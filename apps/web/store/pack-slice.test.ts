import { describe, it, expect } from "vitest"
import { configureStore } from "@reduxjs/toolkit"
import packReducer from "./pack-slice"

function makeStore() {
  return configureStore({ reducer: { pack: packReducer } })
}

describe("packSlice", () => {
  it("has correct initial state", () => {
    const store = makeStore()
    expect(store.getState().pack).toEqual({
      isLoaded: false,
      name: "",
      gridSize: 24,
      variants: [],
      icons: [],
    })
  })
})
