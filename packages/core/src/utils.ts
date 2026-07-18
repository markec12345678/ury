/**
 * General-purpose utility functions.
 * @module @ury/core/utils
 */

/**
 * Clamp a numeric value within an inclusive range.
 *
 * @param value - The value to clamp.
 * @param min   - Lower bound (inclusive).
 * @param max   - Upper bound (inclusive).
 * @returns The clamped value.
 *
 * @example
 * ```ts
 * clamp(150, 0, 100)   // 100
 * clamp(-5, 0, 100)    // 0
 * clamp(50, 0, 100)    // 50
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Return a promise that resolves after the specified delay.
 *
 * Useful for adding deliberate pauses in async flows (e.g. debounced API
 * calls, animation sequencing, or testing).
 *
 * @param ms - Delay in milliseconds.
 * @returns A promise that resolves after `ms` milliseconds.
 *
 * @example
 * ```ts
 * await sleep(300)          // pause 300ms
 * console.log('done')
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Create a debounced version of a function.
 *
 * The returned function delays invocation until `wait` milliseconds have
 * elapsed since the last call. An optional `options` object configures
 * leading-edge and trailing-edge behavior.
 *
 * @param fn    - The function to debounce.
 * @param wait  - Delay in milliseconds.
 * @param opts  - Optional behavior flags.
 * @returns A debounced function with `cancel()` and `flush()` methods.
 *
 * @example
 * ```ts
 * const search = debounce((q: string) => fetchResults(q), 300)
 * search('hello')
 * search.cancel()   // discard pending invocation
 * ```
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number,
  opts: { leading?: boolean; trailing?: boolean } = {}
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true } = opts
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  function debounced(...args: Parameters<T>) {
    lastArgs = args

    if (timer) {
      clearTimeout(timer)
    }

    if (leading && !timer) {
      fn(...args)
    }

    timer = setTimeout(() => {
      timer = null
      if (trailing && lastArgs) {
        fn(...lastArgs)
      }
      lastArgs = null
    }, wait)
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    lastArgs = null
  }

  debounced.flush = () => {
    if (timer && lastArgs) {
      fn(...lastArgs)
      debounced.cancel()
    }
  }

  return debounced
}
