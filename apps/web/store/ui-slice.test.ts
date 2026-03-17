import { describe, it, expect } from "vitest"
import { configureStore } from "@reduxjs/toolkit"
import uiReducer from "./ui-slice"

function makeStore() {
  return configureStore({ reducer: { ui: uiReducer } })
}

describe("uiSlice", () => {
  it("has correct initial state", () => {
    const store = makeStore()
    expect(store.getState().ui).toEqual({
      sidebarOpen: true,
      keylineVisible: true,
      unsavedChanges: false,
    })
  })
})
