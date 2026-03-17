"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { loadPack } from "@/store/pack-slice"
import { FileSystemService } from "@/services/file-system-service"
import { isBrowserSupported } from "@/lib/browser-support"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

export function PackPrompt() {
  const isLoaded = useSelector((s: RootState) => s.pack.isLoaded)
  const dispatch = useDispatch<AppDispatch>()
  const [newPackName, setNewPackName] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  if (isLoaded) return null

  if (!isBrowserSupported()) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-10 text-center shadow-lg">
          <h1 className="text-xl font-semibold">Browser Not Supported</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Icon Builder requires Google Chrome or Microsoft Edge to access your local files.
            Please open this app in a supported browser.
          </p>
        </div>
      </div>
    )
  }

  async function handleOpen() {
    const dirHandle = await window.showDirectoryPicker()
    const service = await FileSystemService.openPack(dirHandle)
    const { name, gridSize, variants, icons } = service.getManifest()
    dispatch(loadPack({ name, gridSize, variants, icons }))
  }

  async function handleCreate() {
    const name = newPackName.trim()
    if (!name) return
    const dirHandle = await window.showDirectoryPicker({ mode: "readwrite" })
    const service = await FileSystemService.createPack(dirHandle, name, 24)
    const manifest = service.getManifest()
    dispatch(loadPack({ name: manifest.name, gridSize: manifest.gridSize, variants: manifest.variants, icons: manifest.icons }))
  }

  function handleOpenCreateDialog() {
    setNewPackName("")
    setShowCreateDialog(true)
  }

  return (
    <>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 rounded-xl border bg-card p-10 shadow-lg">
          <h1 className="text-xl font-semibold">Icon Builder</h1>
          <p className="text-sm text-muted-foreground">Open an existing icon pack or start a new one.</p>
          <div className="flex gap-3">
            <Button onClick={handleOpen}>Open Pack</Button>
            <Button variant="outline" onClick={handleOpenCreateDialog}>Create New Pack</Button>
          </div>
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Pack</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pack-name">Pack name</Label>
            <Input
              id="pack-name"
              autoFocus
              placeholder="My Icon Pack"
              value={newPackName}
              onChange={(e) => setNewPackName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newPackName.trim()}>Choose Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
