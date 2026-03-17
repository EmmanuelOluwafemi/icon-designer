import { describe, it, expect } from "vitest"
import { autoGridLayout } from "./auto-grid-layout"
import type { Icon, GridConfig } from "./auto-grid-layout"

const defaultConfig: GridConfig = {
  gridSize: 24,
  padding: 16,
  labelHeight: 20,
  headerHeight: 32,
}

const icon = (id: string): Icon => ({ id, name: id, category: "", tags: [], files: {} })

describe("autoGridLayout", () => {
  it("returns one frame for a single icon and single variant", () => {
    const frames = autoGridLayout([icon("home")], ["outline"], defaultConfig)
    expect(frames).toHaveLength(1)
    expect(frames[0]).toMatchObject({ iconId: "home", variant: "outline" })
  })

  it("places two icons in separate rows", () => {
    const [a, b] = autoGridLayout([icon("home"), icon("star")], ["outline"], defaultConfig)
    expect(a).toBeDefined()
    expect(b).toBeDefined()
    expect(a!.y).toBeLessThan(b!.y)
    expect(a!.x).toEqual(b!.x)
  })

  it("places variants in separate columns", () => {
    const [a, b] = autoGridLayout([icon("home")], ["outline", "filled"], defaultConfig)
    expect(a).toBeDefined()
    expect(b).toBeDefined()
    expect(a!.x).toBeLessThan(b!.x)
    expect(a!.y).toEqual(b!.y)
  })

  it("returns N×M frames for N icons and M variants", () => {
    const frames = autoGridLayout(
      [icon("home"), icon("star"), icon("bell")],
      ["outline", "filled", "duotone"],
      defaultConfig
    )
    expect(frames).toHaveLength(9)
  })

  it("spaces frames by gridSize + padding", () => {
    const config: GridConfig = { gridSize: 24, padding: 16, labelHeight: 20, headerHeight: 0 }
    const [a, b] = autoGridLayout([icon("home")], ["outline", "filled"], config)
    expect(b!.x - a!.x).toEqual(config.gridSize + config.padding)
  })

  it("offsets rows by gridSize + padding + labelHeight", () => {
    const config: GridConfig = { gridSize: 24, padding: 16, labelHeight: 20, headerHeight: 0 }
    const [a, b] = autoGridLayout([icon("home"), icon("star")], ["outline"], config)
    expect(b!.y - a!.y).toEqual(config.gridSize + config.padding + config.labelHeight)
  })
})
