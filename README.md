# Icon Builder

A specialized infinite-canvas design studio built exclusively for icon designers. Unlike general-purpose tools, Icon Builder provides a purpose-built environment for creating, managing, and exporting icon packs — local-first, no backend required.

> **Browser requirement:** Chrome or Edge only (requires the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API))

## Features

- **Structured canvas** — auto-grid layout with icons as rows and variants as columns
- **SVG vector editor** — pen tool, node editing, boolean operations
- **Keyline grid** — snapping guides for consistent icon sizing
- **Batch export** — SVG and PNG export for the entire pack
- **Local-first** — icon packs live as folders of SVG files on disk; no cloud, no auth, no database

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Canvas | Fabric.js |
| State | Redux Toolkit |
| File Access | File System Access API |
| Testing | Vitest + React Testing Library |
| Monorepo | Turborepo + pnpm workspaces |

## Project Structure

```
apps/web/                  — Main Next.js app (the editor)
  app/                     — Next.js App Router pages
  components/              — UI components (editor layout, panels)
  store/                   — Redux slices (pack, editor, ui)
  hooks/                   — Custom React hooks
  lib/                     — Utility functions (browser support, etc.)
  services/                — FileSystemService (File System Access API)
packages/ui/               — Shared shadcn/ui component library
packages/typescript-config/ — Shared TS configs
docs/                      — PRD, vision, solution docs
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev --filter web
# → http://localhost:3000
```

## Commands

```bash
pnpm dev --filter web        # Start dev server
pnpm build --filter web      # Production build
pnpm lint --filter web       # Run ESLint
pnpm typecheck --filter web  # TypeScript type check

# Inside apps/web:
pnpm test                    # Run tests once
pnpm test:watch              # Run tests in watch mode
```

## Data Format

Each icon pack is a folder on disk:

```
my-icons/
  icon-builder.json   ← manifest (name, gridSize, variants, icon list)
  home.outline.svg
  home.filled.svg
  home.duotone.svg
  settings.outline.svg
  ...
```

Supported variants: `outline | filled | duotone`

## Adding UI Components

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Components are placed in `packages/ui/src/components` and imported as:

```tsx
import { Button } from "@workspace/ui/components/button"
```
