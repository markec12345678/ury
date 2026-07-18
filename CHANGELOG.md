# Changelog

All notable changes to the URY project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed (Round 36)

- **POS React (4 CRITICAL)**: PaymentMethodChart used wrong field names (`method`→`payment_method`, `amount`→`total_paid`, `count`→`transaction_count`) — chart always showed zero data. HourlyBreakdown type missing optional `day`/`day_of_week` fields. PaymentMethodChart useEffect missing cleanup on unmount. Dashboard error state never displayed (blank screen on API failure).
- **POS React (8 HIGH)**: 20+ hardcoded English strings in 6 dashboard components wrapped with `t()` i18n. 20+ new translation keys added to 4 locale files. Unused `_colorMap` removed. `PERIODS` array moved outside component. `useRenderTime` missing dependency array fixed. Missing ARIA roles on period/granularity toggles. Unused `orders` field in RevenueChart removed.
- **Mosaic KDS (4 CRITICAL)**: `showUpdateButtton` typo in Cart.vue (3 t's) — Update button never visible. `incrementItemQuantity` pushed incomplete item to cart (missing `rate`, `item_name`) causing NaN totals. `addToSelectedTables` doesn't await API — route navigates before data loads. `billing()` never resets `isPrinting` on API error — overlay permanently blocked.
- **Mosaic KDS (8 HIGH)**: Duplicate `ref` names in Table.vue and Customer.vue fixed with unique names. Dead transfer links removed from takeAwayTable.vue. `href="#"` links now use `.prevent` modifier. `posClosing` deep-copies state before mutation. `orderTypeSelection` missing `return` after alert. Qty bound as string via `@input` → `Number()` coercion in Menu.vue and Cart.vue.
- **Mosaic KDS (6 MEDIUM)**: Duplicate `id="room"` → unique IDs in Table.vue. `Customer.js` uses store's `db` instance instead of creating new one. `posClosing` calculates `totalInvoices`. `PrintWithQz.disconnectQzPrinter` now async with try/catch. Module-level timer cleanup documented.
- **Backend (2 CRITICAL)**: 20 whitelisted endpoints in `ury_pos/api.py` had zero `frappe.only_for()` calls — any authenticated user could access financial data. Path traversal in `network_printing` via `file_path` parameter — server now generates path internally.
- **Backend (4 HIGH)**: Race condition in order number generation fixed with cache mutex. Scheduled `kotValidationThread` overlap protection with cache lock. Type mismatch in `custom_ury_last_aggregator_invoice` (stored integer instead of invoice name). `frappe.db.commit()` removed from `create_customer`.
- **Backend (4 MEDIUM)**: KOT creation failure in `sync_order` now shows `msgprint` to user. Dashboard IN clause capped at 1000 invoices. `float(rate)` calls wrapped in try/except. `os.makedirs` now uses `exist_ok=True`.

### Fixed (Round 35)

- **POS React (2 CRITICAL)**: Broken JSX structure in POS.tsx — missing `</div>` closing tag causing build failure. Missing `setCurrencySymbol` export in utils.ts causing Vite build failure.
- **POS React (4 HIGH)**: ProductDialog `isItemLoading`/`itemError` state values discarded (loading/error never shown). Dead `setAddonItemCodes` state removed. Type-unsafe `db.getDoc` call fixed with generic param. Stale request guard added to search branch of `fetchOrders`.
- **POS React (3 MEDIUM)**: ErrorBoundary missing default export. LayoutView hardcoded zoom strings wrapped with `t()` i18n. Table.tsx hardcoded error string wrapped with `t()`.
- **Mosaic KDS (2 CRITICAL)**: Missing `updatePercentage`/`applyDiscount` methods in recentOrder store caused TypeError crash on discount input. `isPrinting` stuck `true` after successful network print — overlay permanently blocked.
- **Mosaic KDS (6 HIGH)**: Dialog moved outside `v-for` in Menu.vue (N duplicate DOM nodes eliminated). Store instances removed from `invoiceData.js` state (circular deps fixed, `$reset()`/devtools restored). Click-outside handler added to Header.vue dropdown. Password cleared from memory after login. Payment modal shown only after API response in `billing()`. Deep copy of reactive cart for API payload.
- **Mosaic KDS (3 MEDIUM)**: Unscoped `.bg-gray-100` CSS overrides → renamed to `.modal-backdrop` with `<style scoped>`. `posClosing.savePosClosing()` validates `selectedPosOpenEntry` before API call. Typo `showUpdateButtton` → `showUpdateButton` (9 occurrences).
- **Mosaic KDS (1 LOW)**: `Menu.js showAllItems()` sets `selectedCourse` to `null` (was `""`, inconsistent with initial state).
- **Backend (2 CRITICAL)**: QZ private key no longer exposed via `signature_promise()` API — replaced with `sign_message()` server-side signing. XSS in KOT notification HTML — all dynamic values escaped with `html.escape()`.
- **Backend (7 HIGH)**: Branch validation added to 5 menu management functions (cross-branch data access prevented). Discount/payment validation added to `make_invoice()`. Race condition in `table_transfer()` fixed with `SELECT FOR UPDATE`. `sync_order()` returns limited fields instead of full `invoice.as_dict()` (data leak fix). Stored XSS in P&L remarks escaped. Dead `owner` parameter removed from `make_invoice()` signature.
- **Backend (3 MEDIUM)**: `serve_kot()` uses server-side time instead of client-supplied `time` param. `print_pos_page()` whitelists allowed doctypes (`POS Invoice` only). 33 dead `# import frappe` comments removed across doctypes.

### Changed (Round 35)

- **frappe-sdk-retry** — Search branch of `fetchOrders` now respects stale-request guard sequence counter.
- **Mosaic KDS stores** — `invoiceData.js` no longer stores other Pinia instances in state; uses local `useXxxStore()` calls.
- **Backend `ury_print.py`** — `signature_promise()` removed; replaced with `sign_message()` for server-side signing.

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
