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
    renameIcon(state, action: { payload: { id: string; name: string } }) {
      const icon = state.icons.find((i) => i.id === action.payload.id)
      if (icon) {
        icon.name = action.payload.name
      }
    },
    reorderIcons(state, action: { payload: string[] }) {
      const order = action.payload
      state.icons.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
    },
    updateIconMeta(state, action: { payload: { id: string } & Partial<Pick<Icon, "category" | "tags">> }) {
      const { id, ...patch } = action.payload
      const icon = state.icons.find((i) => i.id === id)
      if (icon) Object.assign(icon, patch)
    },
    updateIconFile(state, action: { payload: { id: string; variant: string; svg: string } }) {
      const icon = state.icons.find((i) => i.id === action.payload.id)
      if (icon) {
        icon.files[action.payload.variant] = action.payload.svg
      }
    },
    duplicateIcon(state, action: { payload: string }) {
      const source = state.icons.find((i) => i.id === action.payload)
      if (!source) return
      const copy: Icon = {
        ...source,
        id: `${source.id}-copy-${Date.now()}`,
        name: `${source.name} copy`,
        files: { ...source.files },
        tags: [...source.tags],
      }
      state.icons.push(copy)
    },
  },
})

export const { loadPack, addIcon, removeIcon, renameIcon, reorderIcons, duplicateIcon, updateIconMeta, updateIconFile } = packSlice.actions

export default packSlice.reducer
