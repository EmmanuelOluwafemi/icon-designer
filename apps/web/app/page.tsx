"use client"

import { Provider } from "react-redux"
import { store } from "@/store"
import { loadPack } from "@/store/pack-slice"
import { EditorLayout } from "@/components/editor-layout"

// TODO: remove mock data — for canvas preview only
store.dispatch(loadPack({
  name: "Mock Pack",
  gridSize: 48,
  variants: ["outline", "filled", "duotone"],
  icons: [
    { id: "home",     name: "Home",     category: "navigation", tags: [], files: {} },
    { id: "search",   name: "Search",   category: "navigation", tags: [], files: {} },
    { id: "settings", name: "Settings", category: "system",     tags: [], files: {} },
    { id: "bell",     name: "Bell",     category: "alerts",     tags: [], files: {} },
    { id: "user",     name: "User",     category: "people",     tags: [], files: {} },
  ],
}))

export default function Page() {
  return (
    <Provider store={store}>
      <EditorLayout />
    </Provider>
  )
}
