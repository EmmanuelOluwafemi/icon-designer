import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Fabric.js — IText needs a real canvas context which isn't available in jsdom
vi.mock("fabric", () => {
  class Rect {
    type = "rect"
    on = vi.fn()
    set = vi.fn((patch: object) => Object.assign(this, patch))
    constructor(opts: object) { Object.assign(this, opts) }
  }
  class IText {
    type = "i-text"
    text: string
    on = vi.fn()
    set = vi.fn((patch: object) => Object.assign(this, patch))
    constructor(text: string, opts: object) { this.text = text; Object.assign(this, opts) }
  }
  return { Rect, IText }
})

import { CanvasBridge } from "./canvas-bridge"
import type { PackState } from "../store/pack-slice"
import type { GridConfig } from "./auto-grid-layout"

// ---------------------------------------------------------------------------
// Lightweight Fabric.js canvas stub
// ---------------------------------------------------------------------------
function makeStubCanvas() {
  const objects: object[] = []
  const handlers: Record<string, Array<(e: unknown) => void>> = {}

  return {
    add: vi.fn((...objs: object[]) => { objects.push(...objs) }),
    remove: vi.fn((obj: object) => {
      const idx = objects.indexOf(obj)
      if (idx !== -1) objects.splice(idx, 1)
    }),
    clear: vi.fn(() => { objects.length = 0 }),
    renderAll: vi.fn(),
    dispose: vi.fn(),
    getObjects: vi.fn(() => [...objects]),
    on: vi.fn((event: string, handler: (e: unknown) => void) => {
      handlers[event] ??= []
      handlers[event]!.push(handler)
    }),
    fire: (event: string, data?: unknown) => {
      handlers[event]?.forEach((h) => h(data))
    },
    _objects: objects,
  }
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------
const config: GridConfig = { gridSize: 48, padding: 32, labelHeight: 24, headerHeight: 56 }

function makeState(overrides: Partial<PackState> = {}): PackState {
  return {
    isLoaded: true,
    name: "Test Pack",
    gridSize: 48,
    variants: ["outline", "filled"],
    icons: [
      { id: "home", name: "Home", category: "", tags: [], files: {} },
      { id: "star", name: "Star", category: "", tags: [], files: {} },
    ],
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("CanvasBridge", () => {
  let canvas: ReturnType<typeof makeStubCanvas>
  let dispatch: ReturnType<typeof vi.fn>
  let bridge: CanvasBridge

  beforeEach(() => {
    canvas = makeStubCanvas()
    dispatch = vi.fn()
    bridge = new CanvasBridge(canvas as never, dispatch as never)
  })

  // 1. loadFromState
  it("loadFromState creates one rect per icon×variant", () => {
    const state = makeState()
    bridge.loadFromState(state, config)
    // 2 icons × 2 variants = 4 rects + labels/headers
    const rects = canvas._objects.filter((o: unknown) => (o as { type?: string }).type === "rect")
    expect(rects).toHaveLength(4)
  })

  it("loadFromState clears existing objects before building", () => {
    bridge.loadFromState(makeState(), config)
    bridge.loadFromState(makeState(), config)
    const rects = canvas._objects.filter((o: unknown) => (o as { type?: string }).type === "rect")
    expect(rects).toHaveLength(4) // not 8
  })

  // 2. sync — add icon
  it("sync adds frame objects for a new icon without clearing existing", () => {
    const prev = makeState()
    bridge.loadFromState(prev, config)
    const countBefore = canvas._objects.length

    const next = makeState({
      icons: [...prev.icons, { id: "bell", name: "Bell", category: "", tags: [], files: {} }],
    })
    bridge.sync(prev, next, config)

    // 2 new rects for bell×outline and bell×filled
    const rects = canvas._objects.filter((o: unknown) => (o as { type?: string }).type === "rect")
    expect(rects).toHaveLength(6)
    expect(canvas._objects.length).toBeGreaterThan(countBefore)
    expect(canvas.clear).toHaveBeenCalledTimes(1) // only from loadFromState
  })

  // 3. sync — remove icon
  it("sync removes only the objects belonging to the removed icon", () => {
    const prev = makeState()
    bridge.loadFromState(prev, config)

    const next = makeState({ icons: [prev.icons[1]!] }) // remove "home"
    bridge.sync(prev, next, config)

    const rects = canvas._objects.filter((o: unknown) => (o as { type?: string }).type === "rect")
    expect(rects).toHaveLength(2) // only star's 2 rects remain
  })

  // 4. sync — rename icon
  it("sync updates only the label text when an icon is renamed", () => {
    const prev = makeState()
    bridge.loadFromState(prev, config)

    const next = makeState({
      icons: [{ ...prev.icons[0]!, name: "House" }, prev.icons[1]!],
    })
    bridge.sync(prev, next, config)

    const labels = canvas._objects.filter(
      (o: unknown) => (o as { type?: string }).type === "i-text" && (o as { text?: string }).text === "House"
    )
    expect(labels.length).toBeGreaterThan(0)
  })

  // 5. object:modified — dirty tracking + guard
  it("object:modified marks the frame dirty", () => {
    bridge.loadFromState(makeState(), config)
    const rects = canvas._objects.filter((o: unknown) => (o as { type?: string }).type === "rect")
    const homeOutlineRect = rects[0] as { data?: { iconId: string; variant: string } }

    canvas.fire("object:modified", { target: homeOutlineRect })
    expect(bridge.isDirty(homeOutlineRect.data!.iconId, homeOutlineRect.data!.variant)).toBe(true)
  })

  it("isUpdatingFromCanvas guard suppresses dirty marking while bridge is updating canvas", () => {
    bridge.loadFromState(makeState(), config)
    const rects = canvas._objects.filter((o: unknown) => (o as { type?: string }).type === "rect")
    const rect = rects[0] as { data?: { iconId: string; variant: string } }

    // Simulate the bridge updating canvas internally — guard should prevent dirty mark
    ;(bridge as unknown as { isUpdatingFromCanvas: boolean }).isUpdatingFromCanvas = true
    canvas.fire("object:modified", { target: rect })
    expect(bridge.isDirty(rect.data!.iconId, rect.data!.variant)).toBe(false)

    // After guard resets, normal events should mark dirty again
    ;(bridge as unknown as { isUpdatingFromCanvas: boolean }).isUpdatingFromCanvas = false
    canvas.fire("object:modified", { target: rect })
    expect(bridge.isDirty(rect.data!.iconId, rect.data!.variant)).toBe(true)
  })

  // 5b. sync — reorder
  it("sync repositions frames when icon order changes", () => {
    const prev = makeState()
    bridge.loadFromState(prev, config)

    // Capture the original top of home's first-variant rect
    const rects = canvas._objects.filter((o: unknown) => (o as { type?: string }).type === "rect")
    const homeRect = rects.find((o: unknown) => (o as { data?: { iconId: string } }).data?.iconId === "home") as { top?: number; set: (p: object) => void }
    const originalTop = homeRect?.top

    // Swap order: star first, home second
    const next = makeState({ icons: [prev.icons[1]!, prev.icons[0]!] })
    bridge.sync(prev, next, config)

    // home should now be in row 1 (lower top) — star takes row 0
    expect(homeRect?.top).not.toBe(originalTop)
  })

  // 6. getIconSVG
  it("getIconSVG returns null for an unknown frame", () => {
    bridge.loadFromState(makeState(), config)
    expect(bridge.getIconSVG("nonexistent", "outline")).toBeNull()
  })

  it("getIconSVG returns a string for a known frame", () => {
    bridge.loadFromState(makeState(), config)
    const result = bridge.getIconSVG("home", "outline")
    expect(typeof result).toBe("string")
  })

  // 7. dirty / markClean
  it("markClean clears the dirty flag", () => {
    bridge.loadFromState(makeState(), config)
    const rects = canvas._objects.filter((o: unknown) => (o as { type?: string }).type === "rect")
    canvas.fire("object:modified", { target: rects[0] as object })

    bridge.markClean("home", "outline")
    expect(bridge.isDirty("home", "outline")).toBe(false)
  })
})
