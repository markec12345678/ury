# Changelog

All notable changes to the URY project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **2 new UI components** (`@ury/ui`) — Sheet (5 stories) with slide-in panel (top/bottom/left/right), overlay, Header/Footer/Title/Description/Close sub-components. Calendar (5 stories) with date grid, month navigation, min/max dates, controlled mode. Total: 30 components, 129 stories.
- **25 unit tests** for Sheet (12) and Calendar (13) components.

### Fixed

- **POS React (1 CRITICAL)**: Unused `DOMPurify` import removed from AIInsightsPanel (dead code after React-based rendering refactor).
- **POS React (3 HIGH)**: 7 hardcoded English strings in Table.tsx wrapped with `t()` i18n, ProductDialog discarded tuple values fixed (`[, setter]` → `[value, setter]`), unused `setAddonItemCodes` state removed.
- **POS React (3 MEDIUM)**: Unused `_colorMap` removed from Dashboard, `document.getElementById('root')!` replaced with guarded access, `shortcutRegistry.destroy()` added to clean up keydown listener.
- **POS React (4 LOW)**: `getscramblePattern` renamed to `getScramblePattern`, `letterhead:"No Letterhead"` spacing fixed, aria-label added to payment inputs, TODO(i18n) comment on hardcoded utils string.
- **Mosaic KDS (2 CRITICAL)**: Dead socket on re-mount — socket init moved from module scope to `mounted()`, socket+auth race condition fixed with `Promise.all`.
- **Mosaic KDS (5 HIGH)**: Duplicate deps removed from package.json (autoprefixer/postcss/tailwindcss from deps, keep devDeps), unused flowbite/flowbite-vue removed, dead `vue.svg` deleted, dead `struckThroughItems` data property removed, `@keydown.space` handler added on KOT cards.
- **Mosaic KDS (3 MEDIUM)**: `v-show` → `v-if` for comments, dead `__uryAuthState` type removed, Tailwind spacing override `'28':'28px'` → `'gutter':'28px'`, password cleared on login failure.
- **Mosaic KDS (1 HIGH)**: KOT objects from API now have reactive defaults (`isRotated`, `showDiv`, `timecolor`, `timeRemaining`).
- **Backend (2 CRITICAL)**: Owner spoofing in KOT validation — `kotdoc.db_set("owner", posInvoice.owner)` removed (Frappe sets owner automatically). Non-atomic `cancel_order` — wrapped in `frappe.db.savepoint()` with rollback.
- **Backend (6 HIGH)**: Untranslated strings wrapped in `_()`, exception details no longer leaked to client (logged server-side + generic message), cross-branch data leak when branch is None (now throws ValidationError), LIKE wildcard injection fixed (escapes `%` and `_`).
- **Backend (6 MEDIUM)**: Unused `datetime`/`get_datetime` imports removed, `inner_bom_process` → `_inner_bom_process` (private), dead code `"item_code": item.get("item", ...)` → `item.item_code`, `add_menu_item` optimized (`get_doc` → `db.get_value`), `frappe.only_for()` added to `table_transfer` and `captain_transfer`.

### Changed

- **README.md** — Updated component count to 30, story count to 129, added Sheet and Calendar.
- **Barrel exports** (`packages/ui/src/index.ts`) — Added Sheet and Calendar component exports.
- **Mosaic KDS package.json** — Removed 5 unused/duplicate dependencies.

## [0.0.0] - 2025-01-01

### Added

- **@ury/ui component library** — 16 components with 75 Storybook stories:
  - Button (5), Card (2), Badge (3), Input (3), Textarea (3), Loader (3), Spinner (2), Dialog (4), Select (7), Toast (4), Tooltip (5), Switch (6), Checkbox (7), Tabs (7), Separator (5), Avatar (7)
- **@ury/core** — Frappe SDK client, authentication, role permissions, storage, formatting, QZ printing.
- **POS v2** — Vite + React + Zustand application.
- **CI/CD pipelines** — 8 GitHub Actions workflows (CI, Fork CI, Release, Chromatic, Labeler, Stale, Fork Sync, Dependabot).
- **Composite action** — `.github/actions/setup-node` eliminating ~80 lines of CI duplication.
- **Docker** — Multi-stage production Dockerfile with non-root user, dev stack with PostgreSQL 16 + Redis 7.
- **PR templates** — Default, bug fix, and new feature templates.
- **Issue templates** — Bug report, feature request, and question forms.
- **Dependabot** — Weekly npm, Docker, and GitHub Actions dependency updates.
- **Branch protection** — main (2 approvals + code owners + linear history), develop (1 approval).
- **Husky pre-commit hooks** — Prettier + ESLint + EditorConfig enforcement.
- **CODEOWNERS** — Review routing to @markec12345678.
