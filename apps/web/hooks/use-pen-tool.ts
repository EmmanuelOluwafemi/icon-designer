"use client"

import { useEffect, useRef } from "react"
import { Path, Circle, Group } from "fabric"
import type { Canvas, FabricObject } from "fabric"
import type { EditorState } from "../store/editor-slice"
import { buildPathString, closedPathString, parsePathAnchors, moveAnchor, removeAnchor } from "../lib/path-builder"
import type { AnchorPoint } from "../lib/path-builder"

interface PenProps {
  strokeColor: string
  strokeWidth: number
  fillColor: string
}

const ANCHOR_RADIUS = 4
const HANDLE_RADIUS = 3
const CLOSE_THRESHOLD = 10

/** Tag applied to anchor/handle circles so we can identify them */
const ANCHOR_TAG = "__pen_anchor__"
const HANDLE_TAG = "__pen_handle__"

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function makeAnchorCircle(x: number, y: number, index: number): Circle {
  return new Circle({
    left: x - ANCHOR_RADIUS,
    top: y - ANCHOR_RADIUS,
    radius: ANCHOR_RADIUS,
    fill: "#fff",
    stroke: "#3b82f6",
    strokeWidth: 1.5,
    selectable: true,
    evented: true,
    hasControls: false,
    hasBorders: false,
    data: { tag: ANCHOR_TAG, index },
  })
}

export function usePenTool(
  fabricRef: React.RefObject<Canvas | null>,
  activeTool: EditorState["activeTool"],
  props: PenProps
) {
  const anchors = useRef<AnchorPoint[]>([])
  const previewPath = useRef<Path | null>(null)
  const anchorCircles = useRef<Circle[]>([])
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const fc = fabricRef.current
    if (!fc || activeTool !== "pen") return

    // --- helpers ---

    function getPreviewFill() {
      return props.fillColor === "transparent" ? "" : props.fillColor
    }

    function refreshPreview(pts: AnchorPoint[], closed = false) {
      if (previewPath.current) {
        fc!.remove(previewPath.current)
        previewPath.current = null
      }
      if (pts.length < 1) return
      const d = closed ? closedPathString(pts) : buildPathString(pts)
      if (!d) return
      const p = new Path(d, {
        stroke: props.strokeColor,
        strokeWidth: props.strokeWidth,
        fill: closed ? getPreviewFill() : "",
        selectable: false,
        evented: false,
      })
      previewPath.current = p
      fc!.add(p)
      // Keep anchors on top
      anchorCircles.current.forEach((c) => fc!.bringObjectToFront(c))
      fc!.renderAll()
    }

    function addAnchorCircle(x: number, y: number) {
      const idx = anchors.current.length - 1
      const c = makeAnchorCircle(x, y, idx)
      anchorCircles.current.push(c)
      fc!.add(c)
    }

    function commitPath() {
      if (anchors.current.length < 2) {
        clearPen()
        return
      }
      const d = closedPathString(anchors.current)
      const finalPath = new Path(d, {
        stroke: props.strokeColor,
        strokeWidth: props.strokeWidth,
        fill: getPreviewFill(),
        selectable: true,
        evented: true,
      })
      fc!.add(finalPath)
      clearPen()
    }

    function clearPen() {
      if (previewPath.current) {
        fc!.remove(previewPath.current)
        previewPath.current = null
      }
      anchorCircles.current.forEach((c) => fc!.remove(c))
      anchorCircles.current = []
      anchors.current = []
      fc!.renderAll()
    }

    // --- event handlers ---

    function onMouseDown(e: { pointer?: { x: number; y: number }; target?: FabricObject | null }) {
      const p = e.pointer
      if (!p || !fc) return

      // Clicked on an existing anchor circle — start moving it
      const target = e.target as ({ data?: { tag?: string; index?: number } } & FabricObject) | null
      if (target?.data?.tag === ANCHOR_TAG) {
        isDragging.current = true
        dragStart.current = { x: p.x, y: p.y }
        return
      }

      const pts = anchors.current
      // Close the path if clicking near the first anchor
      if (pts.length >= 2 && dist(p, pts[0]!) < CLOSE_THRESHOLD) {
        commitPath()
        return
      }

      anchors.current = [...pts, { x: p.x, y: p.y }]
      addAnchorCircle(p.x, p.y)
      refreshPreview(anchors.current)
    }

    function onMouseMove(e: { pointer?: { x: number; y: number } }) {
      const p = e.pointer
      if (!p || !fc) return

      if (isDragging.current) return // let Fabric handle anchor drag

      const pts = anchors.current
      if (pts.length === 0) return

      // Show preview with a dangling line to cursor
      const preview = [...pts, { x: p.x, y: p.y }]
      refreshPreview(preview)
    }

    function onMouseUp() {
      isDragging.current = false
    }

    function onObjectModified(e: { target?: FabricObject | null }) {
      const target = e.target as ({ data?: { tag?: string; index?: number }; left?: number; top?: number } & FabricObject) | null
      if (target?.data?.tag !== ANCHOR_TAG) return

      const idx = target.data?.index
      if (idx === undefined) return

      const x = (target.left ?? 0) + ANCHOR_RADIUS
      const y = (target.top ?? 0) + ANCHOR_RADIUS
      anchors.current = moveAnchor(anchors.current, idx, x, y)
      refreshPreview(anchors.current)
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") clearPen()
      if ((e.key === "Delete" || e.key === "Backspace") && fc) {
        const active = fc.getActiveObject() as ({ data?: { tag?: string; index?: number } } & FabricObject) | null
        if (active?.data?.tag === ANCHOR_TAG) {
          const idx = active.data?.index
          if (idx !== undefined) {
            anchors.current = removeAnchor(anchors.current, idx)
            // Re-index remaining circles
            anchorCircles.current.forEach((c, i) => {
              if (i >= idx) {
                const d = (c as unknown as { data: { tag: string; index: number } }).data
                d.index = i
              }
            })
            anchorCircles.current.splice(idx, 1)
            fc.remove(active)
            refreshPreview(anchors.current)
          }
        }
      }
    }

    fc.on("mouse:down", onMouseDown as never)
    fc.on("mouse:move", onMouseMove as never)
    fc.on("mouse:up", onMouseUp)
    fc.on("object:modified", onObjectModified as never)
    window.addEventListener("keydown", onKeyDown)

    return () => {
      clearPen()
      fc.off("mouse:down", onMouseDown as never)
      fc.off("mouse:move", onMouseMove as never)
      fc.off("mouse:up", onMouseUp)
      fc.off("object:modified", onObjectModified as never)
      window.removeEventListener("keydown", onKeyDown)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricRef, activeTool, props.strokeColor, props.strokeWidth, props.fillColor])
}
