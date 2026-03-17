import { createSlice } from "@reduxjs/toolkit"

export interface Icon {
  id: string
  name: string
  category: string
  tags: string[]
  files: Record<string, string>
}

export interface PackState {
  isLoaded: boolean
  name: string
  gridSize: number
  variants: string[]
  icons: Icon[]
}

const initialState: PackState = {
  isLoaded: false,
  name: "",
  gridSize: 24,
  variants: [],
  icons: [],
}

const packSlice = createSlice({
  name: "pack",
  initialState,
  reducers: {
    loadPack(_state, action: { payload: Omit<PackState, "isLoaded"> }) {
      return { ...action.payload, isLoaded: true }
    },
    addIcon(state, action: { payload: Icon }) {
      const exists = state.icons.some((i) => i.id === action.payload.id)
      if (!exists) {
        state.icons.push(action.payload)
      }
    },
    removeIcon(state, action: { payload: string }) {
      state.icons = state.icons.filter((i) => i.id !== action.payload)
    },
  },
})

export const { loadPack, addIcon, removeIcon } = packSlice.actions

export default packSlice.reducer
