/**
 * Validator utility functions for the URY POS system.
 * Provides reusable validation for common POS data like emails,
 * phone numbers, amounts, and order identifiers.
 */

/** Validates an email address format */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/** Validates a phone number (supports international format with + prefix) */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;
  return phoneRegex.test(phone.trim());
}

/** Validates that a number is a positive monetary amount (allows decimals) */
export function isValidAmount(value: number): boolean {
  return typeof value === 'number' && isFinite(value) && value >= 0;
}

/** Validates that a quantity is a positive integer */
export function isValidQuantity(qty: number): boolean {
  return typeof qty === 'number' && isFinite(qty) && Number.isInteger(qty) && qty > 0;
}

/** Validates a POS invoice name format (e.g., "SINV-00001" or "ACC-SINV-00001") */
export function isValidInvoiceName(name: string): boolean {
  const invoiceRegex = /^(ACC-)?SINV-\d+$/;
  return invoiceRegex.test(name);
}

/** Validates a table number (alphanumeric, 1-10 chars) */
export function isValidTableNumber(table: string): boolean {
  const tableRegex = /^[A-Za-z0-9\-]{1,10}$/;
  return tableRegex.test(table.trim());
}

/** Validates a customer name (at least 2 characters, no special symbols) */
export function isValidCustomerName(name: string): boolean {
  return name.trim().length >= 2 && /^[A-Za-zÀ-ÿ\s\-'.]+$/.test(name.trim());
}

/** Validates a discount percentage (0-100) */
export function isValidDiscountPercent(percent: number): boolean {
  return typeof percent === 'number' && isFinite(percent) && percent >= 0 && percent <= 100;
}

/** Validates a discount amount (non-negative, not exceeding the max) */
export function isValidDiscountAmount(amount: number, maxAmount: number): boolean {
  return typeof amount === 'number' && isFinite(amount) && amount >= 0 && amount <= maxAmount;
}

/** Validates a KOT number format (e.g., "KOT00001") */
export function isValidKOTNumber(kot: string): boolean {
  const kotRegex = /^KOT\d{5,}$/;
  return kotRegex.test(kot);
}
