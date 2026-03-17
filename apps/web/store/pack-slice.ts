import { createSlice } from "@reduxjs/toolkit"

export interface PackState {
  name: string
  gridSize: number
  variants: string[]
  icons: unknown[]
}

const initialState: PackState = {
  name: "",
  gridSize: 24,
  variants: [],
  icons: [],
}

const packSlice = createSlice({
  name: "pack",
  initialState,
  reducers: {},
})

export default packSlice.reducer
