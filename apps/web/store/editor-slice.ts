import { createSlice } from "@reduxjs/toolkit"

export interface EditorState {
  activeTool: "select" | "pen" | "rect" | "circle" | "line"
  activeIconId: string | null
  activeVariant: string | null
}

const initialState: EditorState = {
  activeTool: "select",
  activeIconId: null,
  activeVariant: null,
}

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {},
})

export default editorSlice.reducer
