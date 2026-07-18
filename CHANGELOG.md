# Changelog

All notable changes to the URY project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **2 new UI components** (`@ury/ui`) — Table (5 stories) with composable sub-components (Header/Body/Footer/Row/Head/Cell/Caption), Pagination (5 stories) with Content/Item/Link/Previous/Next/Ellipsis sub-components. Total: 28 components, 119 stories.
- **32 unit tests** for Table (14) and Pagination (18) components.

### Fixed

- **POS React (1 CRITICAL)**: XSS via `dangerouslySetInnerHTML` in AIInsightsPanel — now sanitizes with DOMPurify before rendering.
- **POS React (3 HIGH)**: Wrong `owner` prop in Orders.tsx PaymentDialog (passed `cashier` instead of `owner`), unsanitized LIKE pattern in `getscramblePattern` (escapes %, _, \), unguarded `console.error` in PaymentMethodChart (now gated behind `import.meta.env.DEV`).
- **POS React (4 MEDIUM)**: Removed 8 unused underscore-prefixed variables across PaymentDialog/ProductDialog/POS/PaymentMethodChart/Table, PaymentDialog useEffect missing `paymentInputs` dependency, ErrorBoundary `errorCount` always resets to 0 (now properly increments), CommentDialog missing ARIA dialog semantics (added role/aria-modal/aria-labelledby).
- **POS React (3 LOW)**: `QuickFilterButton` moved outside POS component body (prevents remounting), `formatCurrency` NaN guard added, inconsistent `}catch(e){` formatting fixed in auth-api.ts.
- **Mosaic KDS (2 CRITICAL)**: Socket initialized at module scope never disconnected (moved to component lifecycle with `disconnect()` in `beforeUnmount`), async socket init not awaited (now handled with promise).
- **Mosaic KDS (5 HIGH)**: `window.globalSiteName` replaced with module-scoped variable, `markRaw()` added for Masonry and Frappe call instances, Audio object leak in `playAlertSound` (cached single instance), stacking timeouts in `hideStatusMessageAfterDelay` (clears previous), invalid Tailwind classes (`text-gray` → `text-gray-700`, `justify` → `justify-center`).
- **Mosaic KDS (5 MEDIUM)**: `v-if` inside `v-for` replaced with computed `visibleKots`, minutes not zero-padded in `calculateTimeRemaining`, negative time values clamped to 0, catch-all route added for unmatched paths, dead `style.css` deleted, password cleared after login.
- **Mosaic KDS (4 LOW)**: `localStorage.setItem` wrapped in try/catch, ARIA attributes added on interactive KOT cards, `aria-live="polite"` added on status messages.
- **Backend (3 HIGH)**: Missing `frappe.only_for()` on `get_order_invoice` and `customer_favourite_item` (exposes invoice creation and customer data to any user), raw SQL UPDATE bypasses document lifecycle in `cancel_kot` (now uses `frappe.get_doc().cancel()`).
- **Backend (6 MEDIUM)**: `frappe.only_for()` added to 7 more whitelisted methods across `ury_order.py`, `sub_pos_closing.py`, `ury_daily_p_and_l.py`, `pos_extend.py`. Owner spoofing in KOT validation (`kotdoc.owner` set from waiter field, now uses `posInvoice.owner`). All 9 explicit `frappe.db.commit()` calls removed from `ury_menu_management.py`.
- **Backend (6 LOW)**: Dead `inner_inner_bom_process` function removed, unused `json`/`nowdate` imports removed, 6 error messages internationalized (`f"..."` → `_().format()`), typo `get_proft_loss_details` → `get_profit_loss_details`, hardcoded `"INR"` → dynamic company currency, commented-out dead code removed.

### Changed

- **README.md** — Updated component count to 28, story count to 119, added Table and Pagination to component list.
- **Barrel exports** (`packages/ui/src/index.ts`) — Added Table and Pagination component exports.
- **DOMPurify** added as dependency to POS frontend for HTML sanitization.

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
