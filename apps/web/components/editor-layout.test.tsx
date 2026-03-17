import { describe, it, expect, vi } from "vitest"
import React from "react"

// @base-ui/react doesn't initialize correctly in jsdom — shim the UI primitives
vi.mock("@workspace/ui/components/button", () => ({
  Button: ({ children, onClick, disabled, ...rest }: React.ComponentProps<"button">) => (
    <button onClick={onClick} disabled={disabled} {...rest}>{children}</button>
  ),
}))
vi.mock("@workspace/ui/components/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock("@workspace/ui/components/input", () => ({
  Input: (props: React.ComponentProps<"input">) => <input {...props} />,
}))
vi.mock("@workspace/ui/components/label", () => ({
  Label: ({ children, ...props }: React.ComponentProps<"label">) => <label {...props}>{children}</label>,
}))
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import packReducer from "@/store/pack-slice"
import editorReducer from "@/store/editor-slice"
import uiReducer from "@/store/ui-slice"
import { EditorLayout } from "./editor-layout"

// Fabric.js requires a real WebGL/canvas context — mock it for jsdom
vi.mock("fabric", () => {
  class Canvas {
    selection = false
    on = vi.fn()
    off = vi.fn()
    getObjects = vi.fn(() => [])
    add = vi.fn()
    remove = vi.fn()
    clear = vi.fn()
    renderAll = vi.fn()
    dispose = vi.fn()
    setDimensions = vi.fn()
    getZoom = vi.fn(() => 1)
    zoomToPoint = vi.fn()
    relativePan = vi.fn()
    setCursor = vi.fn()
    getActiveObject = vi.fn(() => null)
    discardActiveObject = vi.fn()
    constructor() {}
  }
  class Point {
    constructor(public x: number, public y: number) {}
  }
  return { Canvas, Point }
})

function makeStore() {
  return configureStore({
    reducer: { pack: packReducer, editor: editorReducer, ui: uiReducer },
  })
}

function renderEditor() {
  return render(
    <Provider store={makeStore()}>
      <EditorLayout />
    </Provider>
  )
}

describe("EditorLayout", () => {
  it("renders all 5 panels", () => {
    renderEditor()
    expect(screen.getByRole("banner")).toBeInTheDocument()        // TopBar
    expect(screen.getByRole("toolbar")).toBeInTheDocument()       // Toolbar
    expect(screen.getByRole("complementary")).toBeInTheDocument() // Sidebar
    expect(screen.getByRole("main")).toBeInTheDocument()          // Canvas
    expect(screen.getByRole("region", { name: /properties/i })).toBeInTheDocument() // PropertiesPanel
  })
})
