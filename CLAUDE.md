# Project: Icon Builder

## What This Is
Icon Builder is a specialized infinite-canvas design studio built exclusively for icon designers. Unlike general-purpose tools like Figma or Illustrator, it provides a purpose-built environment for creating, managing, and exporting icon packs. Designers get a structured canvas (auto-grid layout with icons as rows and variants as columns), a full SVG vector editor (pen tool, node editing, boolean ops), keyline grid with snapping, and batch SVG/PNG export. The app is local-first — icon packs live as folders of SVG files on disk, accessed via the File System Access API (Chrome/Edge only).

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 + shadcn/ui (dark theme by default)
- **Canvas**: Fabric.js
- **State**: Redux Toolkit (`packSlice`, `editorSlice`, `uiSlice`)
- **File Access**: File System Access API (Chrome/Edge only, no backend)
- **Testing**: Vitest + React Testing Library
- **Monorepo**: Turborepo + pnpm workspaces

## Project Structure
```
apps/web/                  -- Main Next.js app (the editor)
  app/                     -- Next.js App Router pages
  components/              -- UI components (editor layout, panels)
  store/                   -- Redux slices and store config
  hooks/                   -- Custom React hooks
  lib/                     -- Utility functions
packages/ui/               -- Shared shadcn/ui component library
packages/typescript-config/ -- Shared TS configs
docs/                      -- PRD, vision, solution docs
```

## Commands
- `pnpm dev --filter web` — Start dev server (http://localhost:3000)
- `pnpm build --filter web` — Build for production
- `pnpm lint --filter web` — Run linter
- `pnpm test` (inside `apps/web`) — Run tests once
- `pnpm test:watch` (inside `apps/web`) — Run tests in watch mode
- `pnpm typecheck --filter web` — TypeScript type check

## Coding Conventions
- TypeScript strict mode, no `any` types
- Tailwind for all styling, no custom CSS files
- Functional components with hooks, no class components
- File names in kebab-case
- Use server components by default, add `"use client"` only when needed
- Handle all loading and error states in UI
- Redux for all app state — no local state for business logic
- Fabric.js canvas state is owned by Fabric.js; sync to Redux via `CanvasBridge` only
- Never read or write files directly — always go through `FileSystemService`
- Tests verify observable behavior through public interfaces, not implementation details

## UI Components
- **Always use shadcn/ui components** for all UI elements — buttons, inputs, dialogs, labels, etc.
- Only hand-roll a component if no suitable shadcn primitive exists for it (e.g. the Fabric.js canvas itself).
- shadcn components live in `packages/ui/src/components/` and are imported as `@workspace/ui/components/<name>`.
- **Before using a component**, check `packages/ui/src/components/` to confirm it is installed.
- **If a needed component is not installed**, install it first by running (from the monorepo root):
  ```bash
  pnpm dlx shadcn@latest add <component-name> -c apps/web
  ```
  Then import from `@workspace/ui/components/<name>`.

## Key Architectural Decisions
- **Canvas**: Fabric.js (Canvas-based rendering, SVG import/export)
- **Data format**: Flat folder of SVGs + `icon-builder.json` manifest (local-first)
- **Variants**: Fixed enum — `outline | filled | duotone`
- **Grid size**: Pack-level setting (not per-icon)
- **Save strategy**: Manifest auto-saves on state change (debounced); SVG files write on Cmd+S only
- **CanvasBridge**: The sync layer between Redux and Fabric.js — use `isUpdatingFromCanvas` guard to prevent update loops
- **No auth, no database, no cloud** for MVP

## GitHub Issues
- PRD: #1
- Project scaffolding & editor shell: #2 (done)
- FileSystemService — open & create pack: #3
- Pack Store + Auto-Grid Layout: #4
- Icon management: #5
- Variant management: #6
- CanvasBridge: #7
- Import existing flat SVG folder: #8
- Path editor — select & primitives: #9
- Path editor — pen tool & node editing: #10
- Path editor — stroke properties & boolean ops: #11
- Keyline grid system: #12
- Save & sync: #13
- SVG export: #14
- PNG export: #15
