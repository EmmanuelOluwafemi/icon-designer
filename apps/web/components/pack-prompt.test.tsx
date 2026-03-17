import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import React from "react"

// @base-ui/react doesn't initialize correctly in jsdom — provide a simple shim
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
