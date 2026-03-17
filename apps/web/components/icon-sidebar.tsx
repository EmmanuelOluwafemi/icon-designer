"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import type { RootState, AppDispatch } from "../store"
import { addIcon, removeIcon, duplicateIcon, renameIcon, reorderIcons, updateIconMeta } from "../store/pack-slice"
import { setActiveIconId, setActiveVariant } from "../store/editor-slice"
import type { Icon } from "../store/pack-slice"

function variantDot(files: Record<string, string>, variant: string) {
  return files[variant] ? "bg-primary" : "bg-muted"
}

function TagsInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("")

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed])
    setDraft("")
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
        >
          {tag}
          <button
            className="ml-0.5 hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onChange(tags.filter((t) => t !== tag)) }}
          >×</button>
        </span>
      ))}
      <input
        className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-muted-foreground"
        placeholder="add tag…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit() }
          if (e.key === "Backspace" && !draft && tags.length) onChange(tags.slice(0, -1))
        }}
        onBlur={commit}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

function SortableIconRow({
  icon,
  variants,
  isActive,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
  onUpdateMeta,
  onAddVariant,
}: {
  icon: Icon
  variants: string[]
  isActive: boolean
  onSelect: () => void
  onRename: (name: string) => void
  onDuplicate: () => void
  onDelete: () => void
  onUpdateMeta: (patch: Partial<Pick<Icon, "category" | "tags">>) => void
  onAddVariant: (variant: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(icon.name)
  const [expanded, setExpanded] = useState(false)
  const [editingCategory, setEditingCategory] = useState(false)
  const [categoryDraft, setCategoryDraft] = useState(icon.category)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: icon.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  function commitRename() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== icon.name) onRename(trimmed)
    setEditing(false)
  }

  function commitCategory() {
    const trimmed = categoryDraft.trim()
    if (trimmed !== icon.category) onUpdateMeta({ category: trimmed })
    setEditingCategory(false)
  }

  const emptyVariants = variants.filter((v) => !icon.files[v])

  return (
    <div ref={setNodeRef} style={style} className={`group rounded-md transition-colors ${isActive ? "bg-accent" : "hover:bg-muted/50"}`}>
      <div
        className="flex cursor-pointer items-start gap-1 px-2 py-2"
        onClick={() => { onSelect(); setExpanded((v) => !v) }}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
        >
          ⠿
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            {editing ? (
              <input
                autoFocus
                className="flex-1 bg-transparent text-sm font-medium outline-none"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename()
                  if (e.key === "Escape") { setDraft(icon.name); setEditing(false) }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="flex-1 truncate text-sm font-medium"
                onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); setDraft(icon.name) }}
              >
                {icon.name}
              </span>
            )}

            <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
              {emptyVariants.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    title="Add variant"
                    className="rounded p-0.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >+</DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {emptyVariants.map((v) => (
                      <DropdownMenuItem key={v} onClick={() => onAddVariant(v)}>
                        Add {v}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <button
                title="Duplicate"
                className="rounded p-0.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => { e.stopPropagation(); onDuplicate() }}
              >⧉</button>
              <button
                title="Delete"
                className="rounded p-0.5 text-xs text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete() }}
              >✕</button>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-1.5">
            {editingCategory ? (
              <input
                autoFocus
                className="w-20 rounded bg-muted px-1.5 py-0.5 text-[10px] outline-none"
                value={categoryDraft}
                onChange={(e) => setCategoryDraft(e.target.value)}
                onBlur={commitCategory}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitCategory()
                  if (e.key === "Escape") { setCategoryDraft(icon.category); setEditingCategory(false) }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <Badge
                variant="outline"
                className="h-4 cursor-text px-1.5 text-[10px]"
                onClick={(e) => { e.stopPropagation(); setEditingCategory(true); setCategoryDraft(icon.category) }}
                title="Click to edit category"
              >
                {icon.category || "no category"}
              </Badge>
            )}
            <div className="flex gap-1">
              {variants.map((v) => (
                <span key={v} title={v} className={`h-2 w-2 rounded-full ${variantDot(icon.files, v)}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded: tags editor */}
      {expanded && (
        <div
          className="border-t border-border/50 px-3 pb-2 pt-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tags</p>
          <TagsInput
            tags={icon.tags}
            onChange={(tags) => onUpdateMeta({ tags })}
          />
        </div>
      )}
    </div>
  )
}

export function IconSidebar() {
  const dispatch = useDispatch<AppDispatch>()
  const { icons, variants, isLoaded } = useSelector((s: RootState) => s.pack)
  const { activeIconId } = useSelector((s: RootState) => s.editor)
  const [search, setSearch] = useState("")

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const filtered = icons.filter((icon) => {
    const q = search.toLowerCase()
    return icon.name.toLowerCase().includes(q) || icon.tags.some((t) => t.toLowerCase().includes(q))
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = icons.findIndex((i) => i.id === active.id)
    const newIndex = icons.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(icons, oldIndex, newIndex)
    dispatch(reorderIcons(reordered.map((i) => i.id)))
  }

  function handleAddIcon() {
    const id = `icon-${Date.now()}`
    dispatch(addIcon({ id, name: "Untitled", category: "", tags: [], files: {} }))
    dispatch(setActiveIconId(id))
    dispatch(setActiveVariant(variants[0] ?? null))
  }

  function handleDelete(id: string) {
    const name = icons.find((i) => i.id === id)?.name
    if (confirm(`Delete icon "${name}"?`)) dispatch(removeIcon(id))
  }

  function handleAddVariant(iconId: string, variant: string) {
    dispatch(setActiveIconId(iconId))
    dispatch(setActiveVariant(variant))
  }

  if (!isLoaded) return null

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Icons <span className="font-normal">({icons.length})</span>
        </span>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleAddIcon}>
          + Add
        </Button>
      </div>

      <div className="px-2 py-2">
        <Input
          placeholder="Search by name or tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 text-xs"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="px-1 pb-2">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              {search ? "No results" : "No icons yet"}
            </p>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filtered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {filtered.map((icon) => (
                <SortableIconRow
                  key={icon.id}
                  icon={icon}
                  variants={variants}
                  isActive={activeIconId === icon.id}
                  onSelect={() => { dispatch(setActiveIconId(icon.id)); dispatch(setActiveVariant(variants[0] ?? null)) }}
                  onRename={(name) => dispatch(renameIcon({ id: icon.id, name }))}
                  onDuplicate={() => dispatch(duplicateIcon(icon.id))}
                  onDelete={() => handleDelete(icon.id)}
                  onUpdateMeta={(patch) => dispatch(updateIconMeta({ id: icon.id, ...patch }))}
                  onAddVariant={(variant) => handleAddVariant(icon.id, variant)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>
    </div>
  )
}
