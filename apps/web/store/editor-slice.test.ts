import { describe, it, expect } from "vitest"
import { configureStore } from "@reduxjs/toolkit"
import editorReducer from "./editor-slice"

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
})
