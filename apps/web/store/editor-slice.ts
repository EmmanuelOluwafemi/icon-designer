import { createSlice } from "@reduxjs/toolkit"

export interface EditorState {
  activeTool: "select" | "pen" | "rect" | "circle" | "line"
  activeIconId: string | null
  activeVariant: string | null
  strokeColor: string
  strokeWidth: number
  fillColor: string
}

const initialState: EditorState = {
  activeTool: "select",
  activeIconId: null,
  activeVariant: null,
  strokeColor: "#ffffff",
  strokeWidth: 1.5,
  fillColor: "transparent",
}

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setActiveIconId(state, action: { payload: string | null }) {
      state.activeIconId = action.payload
    },
    setActiveVariant(state, action: { payload: string | null }) {
      state.activeVariant = action.payload
    },
    setActiveTool(state, action: { payload: EditorState["activeTool"] }) {
      state.activeTool = action.payload
    },
    setStrokeColor(state, action: { payload: string }) {
      state.strokeColor = action.payload
    },
    setStrokeWidth(state, action: { payload: number }) {
      state.strokeWidth = action.payload
    },
    setFillColor(state, action: { payload: string }) {
      state.fillColor = action.payload
    },
  },
})

export const {
  setActiveIconId,
  setActiveVariant,
  setActiveTool,
  setStrokeColor,
  setStrokeWidth,
  setFillColor,
} = editorSlice.actions

export default editorSlice.reducer
