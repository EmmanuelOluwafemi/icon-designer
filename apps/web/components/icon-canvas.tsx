"use client"

import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { Canvas, Rect, IText } from "fabric"
import type { RootState } from "../store"
import { autoGridLayout } from "../lib/auto-grid-layout"
import type { GridConfig } from "../lib/auto-grid-layout"

const GRID_CONFIG: GridConfig = {
  gridSize: 48,
  padding: 24,
  labelHeight: 24,
  headerHeight: 40,
}

const FRAME_FILL = "#18181b"
const FRAME_STROKE = "#3f3f46"
const HEADER_COLOR = "#71717a"
const LABEL_COLOR = "#a1a1aa"
const CANVAS_BG = "#09090b"

export function IconCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)

  const { icons, variants, gridSize, isLoaded } = useSelector((s: RootState) => s.pack)

  // Mount / unmount the Fabric canvas once
  useEffect(() => {
    const el = canvasElRef.current
    if (!el) return

    const fc = new Canvas(el, {
      backgroundColor: CANVAS_BG,
      selection: false,
    })
    fabricRef.current = fc

    return () => {
      fc.dispose()
      fabricRef.current = null
    }
  }, [])

  // Re-render frames whenever pack state changes
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
        left: col * cellSize + gridSize / 2,
        top: config.headerHeight / 2 - 6,
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
        left: x,
        top: y,
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
          left: x + size / 2,
          top: y + size + 4,
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
    <div className="relative h-full w-full overflow-auto">
      <canvas ref={canvasElRef} />
    </div>
  )
}
