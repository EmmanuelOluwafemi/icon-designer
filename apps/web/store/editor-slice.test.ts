import { describe, it, expect } from "vitest"
import { configureStore } from "@reduxjs/toolkit"
import editorReducer, { setActiveIconId, setActiveVariant, setActiveTool, setStrokeColor, setStrokeWidth, setFillColor } from "./editor-slice"

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
      strokeColor: "#000000",
      strokeWidth: 1.5,
      fillColor: "transparent",
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
    store.dispatch(setActiveTool("rect"))
    expect(store.getState().editor.activeTool).toBe("rect")
  })

  it("setStrokeColor updates stroke color", () => {
    const store = makeStore()
    store.dispatch(setStrokeColor("#ff0000"))
    expect(store.getState().editor.strokeColor).toBe("#ff0000")
  })

  it("setStrokeWidth updates stroke width", () => {
    const store = makeStore()
    store.dispatch(setStrokeWidth(3))
    expect(store.getState().editor.strokeWidth).toBe(3)
  })

  it("setFillColor updates fill color", () => {
    const store = makeStore()
    store.dispatch(setFillColor("#0000ff"))
    expect(store.getState().editor.fillColor).toBe("#0000ff")
  })
})
