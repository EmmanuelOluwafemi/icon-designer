import { createSlice } from "@reduxjs/toolkit"

export interface PackState {
  isLoaded: boolean
  name: string
  gridSize: number
  variants: string[]
  icons: unknown[]
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
    loadPack(state, action: { payload: Omit<PackState, "isLoaded"> }) {
      return { ...action.payload, isLoaded: true }
    },
  },
})

export const { loadPack } = packSlice.actions

export default packSlice.reducer
