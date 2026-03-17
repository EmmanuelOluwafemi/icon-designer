import { Rect, IText, Point } from "fabric"
import type { Canvas, FabricObject } from "fabric"
import type { AppDispatch } from "../store"
import type { PackState } from "../store/pack-slice"
import { updateIconFile } from "../store/pack-slice"
import { autoGridLayout } from "./auto-grid-layout"
import type { Frame, GridConfig } from "./auto-grid-layout"

const CANVAS_PADDING = 48
const SERIALIZE_DEBOUNCE_MS = 500

const COLORS = {
  frameFill: "#18181b",
  frameStroke: "#3f3f46",
  frameStrokeActive: "#6366f1",
  header: "#71717a",
  label: "#a1a1aa",
  plus: "#52525b",
}

type FrameKey = string // `${iconId}:${variant}`

function toKey(iconId: string, variant: string): FrameKey {
  return `${iconId}:${variant}`
}

function fromKey(key: FrameKey): { iconId: string; variant: string } {
  const colon = key.indexOf(":")
  return { iconId: key.slice(0, colon), variant: key.slice(colon + 1) }
}

function applyGridSize(config: GridConfig, state: PackState): GridConfig {
  return { ...config, gridSize: state.gridSize }
}

interface FrameObjects {
  rect: Rect
  /** Absolute-positioned clip rect applied to each drawn shape in this frame */
  clipRect: Rect
  /** Drawn shapes (Rect, Ellipse, Line, Path) owned by this frame */
  shapes: FabricObject[]
  plus?: IText
  label?: IText
}

export class CanvasBridge {
  private frameObjects = new Map<FrameKey, FrameObjects>()
  private headerObjects: IText[] = []
  private dirty = new Set<FrameKey>()
  private isUpdatingFromCanvas = false
  private serializeTimers = new Map<FrameKey, ReturnType<typeof setTimeout>>()

  constructor(
    private canvas: Canvas,
    private dispatch: AppDispatch
  ) {
    this.canvas.on("object:modified", (e: { target?: object }) => {
      if (this.isUpdatingFromCanvas) return
      const target = e.target as { data?: { iconId: string; variant: string } } | undefined
      if (target?.data) {
        this.dirty.add(toKey(target.data.iconId, target.data.variant))
      }
    })
  }

  // -------------------------------------------------------------------------
  // Full load — clear canvas and rebuild from state
  // -------------------------------------------------------------------------
  loadFromState(state: PackState, config: GridConfig): void {
    this.serializeTimers.forEach((t) => clearTimeout(t))
    this.serializeTimers.clear()
    this.canvas.clear()
    this.frameObjects.clear()
    this.headerObjects = []
    this.dirty.clear()
    this.buildAll(state, applyGridSize(config, state))
    this.canvas.renderAll()
  }

  // -------------------------------------------------------------------------
  // Incremental sync — diff prev vs next, only touch what changed
  // -------------------------------------------------------------------------
  sync(prev: PackState, next: PackState, config: GridConfig): void {
    const cfg = applyGridSize(config, next)
    const prevIds = new Set(prev.icons.map((i) => i.id))
    const nextIds = new Set(next.icons.map((i) => i.id))

    // Remove icons no longer present
    for (const id of prevIds) {
      if (!nextIds.has(id)) this.removeIconFrames(id, prev.variants)
    }

    // Add new icons
    const newIcons = next.icons.filter((i) => !prevIds.has(i.id))
    if (newIcons.length > 0) {
      const frames = autoGridLayout(newIcons, next.variants, cfg)
      for (const frame of frames) {
        const icon = newIcons.find((i) => i.id === frame.iconId)!
        this.addFrameObjects(frame, icon, next.variants)
      }
    }

    // Renames — update label text in place
    for (const nextIcon of next.icons) {
      const prevIcon = prev.icons.find((i) => i.id === nextIcon.id)
      if (prevIcon && prevIcon.name !== nextIcon.name) {
        this.updateLabel(nextIcon.id, next.variants[0] ?? "", nextIcon.name)
      }
    }

    // Reorder — if icon order changed, reposition all existing frames
    const orderChanged = prev.icons.some((icon, i) => icon.id !== next.icons[i]?.id)
    if (orderChanged) {
      this.repositionAll(next, cfg)
    }

    this.canvas.renderAll()
  }

