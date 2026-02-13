# Release Runbook

This repository uses tag-based releases for Electron distribution.

## Versioning

- Tag format: `vX.Y.Z`
- Current planned release line starts at `v0.2.0`

## One-time setup

- Ensure `main` contains `.github/workflows/release.yml`
- Ensure GitHub Actions is enabled for this repository

## Create a release

```bash
git fetch origin
git checkout main
git pull --rebase origin main
git tag v0.2.0
git push origin v0.2.0
```

## What happens next

`Release` workflow runs on `macos-14` and performs:

1. `pnpm install --frozen-lockfile`
2. `pnpm check`
3. `pnpm lint`
4. `pnpm test`
5. `pnpm --filter @ccplans/electron dist:mac`
6. Upload `apps/electron/release/*.dmg` to GitHub Release

## Local DMG build (optional)

```bash
pnpm install
pnpm --filter @ccplans/electron dist:mac
```

Generated files:

- `apps/electron/release/ccplans-<version>-mac-arm64.dmg`
