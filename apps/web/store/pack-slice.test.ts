import { describe, it, expect } from "vitest"
import { configureStore } from "@reduxjs/toolkit"
import packReducer, { loadPack, addIcon, removeIcon } from "./pack-slice"
import type { Icon } from "./pack-slice"

function makeStore() {
  return configureStore({ reducer: { pack: packReducer } })
}

const testIcon: Icon = {
  id: "home",
  name: "Home",
  category: "navigation",
  tags: ["house"],
  files: {},
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

  it("loadPack hydrates pack metadata and icons", () => {
    const store = makeStore()
    store.dispatch(loadPack({
      name: "My Icons",
      gridSize: 32,
      variants: ["outline", "filled"],
      icons: [testIcon],
    }))
    const state = store.getState().pack
    expect(state.isLoaded).toBe(true)
    expect(state.name).toBe("My Icons")
    expect(state.gridSize).toBe(32)
    expect(state.variants).toEqual(["outline", "filled"])
    expect(state.icons).toHaveLength(1)
    expect(state.icons[0]).toMatchObject({ id: "home", name: "Home" })
  })

  it("addIcon appends an icon to the list", () => {
    const store = makeStore()
    store.dispatch(addIcon(testIcon))
    expect(store.getState().pack.icons).toHaveLength(1)
    expect(store.getState().pack.icons[0]).toMatchObject({ id: "home" })
  })

  it("addIcon does not add a duplicate id", () => {
    const store = makeStore()
    store.dispatch(addIcon(testIcon))
    store.dispatch(addIcon(testIcon))
    expect(store.getState().pack.icons).toHaveLength(1)
  })

  it("removeIcon removes an icon by id", () => {
    const store = makeStore()
    store.dispatch(addIcon(testIcon))
    store.dispatch(removeIcon("home"))
    expect(store.getState().pack.icons).toHaveLength(0)
  })

  it("removeIcon is a no-op for unknown id", () => {
    const store = makeStore()
    store.dispatch(addIcon(testIcon))
    store.dispatch(removeIcon("nonexistent"))
    expect(store.getState().pack.icons).toHaveLength(1)
  })
})
