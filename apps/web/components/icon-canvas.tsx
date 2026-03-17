"use client"

import { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Canvas, Point } from "fabric"
import type { RootState, AppDispatch } from "../store"
import type { GridConfig } from "../lib/auto-grid-layout"
import { CanvasBridge } from "../lib/canvas-bridge"
import { setActiveIconId, setActiveVariant } from "../store/editor-slice"
import type { PackState } from "../store/pack-slice"
import { useDrawTool } from "../hooks/use-draw-tool"
import { useCanvasShortcuts } from "../hooks/use-canvas-shortcuts"
import { usePenTool } from "../hooks/use-pen-tool"

const GRID_CONFIG: GridConfig = {
  gridSize: 48,
  padding: 32,
  labelHeight: 24,
  headerHeight: 56,
}

const CANVAS_BG = "#09090b"

export function IconCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const bridgeRef = useRef<CanvasBridge | null>(null)
  const prevStateRef = useRef<PackState | null>(null)
  const isPanning = useRef(false)
  const lastPan = useRef({ x: 0, y: 0 })
  const { activeIconId, activeVariant, activeTool, strokeColor, strokeWidth, fillColor } = useSelector((s: RootState) => s.editor)
  const activeToolRef = useRef(activeTool)

  const dispatch = useDispatch<AppDispatch>()
  const packState = useSelector((s: RootState) => s.pack)

  useEffect(() => { activeToolRef.current = activeTool }, [activeTool])

  useDrawTool(fabricRef, bridgeRef, activeTool, strokeColor, strokeWidth, fillColor)
  usePenTool(fabricRef, bridgeRef, activeTool, { strokeColor, strokeWidth, fillColor })
  useCanvasShortcuts(fabricRef, dispatch)

  // Mount Fabric canvas + CanvasBridge once
  useEffect(() => {
    const container = containerRef.current
    const el = canvasElRef.current
    if (!container || !el) return

    const fc = new Canvas(el, { backgroundColor: CANVAS_BG, selection: false })
    fabricRef.current = fc

    const bridge = new CanvasBridge(fc, dispatch)
    bridgeRef.current = bridge

    // Click on a frame rect to set active icon/variant
    fc.on("mouse:down:before", (e) => {
      const target = e.target as { data?: { iconId: string; variant: string } } | null
      if (target?.data) {
        dispatch(setActiveIconId(target.data.iconId))
        dispatch(setActiveVariant(target.data.variant))
      }
    })

    // Pan on empty canvas — only when select tool is active
    fc.on("mouse:down", (e) => {
      if (!e.target && activeToolRef.current === "select") {
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

    const resize = () => {
      fc.setDimensions({ width: container.clientWidth, height: container.clientHeight })
      fc.renderAll()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)

    return () => {
      observer.disconnect()
      bridge.dispose()
      bridgeRef.current = null
      fabricRef.current = null
    }
  }, [dispatch])

  // Sync Redux pack state → CanvasBridge (incremental)
  useEffect(() => {
    const bridge = bridgeRef.current
    if (!bridge) return

    if (!packState.isLoaded || packState.icons.length === 0 || packState.variants.length === 0) return

    const prev = prevStateRef.current
    if (!prev) {
      bridge.loadFromState(packState, GRID_CONFIG)
    } else {
      bridge.sync(prev, packState, GRID_CONFIG)
    }
    prevStateRef.current = packState
  }, [packState])

  // Update active frame highlight whenever selection changes
  useEffect(() => {
    bridgeRef.current?.setActiveFrame(activeIconId, activeVariant)
    fabricRef.current?.renderAll()
  }, [activeIconId, activeVariant])

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${activeTool === "select" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"}`}>
      <canvas ref={canvasElRef} />
    </div>
  )
}
