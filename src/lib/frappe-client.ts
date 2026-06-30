// URY Frappe REST API Client
// Typed client for connecting to any Frappe/ERPNext backend running URY

export interface FrappeConfig {
  baseUrl: string; // e.g. https://erp.myrestaurant.com
  apiKey?: string;
  apiSecret?: string;
  cookie?: string; // session cookie from NextAuth
}

export interface FrappeDocListParams {
  doctype: string;
  fields?: string[];
  filters?: Record<string, unknown> | Array<unknown>;
  order_by?: string;
  limit?: number;
  limit_start?: number;
}

export interface FrappeCallParams {
  method: string;
  args?: Record<string, unknown>;
}

export interface FrappeResponse<T> {
  data: T;
  exc?: string;
  message?: string;
}

export interface FrappeDocListResponse<T> {
  data: T[];
  message?: string;
}

export interface FrappeLoginResponse {
  message: string;
  user: string;
  full_name?: string;
  email?: string;
  home_page?: string;
}

// ── Persistence ──────────────────────────────────────────

const CONFIG_KEY = 'ury_frappe_config';

export function saveConfig(config: FrappeConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIG_KEY, JSON.stringify({
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
  }));
}

export function loadConfig(): FrappeConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONFIG_KEY);
}

// ── Retry Configuration ──────────────────────────────────

export interface RetryConfig {
  maxRetries: number;       // Maximum number of retry attempts (default: 3)
  baseDelay: number;        // Base delay in ms before first retry (default: 1000)
  maxDelay: number;         // Maximum delay cap in ms (default: 10000)
  backoffFactor: number;    // Exponential multiplier (default: 2)
  retryableStatuses: number[]; // HTTP status codes that trigger retry (default: [408, 429, 500, 502, 503, 504])
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay for retry attempt with exponential backoff + jitter.
 * Formula: min(maxDelay, baseDelay * backoffFactor^attempt) + random jitter
 */
function getRetryDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, attempt);
  const cappedDelay = Math.min(config.maxDelay, exponentialDelay);
  // Add jitter: random 0-30% of the delay to prevent thundering herd
  const jitter = cappedDelay * 0.3 * Math.random();
  return cappedDelay + jitter;
}

/**
 * Determines if an error/response should trigger a retry.
 * Retries on: network errors, 408 (timeout), 429 (rate limit), 5xx (server errors).
 * Does NOT retry on: 4xx client errors (400, 401, 403, 404, etc.).
 */
function isRetryable(status: number | null, error: unknown): boolean {
  // Network error (no status code)
  if (status === null && error !== null) return true;
  if (status === null) return false;
  return DEFAULT_RETRY_CONFIG.retryableStatuses.includes(status);
}

