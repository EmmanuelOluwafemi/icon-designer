# PRD: Icon Builder — Infinite Canvas Icon Design Studio

## Problem Statement

Icon designers today have no purpose-built tool for creating and managing icon packs. They are forced to adapt general-purpose tools like Figma or Adobe Illustrator, which creates significant friction:

- Icons from the same pack are scattered across artboards with no structured organization
- Applying consistent style changes (e.g. switching an entire pack from outline to filled) requires manual, repetitive work on each icon
- There is no built-in concept of icon variants (outline, filled, duotone) — designers hack these with naming conventions
- Keyline grids (the alignment guides that ensure visual consistency across icon shapes) must be manually set up on every new file
- Importing and exporting icon packs in standard formats requires third-party plugins or manual scripting
- There is no single workspace where all icons in a pack live, are organized, and can be worked on simultaneously

Icon designers need a tool that understands their workflow from the ground up — not a general design tool repurposed for icon work.

## Solution

Icon Builder is a specialized, infinite-canvas design studio built exclusively for icon designers. It provides a structured yet flexible workspace where designers can create, organize, edit, and export icon packs efficiently.

The editor runs in the browser (Chrome/Edge) and operates on local files via the File System Access API. An icon pack is a folder on the designer's machine — Icon Builder opens that folder, reads the manifest and SVG files, and renders them on an infinite canvas organized in an auto-grid layout (icons as rows, variants as columns).

Designers get a full SVG vector editor (pen tool, node editing, shape primitives, boolean operations) inside each icon frame, with keyline grid overlays and snapping for visual consistency. Style changes can be applied across an entire pack at once. When done, the pack exports to clean SVG and PNG files.

## User Stories

### Opening & Creating Icon Packs

1. As an icon designer, I want to create a new icon pack from scratch, so that I can start a fresh project with a clean structure.
2. As an icon designer, I want to open an existing icon pack folder from my file system, so that I can continue working on a pack I started previously.
3. As an icon designer, I want to set a pack name, grid size (e.g. 24×24), and available variants when creating a new pack, so that the pack is configured correctly from the start.
4. As an icon designer, I want to import a flat folder of SVG files as a new pack, so that I can bring in work I did in other tools.
5. As an icon designer, I want the app to remember my pack configuration (name, grid size, variants) in a manifest file, so that settings are preserved between sessions.
6. As an icon designer, I want to see a "Open Pack" prompt when I open the app with no pack loaded, so that I can quickly get to work.

### Canvas & Layout

7. As an icon designer, I want to see all icons in my pack displayed on an infinite canvas, so that I can get a complete overview of my work.
8. As an icon designer, I want icons automatically arranged in a grid (icons as rows, variants as columns), so that I can compare variants side-by-side without manual arrangement.
9. As an icon designer, I want to pan the canvas by dragging, so that I can navigate to any part of my icon pack.
10. As an icon designer, I want to zoom in and out of the canvas, so that I can work on fine details or get an overview.
11. As an icon designer, I want each icon to live inside a labeled frame on the canvas, so that icon boundaries are clear and names are visible.
12. As an icon designer, I want variant columns to be clearly labeled (e.g. "Outline", "Filled", "Duotone"), so that I always know which variant I am editing.

### Icon Management

13. As an icon designer, I want to add a new icon to my pack, so that I can grow my library.
14. As an icon designer, I want to rename an icon, so that I can correct naming mistakes or follow naming conventions.
15. As an icon designer, I want to delete an icon from my pack, so that I can remove icons that are no longer needed.
16. As an icon designer, I want to reorder icons on the canvas, so that I can organize my pack logically.
17. As an icon designer, I want to assign a category to each icon (e.g. "Arrows", "UI", "Media"), so that related icons are grouped together.
18. As an icon designer, I want to add tags to an icon, so that it is easier to search and organize.
19. As an icon designer, I want to search for icons by name or tag in the sidebar, so that I can quickly find a specific icon in a large pack.
20. As an icon designer, I want to duplicate an icon, so that I can create variations without starting from scratch.

