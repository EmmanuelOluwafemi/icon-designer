import { describe, it, expect } from "vitest"
import {
  buildPathString,
  closedPathString,
  parsePathAnchors,
  moveAnchor,
  removeAnchor,
  type AnchorPoint,
} from "./path-builder"

describe("buildPathString", () => {
  it("returns empty string for empty anchor list", () => {
    expect(buildPathString([])).toBe("")
  })

  it("builds a single-point path as a move command", () => {
    const anchors: AnchorPoint[] = [{ x: 10, y: 20 }]
    expect(buildPathString(anchors)).toBe("M 10 20")
  })

  it("builds a two-point straight-line path", () => {
    const anchors: AnchorPoint[] = [{ x: 0, y: 0 }, { x: 100, y: 50 }]
    expect(buildPathString(anchors)).toBe("M 0 0 L 100 50")
  })

  it("builds a cubic bezier segment when control points are provided", () => {
    const anchors: AnchorPoint[] = [
      { x: 0, y: 0, cp2: { x: 30, y: -20 } },
      { x: 100, y: 0, cp1: { x: 70, y: -20 } },
    ]
    expect(buildPathString(anchors)).toBe("M 0 0 C 30 -20 70 -20 100 0")
  })

  it("falls back to L when only one side has a control point", () => {
    const anchors: AnchorPoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0, cp1: { x: 50, y: -10 } },
    ]
    // one cp only → straight line (symmetric cp not enforced here)
    expect(buildPathString(anchors)).toBe("M 0 0 L 100 0")
  })

  it("handles three straight-line segments", () => {
    const anchors: AnchorPoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ]
    expect(buildPathString(anchors)).toBe("M 0 0 L 100 0 L 100 100")
  })
})

describe("closedPathString", () => {
  it("appends Z to a path string", () => {
    const anchors: AnchorPoint[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 },
    ]
    expect(closedPathString(anchors)).toBe("M 0 0 L 100 0 L 50 100 Z")
  })

  it("returns empty string for empty anchors", () => {
    expect(closedPathString([])).toBe("")
  })
})

describe("parsePathAnchors", () => {
  it("parses a simple M L path back to anchors", () => {
    const anchors = parsePathAnchors("M 0 0 L 100 50")
    expect(anchors).toHaveLength(2)
    expect(anchors[0]).toMatchObject({ x: 0, y: 0 })
    expect(anchors[1]).toMatchObject({ x: 100, y: 50 })
  })

  it("parses a cubic bezier path with control points", () => {
    const anchors = parsePathAnchors("M 0 0 C 30 -20 70 -20 100 0")
    expect(anchors).toHaveLength(2)
    expect(anchors[0]).toMatchObject({ x: 0, y: 0, cp2: { x: 30, y: -20 } })
    expect(anchors[1]).toMatchObject({ x: 100, y: 0, cp1: { x: 70, y: -20 } })
  })

  it("returns empty array for empty string", () => {
    expect(parsePathAnchors("")).toEqual([])
  })
})

describe("moveAnchor", () => {
  it("moves an anchor at the given index", () => {
    const anchors: AnchorPoint[] = [{ x: 0, y: 0 }, { x: 100, y: 100 }]
    const updated = moveAnchor(anchors, 1, 200, 200)
    expect(updated[1]).toMatchObject({ x: 200, y: 200 })
    expect(updated[0]).toMatchObject({ x: 0, y: 0 }) // unchanged
  })

  it("does not mutate the original array", () => {
    const anchors: AnchorPoint[] = [{ x: 0, y: 0 }]
    const updated = moveAnchor(anchors, 0, 10, 10)
    expect(anchors[0]).toMatchObject({ x: 0, y: 0 })
    expect(updated).not.toBe(anchors)
  })
})

describe("removeAnchor", () => {
  it("removes the anchor at the given index", () => {
    const anchors: AnchorPoint[] = [{ x: 0, y: 0 }, { x: 50, y: 50 }, { x: 100, y: 0 }]
    const updated = removeAnchor(anchors, 1)
    expect(updated).toHaveLength(2)
    expect(updated[0]).toMatchObject({ x: 0, y: 0 })
    expect(updated[1]).toMatchObject({ x: 100, y: 0 })
  })

  it("does not mutate the original array", () => {
    const anchors: AnchorPoint[] = [{ x: 0, y: 0 }, { x: 100, y: 100 }]
    removeAnchor(anchors, 0)
    expect(anchors).toHaveLength(2)
  })
})
