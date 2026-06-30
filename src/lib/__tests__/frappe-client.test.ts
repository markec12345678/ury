import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FrappeClient, getFrappeClient, resetFrappeClient, saveConfig, clearConfig, loadConfig } from '@/lib/frappe-client';
import type { FrappeConfig } from '@/lib/frappe-client';

// ── Mocks ──────────────────────────────────────────────

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => { store[key] = val; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

const testConfig: FrappeConfig = {
  baseUrl: 'https://test-frappe.example.com',
  apiKey: 'test-key',
  apiSecret: 'test-secret',
};

// ── Tests ──────────────────────────────────────────────

describe('FrappeClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockLocalStorage.clear();
    resetFrappeClient();
  });

  // ── Config Persistence ──────────────────────────────

  describe('Config Persistence', () => {
    it('should save and load config from localStorage', () => {
      saveConfig(testConfig);
      const loaded = loadConfig();
      expect(loaded).toBeTruthy();
      expect(loaded!.baseUrl).toBe(testConfig.baseUrl);
      expect(loaded!.apiKey).toBe(testConfig.apiKey);
    });

    it('should clear config from localStorage', () => {
      saveConfig(testConfig);
      clearConfig();
      const loaded = loadConfig();
      expect(loaded).toBeNull();
    });

    it('should return null when no config saved', () => {
      const loaded = loadConfig();
      expect(loaded).toBeNull();
    });
  });

  // ── Singleton ───────────────────────────────────────

  describe('Singleton', () => {
    it('should return same instance', () => {
      saveConfig(testConfig);
      const a = getFrappeClient();
      const b = getFrappeClient();
      expect(a).toBe(b);
    });

    it('should create new instance after reset', () => {
      saveConfig(testConfig);
      const a = getFrappeClient();
      resetFrappeClient();
      const b = getFrappeClient();
      expect(a).not.toBe(b);
    });
  });

  // ── Core Methods ────────────────────────────────────

  describe('ping', () => {
    it('should return true on successful ping', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const client = new FrappeClient(testConfig, { maxRetries: 0 });
      const result = await client.ping();
      expect(result).toBe(true);
    });

    it('should return false on failed ping', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const client = new FrappeClient(testConfig, { maxRetries: 0 });
      const result = await client.ping();
      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    it('should call the login endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged in', user: 'admin' }),
      });
      const client = new FrappeClient(testConfig, { maxRetries: 0 });
      const result = await client.login('admin', 'password');
      expect(result.user).toBe('admin');
    });

    it('should throw on failed login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      });
      const client = new FrappeClient(testConfig, { maxRetries: 0 });
      await expect(client.login('admin', 'wrong')).rejects.toThrow();
    });
  });

  // ── Document Operations ─────────────────────────────

  describe('getDocList', () => {
    it('should fetch document list with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ name: 'DOC-001' }] }),
      });
      const client = new FrappeClient(testConfig, { maxRetries: 0 });
      const result = await client.getDocList({ doctype: 'URY Restaurant', fields: ['*'] });
      expect(result.data).toHaveLength(1);
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('URY Restaurant');
    });
  });

  describe('createDoc', () => {
    it('should POST to create a document', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { name: 'NEW-001' } }),
      });
      const client = new FrappeClient(testConfig, { maxRetries: 0 });
      const result = await client.createDoc('URY Table', { no_of_seats: 4 });
      expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    });
  });

  // ── Retry Logic ─────────────────────────────────────

  describe('Retry Logic', () => {
    it('should retry on 503 server error for GET requests', async () => {
      // First call: 503, second call: success
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });

      const client = new FrappeClient(testConfig, { maxRetries: 2, baseDelay: 10, maxDelay: 50 });
      const result = await client.getDocList({ doctype: 'URY Room', fields: ['*'] });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should NOT retry on 404 client error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });

      const client = new FrappeClient(testConfig, { maxRetries: 2, baseDelay: 10 });
      await expect(client.getDoc('URY Table', 'nonexistent')).rejects.toThrow();
      // Should only call fetch once — no retry for 404
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should NOT retry POST on 500 server error (non-idempotent)', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });

      const client = new FrappeClient(testConfig, { maxRetries: 2, baseDelay: 10 });
      await expect(client.createDoc('URY Table', {})).rejects.toThrow();
      // POST should not be retried on server errors
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on network error (fetch throws)', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });

      const client = new FrappeClient(testConfig, { maxRetries: 2, baseDelay: 10, maxDelay: 50 });
      const result = await client.getDocList({ doctype: 'URY Room', fields: ['*'] });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should exhaust retries and throw', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      const client = new FrappeClient(testConfig, { maxRetries: 1, baseDelay: 10, maxDelay: 20 });
      await expect(client.getDocList({ doctype: 'URY Room', fields: ['*'] })).rejects.toThrow('Persistent network error');
    });
  });

  // ── URY-Specific Methods ────────────────────────────

  describe('URY API Methods', () => {
    it('should call getKOTList', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [{ name: 'KOT-001' }] }),
      });
      const client = new FrappeClient(testConfig, { maxRetries: 0 });
      const result = await client.getKOTList();
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('ury.api.ury_kot_display.get_kot_list');
    });

    it('should call getRestaurantTables', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });
      const client = new FrappeClient(testConfig, { maxRetries: 0 });
      await client.getRestaurantTables('room-1');
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('URY Table');
    });

    it('should call getDailyPL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });
      const client = new FrappeClient(testConfig, { maxRetries: 0 });
      await client.getDailyPL();
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('URY Daily P');
    });
  });
});
