import { describe, it, expect } from "vitest"
import { clamp, sleep, debounce } from "../utils"

describe("clamp", () => {
  it("returns the value when within range", () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })

  it("clamps to min when value is below range", () => {
    expect(clamp(-5, 0, 100)).toBe(0)
  })

  it("clamps to max when value is above range", () => {
    expect(clamp(150, 0, 100)).toBe(100)
  })

  it("works with negative ranges", () => {
    expect(clamp(-20, -10, 10)).toBe(-10)
  })

  it("works when min equals max", () => {
    expect(clamp(42, 5, 5)).toBe(5)
  })
})

describe("sleep", () => {
  it("resolves after the specified delay", async () => {
    const start = Date.now()
    await sleep(50)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(40) // allow small timing variance
  })

  it("resolves immediately with 0 delay", async () => {
    const start = Date.now()
    await sleep(0)
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(50)
  })
})

describe("debounce", () => {
  it("delays function invocation", async () => {
    let callCount = 0
    const fn = debounce(() => { callCount++ }, 50)
    fn()
    fn()
    fn()
    expect(callCount).toBe(0)
    await sleep(80)
    expect(callCount).toBe(1)
  })

  it("supports cancel", async () => {
    let callCount = 0
    const fn = debounce(() => { callCount++ }, 50)
    fn()
    fn.cancel()
    await sleep(80)
    expect(callCount).toBe(0)
  })

  it("supports flush", async () => {
    let callCount = 0
    const fn = debounce(() => { callCount++ }, 50)
    fn()
    fn.flush()
    expect(callCount).toBe(1)
    await sleep(80)
    expect(callCount).toBe(1) // not called again
  })

  it("supports leading option", () => {
    let callCount = 0
    const fn = debounce(() => { callCount++ }, 50, { leading: true, trailing: false })
    fn()
    expect(callCount).toBe(1)
  })
})
