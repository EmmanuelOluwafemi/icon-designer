import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import packReducer from "@/store/pack-slice"
import editorReducer from "@/store/editor-slice"
import uiReducer from "@/store/ui-slice"
import { EditorLayout } from "./editor-layout"

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
