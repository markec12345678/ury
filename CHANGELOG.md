# Changelog

All notable changes to the URY project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Skeleton UI component** (`@ury/ui`) — Loading placeholder with CVA variants (text, circular, rectangular) and animation modes (pulse, wave, none). Includes 5 pre-built layout skeletons: MenuCardSkeleton, DashboardCardSkeleton, TableRowSkeleton, ChartSkeleton. 7 Storybook stories.
- **Empty State UI component** (`@ury/ui`) — Empty data placeholder with CVA size variants (sm, md, lg), optional Lucide icon, title, description, and call-to-action. Full ARIA accessibility. 5 Storybook stories.
- **React hooks** (`@ury/core`):
  - `useDebounce` — Debounce a value with configurable delay.
  - `useLocalStorage` — Persist state in localStorage with automatic JSON serialization.
  - `useToggle` — Toggle between boolean values with toggle/setTrue/setFalse.
  - `useMediaQuery` — React to CSS media query changes using `useSyncExternalStore`.
  - `usePrevious` — Track the previous value of a variable across renders.
- **Vitest unit tests** (`@ury/core`) — Test suites for validation, utils, and format-date modules.
- **Progress UI component** (`@ury/ui`) — Determinate and indeterminate progress bars with CVA variants (default, success, warning, danger, info), three sizes (sm, default, lg), optional percentage label, striped pattern, animate pulse, and full ARIA accessibility. 8 Storybook stories.
- **CODE_OF_CONDUCT.md** — Contributor Covenant v2.1 code of conduct.
- **CHANGELOG.md** — Release tracking following Keep a Changelog format.
- **packages/core utilities**:
  - `validateEmail` — RFC-compliant email validation.
  - `validatePhone` — International phone number validation.
  - `debounce` — Generic debounce with leading/trailing options and cancel/flush methods.
  - `formatDate` — Locale-aware date formatting with multiple presets (date, time, datetime, relative).
  - `formatNumber` — Number formatting with locale, currency, and compact notation support.
  - `clamp` — Numeric value clamping utility.
  - `sleep` — Promise-based async delay for testing and UI transitions.
- **CI hardening** — Removed `continue-on-error: true` and `|| true` from critical CI steps (lint, type-check, build) so failures now properly surface.

### Changed

- **README.md** — Updated component count to 19, story count to 93, added Skeleton and Empty State to component table.
- **CONTRIBUTING.md** — Updated component list, added core hooks reference.
- **Barrel exports** (`packages/ui/src/index.ts`) — Added Skeleton and Empty State component exports.
- **Barrel exports** (`packages/core/src/index.ts`) — Added hooks exports.

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
