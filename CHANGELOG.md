# Changelog

All notable changes to the URY project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **2 new UI components** (`@ury/ui`) — Alert (7 stories) with Title/Description sub-components and 5 variants (default/info/success/warning/danger), Breadcrumb (5 stories) with List/Item/Link/Separator/Ellipsis sub-components. Total: 26 components, 109 stories.
- **extractServerMessage utility** — Safe `error._server_messages` parser for both React (TypeScript) and Vue (Pinia) stores, eliminating 18+ unsafe `JSON.parse` patterns.
- **Shared backend utility** — `ury/ury/api/utils.py` with canonical `_get_user_branch()` function (previously duplicated 3×).

### Fixed

- **Backend (4 HIGH)**: Owner spoofing via client-controlled `cashier` in sync_order (now uses `frappe.session.user`), missing `frappe.only_for()` on sync_order/make_invoice/cancel_order/kot_execute, cross-branch data leaks in payment method chart, inventory report, and expense reports (branch filter added), integer truncation in KOT cancel quantities (`int()` → `flt()`).
- **Backend (6 MEDIUM)**: Non-atomic dual SQL UPDATE in qz_print_update (replaced with `frappe.db.set_value`), XSS in report HTML for company name (added `_html.escape`), missing branch/date filters in expense reports, negative rate not validated in menu management, temp PDF file not cleaned up after network printing.
- **Backend (2 LOW)**: App permission too restrictive in permission.py (added Restaurant Manager/User roles), missing negative rate validation.
- **POS React (2 HIGH)**: AuthGuard overlapping `isLoading`/`error` state from root store (renamed to `authLoading`/`authError`/`configLoading`/`configError`), PaymentDialog discount validation bypass (now sends validated `appliedDiscount` instead of raw `discountValue`).
- **POS React (4 MEDIUM)**: `window.open` missing `noopener,noreferrer` in 3 locations (tab-nabbing prevention), `useShortcut` stableHandler defeating memoization (ref-based approach), `formatCurrency` negative amount display (`€ -50` → `-€ 50`), `MenuCard` missing `aria-disabled` when disabled.
- **POS React (2 LOW)**: Unused `_addonItemCodes` state removed from ProductDialog, `formatCurrency` negative amount handling.
- **Mosaic KDS (1 CRITICAL)**: Cancel confirmation in invoiceCreation now properly checked — cancelled modal prevents invoice creation.
- **Mosaic KDS (4 HIGH)**: `markRaw()` on 8 store instances in invoiceData.js, `fetchInvoiceDetails` refactored from await+.then antipattern to clean async/await, POS Closing taxes accumulation bug (combinedTaxes moved outside forEach loop), addToCart pushes deep-clone instead of direct reference.
- **Mosaic KDS (5 MEDIUM)**: Comma expression in recentOrder return statements removed, `totalAmount` toFixed(3) → toFixed(2), logout double router.push simplified, notification timeout 900ms → 3000ms, double router.push in invoiceCreation removed.
- **Mosaic KDS (1 LOW)**: Redundant previousOrderItem double splice simplified.

### Changed

- **README.md** — Updated component count to 26, story count to 109, added Alert and Breadcrumb to component list.
- **Barrel exports** (`packages/ui/src/index.ts`) — Added Alert and Breadcrumb component exports.
- **Auth slice** — `isLoading` → `authLoading`, `error` → `authError` for unique state in root store.
- **Config slice** — `isLoading` → `configLoading`, `error` → `configError` for unique state in root store.

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
