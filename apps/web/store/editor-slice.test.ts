import { describe, it, expect } from "vitest"
import { configureStore } from "@reduxjs/toolkit"
import editorReducer, { setActiveIconId, setActiveVariant, setActiveTool } from "./editor-slice"

function makeStore() {
  return configureStore({ reducer: { editor: editorReducer } })
}

describe("editorSlice", () => {
  it("has correct initial state", () => {
    const store = makeStore()
    expect(store.getState().editor).toEqual({
      activeTool: "select",
      activeIconId: null,
      activeVariant: null,
    })
  })

  it("setActiveIconId sets the active icon", () => {
    const store = makeStore()
    store.dispatch(setActiveIconId("home"))
    expect(store.getState().editor.activeIconId).toBe("home")
  })

  it("setActiveIconId can be cleared to null", () => {
    const store = makeStore()
    store.dispatch(setActiveIconId("home"))
    store.dispatch(setActiveIconId(null))
    expect(store.getState().editor.activeIconId).toBeNull()
  })

  it("setActiveVariant sets the active variant", () => {
    const store = makeStore()
    store.dispatch(setActiveVariant("outline"))
    expect(store.getState().editor.activeVariant).toBe("outline")
  })

  it("setActiveVariant can be cleared to null", () => {
    const store = makeStore()
    store.dispatch(setActiveVariant("outline"))
    store.dispatch(setActiveVariant(null))
    expect(store.getState().editor.activeVariant).toBeNull()
  })

  it("setActiveTool changes the active tool", () => {
    const store = makeStore()
    store.dispatch(setActiveTool("pen"))
    expect(store.getState().editor.activeTool).toBe("pen")
  })
})
