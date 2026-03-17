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
  },
})

export const { setActiveIconId, setActiveVariant, setActiveTool } = editorSlice.actions

export default editorSlice.reducer