### Variant Management

21. As an icon designer, I want each icon to have multiple variants (outline, filled, duotone), so that I can deliver a complete icon pack.
22. As an icon designer, I want to switch between editing different variants of an icon, so that I can work on each style independently.
23. As an icon designer, I want to add a new variant to a specific icon, so that I can extend the pack's style options.
24. As an icon designer, I want to see which variants exist for each icon at a glance on the canvas, so that I know where work is still needed.
25. As an icon designer, I want empty variant slots to be visually indicated on the canvas, so that missing variants are obvious.

### Vector Path Editing

26. As an icon designer, I want to draw paths with a pen tool, so that I can create icon shapes from scratch.
27. As an icon designer, I want to edit existing path nodes (move, add, remove anchor points), so that I can refine icon shapes precisely.
28. As an icon designer, I want to drag bezier handles on anchor points, so that I can create smooth curves.
29. As an icon designer, I want to draw primitive shapes (rectangle, circle, line), so that I can quickly build common icon elements.
30. As an icon designer, I want to select, move, scale, and rotate objects, so that I can position elements precisely within a frame.
31. As an icon designer, I want to perform boolean operations (union, subtract, intersect, exclude) on paths, so that I can create complex icon shapes efficiently.
32. As an icon designer, I want to set stroke width, stroke cap (round, square, butt), and stroke join (round, miter, bevel) on paths, so that I can control the outline style of my icons.
33. As an icon designer, I want to group and ungroup objects, so that I can manage complex icon structures.
34. As an icon designer, I want to undo and redo edits within the canvas, so that I can recover from mistakes.
35. As an icon designer, I want to copy and paste objects within and between icon frames, so that I can reuse shapes efficiently.

### Keyline Grid

36. As an icon designer, I want to enable a keyline grid overlay on every icon frame in my pack, so that I can maintain visual consistency across all icons.
37. As an icon designer, I want the keyline grid to include standard shapes (circle, square, portrait rectangle, landscape rectangle) fitted within the icon frame, so that I can follow established icon grid conventions.
38. As an icon designer, I want to configure the keyline grid once at the pack level, so that it applies consistently to every icon without per-icon setup.
39. As an icon designer, I want path nodes and objects to snap to keyline boundaries, so that my icons stay visually consistent without manual alignment.
40. As an icon designer, I want to toggle keyline grid visibility on and off, so that I can focus on the artwork without visual clutter when needed.

### Saving

41. As an icon designer, I want the pack manifest to be saved automatically as I work, so that my pack configuration is never lost.
42. As an icon designer, I want to save SVG files to disk explicitly (Cmd+S), so that I control when the source files are updated.
43. As an icon designer, I want a visual indicator showing unsaved changes, so that I know when my SVG files are out of sync with the canvas.
44. As an icon designer, I want the app to warn me before closing if there are unsaved SVG changes, so that I do not lose work accidentally.

### Export

45. As an icon designer, I want to export my entire icon pack as individual SVG files, so that I can deliver clean, standards-compliant icons to clients or design systems.
46. As an icon designer, I want to export my entire icon pack as PNG files at multiple sizes (16, 24, 32, 48, 64px), so that I can deliver rasterized assets when needed.
47. As an icon designer, I want to export a single icon (all variants) as SVG and PNG, so that I can share or test individual icons.
48. As an icon designer, I want exported SVG files to be clean and minimal (no editor metadata, no unnecessary attributes), so that they are production-ready.
49. As an icon designer, I want to choose the output folder for exports, so that files go where I expect them.
50. As an icon designer, I want a progress indicator during batch export, so that I know the export is running on large packs.

## Implementation Decisions

### FileSystemService
- Uses the File System Access API (`showDirectoryPicker`, `showOpenFilePicker`) — Chrome/Edge only
- Reads and writes `icon-builder.json` (pack manifest) and individual `.svg` files
- Manifest schema: `{ name, version, gridSize, variants[], icons[] }` where each icon has `{ id, name, category, tags, files: { [variant]: relativePath } }`
- Variant names are a fixed enum: `outline | filled | duotone`
- Grid size is a pack-level setting (not per-icon)
- Service exposes a clean async interface: `openPack()`, `createPack()`, `readIcon()`, `writeIcon()`, `writeManifest()`

