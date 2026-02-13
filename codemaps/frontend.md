# Renderer Codemap (apps/electron/src/renderer)

> Freshness: 2026-02-13

## Entry

- `main.tsx`: React root + QueryClient + HashRouter
- `App.tsx`: route registration

## Pages

- `/` -> `HomePage`
- `/plan/:filename` -> `ViewPage`
- `/plan/:filename/review` -> `ReviewPage`
- `/search` -> `SearchPage`
- `/kanban` -> `KanbanPage`
- `/dependencies` -> `DependencyPage`
- `/settings` -> `SettingsPage`

## State

- `stores/planStore.ts`: selection, sorting, filtering
- `stores/uiStore.ts`: theme, toasts, modal

## Data Access

- `lib/api/ipcClient.ts`: typed IPC client
- `lib/hooks/usePlans.ts`: plan mutations and queries
- `lib/hooks/useSearch.ts`: search query
- `lib/hooks/useHistory.ts`: history/diff/rollback
- `lib/hooks/useDependencies.ts`: dependency graph
- `lib/hooks/useSettings.ts`: settings queries/mutations
