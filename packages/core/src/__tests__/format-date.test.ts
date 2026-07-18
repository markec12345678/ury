import { describe, it, expect } from "vitest"
import { formatDate, formatNumber } from "../format-date"

describe("formatDate", () => {
  it("formats a date with the datetime preset", () => {
    const result = formatDate("2025-01-15T14:30:00Z", { preset: "date" })
    // Result depends on locale, just verify it's a non-empty string
    expect(result).toBeTruthy()
    expect(result).not.toBe("Invalid date")
  })

  it("returns 'Invalid date' for unparseable input", () => {
    expect(formatDate("not-a-date")).toBe("Invalid date")
  })

  it("handles Date objects", () => {
    const result = formatDate(new Date("2025-06-15"), { preset: "date" })
    expect(result).toBeTruthy()
  })

  it("handles timestamp numbers", () => {
    const result = formatDate(Date.now(), { preset: "date" })
    expect(result).toBeTruthy()
  })

  describe("relative preset", () => {
    it("returns 'just now' for recent dates", () => {
      expect(formatDate(Date.now(), { preset: "relative" })).toBe("just now")
    })

    it("returns minutes ago", () => {
      const fiveMinAgo = Date.now() - 5 * 60 * 1000
      expect(formatDate(fiveMinAgo, { preset: "relative" })).toContain("minute")
    })

    it("returns hours ago", () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
      expect(formatDate(twoHoursAgo, { preset: "relative" })).toContain("hour")
    })

    it("returns days ago", () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
      expect(formatDate(threeDaysAgo, { preset: "relative" })).toContain("day")
    })

    it("returns months ago", () => {
      const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000
      expect(formatDate(threeMonthsAgo, { preset: "relative" })).toContain("month")
    })
  })
})

describe("formatNumber", () => {
  it("formats integers with locale separators", () => {
    const result = formatNumber(1234)
    expect(result).toBeTruthy()
  })

  it("formats with specified decimal places", () => {
    const result = formatNumber(1234.5, { maximumFractionDigits: 2 })
    expect(result).toContain("1,234.5")
  })

  it("formats as currency", () => {
    const result = formatNumber(99.99, { currency: "USD" })
    expect(result).toContain("99.99")
  })

  it("formats with compact notation", () => {
    const result = formatNumber(1500000, { compact: true })
    expect(result).toMatch(/1\.5M|1,500K/)
  })

  it("handles zero", () => {
    const result = formatNumber(0)
    expect(result).toBeTruthy()
  })
})