### PackStore (Redux Toolkit)
- Manages all app state: pack metadata, icons array, active icon, active variant, tool mode, UI state (sidebar open, keyline visible, unsaved changes flag)
- Slices: `packSlice`, `editorSlice`, `uiSlice`
- Pack state is derived from the manifest — FileSystemService hydrates it on open
- No direct Fabric.js references in Redux — canvas state is owned by Fabric.js, not Redux

### CanvasBridge
- The critical sync layer between Redux state and Fabric.js canvas
- On pack load: reads Redux pack state, instantiates Fabric.js objects for each icon frame
- On Redux state change: updates only the affected Fabric.js objects (not full re-render)
- On Fabric.js object mutation: dispatches Redux actions to keep app state in sync
- Listens to Fabric.js events (`object:modified`, `path:created`, etc.) and translates to Redux dispatches
- Exposes imperative methods: `loadPack()`, `focusIcon()`, `getIconSVG(iconId, variant)`

### AutoGridLayout
- Pure function: takes pack icon list + canvas config (grid size, gutter, columns) → returns `{ id, x, y }` positions for each icon frame
- Layout: rows = icons, columns = variants
- Recalculates on icon add/remove/reorder
- No Fabric.js dependency — layout is computed then applied by CanvasBridge

### KeylineSystem
- Keyline shapes: circle (inscribed), square (inscribed), portrait rectangle, landscape rectangle — all rendered relative to the icon frame size
- Rendered as a non-interactive Fabric.js overlay group on each icon frame
- Snapping: overrides Fabric.js `object:moving` and path editing events to snap to keyline boundaries within a configurable snap threshold
- Per-pack configuration stored in manifest: `{ keyline: { enabled, shapes[], snapEnabled } }`

### PathEditor
- Wraps Fabric.js tool modes: select (`SelectionTool`), pen (`PenTool`), rectangle (`RectTool`), circle (`CircleTool`), line (`LineTool`)
- Active tool stored in Redux `editorSlice.activeTool`
- Boolean operations via a boolean operations utility (union, subtract, intersect, exclude) — applied to selected Fabric.js path objects
- Stroke properties (width, cap, join) dispatched through Redux and applied to Fabric.js objects via CanvasBridge

### ExportService
- SVG export: serializes Fabric.js canvas objects for a given icon frame to clean SVG markup — strips editor metadata, normalizes attributes
- PNG export: renders SVG to an offscreen canvas at target sizes (16, 24, 32, 48, 64px), exports as PNG blob
- Batch export: iterates all icons × variants, writes files via FileSystemService
- Export is decoupled from the canvas — works from SVG string input, not live Fabric.js state

### SaveSyncService
- Auto-save: watches Redux pack state changes, debounces writes to `icon-builder.json` manifest via FileSystemService
- Manual save (Cmd+S): calls `CanvasBridge.getIconSVG()` for all dirty icons, writes SVG files via FileSystemService, clears unsaved-changes flag in Redux
- Dirty tracking: CanvasBridge marks icons as dirty on `object:modified` events; SaveSyncService reads this to know which files to write

### UI Modules
- **Toolbar (left)**: tool switcher buttons bound to Redux `editorSlice.activeTool`
- **Sidebar (left)**: icon list with search, category grouping, variant indicators — reads from Redux `packSlice`
- **PropertiesPanel (right)**: shows/edits properties of the Fabric.js selected object — stroke, fill, dimensions, position
- **TopBar**: pack name, save button, export button, zoom controls
- All UI built with shadcn/ui components as the base, extended with custom dark-theme styles

