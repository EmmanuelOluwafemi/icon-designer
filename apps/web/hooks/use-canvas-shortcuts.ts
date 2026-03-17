import { useEffect } from "react"
import type { Canvas } from "fabric"
import type { AppDispatch } from "../store"
import { setActiveTool } from "../store/editor-slice"
import type { EditorState } from "../store/editor-slice"

const KEY_TO_TOOL: Record<string, EditorState["activeTool"]> = {
  v: "select",
  r: "rect",
  c: "circle",
  l: "line",
  p: "pen",
}

export function useCanvasShortcuts(
  fabricRef: React.RefObject<Canvas | null>,
  dispatch: AppDispatch
) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't fire shortcuts when typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const fc = fabricRef.current
      const key = e.key.toLowerCase()
      const meta = e.metaKey || e.ctrlKey

      // Tool shortcuts
      if (!meta && KEY_TO_TOOL[key]) {
        dispatch(setActiveTool(KEY_TO_TOOL[key]!))
        return
      }

      if (!fc) return

      // Undo / redo — requires history plugin (issue #13)
      if (meta && key === "z" && !e.shiftKey) {
        ;(fc as unknown as { undo?: () => void }).undo?.()
        e.preventDefault()
        return
      }
      if (meta && (key === "y" || (key === "z" && e.shiftKey))) {
        ;(fc as unknown as { redo?: () => void }).redo?.()
        e.preventDefault()
        return
      }

      // Group / ungroup
      if (meta && key === "g" && !e.shiftKey) {
        const active = fc.getActiveObject()
        if (active && active.type === "activeselection") {
          const group = (active as { toGroup?: () => unknown }).toGroup?.()
          if (group) fc.setActiveObject(group as never)
          fc.renderAll()
        }
        e.preventDefault()
        return
      }
      if (meta && key === "g" && e.shiftKey) {
        const active = fc.getActiveObject()
        if (active && active.type === "group") {
          (active as { toActiveSelection?: () => unknown }).toActiveSelection?.()
          fc.renderAll()
        }
        e.preventDefault()
        return
      }

      // Delete selected
      if (key === "delete" || key === "backspace") {
        const active = fc.getActiveObject()
        if (active) {
          fc.remove(active)
          fc.discardActiveObject()
          fc.renderAll()
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [fabricRef, dispatch])
}