/**
 * Fetch with automatic retry and exponential backoff.
 * Only retries on transient failures (network errors, rate limits, server errors).
 * Idempotent methods (GET) are always safe to retry.
 * Non-idempotent methods (POST, PUT, DELETE) only retry on network errors,
 * not on server errors, to avoid duplicate operations.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryConfig: Partial<RetryConfig> = {},
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  const isIdempotent = !options.method || options.method === 'GET' || options.method === 'HEAD';
  let lastError: unknown = null;
  let lastStatus: number | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If response is OK or a non-retryable client error, return immediately
      if (response.ok || !isRetryable(response.status, null)) {
        return response;
      }

      // For non-idempotent methods, don't retry server errors (avoid duplicates)
      if (!isIdempotent && response.status >= 500) {
        return response;
      }

      lastStatus = response.status;
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (err) {
      lastError = err;
      lastStatus = null;
    }

    // Don't wait after the last attempt
    if (attempt < config.maxRetries) {
      const delay = getRetryDelay(attempt, config);
      console.warn(
        `[FrappeClient] Retry ${attempt + 1}/${config.maxRetries} after ${Math.round(delay)}ms ` +
        `(${lastStatus ? `HTTP ${lastStatus}` : 'network error'}): ${url}`
      );
      await sleep(delay);
    }
  }

  // All retries exhausted — throw the last error
  if (lastStatus !== null) {
    // Re-fetch to get the actual response object for the caller to handle
    try {
      return await fetch(url, options);
    } catch {
      throw lastError;
    }
  }
  throw lastError;
}

// ── Client ───────────────────────────────────────────────

export class FrappeClient {
  private config: FrappeConfig;
  private retryConfig: Partial<RetryConfig>;

  constructor(config: FrappeConfig, retryConfig?: Partial<RetryConfig>) {
    this.config = config;
    this.retryConfig = retryConfig ?? {};
  }

  updateConfig(config: FrappeConfig) {
    this.config = config;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.config.apiKey && this.config.apiSecret) {
      headers['Authorization'] = `token ${this.config.apiKey}:${this.config.apiSecret}`;
    }

    if (this.config.cookie) {
      headers['Cookie'] = this.config.cookie;
    }

    return headers;
  }

  private getBaseUrl(): string {
    return this.config.baseUrl.replace(/\/+$/, '');
  }

  // ── Core Methods ──────────────────────────────────────

  async ping(): Promise<boolean> {
    try {
      const res = await fetchWithRetry(`${this.getBaseUrl()}/api/method/ping`, {
        headers: this.getHeaders(),
        credentials: 'include',
      }, { maxRetries: 1, baseDelay: 500, ...this.retryConfig });
      return res.ok;
    } catch {
      return false;
    }
  }

  async login(username: string, password: string): Promise<FrappeLoginResponse> {
    const res = await fetchWithRetry(`${this.getBaseUrl()}/api/method/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ usr: username, pwd: password }),
    }, { maxRetries: 1, ...this.retryConfig }); // Login: only 1 retry to avoid lockouts

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    return res.json();
  }

  async getLoggedInUser(): Promise<string | null> {
    try {
      const res = await fetchWithRetry(`${this.getBaseUrl()}/api/method/frappe.auth.get_logged_user`, {
        headers: this.getHeaders(),
        credentials: 'include',
      }, this.retryConfig);
      if (!res.ok) return null;
      const data = await res.json();
      return data.message;
    } catch {
      return null;
    }
  }

  // ── Frappe Call (whitelisted API) ─────────────────────

  async call<T = unknown>(params: FrappeCallParams): Promise<FrappeResponse<T>> {
    const res = await fetchWithRetry(`${this.getBaseUrl()}/api/method/${params.method}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify(params.args || {}),
    }, this.retryConfig);

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: `API call failed: ${params.method}` }));
      throw new Error(error.message || error.exc || `API error: ${params.method}`);
    }

    return res.json();
  }

  // ── Document Operations ───────────────────────────────

  async getDocList<T = unknown>(params: FrappeDocListParams): Promise<FrappeDocListResponse<T>> {
    const queryParams = new URLSearchParams();
    queryParams.set('doctype', params.doctype);

    if (params.fields?.length) {
      queryParams.set('fields', JSON.stringify(params.fields));
    }
    if (params.filters) {
      queryParams.set('filters', JSON.stringify(params.filters));
    }
    if (params.order_by) {
      queryParams.set('order_by', params.order_by);
    }
    if (params.limit) {
      queryParams.set('limit_page_length', String(params.limit));
    }
    if (params.limit_start) {
      queryParams.set('limit_start', String(params.limit_start));
    }

    const res = await fetchWithRetry(
      `${this.getBaseUrl()}/api/resource/${params.doctype}?${queryParams.toString()}`,
      {
        headers: this.getHeaders(),
        credentials: 'include',
      },
      this.retryConfig
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch ${params.doctype} list`);
    }

    return res.json();
  }

  async getDoc<T = unknown>(doctype: string, name: string): Promise<FrappeResponse<T>> {
    const res = await fetchWithRetry(
      `${this.getBaseUrl()}/api/resource/${doctype}/${name}`,
      {
        headers: this.getHeaders(),
        credentials: 'include',
      },
      this.retryConfig
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch ${doctype} ${name}`);
    }

    return res.json();
  }

  async createDoc<T = unknown>(doctype: string, data: Partial<T>): Promise<FrappeResponse<T>> {
    const res = await fetchWithRetry(
      `${this.getBaseUrl()}/api/resource/${doctype}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      },
      { maxRetries: 1, ...this.retryConfig } // Create: only 1 retry to avoid duplicates
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: `Failed to create ${doctype}` }));
      throw new Error(error.message || `Failed to create ${doctype}`);
    }

    return res.json();
  }

  async updateDoc<T = unknown>(doctype: string, name: string, data: Partial<T>): Promise<FrappeResponse<T>> {
    const res = await fetchWithRetry(
      `${this.getBaseUrl()}/api/resource/${doctype}/${name}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
      },
      { maxRetries: 1, ...this.retryConfig } // Update: only 1 retry to avoid duplicates
    );

    if (!res.ok) {
      throw new Error(`Failed to update ${doctype} ${name}`);
    }

    return res.json();
  }

  async deleteDoc(doctype: string, name: string): Promise<void> {
    const res = await fetchWithRetry(
      `${this.getBaseUrl()}/api/resource/${doctype}/${name}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      },
      { maxRetries: 1, ...this.retryConfig } // Delete: only 1 retry to avoid duplicates
    );

    if (!res.ok) {
      throw new Error(`Failed to delete ${doctype} ${name}`);
    }
  }

  // ── URY-Specific API Methods ──────────────────────────

  async getRestaurantMenu(posProfile: string, room?: string, orderType?: string) {
    return this.call({
      method: 'ury.ury_pos.api.getRestaurantMenu',
      args: { pos_profile: posProfile, room, order_type: orderType },
    });
  }

  async getMenuCourses() {
    return this.call({ method: 'ury.ury_pos.api.getMenuCourses' });
  }

  async getRooms() {
    return this.call({ method: 'ury.ury_pos.api.getRoom' });
  }

  async getBranch() {
    return this.call({ method: 'ury.ury_pos.api.getBranch' });
  }

  async getBranchRoom() {
    return this.call({ method: 'ury.ury_pos.api.getBranchRoom' });
  }

  async getModeOfPayment() {
    return this.call({ method: 'ury.ury_pos.api.getModeOfPayment' });
  }

  async getPosProfile() {
    return this.call({ method: 'ury.ury_pos.api.getPosProfile' });
  }

  async posOpening() {
    return this.call({ method: 'ury.ury_pos.api.posOpening' });
  }

  async getCashier(room: string) {
    return this.call({ method: 'ury.ury_pos.api.getCashier', args: { room } });
  }

  async getInvoiceForCashier(status: string, cashier: string, limit: number, limitStart: number) {
    return this.call({
      method: 'ury.ury_pos.api.getInvoiceForCashier',
      args: { status, cashier, limit, limit_start: limitStart },
    });
  }

  async getKOTList() {
    return this.call({ method: 'ury.api.ury_kot_display.get_kot_list' });
  }

  async serveKOT(name: string, time: string) {
    return this.call({ method: 'ury.api.ury_kot_display.serve_kot', args: { name, time } });
  }

  async confirmKOT(name: string, user: string) {
    return this.call({ method: 'ury.api.ury_kot_display.confirm_kot', args: { name, user } });
  }

  async getProductionUnits() {
    return this.call({ method: 'ury.api.ury_kot_display.get_production_units' });
  }

  async searchPosInvoice(query: string, status: string) {
    return this.call({ method: 'ury.ury_pos.api.searchPosInvoice', args: { query, status } });
  }

  // ── URY Doctypes ──────────────────────────────────────

  async getRestaurants() {
    return this.getDocList({ doctype: 'URY Restaurant', fields: ['*'] });
  }

  async getRestaurantRooms(restaurant?: string) {
    const filters: Record<string, unknown> = {};
    if (restaurant) filters['restaurant'] = restaurant;
    return this.getDocList({ doctype: 'URY Room', fields: ['*'], filters });
  }

  async getRestaurantTables(room?: string) {
    const filters: Record<string, unknown> = {};
    if (room) filters['room'] = room;
    return this.getDocList({ doctype: 'URY Table', fields: ['*'], filters });
  }

  async getDailyPL(date?: string) {
    const filters: Record<string, unknown> = {};
    if (date) filters['date'] = date;
    return this.getDocList({ doctype: 'URY Daily P&L', fields: ['*'], filters, limit: 30 });
  }

  // ── Shift & Cashier Methods ──────────────────────────

  async getPOSOpeningEntry(status?: string) {
    const filters: Record<string, unknown> = {};
    if (status) filters['status'] = status;
    return this.getDocList({
      doctype: 'POS Opening Entry',
      fields: ['*'],
      filters,
      order_by: 'creation desc',
      limit: 5,
    });
  }

  async getPOSClosingEntry(openingEntry?: string) {
    const filters: Record<string, unknown> = {};
    if (openingEntry) filters['pos_opening_entry'] = openingEntry;
    return this.getDocList({
      doctype: 'POS Closing Entry',
      fields: ['*'],
      filters,
      order_by: 'creation desc',
      limit: 5,
    });
  }

  async createPOSOpening(data: {
    pos_profile: string;
    company: string;
    opening_balance: number;
    [key: string]: unknown;
  }) {
    return this.createDoc('POS Opening Entry', data);
  }

  async createPOSClosing(data: {
    pos_opening_entry: string;
    closing_balance: number;
    [key: string]: unknown;
  }) {
    return this.createDoc('POS Closing Entry', data);
  }
}

// ── Singleton ────────────────────────────────────────────

let clientInstance: FrappeClient | null = null;

export function getFrappeClient(): FrappeClient {
  if (!clientInstance) {
    const config = loadConfig() || { baseUrl: '' };
    clientInstance = new FrappeClient(config);
  }
  return clientInstance;
}

export function resetFrappeClient(): void {
  clientInstance = null;
}