  // -------------------------------------------------------------------------
  // Active frame highlight
  // -------------------------------------------------------------------------
  setActiveFrame(iconId: string | null, variant: string | null): void {
    for (const [key, objs] of this.frameObjects) {
      const { iconId: fIconId, variant: fVariant } = fromKey(key)
      const isActive = fIconId === iconId && fVariant === variant
      objs.rect.set({
        stroke: isActive ? COLORS.frameStrokeActive : COLORS.frameStroke,
        strokeWidth: isActive ? 2 : 1,
        strokeDashArray: isActive ? undefined : (objs.plus ? [4, 4] : undefined),
      })
    }
  }

  // -------------------------------------------------------------------------
  // Frame hit-testing — returns which frame contains canvas point (x, y)
  // -------------------------------------------------------------------------
  getFrameAtPoint(x: number, y: number): { iconId: string; variant: string } | null {
    const point = new Point(x, y)
    for (const [key, objs] of this.frameObjects) {
      if (objs.rect.containsPoint(point)) {
        return fromKey(key)
      }
    }
    return null
  }

  // -------------------------------------------------------------------------
  // Add a drawn shape to a frame — applies clip rect, registers ownership
  // -------------------------------------------------------------------------
  addShapeToFrame(iconId: string, variant: string, shape: FabricObject): void {
    const objs = this.frameObjects.get(toKey(iconId, variant))
    if (!objs) return
    ;(shape as unknown as { clipPath: Rect }).clipPath = objs.clipRect
    objs.shapes.push(shape)
    this.dirty.add(toKey(iconId, variant))
    this.scheduleSerialize(iconId, variant)
  }

