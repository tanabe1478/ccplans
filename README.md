# Claude Plans Manager (ccplans)

A native Electron app for managing Claude plan files in `~/.claude/plans/`.

## Overview

ccplans is now Electron-first and runs standalone.
It does **not** require a separate web server or API process.

## Features

- Plan list and full-text search
- Markdown detail view with section navigation
- Status management (`todo`, `in_progress`, `review`, `completed`)
- Kanban view and dependency graph
- Review mode with prompt generation + clipboard copy
- Bulk selection + bulk status update + permanent delete
- Open plan files in external apps (VSCode / Terminal / default app)

## Prerequisites

- Node.js 20+
- pnpm 9+
- macOS / Linux / Windows (Electron-supported)

## Quick Start

```bash
pnpm install
pnpm dev
```

## Download

Prebuilt binaries are distributed on GitHub Releases:

- https://github.com/tanabe1478/ccplans/releases/latest

macOS users can download the latest `.dmg` from the assets section.

## Project Structure

```text
apps/
  electron/     # Electron main/preload/renderer + E2E
packages/
  shared/       # Shared type definitions
hooks/          # Claude Code hook scripts
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Launch Electron app in dev mode |
| `pnpm build` | Build Electron app |
| `pnpm dist:mac` | Build macOS arm64 `.dmg` locally |
| `pnpm test` | Run shared + Electron unit tests |
| `pnpm test:e2e` | Run Electron Playwright E2E |
| `pnpm lint` | Type-check shared + Electron |
| `pnpm check` | Biome check |

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PLANS_DIR` | `~/.claude/plans` | Plan file directory |
| `ARCHIVE_DIR` | `<PLANS_DIR>/archive` | Archive directory (legacy/internal) |
| `ARCHIVE_RETENTION_DAYS` | `30` | Archive retention days (legacy/internal) |
| `OPEN_DEVTOOLS` | `false` | Open devtools in Electron dev mode |

## Hook

This repository includes a Claude Code hook script to inject/maintain plan frontmatter:

- `hooks/plan-metadata/inject.py`
- See `hooks/plan-metadata/README.md` for setup.

## Release

Release is tag-based and fully automated by GitHub Actions:

1. Push a `vX.Y.Z` tag (example: `v0.2.0`)
2. `Release` workflow builds macOS arm64 `.dmg`
3. Artifact is attached to a GitHub Release page

Detailed runbook: `docs/release.md`

## License

MIT
