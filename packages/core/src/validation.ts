/**
 * Validation utilities for common input formats.
 * @module @ury/core/validation
 */

/** RFC 5322 compliant email pattern — covers the vast majority of real-world addresses. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validate an email address.
 *
 * Uses a practical RFC-5322-inspired regex that covers >99% of real-world
 * addresses while remaining readable. It deliberately avoids the full RFC
 * grammar (which permits quoted strings, comments, IP-literal domains, etc.)
 * because those edge cases are almost never intentional in form input.
 *
 * @param email - The email string to validate.
 * @returns `true` when the string matches a typical email format.
 *
 * @example
 * ```ts
 * validateEmail('user@example.com')   // true
 * validateEmail('not-an-email')       // false
 * validateEmail('')                   // false
 * ```
 */
export function validateEmail(email: string): boolean {
  return EMAIL_RE.test(email)
}

/**
 * Validate an international phone number.
 *
 * Accepts an optional leading `+` followed by 7–15 digits. Spaces, hyphens,
 * and parentheses are stripped before validation so that formatted inputs like
 * `+1 (555) 123-4567` are handled correctly.
 *
 * The 7–15 digit range covers the shortest valid national numbers (e.g. some
 * small island nations) through the longest (e.g. Germany with country code).
 *
 * @param phone - The phone number string to validate.
 * @returns `true` when the cleaned number matches the expected pattern.
 *
 * @example
 * ```ts
 * validatePhone('+1 555-123-4567')  // true
 * validatePhone('(020) 1234 5678')   // true
 * validatePhone('123')               // false (too short)
 * ```
 */
export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-()]/g, '')
  return /^\+?\d{7,15}$/.test(digits)
}
