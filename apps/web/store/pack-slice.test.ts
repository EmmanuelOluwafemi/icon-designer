import { describe, it, expect } from "vitest"
import { configureStore } from "@reduxjs/toolkit"
import packReducer, { loadPack, addIcon, removeIcon, renameIcon, reorderIcons, duplicateIcon, updateIconMeta } from "./pack-slice"
import type { Icon } from "./pack-slice"

function makeStore() {
  return configureStore({ reducer: { pack: packReducer } })
}

const testIcon: Icon = {
  id: "home",
  name: "Home",
  category: "navigation",
  tags: ["house"],
  files: { outline: "home.svg" },
}

const starIcon: Icon = {
  id: "star",
  name: "Star",
  category: "misc",
  tags: [],
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

  it("renameIcon updates the icon name", () => {
    const store = makeStore()
    store.dispatch(addIcon(testIcon))
    store.dispatch(renameIcon({ id: "home", name: "House" }))
    expect(store.getState().pack.icons[0]?.name).toBe("House")
  })

  it("renameIcon is a no-op for unknown id", () => {
    const store = makeStore()
    store.dispatch(addIcon(testIcon))
    store.dispatch(renameIcon({ id: "unknown", name: "X" }))
    expect(store.getState().pack.icons[0]?.name).toBe("Home")
  })

  it("reorderIcons reorders by new id array", () => {
    const store = makeStore()
    store.dispatch(addIcon(testIcon))
    store.dispatch(addIcon(starIcon))
    store.dispatch(reorderIcons(["star", "home"]))
    const icons = store.getState().pack.icons
    expect(icons[0]?.id).toBe("star")
    expect(icons[1]?.id).toBe("home")
  })

  it("duplicateIcon creates a copy with a new id", () => {
    const store = makeStore()
    store.dispatch(addIcon(testIcon))
    store.dispatch(duplicateIcon("home"))
    const icons = store.getState().pack.icons
    expect(icons).toHaveLength(2)
    expect(icons[1]?.name).toBe("Home copy")
    expect(icons[1]?.id).not.toBe("home")
    expect(icons[1]?.files).toEqual(testIcon.files)
  })

  it("updateIconMeta updates category and tags", () => {
    const store = makeStore()
    store.dispatch(addIcon(testIcon))
    store.dispatch(updateIconMeta({ id: "home", category: "ui", tags: ["web", "app"] }))
    const icon = store.getState().pack.icons[0]
    expect(icon?.category).toBe("ui")
    expect(icon?.tags).toEqual(["web", "app"])
  })

  it("updateIconMeta is a no-op for unknown id", () => {
    const store = makeStore()
    store.dispatch(addIcon(testIcon))
    store.dispatch(updateIconMeta({ id: "unknown", category: "ui" }))
    expect(store.getState().pack.icons[0]?.category).toBe("navigation")
  })

  it("duplicateIcon is a no-op for unknown id", () => {
    const store = makeStore()
    store.dispatch(addIcon(testIcon))
    store.dispatch(duplicateIcon("unknown"))
    expect(store.getState().pack.icons).toHaveLength(1)
  })
})
