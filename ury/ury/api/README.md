# URY API Documentation

> Auto-generated reference for URY whitelisted API endpoints.
> All endpoints require authentication (except where noted).
> Base URL: `{frappe_site_url}/api/method/ury.ury.api.{module}.{function}`

---

## Authentication

All API calls require a valid Frappe session cookie or API key/secret pair.

```bash
# Session-based
curl -c cookies.txt -X POST https://your-site/api/method/login \
  -d "usr=administrator&pwd=password"

# Token-based
curl -H "Authorization: token xxx:yyy" https://your-site/api/method/ury.ury.api.ury_dashboard.get_dashboard_data
```

---

## Dashboard API

### `get_dashboard_data`
Get overview dashboard data for the current period.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `"today"` | `today`, `yesterday`, `this_week`, `this_month`, `last_7_days`, `last_30_days` |

**Roles:** Restaurant Manager, Accounts Manager

**Returns:** `{ revenue, orders, avg_order_value, top_items, recent_orders }`

---

### `get_revenue_chart`
Get time-series revenue data for charting.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `"daily"` | Aggregation period |
| `from_date` | string | auto | Start date (YYYY-MM-DD) |
| `to_date` | string | auto | End date (YYYY-MM-DD) |

**Roles:** Restaurant Manager, Accounts Manager

---

## Reports API

### `get_sales_report`
Generate a sales report with item breakdown, order types, and hourly analysis.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `"daily"` | `daily`, `weekly`, `monthly`, `custom`, `yesterday`, `last_7_days`, `last_30_days`, `last_month` |
| `from_date` | string | auto | Start date |
| `to_date` | string | auto | End date |

**Roles:** Restaurant Manager, Accounts Manager

**Returns:** `{ period, from_date, to_date, branch, summary, item_sales, order_type_sales, hourly_sales, cancelled_orders, payment_summary, top_customers }`

---

### `export_report_pdf`
Generate a downloadable PDF report.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `report_type` | string | `"sales"` | `sales`, `inventory`, `expense`, `profit_loss` |
| `period` | string | `"daily"` | Report period |
| `from_date` | string | auto | Start date |
| `to_date` | string | auto | End date |

**Roles:** Restaurant Manager, Accounts Manager

**Returns:** `{ file_url }` — URL to the generated PDF

---

## Menu Management API

### `get_menus`
List all menus with their items.

**Roles:** Any authenticated user

**Returns:** `[{ name, menu_name, enabled, items: [...] }]`

---

### `create_menu`
Create a new menu.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `menu_name` | string | Yes | Display name |
| `branch` | string | No | Branch assignment |

**Roles:** Restaurant Manager

---

### `toggle_menu`
Enable or disable a menu.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `menu_name` | string | Yes | Menu to toggle |

**Roles:** Restaurant Manager

---

### `batch_update_prices`
Batch update prices for items in a menu.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `menu` | string | Yes | Menu name |
| `updates` | JSON | Yes | `[{item_code, new_rate}]` |

**Roles:** Restaurant Manager

---

## Kitchen (KOT) API

### `get_kot_list`
Get kitchen orders for a station.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `station` | string | No | Kitchen station filter |

**Roles:** Kitchen Staff, Kitchen Manager

---

### `serve_kot`
Mark a KOT as served.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | KOT document name |
| `time` | string | No | Serve timestamp |

**Roles:** Kitchen Staff

---

### `confirm_cancel_kot`
Verify a KOT cancellation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | KOT document name |

**Note:** Uses `frappe.session.user` for verification identity (server-side).

**Roles:** Kitchen Manager

---

## Printing API

### `network_printing`
Send a document to a network printer.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `invoice` | string | Yes | POS Invoice name |
| `printer` | string | Yes | Printer name |

**Roles:** Restaurant Manager, Cashier

---

### `qz_certificate`
Get the QZ Tray signing certificate.

**Roles:** Restaurant Manager, Cashier

---

## Error Handling

All endpoints follow Frappe's standard error format:

```json
{
  "exc_type": "ValidationError",
  "exception": "frappe.exceptions.ValidationError: Invalid date format",
  "_exc_messages": ["Invalid date format"]
}
```

Common HTTP status codes:
- `200` — Success
- `401` — Not authenticated
- `403` — Permission denied
- `417` — Validation error
- `500` — Server error
