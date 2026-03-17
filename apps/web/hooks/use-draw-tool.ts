import { useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Rect, Ellipse, Line } from "fabric"
import type { Canvas, FabricObject } from "fabric"
import type { RootState, AppDispatch } from "../store"
import type { EditorState } from "../store/editor-slice"
import { setActiveIconId, setActiveVariant } from "../store/editor-slice"
import type { CanvasBridge } from "../lib/canvas-bridge"

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
    selectable: false,
    evented: false,
  }
  if (tool === "rect") return new Rect({ ...base, width: 0, height: 0, rx: 0, ry: 0 })
  if (tool === "circle") return new Ellipse({ ...base, rx: 0, ry: 0 })
  return new Line([x, y, x, y], { ...base, left: x, top: y })
}

function updateShape(
  tool: DrawTool,
  shape: FabricObject,
  startX: number,
  startY: number,
  currX: number,
  currY: number
) {
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
  bridgeRef: React.RefObject<CanvasBridge | null>,
  activeTool: EditorState["activeTool"],
  strokeColor: string,
  strokeWidth: number,
  fillColor: string
) {
  const dispatch = useDispatch<AppDispatch>()
  const activeIconId = useSelector((s: RootState) => s.editor.activeIconId)
  const activeVariant = useSelector((s: RootState) => s.editor.activeVariant)

  // Refs to avoid stale closures inside event handlers
  const activeIconIdRef = useRef(activeIconId)
  const activeVariantRef = useRef(activeVariant)
  useEffect(() => { activeIconIdRef.current = activeIconId }, [activeIconId])
  useEffect(() => { activeVariantRef.current = activeVariant }, [activeVariant])

  const drawing = useRef(false)
  const startPoint = useRef({ x: 0, y: 0 })
  const activeShape = useRef<FabricObject | null>(null)
  const currentFrame = useRef<{ iconId: string; variant: string } | null>(null)

  useEffect(() => {
    const fc = fabricRef.current
    if (!fc) return

    // Enable/disable object selection based on tool
    fc.selection = activeTool === "select"
    fc.getObjects().forEach((obj) => {
      const isFrame = (obj as { data?: unknown }).data !== undefined
      obj.selectable = activeTool === "select" && !isFrame
      obj.evented = activeTool === "select" || !isFrame
    })
    fc.renderAll()

    if (!DRAW_TOOLS.includes(activeTool)) return

    const tool = activeTool as DrawTool
    const props: DrawProps = { strokeColor, strokeWidth, fillColor }

    function onMouseDown(e: { pointer?: { x: number; y: number } }) {
      const p = e.pointer
      if (!p || !fc) return

      // Identify which frame this click lands in
      const bridge = bridgeRef.current
      const frame = bridge?.getFrameAtPoint(p.x, p.y) ?? null
      if (!frame) return // don't draw outside any frame

      // Activate the frame if different from current
      if (
        frame.iconId !== activeIconIdRef.current ||
        frame.variant !== activeVariantRef.current
      ) {
        dispatch(setActiveIconId(frame.iconId))
        dispatch(setActiveVariant(frame.variant))
      }

      currentFrame.current = frame
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

      if (w < 2 && h < 2) {
        fc.remove(obj)
      } else {
        // Register the shape with the frame — applies clipPath and schedules SVG sync
        const bridge = bridgeRef.current
        const frame = currentFrame.current
        if (bridge && frame) {
          bridge.addShapeToFrame(frame.iconId, frame.variant, obj)
        }
      }

      activeShape.current = null
      currentFrame.current = null
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
  }, [fabricRef, bridgeRef, activeTool, strokeColor, strokeWidth, fillColor, dispatch])
}
