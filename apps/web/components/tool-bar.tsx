"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../store"
import { setActiveTool } from "../store/editor-slice"
import type { EditorState } from "../store/editor-slice"

type Tool = EditorState["activeTool"]

const TOOLS: { id: Tool; label: string; icon: string; shortcut: string }[] = [
  { id: "select", label: "Select",    icon: "↖",  shortcut: "V" },
  { id: "rect",   label: "Rectangle", icon: "▭",  shortcut: "R" },
  { id: "circle", label: "Circle",    icon: "◯",  shortcut: "C" },
  { id: "line",   label: "Line",      icon: "╱",  shortcut: "L" },
  { id: "pen",    label: "Pen",       icon: "✒",  shortcut: "P" },
]

export function ToolBar() {
  const dispatch = useDispatch<AppDispatch>()
  const activeTool = useSelector((s: RootState) => s.editor.activeTool)

  return (
    <nav role="toolbar" aria-label="Tools" className="flex w-12 shrink-0 flex-col items-center gap-1 border-r py-2">
      {TOOLS.map(({ id, label, icon, shortcut }) => (
        <button
          key={id}
          title={`${label} (${shortcut})`}
          aria-label={label}
          aria-pressed={activeTool === id}
          onClick={() => dispatch(setActiveTool(id))}
          className={`flex h-8 w-8 items-center justify-center rounded text-base transition-colors ${
            activeTool === id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {icon}
        </button>
      ))}
    </nav>
  )
}
