import { createSlice } from "@reduxjs/toolkit"

export interface UiState {
  sidebarOpen: boolean
  keylineVisible: boolean
  unsavedChanges: boolean
}

const initialState: UiState = {
  sidebarOpen: true,
  keylineVisible: true,
  unsavedChanges: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {},
})

export default uiSlice.reducer
