/**
 * Shared constants for the URY POS system.
 * Centralizes configuration values used across packages.
 */

/** Order type identifiers matching the Frappe backend */
export const ORDER_TYPES = {
  DINE_IN: 'Dine In',
  TAKEAWAY: 'Takeaway',
  DELIVERY: 'Delivery',
} as const;

export type OrderType = (typeof ORDER_TYPES)[keyof typeof ORDER_TYPES];

/** KOT status values matching the backend doctype */
export const KOT_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  SERVED: 'Served',
  CANCELLED: 'Cancelled',
} as const;

export type KotStatus = (typeof KOT_STATUS)[keyof typeof KOT_STATUS];

/** Invoice/payment status values */
export const INVOICE_STATUS = {
  DRAFT: 0,
  SUBMITTED: 1,
  CANCELLED: 2,
} as const;

/** Payment method identifiers */
export const PAYMENT_METHODS = {
  CASH: 'Cash',
  CARD: 'Card',
  UPI: 'UPI',
  BANK_TRANSFER: 'Bank Transfer',
  CREDIT: 'Credit',
} as const;

/** User roles in the URY system */
export const ROLES = {
  URY_MANAGER: 'URY Manager',
  URY_CASHIER: 'URY Cashier',
  URY_CAPTAIN: 'URY Captain',
  SYSTEM_MANAGER: 'System Manager',
  ADMINISTRATOR: 'Administrator',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/** Default pagination settings */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/** Time-related constants */
export const TIME = {
  /** Debounce delay for search inputs (ms) */
  SEARCH_DEBOUNCE_MS: 300,
  /** Auto-refresh interval for dashboard (ms) */
  DASHBOARD_REFRESH_MS: 30_000,
  /** Toast notification duration (ms) */
  TOAST_DURATION_MS: 3_000,
  /** KOT status poll interval (ms) */
  KOT_POLL_INTERVAL_MS: 5_000,
  /** Session timeout warning (ms) */
  SESSION_TIMEOUT_MS: 1_800_000, // 30 minutes
} as const;

/** localStorage keys used across the application */
export const STORAGE_KEYS = {
  POS_PROFILE: 'pos_profile',
  AUTH_TOKEN: 'auth_token',
  CURRENCY_SYMBOL: 'currencySymbol',
  LAST_ORDER_TYPE: 'last_order_type',
  PRINTER_SETTINGS: 'ury_printer_settings',
  PREFERRED_LANGUAGE: 'ury_preferred_language',
  TABLE_FILTER: 'ury_table_filter',
} as const;

/** Number format settings */
export const NUMBER_FORMAT = {
  /** Default decimal places for currency */
  CURRENCY_DECIMALS: 2,
  /** Default decimal places for quantities */
  QUANTITY_DECIMALS: 2,
  /** Thousands separator */
  THOUSANDS_SEPARATOR: ',',
  /** Decimal separator */
  DECIMAL_SEPARATOR: '.',
} as const;
