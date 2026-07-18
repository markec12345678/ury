import { describe, it, expect } from "vitest"
import { validateEmail, validatePhone } from "../validation"

describe("validateEmail", () => {
  it("accepts valid email addresses", () => {
    expect(validateEmail("user@example.com")).toBe(true)
    expect(validateEmail("john.doe+tag@company.co.uk")).toBe(true)
    expect(validateEmail("a@b.cc")).toBe(true)
  })

  it("rejects invalid email addresses", () => {
    expect(validateEmail("")).toBe(false)
    expect(validateEmail("not-an-email")).toBe(false)
    expect(validateEmail("@missing-local.com")).toBe(false)
    expect(validateEmail("missing-at.com")).toBe(false)
    expect(validateEmail("user@.com")).toBe(false)
    expect(validateEmail("user@com")).toBe(false)
  })
})

describe("validatePhone", () => {
  it("accepts valid phone numbers", () => {
    expect(validatePhone("+1 555-123-4567")).toBe(true)
    expect(validatePhone("(020) 1234 5678")).toBe(true)
    expect(validatePhone("+386 1 234 5678")).toBe(true)
    expect(validatePhone("15551234567")).toBe(true)
  })

  it("rejects invalid phone numbers", () => {
    expect(validatePhone("")).toBe(false)
    expect(validatePhone("123")).toBe(false)
    expect(validatePhone("abc")).toBe(false)
    expect(validatePhone("+1 234 567 8901 2345 67890")).toBe(false)
  })
})
