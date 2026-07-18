# Changelog

All notable changes to the URY project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (Round 34)

- **2 new UI components** (`@ury/ui`) — Sheet (5 stories) with slide-in panel (top/bottom/left/right), overlay, Header/Footer/Title/Description/Close sub-components. Calendar (5 stories) with date grid, month navigation, min/max dates, controlled mode. Total: 30 components, 129 stories.
- **176 unit tests** across 9 new test files: Tooltip (16), Switch (16), Progress (14), Checkbox (18), Tabs (20), Alert (14), Breadcrumb (14), Separator (10), Avatar (16).

### Fixed (Round 34)

- **POS React (1 CRITICAL)**: `frappe-sdk-retry` POST method no longer auto-retries by default — must pass `{ idempotent: true }` to enable retry on POST calls (prevents duplicate order creation).
- **POS React (2 HIGH)**: Stale request guards added to `_loadTableOrderSeq` and `_fetchOrdersSeq` — discards outdated async responses when multiple concurrent requests race. PaymentDialog error handling fixed — `fetchOrders()` now called before `onClose()`.
- **POS React (5 MEDIUM)**: NetworkStatus timer cleanup moved from event handler to `useRef` + useEffect return (was leaking timer). Unused `_searchQuery`/`_setSearchQuery` removed from POS.tsx. Module-level currency symbol cache avoids repeated localStorage reads. sessionStorage posProfile validation checks required fields before trusting cached data. `frappe-sdk-retry` migration for Orders, ProductDialog.
- **Mosaic KDS (2 CRITICAL)**: Socket init race condition — stored init as promise, await in `mounted()`. Re-fetch KOT data on socket reconnect to avoid stale display.
- **Mosaic KDS (11 HIGH)**: KOT deduplication on socket insert (`if (!this.kot.some(k => k.name === newKot.name))`). `markRaw` on Masonry instance. `_statusTimeout` cleared before reassignment. Completed KOTs removed from array instead of hidden. Socket channel listener updated on branch change (`_lastKotChannel` tracking). `localStorage` writes wrapped in try/catch. Midnight crossover fix (`timeDifference += 86400000` when negative). Audio alert cooldown (3s minimum between plays). `window.globalSiteName` → module-scoped `_siteName`. Login inputs disabled during loading. Catch-all route added.
- **Mosaic KDS (1 MEDIUM)**: Dead `style.css` file deleted.
- **Mosaic KDS (1 LOW)**: `aria-live="polite"` on KOT status message.
- **Backend (2 CRITICAL)**: Raw SQL `UPDATE tabURY KOT SET docstatus = 2` replaced with `frappe.get_doc("URY KOT", name).cancel()` + error logging (document lifecycle compliance). 9 `frappe.db.commit()` calls removed from `ury_menu_management.py` (Frappe manages transactions).
- **Backend (8 HIGH)**: `frappe.only_for()` added to 8 whitelisted functions in `ury_order.py` (get_order_invoice, item_query_restaurant, get_restaurant_and_menu_name, get_menu_name, pos_opening_check, table_transfer, captain_transfer, customer_favourite_item). `frappe.only_for()` added to `get_pos_invoices` in `sub_pos_closing.py`. Branch filter on COGS query in `ury_reports.py`. Branch validation in `create_menu` against `_get_user_branch()`. Quantity validation (1–9999) and cashier/waiter role validation in `sync_order`. Discount validation (0–100) and payments validation (non-empty, positive amounts) in `make_invoice`.
- **Backend (6 MEDIUM)**: Dead `owner` parameter removed from `sync_order` and `make_invoice`. `batch_update_prices` size limit (max 500). Hardcoded `"INR"` → dynamic `frappe.db.get_value("Company", ..., "default_currency")`. IndexError guard on `attendance_count`. Dead `user=None` param removed from `confirm_cancel_kot`. 10 child doctypes cleaned of dead `# import frappe`.

### Changed (Round 34)

- **README.md** — Updated component count to 30, story count to 129, added Sheet and Calendar rows to component table.
- **Barrel exports** (`packages/ui/src/index.ts`) — Added Sheet and Calendar component exports; removed duplicate sheet export.
- **frappe-sdk-retry** — POST calls no longer auto-retry; pass `{ idempotent: true }` to opt in.
- **Mosaic KDS** — Dead `style.css` removed.

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