  // -------------------------------------------------------------------------
  // SVG serialization — frame shapes → SVG string with frame-local viewBox
  // -------------------------------------------------------------------------
  serializeFrameSVG(iconId: string, variant: string): string {
    const objs = this.frameObjects.get(toKey(iconId, variant))
    if (!objs || objs.shapes.length === 0) return ""

    const { left: fl = 0, top: ft = 0, width: fw = 48, height: fh = 48 } = objs.rect

    const shapeSVGs = objs.shapes
      .map((s) => {
        try {
          return (s as unknown as { toSVG: () => string }).toSVG()
        } catch {
          return ""
        }
      })
      .filter(Boolean)
      .join("\n")

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fw} ${fh}">`,
      `  <g transform="translate(${-fl},${-ft})">`,
      shapeSVGs,
      `  </g>`,
      `</svg>`,
    ].join("\n")
  }

  // -------------------------------------------------------------------------
  // Legacy SVG export (used externally — delegates to serializeFrameSVG)
  // -------------------------------------------------------------------------
  getIconSVG(iconId: string, variant: string): string | null {
    const objs = this.frameObjects.get(toKey(iconId, variant))
    if (!objs) return null
    return (
      this.serializeFrameSVG(iconId, variant) ||
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${objs.rect.width ?? 48} ${objs.rect.height ?? 48}"></svg>`
    )
  }

  // -------------------------------------------------------------------------
  // Dirty tracking
  // -------------------------------------------------------------------------
  isDirty(iconId: string, variant: string): boolean {
    return this.dirty.has(toKey(iconId, variant))
  }

  markClean(iconId: string, variant: string): void {
    this.dirty.delete(toKey(iconId, variant))
  }

  dispose(): void {
    this.serializeTimers.forEach((t) => clearTimeout(t))
    this.canvas.dispose()
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------
  private scheduleSerialize(iconId: string, variant: string): void {
    const key = toKey(iconId, variant)
    const existing = this.serializeTimers.get(key)
    if (existing) clearTimeout(existing)

    const timer = setTimeout(() => {
      const svg = this.serializeFrameSVG(iconId, variant)
      if (svg) {
        this.dispatch(updateIconFile({ id: iconId, variant, svg }))
      }
      this.serializeTimers.delete(key)
    }, SERIALIZE_DEBOUNCE_MS)

    this.serializeTimers.set(key, timer)
  }

  private buildAll(state: PackState, cfg: GridConfig): void {
    const { icons, variants, gridSize } = state
    const cellSize = gridSize + cfg.padding

    // Variant column headers
    variants.forEach((variant, col) => {
      const header = new IText(variant, {
        left: CANVAS_PADDING + col * cellSize + gridSize / 2,
        top: CANVAS_PADDING + cfg.headerHeight / 2 - 8,
        fontSize: 11,
        fill: COLORS.header,
        fontFamily: "sans-serif",
        selectable: false,
        evented: false,
        originX: "center",
      })
      this.headerObjects.push(header)
      this.canvas.add(header)
    })

    const frames = autoGridLayout(icons, variants, cfg)
    for (const frame of frames) {
      const icon = icons.find((i) => i.id === frame.iconId)!
      this.addFrameObjects(frame, icon, variants)
    }
  }

  private addFrameObjects(
    frame: Frame,
    icon: PackState["icons"][number],
    variants: string[]
  ): void {
    const { x, y, size, iconId, variant } = frame
    const key = toKey(iconId, variant)
    const isEmpty = !icon.files[variant]

    const rect = new Rect({
      left: CANVAS_PADDING + x,
      top: CANVAS_PADDING + y,
      width: size,
      height: size,
      fill: COLORS.frameFill,
      stroke: COLORS.frameStroke,
      strokeWidth: 1,
      strokeDashArray: isEmpty ? [4, 4] : undefined,
      selectable: false,
      evented: true,
      rx: 2,
      ry: 2,
      data: { iconId, variant },
    })
    this.canvas.add(rect)

    // Clip rect: absolute-positioned, not added to canvas, used as clipPath on drawn shapes
    const clipRect = new Rect({
      left: CANVAS_PADDING + x,
      top: CANVAS_PADDING + y,
      width: size,
      height: size,
      absolutePositioned: true,
    })

    const frameObjs: FrameObjects = { rect, clipRect, shapes: [] }

    if (isEmpty) {
      const plus = new IText("+", {
        left: CANVAS_PADDING + x + size / 2,
        top: CANVAS_PADDING + y + size / 2,
        fontSize: 18,
        fill: COLORS.plus,
        fontFamily: "sans-serif",
        selectable: false,
        evented: false,
        originX: "center",
        originY: "center",
      })
      this.canvas.add(plus)
      frameObjs.plus = plus
    }

    // Label only on the first variant column
    if (variant === variants[0]) {
      const label = new IText(icon.name, {
        left: CANVAS_PADDING + x + size / 2,
        top: CANVAS_PADDING + y + size + 6,
        fontSize: 10,
        fill: COLORS.label,
        fontFamily: "sans-serif",
        selectable: false,
        evented: false,
        originX: "center",
      })
      this.canvas.add(label)
      frameObjs.label = label
    }

    this.frameObjects.set(key, frameObjs)
  }

  private removeIconFrames(iconId: string, variants: string[]): void {
    for (const variant of variants) {
      const key = toKey(iconId, variant)
      const objs = this.frameObjects.get(key)
      if (!objs) continue
      this.canvas.remove(objs.rect)
      if (objs.plus) this.canvas.remove(objs.plus)
      if (objs.label) this.canvas.remove(objs.label)
      objs.shapes.forEach((s) => this.canvas.remove(s))
      this.frameObjects.delete(key)
      this.dirty.delete(key)
    }
  }

  private updateLabel(iconId: string, firstVariant: string, name: string): void {
    const objs = this.frameObjects.get(toKey(iconId, firstVariant))
    if (objs?.label) objs.label.set({ text: name })
  }

  private repositionAll(state: PackState, cfg: GridConfig): void {
    const frames = autoGridLayout(state.icons, state.variants, cfg)
    for (const frame of frames) {
      const { x, y, size, iconId, variant } = frame
      const objs = this.frameObjects.get(toKey(iconId, variant))
      if (!objs) continue
      objs.rect.set({ left: CANVAS_PADDING + x, top: CANVAS_PADDING + y })
      objs.clipRect.set({ left: CANVAS_PADDING + x, top: CANVAS_PADDING + y })
      if (objs.plus) {
        objs.plus.set({ left: CANVAS_PADDING + x + size / 2, top: CANVAS_PADDING + y + size / 2 })
      }
      if (objs.label) {
        objs.label.set({ left: CANVAS_PADDING + x + size / 2, top: CANVAS_PADDING + y + size + 6 })
      }
    }
  }
}
