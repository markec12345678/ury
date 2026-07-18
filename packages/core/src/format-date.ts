/**
 * Date & number formatting utilities.
 * @module @ury/core/format-date
 */

/**
 * Preset format styles that map to `Intl.DateTimeFormat` options.
 *
 * | Preset      | Example output (en-US) |
 * |-------------|------------------------|
 * | `date`      | Jan 5, 2025            |
 * | `time`      | 2:30 PM                |
 * | `datetime`  | Jan 5, 2025, 2:30 PM   |
 * | `relative`  | 3 hours ago            |
 */
export type DatePreset = 'date' | 'time' | 'datetime' | 'relative'

/** Options for the {@link formatDate} function. */
export interface FormatDateOptions {
  /** BCP-47 locale tag. Defaults to `'en-US'`. */
  locale?: string
  /** Named preset. When provided, overrides individual `Intl` options. */
  preset?: DatePreset
}

const PRESET_OPTIONS: Record<DatePreset, Intl.DateTimeFormatOptions> = {
  date: { year: 'numeric', month: 'short', day: 'numeric' },
  time: { hour: 'numeric', minute: '2-digit' },
  datetime: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  },
  relative: {}, // handled separately
}

/**
 * Format a date value using the given preset or default `datetime` style.
 *
 * For the `relative` preset the function falls back to a simple English
 * approximation ("just now", "5 minutes ago", "3 hours ago", etc.). For
 * production-grade relative formatting, use `Intl.RelativeTimeFormat` with a
 * polyfill or the `@formatjs/intl-relativetimeformat` package.
 *
 * @param value  - A `Date`, timestamp number, or ISO date string.
 * @param opts   - Optional locale and preset configuration.
 * @returns A formatted date string.
 *
 * @example
 * ```ts
 * formatDate(new Date(), { preset: 'date' })     // "Jan 5, 2025"
 * formatDate(Date.now(), { preset: 'relative' })  // "just now"
 * formatDate('2025-01-05T14:30:00Z')              // "Jan 5, 2025, 2:30 PM"
 * ```
 */
export function formatDate(
  value: Date | number | string,
  opts: FormatDateOptions = {}
): string {
  const { locale = 'en-US', preset = 'datetime' } = opts
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }

  // Handle relative preset
  if (preset === 'relative') {
    const now = Date.now()
    const diffMs = now - date.getTime()
    const diffSec = Math.round(diffMs / 1000)

    if (diffSec < 60) return 'just now'
    const diffMin = Math.round(diffSec / 60)
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
    const diffHr = Math.round(diffMin / 60)
    if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`
    const diffDay = Math.round(diffHr / 24)
    if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
    const diffMonth = Math.round(diffDay / 30)
    return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`
  }

  return new Intl.DateTimeFormat(locale, PRESET_OPTIONS[preset]).format(date)
}

/** Options for the {@link formatNumber} function. */
export interface FormatNumberOptions {
  /** BCP-47 locale tag. Defaults to `'en-US'`. */
  locale?: string
  /** Number of decimal places. Defaults to `0`. */
  maximumFractionDigits?: number
  /** Display as currency. When set, uses `Intl.NumberFormat` currency style. */
  currency?: string
  /** Use compact notation (e.g. "1.2K", "3.4M"). */
  compact?: boolean
}

/**
 * Format a number with locale awareness and optional currency / compact notation.
 *
 * @param value - The number to format.
 * @param opts  - Formatting options.
 * @returns A formatted number string.
 *
 * @example
 * ```ts
 * formatNumber(1234.5)                           // "1,235"
 * formatNumber(1234.5, { maximumFractionDigits: 2 }) // "1,234.5"
 * formatNumber(99.99, { currency: 'USD' })        // "$99.99"
 * formatNumber(1500000, { compact: true })         // "1.5M"
 * ```
 */
export function formatNumber(value: number, opts: FormatNumberOptions = {}): string {
  const {
    locale = 'en-US',
    maximumFractionDigits = 0,
    currency,
    compact = false,
  } = opts

  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits,
  }

  if (currency) {
    options.style = 'currency'
    options.currency = currency
    if (maximumFractionDigits === 0) {
      options.minimumFractionDigits = 2
      options.maximumFractionDigits = 2
    }
  }

  if (compact) {
    options.notation = 'compact'
    options.compactDisplay = 'short'
  }

  return new Intl.NumberFormat(locale, options).format(value)
}
