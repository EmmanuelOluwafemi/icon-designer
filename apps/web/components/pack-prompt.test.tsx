import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import packReducer from "@/store/pack-slice"
import editorReducer from "@/store/editor-slice"
import uiReducer from "@/store/ui-slice"
import { PackPrompt } from "./pack-prompt"

// Simulate a supported browser so isBrowserSupported() returns true
beforeEach(() => {
  // @ts-expect-error - stub for jsdom
  window.showDirectoryPicker = () => {}
})
afterEach(() => {
  // @ts-expect-error - cleanup
  delete window.showDirectoryPicker
})

function makeStore(isLoaded = false) {
  return configureStore({
    reducer: { pack: packReducer, editor: editorReducer, ui: uiReducer },
    preloadedState: { pack: { isLoaded, name: "", gridSize: 24, variants: [], icons: [] } },
  })
}

describe("PackPrompt", () => {
  it("shows Open and Create buttons when no pack is loaded", () => {
    render(
      <Provider store={makeStore(false)}>
        <PackPrompt />
      </Provider>
    )
    expect(screen.getByRole("button", { name: /open pack/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /create new pack/i })).toBeInTheDocument()
  })

  it("renders nothing when a pack is already loaded", () => {
    const { container } = render(
      <Provider store={makeStore(true)}>
        <PackPrompt />
      </Provider>
    )
    expect(container).toBeEmptyDOMElement()
  })
})
