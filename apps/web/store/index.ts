import { configureStore } from "@reduxjs/toolkit"
import packReducer from "./pack-slice"
import editorReducer from "./editor-slice"
import uiReducer from "./ui-slice"

export const store = configureStore({
  reducer: {
    pack: packReducer,
    editor: editorReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
