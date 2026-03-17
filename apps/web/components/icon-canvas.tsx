"use client"

import { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Canvas, Rect, IText, Point } from "fabric"
import type { RootState, AppDispatch } from "../store"
import { autoGridLayout } from "../lib/auto-grid-layout"
import type { GridConfig } from "../lib/auto-grid-layout"
import { setActiveIconId, setActiveVariant } from "../store/editor-slice"

const GRID_CONFIG: GridConfig = {
  gridSize: 48,
  padding: 32,
  labelHeight: 24,
  headerHeight: 56,
}

const CANVAS_PADDING = 48

const FRAME_FILL = "#18181b"
const FRAME_STROKE = "#3f3f46"
const FRAME_STROKE_ACTIVE = "#6366f1"
const FRAME_STROKE_EMPTY = "#3f3f46"
const HEADER_COLOR = "#71717a"
const LABEL_COLOR = "#a1a1aa"
const LABEL_COLOR_ACTIVE = "#e4e4e7"
const CANVAS_BG = "#09090b"
const PLUS_COLOR = "#52525b"

export function IconCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const isPanning = useRef(false)
  const lastPan = useRef({ x: 0, y: 0 })

  const dispatch = useDispatch<AppDispatch>()
  const { icons, variants, gridSize, isLoaded } = useSelector((s: RootState) => s.pack)
  const { activeIconId, activeVariant } = useSelector((s: RootState) => s.editor)

  // Mount Fabric canvas and keep it sized to the container
  useEffect(() => {
    const container = containerRef.current
    const el = canvasElRef.current
    if (!container || !el) return

    const fc = new Canvas(el, {
      backgroundColor: CANVAS_BG,
      selection: false,
    })
    fabricRef.current = fc

    const resize = () => {
      fc.setDimensions({ width: container.clientWidth, height: container.clientHeight })
      fc.renderAll()
    }
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(container)

    // Click on a frame to set active icon/variant
    fc.on("mouse:down", (e) => {
      if (!e.target) {
        isPanning.current = true
        const evt = e.e as MouseEvent
        lastPan.current = { x: evt.clientX, y: evt.clientY }
        fc.setCursor("grabbing")
      }
    })

    fc.on("mouse:move", (e) => {
      if (!isPanning.current) return
      const evt = e.e as MouseEvent
      const dx = evt.clientX - lastPan.current.x
      const dy = evt.clientY - lastPan.current.y
      lastPan.current = { x: evt.clientX, y: evt.clientY }
      fc.relativePan(new Point(dx, dy))
    })

    fc.on("mouse:up", () => {
      isPanning.current = false
      fc.setCursor("default")
    })

    fc.on("mouse:wheel", (e) => {
      const evt = e.e as WheelEvent
      let zoom = fc.getZoom()
      zoom *= 0.999 ** evt.deltaY
      zoom = Math.min(Math.max(zoom, 0.1), 5)
      fc.zoomToPoint(new Point(evt.offsetX, evt.offsetY), zoom)
      evt.preventDefault()
      evt.stopPropagation()
    })

    return () => {
      observer.disconnect()
      fc.dispose()
      fabricRef.current = null
    }
  }, [])

  // Re-render grid whenever pack or editor state changes
  useEffect(() => {
    const fc = fabricRef.current
    if (!fc) return

    fc.clear()
    fc.backgroundColor = CANVAS_BG

    if (!isLoaded || icons.length === 0 || variants.length === 0) {
      fc.renderAll()
      return
    }

    const config: GridConfig = { ...GRID_CONFIG, gridSize }
    const cellSize = gridSize + config.padding
    const frames = autoGridLayout(icons, variants, config)

    // Variant column headers
    variants.forEach((variant, col) => {
      fc.add(new IText(variant, {
        left: CANVAS_PADDING + col * cellSize + gridSize / 2,
        top: CANVAS_PADDING + config.headerHeight / 2 - 8,
        fontSize: 11,
        fill: HEADER_COLOR,
        fontFamily: "sans-serif",
        selectable: false,
        evented: false,
        originX: "center",
      }))
    })

    // Icon frames + labels
    for (const frame of frames) {
      const { x, y, size, iconId, variant } = frame
      const icon = icons.find((i) => i.id === iconId)
      const isActive = iconId === activeIconId && variant === activeVariant
      const isEmpty = !icon?.files[variant]

      // Frame rect — dashed stroke for empty slots
      const rect = new Rect({
        left: CANVAS_PADDING + x,
        top: CANVAS_PADDING + y,
        width: size,
        height: size,
        fill: FRAME_FILL,
        stroke: isActive ? FRAME_STROKE_ACTIVE : FRAME_STROKE_EMPTY,
        strokeWidth: isActive ? 2 : 1,
        strokeDashArray: isEmpty && !isActive ? [4, 4] : undefined,
        selectable: false,
        evented: true,
        rx: 2,
        ry: 2,
        data: { iconId, variant },
      })

      rect.on("mousedown", () => {
        dispatch(setActiveIconId(iconId))
        dispatch(setActiveVariant(variant))
      })

      fc.add(rect)

      // "+" indicator for empty slots — clickable to set active variant
      if (isEmpty) {
        const plus = new IText("+", {
          left: CANVAS_PADDING + x + size / 2,
          top: CANVAS_PADDING + y + size / 2,
          fontSize: 18,
          fill: PLUS_COLOR,
          fontFamily: "sans-serif",
          selectable: false,
          evented: true,
          originX: "center",
          originY: "center",
        })
        plus.on("mousedown", () => {
          dispatch(setActiveIconId(iconId))
          dispatch(setActiveVariant(variant))
        })
        fc.add(plus)
      }

      // Icon name label (only once per row, on the first variant column)
      if (variant === variants[0] && icon) {
        fc.add(new IText(icon.name, {
          left: CANVAS_PADDING + x + size / 2,
          top: CANVAS_PADDING + y + size + 6,
          fontSize: 10,
          fill: isActive ? LABEL_COLOR_ACTIVE : LABEL_COLOR,
          fontFamily: "sans-serif",
          selectable: false,
          evented: false,
          originX: "center",
        }))
      }
    }

    fc.renderAll()
  }, [icons, variants, gridSize, isLoaded, activeIconId, activeVariant, dispatch])

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden cursor-grab active:cursor-grabbing">
      <canvas ref={canvasElRef} />
    </div>
  )
}
