import { describe, it, expect } from "vitest"
import { parseIconFilenames } from "./parse-icon-filenames"

const KNOWN_VARIANTS = ["outline", "filled", "duotone"]

describe("parseIconFilenames", () => {
  it("parses name.variant.svg into icon + variant", () => {
    const { icons } = parseIconFilenames(["arrow-up.outline.svg"], KNOWN_VARIANTS)
    expect(icons).toHaveLength(1)
    expect(icons[0]).toMatchObject({ name: "arrow-up", variant: "outline", file: "arrow-up.outline.svg" })
  })

  it("parses name.svg into icon with default variant", () => {
    const { icons } = parseIconFilenames(["home.svg"], KNOWN_VARIANTS)
    expect(icons).toHaveLength(1)
    expect(icons[0]).toMatchObject({ name: "home", variant: "outline", file: "home.svg" })
  })

  it("normalises underscores to hyphens and lowercases", () => {
    const { icons } = parseIconFilenames(["Arrow_Up.OUTLINE.SVG"], KNOWN_VARIANTS)
    expect(icons[0]).toMatchObject({ name: "arrow-up", variant: "outline" })
  })

  it("ignores non-svg files silently", () => {
    const { icons, unrecognised } = parseIconFilenames(["readme.txt", "home.svg"], KNOWN_VARIANTS)
    expect(icons).toHaveLength(1)
    expect(unrecognised).toHaveLength(0)
  })

  it("flags unknown variant as unrecognised", () => {
    const { icons, unrecognised } = parseIconFilenames(["home.sharp.svg"], KNOWN_VARIANTS)
    expect(icons).toHaveLength(0)
    expect(unrecognised).toContain("home.sharp.svg")
  })

  it("flags three-or-more segment names as unrecognised", () => {
    const { icons, unrecognised } = parseIconFilenames(["some.random.extra.svg"], KNOWN_VARIANTS)
    expect(icons).toHaveLength(0)
    expect(unrecognised).toContain("some.random.extra.svg")
  })

  it("accumulates multiple variants for the same icon", () => {
    const { icons } = parseIconFilenames(
      ["home.outline.svg", "home.filled.svg", "home.duotone.svg"],
      KNOWN_VARIANTS
    )
    expect(icons).toHaveLength(3)
    expect(icons.map((i) => i.variant).sort()).toEqual(["duotone", "filled", "outline"])
    expect(icons.every((i) => i.name === "home")).toBe(true)
  })

  it("returns empty results for empty input", () => {
    const { icons, unrecognised } = parseIconFilenames([], KNOWN_VARIANTS)
    expect(icons).toHaveLength(0)
    expect(unrecognised).toHaveLength(0)
  })
})
