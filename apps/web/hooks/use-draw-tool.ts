import { useEffect, useRef } from "react"
import { Rect, Ellipse, Line } from "fabric"
import type { Canvas, FabricObject } from "fabric"
import type { EditorState } from "../store/editor-slice"

type DrawTool = "rect" | "circle" | "line"
const DRAW_TOOLS: string[] = ["rect", "circle", "line"]

interface DrawProps {
  strokeColor: string
  strokeWidth: number
  fillColor: string
}

function createShape(tool: DrawTool, x: number, y: number, props: DrawProps): FabricObject {
  const base = {
    left: x,
    top: y,
    stroke: props.strokeColor,
    strokeWidth: props.strokeWidth,
    fill: props.fillColor === "transparent" ? "" : props.fillColor,
    selectable: true,
    evented: true,
  }
  if (tool === "rect") return new Rect({ ...base, width: 0, height: 0, rx: 0, ry: 0 })
  if (tool === "circle") return new Ellipse({ ...base, rx: 0, ry: 0 })
  // line
  return new Line([x, y, x, y], { ...base, left: x, top: y })
}

function updateShape(tool: DrawTool, shape: FabricObject, startX: number, startY: number, currX: number, currY: number) {
  const w = Math.abs(currX - startX)
  const h = Math.abs(currY - startY)
  const left = Math.min(startX, currX)
  const top = Math.min(startY, currY)

  if (tool === "rect") {
    shape.set({ left, top, width: w, height: h })
  } else if (tool === "circle") {
    const ellipse = shape as Ellipse
    ellipse.set({ left, top, rx: w / 2, ry: h / 2 })
  } else if (tool === "line") {
    const line = shape as Line
    line.set({ x1: startX, y1: startY, x2: currX, y2: currY })
  }
  shape.setCoords()
}

export function useDrawTool(
  fabricRef: React.RefObject<Canvas | null>,
  activeTool: EditorState["activeTool"],
  strokeColor: string,
  strokeWidth: number,
  fillColor: string
) {
  const drawing = useRef(false)
  const startPoint = useRef({ x: 0, y: 0 })
  const activeShape = useRef<FabricObject | null>(null)

  useEffect(() => {
    const fc = fabricRef.current
    if (!fc) return

    // Enable/disable object selection based on tool
    fc.selection = activeTool === "select"
    fc.getObjects().forEach((obj) => {
      // Don't make frame rects (which have .data) interactive in draw mode
      const isFrame = (obj as { data?: unknown }).data !== undefined
      obj.selectable = activeTool === "select" && !isFrame
      obj.evented = activeTool === "select" || !isFrame
    })
    fc.renderAll()

    if (!DRAW_TOOLS.includes(activeTool)) return

    const tool = activeTool as DrawTool
    const props: DrawProps = { strokeColor, strokeWidth, fillColor }

    function onMouseDown(e: { pointer?: { x: number; y: number }; target?: FabricObject | null }) {
      if (e.target && (e.target as { data?: unknown }).data) return // clicked a frame — skip
      const p = e.pointer
      if (!p || !fc) return
      drawing.current = true
      startPoint.current = { x: p.x, y: p.y }
      const shape = createShape(tool, p.x, p.y, props)
      activeShape.current = shape
      fc.add(shape)
    }

    function onMouseMove(e: { pointer?: { x: number; y: number } }) {
      if (!drawing.current || !activeShape.current || !fc) return
      const p = e.pointer
      if (!p) return
      updateShape(tool, activeShape.current, startPoint.current.x, startPoint.current.y, p.x, p.y)
      fc.renderAll()
    }

    function onMouseUp() {
      if (!drawing.current || !activeShape.current || !fc) return
      drawing.current = false
      const obj = activeShape.current
      const w = (obj as { width?: number }).width ?? 0
      const h = (obj as { height?: number }).height ?? 0
      if (w < 2 && h < 2) fc.remove(obj)
      activeShape.current = null
      fc.renderAll()
    }

    fc.on("mouse:down", onMouseDown as never)
    fc.on("mouse:move", onMouseMove as never)
    fc.on("mouse:up", onMouseUp)

    return () => {
      fc.off("mouse:down", onMouseDown as never)
      fc.off("mouse:move", onMouseMove as never)
      fc.off("mouse:up", onMouseUp)
    }
  }, [fabricRef, activeTool, strokeColor, strokeWidth, fillColor])
}
