# Changelog

All notable changes to the URY project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **5 new UI components** (`@ury/ui`) — DropdownMenu (4 stories), Accordion (5 stories), Drawer (5 stories), Popover (4 stories), Command palette (5 stories). Total: 24 components, 97 stories.
- **69 unit tests** for DropdownMenu (25), Accordion (18), and Drawer (26) components.
- **extractServerMessage utility** — Safe `error._server_messages` parser for both React (TypeScript) and Vue (Pinia) stores, eliminating 18+ unsafe `JSON.parse` patterns.
- **Shared backend utility** — `ury/ury/api/utils.py` with canonical `_get_user_branch()` function (previously duplicated 3×).

### Fixed

- **Backend (5 CRITICAL)**: XSS in ury_reports.py (`_html.escape` called as function, not literal text), data corruption in cancel_order (raw SQL → standard Frappe `cancel()`), missing `import re` crash, `qz_certificate()` secret exposure (added role check), 19 unguarded API endpoints now have `frappe.only_for()` authorization.
- **POS React (5 CRITICAL)**: XSS in AIInsightsPanel (replaced `dangerouslySetInnerHTML` with React-safe rendering), auto-refresh memory leak (moved timer to component lifecycle), race conditions in ProductDialog and POSOpeningProvider (cancellation flags), unsafe JSON.parse in menu-management-store.
- **Mosaic KDS (4 CRITICAL)**: `markRaw()` for frappe SDK instances in 8 Pinia stores (prevents proxy breakage), shared object aliasing between stores (deep-clone), unhandled user-cancellation rejection, missing error handling on fetchUserDetails.
- **25+ HIGH fixes**: PaymentDialog double-fetch, wrong `owner` prop in Orders, inline component re-renders, unmemized callbacks, resize handler without debounce, dashboard store error handling, Notification store timeout cleanup, localStorage.removeItem invalid args, route-before-data navigation, isPrinting stuck on error, duplicate routes, pagination guard.
- **15+ MEDIUM fixes**: ProductDialog loading/error display, CustomerSelect relatedTarget blur, Dashboard i18n (8 new keys), Orders stable keys, MenuCard unused prop, recentOrder.vue v-if guard, v-for :key attributes, computed getter side effect, aggregatorItem type consistency, posClosing per-row binding, async/await consistency, customer_favourite_item 90-day limit, report HTML file cleanup, unused imports.

### Changed

- **README.md** — Updated component count to 24, story count to 97, added 5 new components to table.
- **Barrel exports** (`packages/ui/src/index.ts`) — Added Accordion, Drawer, DropdownMenu, Popover, Command component exports.

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