### Tech Stack
- **Framework**: Next.js (client-side only for the editor route)
- **Canvas**: Fabric.js
- **State**: Redux Toolkit
- **Pan/Zoom**: react-zoom-pan-pinch
- **UI Components**: shadcn/ui + custom components
- **Styling**: Tailwind CSS
- **File Access**: File System Access API (Chrome/Edge only)

## Testing Decisions

A good test verifies observable external behavior — what the module produces given specific inputs — not implementation details like internal method calls or private state. Tests should remain valid even if the internal implementation is refactored.

### FileSystemService
- Test: given a mock FileSystem API, `openPack()` returns a correctly parsed pack object
- Test: `writeManifest()` serializes pack state to the expected JSON structure
- Test: `readIcon()` returns clean SVG string from a mock file handle
- Mock the File System Access API with a in-memory mock

### PackStore (Redux)
- Test each reducer in isolation: add icon, remove icon, rename icon, set active variant, toggle keyline, mark dirty
- Test selectors: icons by category, variants for a given icon, unsaved changes flag
- No mocking needed — pure functions

### AutoGridLayout
- Test: given N icons and M variants, returns correct x/y positions for each frame
- Test: adding an icon recalculates positions correctly
- Test: reordering icons produces updated positions
- Pure function — no mocking needed

### KeylineSystem
- Test: given a frame size of 24×24, keyline shapes are computed at correct dimensions
- Test: snap function returns nearest keyline boundary for a given point and threshold
- Test: snap is a no-op when snapping is disabled
- Pure geometry functions — no mocking needed

### CanvasBridge
- Test: loading a pack creates the correct number of Fabric.js objects
- Test: a Redux state change triggers the correct Fabric.js update (not a full re-render)
- Test: a Fabric.js `object:modified` event dispatches the correct Redux action
- Mock Fabric.js canvas with a lightweight stub

### PathEditor
- Test: switching tool mode updates Redux state
- Test: boolean union of two overlapping paths produces a single merged path
- Test: stroke property changes are correctly applied to selected objects
- Mock Fabric.js objects for property tests

### ExportService
- Test: SVG export of a simple icon produces clean, valid SVG markup (no editor attributes)
- Test: PNG export at 24×24 produces an image buffer of the correct dimensions
- Test: batch export calls FileSystemService write for every icon × variant combination
- Mock FileSystemService for batch export tests

### SaveSyncService
- Test: manifest auto-save is debounced — rapid state changes produce a single write
- Test: Cmd+S triggers SVG file writes only for dirty icons
- Test: unsaved-changes flag is cleared after a successful manual save
- Mock FileSystemService and CanvasBridge

## Out of Scope

- **AI-powered conversion** (outline → filled, outline → duotone) — post-MVP
- **Cloud sync and user accounts** — post-MVP
- **Collaboration / multiplayer** — post-MVP
- **Safari and Firefox support** — blocked by File System Access API limitations
- **Desktop app (Electron/Tauri)** — considered for future, not MVP
- **Additional export formats** (React components, icon font, sprite sheet, Figma-compatible) — post-MVP
- **Dashboard / home screen** — editor opens directly; pack management is via the editor
- **Variable stroke width** — post-MVP
- **Text tool** — post-MVP
- **Gradients** — post-MVP
- **Database-backed storage** — local-first for MVP; may migrate later

## Further Notes

- The File System Access API requires a user gesture to trigger the directory picker. The app should prompt on first load with a clear "Open Pack" / "Create New Pack" CTA.
- Fabric.js does not include boolean operations natively — a boolean operations utility must be added. Evaluate `fabric-js-boolean-operations` or implement using `paper.js` path boolean logic as a dependency-free utility.
- The CanvasBridge is the highest-risk module. It must be designed carefully to avoid two-way update loops (Redux update → Fabric.js update → Redux update). Use a `isUpdatingFromCanvas` flag or similar guard.
- SVG export must produce files compatible with the existing flat-folder format so that packs created in Icon Builder can be opened in other tools (Figma, Illustrator) without conversion.
- Since there is no git remote yet, this PRD lives in `docs/prd.md`. Submit as a GitHub issue once a remote is configured.
