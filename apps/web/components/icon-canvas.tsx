"use client"

import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { Canvas, Rect, IText, Point } from "fabric"
import type { RootState } from "../store"
import { autoGridLayout } from "../lib/auto-grid-layout"
import type { GridConfig } from "../lib/auto-grid-layout"

const GRID_CONFIG: GridConfig = {
  gridSize: 48,
  padding: 32,
  labelHeight: 24,
  headerHeight: 56,
}

// Padding between canvas edge and the grid content
const CANVAS_PADDING = 48

const FRAME_FILL = "#18181b"
const FRAME_STROKE = "#3f3f46"
const HEADER_COLOR = "#71717a"
const LABEL_COLOR = "#a1a1aa"
const CANVAS_BG = "#09090b"

export function IconCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)

  // Track pan state
  const isPanning = useRef(false)
  const lastPan = useRef({ x: 0, y: 0 })

  const { icons, variants, gridSize, isLoaded } = useSelector((s: RootState) => s.pack)

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

    // Size canvas to container
    const resize = () => {
      fc.setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      })
      fc.renderAll()
    }
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(container)

    // Pan: drag on empty canvas area
    fc.on("mouse:down", (e) => {
      if (e.target) return // don't pan when clicking an object
      isPanning.current = true
      const evt = e.e as MouseEvent
      lastPan.current = { x: evt.clientX, y: evt.clientY }
      fc.setCursor("grabbing")
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

    // Zoom with mouse wheel
    fc.on("mouse:wheel", (e) => {
      const evt = e.e as WheelEvent
      const delta = evt.deltaY
      let zoom = fc.getZoom()
      zoom *= 0.999 ** delta
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

  // Re-render grid whenever pack state changes
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
      const headerText = new IText(variant, {
        left: CANVAS_PADDING + col * cellSize + gridSize / 2,
        top: CANVAS_PADDING + config.headerHeight / 2 - 8,
        fontSize: 11,
        fill: HEADER_COLOR,
        fontFamily: "sans-serif",
        selectable: false,
        evented: false,
        originX: "center",
      })
      fc.add(headerText)
    })

    // Icon frames + labels
    for (const frame of frames) {
      const { x, y, size, iconId, variant } = frame

      const rect = new Rect({
        left: CANVAS_PADDING + x,
        top: CANVAS_PADDING + y,
        width: size,
        height: size,
        fill: FRAME_FILL,
        stroke: FRAME_STROKE,
        strokeWidth: 1,
        selectable: false,
        evented: false,
        rx: 2,
        ry: 2,
        data: { iconId, variant },
      })
      fc.add(rect)

      const icon = icons.find((i) => i.id === iconId)
      if (icon) {
        const label = new IText(icon.name, {
          left: CANVAS_PADDING + x + size / 2,
          top: CANVAS_PADDING + y + size + 6,
          fontSize: 10,
          fill: LABEL_COLOR,
          fontFamily: "sans-serif",
          selectable: false,
          evented: false,
          originX: "center",
        })
        fc.add(label)
      }
    }

    fc.renderAll()
  }, [icons, variants, gridSize, isLoaded])

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden cursor-grab active:cursor-grabbing">
      <canvas ref={canvasElRef} />
    </div>
  )
}
