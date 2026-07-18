/**
 * React hooks for the URY POS system.
 * @module @ury/core/hooks
 */

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react"

/**
 * Debounce a value — returns the latest value only after `delay` ms of inactivity.
 *
 * Useful for search inputs where you don't want to fire an API call on every keystroke.
 *
 * @param value - The value to debounce.
 * @param delay - Debounce delay in milliseconds.
 * @returns The debounced value.
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState("")
 * const debouncedSearch = useDebounce(search, 300)
 *
 * useEffect(() => {
 *   fetchResults(debouncedSearch)
 * }, [debouncedSearch])
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * Persist state in localStorage with automatic serialization.
 *
 * Falls back gracefully when localStorage is unavailable (SSR, private browsing).
 * The stored value is JSON-serialized, so only JSON-compatible values are supported.
 *
 * @param key - localStorage key.
 * @param initialValue - Default value when nothing is stored yet.
 * @returns A stateful value and a setter, just like `useState`.
 *
 * @example
 * ```tsx
 * const [name, setName] = useLocalStorage("user_name", "Guest")
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value
        try {
          localStorage.setItem(key, JSON.stringify(nextValue))
        } catch {
          // localStorage may be full or unavailable
        }
        return nextValue
      })
    },
    [key]
  )

  return [storedValue, setValue]
}

/**
 * Toggle between two values. Defaults to boolean `true`/`false`.
 *
 * @param initialValue - Starting value (default `false`).
 * @returns Current value, toggle function, and explicit set functions.
 *
 * @example
 * ```tsx
 * const [isOpen, toggle, open, close] = useToggle(false)
 * ```
 */
export function useToggle(
  initialValue = false
): [boolean, () => void, () => void, () => void] {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue((v) => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  return [value, toggle, setTrue, setFalse]
}

/**
 * React to changes in a CSS media query.
 *
 * Uses `useSyncExternalStore` for concurrent-mode safety and avoids
 * unnecessary re-renders when the media query result hasn't changed.
 *
 * @param query - CSS media query string, e.g. `"(min-width: 768px)"`.
 * @returns Whether the media query currently matches.
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery("(max-width: 639px)")
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)")
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onStoreChange)
      return () => mql.removeEventListener("change", onStoreChange)
    },
    [query]
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * Track the previous value of a variable across renders.
 *
 * Returns `undefined` on the first render. Useful for comparing
 * previous and current values in effects.
 *
 * @param value - The value to track.
 * @returns The value from the previous render.
 *
 * @example
 * ```tsx
 * const prevCount = usePrevious(count)
 * useEffect(() => {
 *   if (prevCount !== count) console.log(`Changed from ${prevCount} to ${count}`)
 * }, [count, prevCount])
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
