"use client"

import { Provider } from "react-redux"
import { store } from "@/store"
import { EditorLayout } from "@/components/editor-layout"

export default function Page() {
  return (
    <Provider store={store}>
      <EditorLayout />
    </Provider>
  )
}
