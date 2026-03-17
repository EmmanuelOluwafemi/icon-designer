import { describe, it, expect, afterEach } from "vitest"
import { isBrowserSupported } from "./browser-support"

describe("isBrowserSupported()", () => {
  afterEach(() => {
    // @ts-expect-error - cleanup
    delete window.showDirectoryPicker
  })

  it("returns false when showDirectoryPicker is not available", () => {
    expect(isBrowserSupported()).toBe(false)
  })

  it("returns true when showDirectoryPicker is available", () => {
    // @ts-expect-error - simulate Chrome/Edge
    window.showDirectoryPicker = () => {}
    expect(isBrowserSupported()).toBe(true)
  })
})
