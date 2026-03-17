"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import type { AppDispatch } from "../store"
import { loadPack } from "../store/pack-slice"
import type { PackManifest } from "../services/file-system-service"

interface Props {
  manifest: PackManifest
  unrecognised: string[]
  onConfirm: () => void
  onCancel: () => void
}

export function ImportReviewDialog({ manifest, unrecognised, onConfirm, onCancel }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const [open, setOpen] = useState(true)

  function handleConfirm() {
    dispatch(loadPack({
      name: manifest.name,
      gridSize: manifest.gridSize,
      variants: manifest.variants,
      icons: manifest.icons.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        tags: e.tags,
        files: e.files,
      })),
    }))
    setOpen(false)
    onConfirm()
  }

  function handleCancel() {
    setOpen(false)
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import SVG Folder</DialogTitle>
          <DialogDescription>
            Review the inferred pack structure before importing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Inferred icons */}
          <div>
            <p className="mb-2 text-sm font-medium">
              {manifest.icons.length} icon{manifest.icons.length !== 1 ? "s" : ""} found
            </p>
            <ScrollArea className="h-48 rounded-md border">
              <div className="p-3 space-y-1">
                {manifest.icons.map((icon) => (
                  <div key={icon.id} className="flex items-center justify-between gap-2 py-0.5">
                    <span className="text-sm">{icon.name}</span>
                    <div className="flex gap-1">
                      {Object.keys(icon.files).map((v) => (
                        <Badge key={v} variant="outline" className="h-4 px-1.5 text-[10px]">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Unrecognised files */}
          {unrecognised.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-destructive">
                {unrecognised.length} unrecognised file{unrecognised.length !== 1 ? "s" : ""} (will be skipped)
              </p>
              <ScrollArea className="h-24 rounded-md border border-destructive/30">
                <div className="p-3 space-y-1">
                  {unrecognised.map((f) => (
                    <p key={f} className="text-xs text-muted-foreground">{f}</p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={manifest.icons.length === 0}>
            Import {manifest.icons.length > 0 ? `${manifest.icons.length} icons` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
