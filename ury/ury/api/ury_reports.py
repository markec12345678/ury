"""
URY Reports API
Generate daily/weekly/monthly reports with PDF export support.
"""

import frappe
from frappe import _
import html as _html
import re
from frappe.utils import getdate, add_days, add_months, get_first_day, get_last_day, flt, fmt_money
import json
from ury.ury.api.utils import _get_user_branch, _branch_filter


@frappe.whitelist()
def get_sales_report(period="daily", from_date=None, to_date=None):
    """Get sales report for the given period.
    period: daily, weekly, monthly, custom
    """
    frappe.only_for("Restaurant Manager", "Accounts Manager")
    if not from_date or not to_date:
        from_date, to_date = _get_report_dates(period, from_date, to_date)
    else:
        from_date = getdate(from_date)
        to_date = getdate(to_date)

    branch = _get_user_branch()

    # R37-FIX: Replace .format() SQL pattern with _branch_filter helper
    branch_sql, branch_params = _branch_filter(branch)

    # Overall summary
    summary = frappe.db.sql("""
        SELECT 
            COUNT(*) as total_orders,
            SUM(grand_total) as total_revenue,
            SUM(net_total) as net_revenue,
            SUM(total_taxes_and_charges) as total_tax,
            AVG(grand_total) as avg_order_value,
            COUNT(DISTINCT customer) as unique_customers
        FROM `tabPOS Invoice`
        WHERE posting_date BETWEEN %s AND %s
        AND docstatus = 1
        """ + branch_sql,
        [from_date, to_date] + branch_params, as_dict=True)

    summary_data = summary[0] if summary else {}
    summary_data["total_revenue"] = flt(summary_data.get("total_revenue", 0), 2)
    summary_data["net_revenue"] = flt(summary_data.get("net_revenue", 0), 2)
    summary_data["total_tax"] = flt(summary_data.get("total_tax", 0), 2)
    summary_data["avg_order_value"] = flt(summary_data.get("avg_order_value", 0), 2)

    # Item-wise sales — uses pi.branch
    item_branch_sql, item_branch_params = _branch_filter(branch, alias="pi")
    item_sales = frappe.db.sql("""
        SELECT 
            ii.item_code,
            ii.item_name,
            SUM(ii.qty) as total_qty,
            SUM(ii.amount) as total_amount,
            AVG(ii.rate) as avg_rate
        FROM `tabPOS Invoice Item` ii
        JOIN `tabPOS Invoice` pi ON ii.parent = pi.name
        WHERE pi.posting_date BETWEEN %s AND %s
        AND pi.docstatus = 1
        """ + item_branch_sql + """
        GROUP BY ii.item_code, ii.item_name
        ORDER BY total_amount DESC
    """, [from_date, to_date] + item_branch_params, as_dict=True)

    # Order type breakdown
    order_type_sales = frappe.db.sql("""
        SELECT 
            COALESCE(order_type, 'Dine In') as order_type,
            COUNT(*) as order_count,
            SUM(grand_total) as revenue
        FROM `tabPOS Invoice`
        WHERE posting_date BETWEEN %s AND %s
        AND docstatus = 1
        """ + branch_sql + """
        GROUP BY order_type
        ORDER BY revenue DESC
    """, [from_date, to_date] + branch_params, as_dict=True)

    # Hourly breakdown
    hourly_sales = frappe.db.sql("""
        SELECT 
            HOUR(posting_time) as hour,
            COUNT(*) as order_count,
            SUM(grand_total) as revenue
        FROM `tabPOS Invoice`
        WHERE posting_date BETWEEN %s AND %s
        AND docstatus = 1
        """ + branch_sql + """
        GROUP BY HOUR(posting_time)
        ORDER BY hour
    """, [from_date, to_date] + branch_params, as_dict=True)

    # Cancelled orders
    cancelled = frappe.db.sql("""
        SELECT 
            COUNT(*) as cancelled_count,
            SUM(grand_total) as cancelled_amount
        FROM `tabPOS Invoice`
        WHERE posting_date BETWEEN %s AND %s
        AND docstatus = 2
        """ + branch_sql,
        [from_date, to_date] + branch_params, as_dict=True)

    cancelled_data = cancelled[0] if cancelled else {}

    # Payment method summary — uses pe.branch
    pe_branch_sql, pe_branch_params = _branch_filter(branch, alias="pe")
    payment_summary = frappe.db.sql("""
        SELECT 
            pe.mode_of_payment as payment_method,
            SUM(pe.paid_amount) as total_paid,
            COUNT(DISTINCT pe.name) as transaction_count
        FROM `tabPayment Entry` pe
        JOIN `tabPayment Entry Reference` per ON per.parent = pe.name
        WHERE per.reference_doctype = 'POS Invoice'
        AND pe.posting_date BETWEEN %s AND %s
        AND pe.docstatus = 1
        """ + pe_branch_sql + """
        GROUP BY pe.mode_of_payment
        ORDER BY total_paid DESC
    """, [from_date, to_date] + pe_branch_params, as_dict=True)

    # Top customers
    top_customers = frappe.db.sql("""
        SELECT 
            customer,
            customer_name,
            COUNT(*) as order_count,
            SUM(grand_total) as total_spent
        FROM `tabPOS Invoice`
        WHERE posting_date BETWEEN %s AND %s
        AND docstatus = 1
        """ + branch_sql + """
        GROUP BY customer, customer_name
        ORDER BY total_spent DESC
        LIMIT 10
    """, [from_date, to_date] + branch_params, as_dict=True)

    return {
        "period": period,
        "from_date": str(from_date),
        "to_date": str(to_date),
        "branch": branch,
        "summary": summary_data,
        "item_sales": item_sales,
        "order_type_sales": order_type_sales,
        "hourly_sales": hourly_sales,
        "cancelled_orders": {
            "count": int(cancelled_data.get("cancelled_count", 0)),
            "amount": flt(cancelled_data.get("cancelled_amount", 0), 2),
        },
        "payment_summary": payment_summary,
        "top_customers": top_customers,
    }


@frappe.whitelist()
def get_inventory_report(from_date=None, to_date=None):
    """Get inventory/material usage report."""
    frappe.only_for("Restaurant Manager", "Accounts Manager")
    if not from_date:
        from_date = getdate()
    if not to_date:
        to_date = getdate()

    from_date = getdate(from_date)
    to_date = getdate(to_date)
    branch = _get_user_branch()

    # Material consumption
    material_filters = {
        "date": ["between", [from_date, to_date]],
    }
    if branch:
        material_filters["branch"] = branch
    materials = frappe.get_all(
        "URY Materials",
        filters=material_filters,
        fields=["name", "date", "item", "qty", "rate", "amount"],
        order_by="date"
    )

    return {
        "from_date": str(from_date),
        "to_date": str(to_date),
        "materials": materials,
    }


@frappe.whitelist()
def get_expense_report(from_date=None, to_date=None):
    """Get expense report (fixed + variable)."""
    frappe.only_for("Restaurant Manager", "Accounts Manager")
    if not from_date:
        from_date = get_first_day(getdate())
    if not to_date:
        to_date = getdate()

    from_date = getdate(from_date)
    to_date = getdate(to_date)

    branch = _get_user_branch()

    # Fixed expenses
    fixed_filters = {
        "date": ["between", [from_date, to_date]],
    }
    if branch:
        fixed_filters["branch"] = branch
    fixed_expenses = frappe.get_all(
        "URY Fixed Expenses",
        filters=fixed_filters,
        fields=["name", "date", "expense_type", "amount", "description"],
        order_by="expense_type"
    )

    # Variable expenses
    variable_filters = {
        "date": ["between", [from_date, to_date]],
    }
    if branch:
        variable_filters["branch"] = branch
    variable_expenses = frappe.get_all(
        "URY Variable Expenses",
        filters=variable_filters,
        fields=["name", "date", "expense_type", "amount", "description"],
        order_by="date"
    )

    total_fixed = sum(flt(e.amount) for e in fixed_expenses)
    total_variable = sum(flt(e.amount) for e in variable_expenses)

    return {
        "from_date": str(from_date),
        "to_date": str(to_date),
        "fixed_expenses": fixed_expenses,
        "variable_expenses": variable_expenses,
        "total_fixed": flt(total_fixed, 2),
        "total_variable": flt(total_variable, 2),
        "total_expenses": flt(total_fixed + total_variable, 2),
    }


@frappe.whitelist()
def get_profit_loss_report(from_date=None, to_date=None):
    """Get profit and loss report."""
    frappe.only_for("Restaurant Manager", "Accounts Manager")
    if not from_date:
        from_date = get_first_day(getdate())
    if not to_date:
        to_date = getdate()

    from_date = getdate(from_date)
    to_date = getdate(to_date)
    branch = _get_user_branch()

    # R37-FIX: Replace .format() SQL pattern with _branch_filter helper
    branch_sql, branch_params = _branch_filter(branch)

    # Revenue
    revenue_data = frappe.db.sql("""
        SELECT 
            SUM(grand_total) as total_revenue,
            SUM(net_total) as net_revenue,
            SUM(total_taxes_and_charges) as total_tax
        FROM `tabPOS Invoice`
        WHERE posting_date BETWEEN %s AND %s
        AND docstatus = 1
        """ + branch_sql,
        [from_date, to_date] + branch_params, as_dict=True)

    revenue = revenue_data[0] if revenue_data else {}
    total_revenue = flt(revenue.get("total_revenue", 0), 2)

    # Expenses
    expense_data = get_expense_report(str(from_date), str(to_date))
    total_expenses = expense_data["total_expenses"]

    # Cost of goods
    cogs_filters = {"date": ["between", [from_date, to_date]]}
    if branch:
        cogs_filters["branch"] = branch
    cogs_data = frappe.get_all(
        "URY Cost of Goods",
        filters=cogs_filters,
        fields=["sum(amount) as total_cogs"]
    )
    total_cogs = flt(cogs_data[0].total_cogs) if cogs_data else 0

    gross_profit = total_revenue - total_cogs
    net_profit = gross_profit - total_expenses

    return {
        "from_date": str(from_date),
        "to_date": str(to_date),
        "total_revenue": total_revenue,
        "net_revenue": flt(revenue.get("net_revenue", 0), 2),
        "total_tax": flt(revenue.get("total_tax", 0), 2),
        "cost_of_goods": flt(total_cogs, 2),
        "gross_profit": flt(gross_profit, 2),
        "total_expenses": total_expenses,
        "fixed_expenses": expense_data["total_fixed"],
        "variable_expenses": expense_data["total_variable"],
        "net_profit": flt(net_profit, 2),
        "profit_margin": flt(net_profit / total_revenue * 100, 1) if total_revenue > 0 else 0,
    }


@frappe.whitelist()
def export_report_pdf(report_type="sales", period="daily", from_date=None, to_date=None):
    """Generate and return a PDF report.
    Returns the PDF file URL for download.
    """
    frappe.only_for("Restaurant Manager", "Accounts Manager")
    # Get report data
    if report_type == "sales":
        data = get_sales_report(period, from_date, to_date)
    elif report_type == "inventory":
        data = get_inventory_report(from_date, to_date)
    elif report_type == "expense":
        data = get_expense_report(from_date, to_date)
    elif report_type == "profit_loss":
        data = get_profit_loss_report(from_date, to_date)
    else:
        frappe.throw(_("Unknown report type: {0}").format(report_type), frappe.ValidationError)

    # Store data in a temporary doc for PDF generation
    report_html = _generate_report_html(report_type, data)

    # Save the HTML as a temporary file
    import os
    import time as _time
    temp_dir = frappe.get_site_path("private", "reports")
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir, exist_ok=True)

    # Cleanup: delete HTML files older than 1 hour
    now = _time.time()
    for old_file in os.listdir(temp_dir):
        old_filepath = os.path.join(temp_dir, old_file)
        if old_file.endswith('.html') and os.path.isfile(old_filepath):
            if now - os.path.getmtime(old_filepath) > 3600:
                try:
                    os.remove(old_filepath)
                except OSError:
                    pass

    # R47-FIX: Sanitize username for filesystem safety — email addresses
    # shouldn't contain path separators, but sanitize defensively.
    # R49-FIX: Also sanitize report_type and branch for filename safety
    safe_user = re.sub(r'[^\w@.\-]', '_', frappe.session.user)
    safe_report_type = re.sub(r'[^\w\-]', '_', report_type)
    safe_branch = re.sub(r'[^\w\-]', '_', _get_user_branch() or "unknown")
    filename = f"report_{safe_report_type}_{safe_user}_{safe_branch}_{frappe.generate_hash(length=8)}.html"
    filepath = os.path.join(temp_dir, filename)

    with open(filepath, "w") as f:
        f.write(report_html)

    # R49-FIX: Return path under Frappe's private files route which requires
    # authentication. The previous "/reports/{filename}" path could be served
    # by the web server without authentication if the private directory is
    # mapped. Use Frappe's secure file download route instead.
    return f"/api/method/frappe.utils.file_manager.download_file?file_path=private/reports/{filename}"


# ---- Helper functions ----

def _get_report_dates(period, from_date=None, to_date=None):
    """Get date range for a report period."""
    today = getdate()

    if period == "daily":
        return today, today
    elif period == "weekly":
        weekday = today.weekday()
        start = add_days(today, -weekday)
        return start, today
    elif period == "monthly":
        return get_first_day(today), get_last_day(today)
    elif period == "yesterday":
        yesterday = add_days(today, -1)
        return yesterday, yesterday
    elif period == "last_7_days":
        return add_days(today, -6), today
    elif period == "last_30_days":
        return add_days(today, -29), today
    elif period == "last_month":
        last_month = add_months(today, -1)
        return get_first_day(last_month), get_last_day(last_month)
    else:
        frappe.throw(
            _("Unknown period '{0}'. Valid periods: daily, weekly, monthly, yesterday, last_7_days, last_30_days, last_month").format(period),
            frappe.ValidationError
        )





def _generate_report_html(report_type, data):
    """Generate HTML for a report that can be converted to PDF."""
    company = frappe.db.get_single_value("Global Defaults", "default_company") or "URY Restaurant"
    currency = frappe.db.get_single_value("Global Defaults", "default_currency") or "EUR"

    if report_type == "sales":
        return _sales_report_html(data, company, currency)
    elif report_type == "expense":
        return _expense_report_html(data, company, currency)
    elif report_type == "profit_loss":
        return _pl_report_html(data, company, currency)
    else:
        return _generic_report_html(report_type, data, company, currency)


def _sales_report_html(data, company, currency):
    """Generate HTML for sales report."""
    summary = data.get("summary", {})
    item_rows = ""
    for item in data.get("item_sales", []):
        safe_name = _html.escape(str(item.get('item_name', '')))
        item_rows += f"""
        <tr>
            <td>{safe_name}</td>
            <td class="number">{flt(item.get('total_qty', 0), 1)}</td>
            <td class="number">{fmt_money(flt(item.get('avg_rate', 0), 2), currency=currency)}</td>
            <td class="number">{fmt_money(flt(item.get('total_amount', 0), 2), currency=currency)}</td>
        </tr>"""

    otype_rows = ""
    for o in data.get('order_type_sales', []):
        safe_otype = _html.escape(str(o.get("order_type", "")))
        otype_rows += f'<tr><td>{safe_otype}</td><td class="number">{int(o.get("order_count", 0))}</td><td class="number">{fmt_money(flt(o.get("revenue", 0), 2), currency=currency)}</td></tr>'

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica', Arial, sans-serif; margin: 40px; color: #333; }}
            h1 {{ color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 10px; }}
            h2 {{ color: #374151; margin-top: 30px; }}
            .summary-grid {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }}
            .summary-card {{ background: #f3f4f6; padding: 15px; border-radius: 8px; }}
            .summary-card .label {{ font-size: 12px; color: #6b7280; }}
            .summary-card .value {{ font-size: 20px; font-weight: bold; color: #111827; }}
            table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
            th {{ background: #1a56db; color: white; padding: 10px; text-align: left; }}
            td {{ padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }}
            .number {{ text-align: right; }}
            .header-info {{ display: flex; justify-content: space-between; margin-bottom: 20px; }}
            .period {{ color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="header-info">
            <div>
                <h1>Sales Report</h1>
                <p class="period">{_html.escape(str(data.get('from_date', '')))} - {_html.escape(str(data.get('to_date', '')))}</p>
            </div>
            <div style="text-align: right;">
                <strong>{_html.escape(str(company))}</strong><br>
                <span class="period">Generated: {_html.escape(str(frappe.utils.now()))}</span>
            </div>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <div class="label">Total Revenue</div>
                <div class="value">{fmt_money(summary.get('total_revenue', 0), currency=currency)}</div>
            </div>
            <div class="summary-card">
                <div class="label">Total Orders</div>
                <div class="value">{int(summary.get('total_orders', 0))}</div>
            </div>
            <div class="summary-card">
                <div class="label">Avg Order Value</div>
                <div class="value">{fmt_money(summary.get('avg_order_value', 0), currency=currency)}</div>
            </div>
        </div>

        <h2>Item-wise Sales</h2>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Avg Rate</th>
                    <th>Total Amount</th>
                </tr>
            </thead>
            <tbody>
                {item_rows}
            </tbody>
        </table>

        <h2>Order Type Breakdown</h2>
        <table>
            <thead>
                <tr><th>Order Type</th><th>Orders</th><th>Revenue</th></tr>
            </thead>
            <tbody>
                {otype_rows}
            </tbody>
        </table>
    </body>
    </html>"""


def _expense_report_html(data, company, currency):
    """Generate HTML for expense report."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica', Arial, sans-serif; margin: 40px; color: #333; }}
            h1 {{ color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; }}
            .summary-grid {{ display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin: 20px 0; }}
            .summary-card {{ background: #fef2f2; padding: 15px; border-radius: 8px; }}
            .summary-card .label {{ font-size: 12px; color: #991b1b; }}
            .summary-card .value {{ font-size: 20px; font-weight: bold; color: #7f1d1d; }}
            table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
            th {{ background: #dc2626; color: white; padding: 10px; text-align: left; }}
            td {{ padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }}
            .number {{ text-align: right; }}
        </style>
    </head>
    <body>
        <h1>Expense Report</h1>
        <p>Period: {_html.escape(str(data.get('from_date', '')))} - {_html.escape(str(data.get('to_date', '')))}</p>
        <div class="summary-grid">
            <div class="summary-card">
                <div class="label">Fixed Expenses</div>
                <div class="value">{fmt_money(data.get('total_fixed', 0), currency=currency)}</div>
            </div>
            <div class="summary-card">
                <div class="label">Variable Expenses</div>
                <div class="value">{fmt_money(data.get('total_variable', 0), currency=currency)}</div>
            </div>
            <div class="summary-card">
                <div class="label">Total Expenses</div>
                <div class="value">{fmt_money(data.get('total_expenses', 0), currency=currency)}</div>
            </div>
        </div>
    </body>
    </html>"""


def _pl_report_html(data, company, currency):
    """Generate HTML for profit & loss report."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica', Arial, sans-serif; margin: 40px; color: #333; }}
            h1 {{ color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }}
            .pl-section {{ margin: 20px 0; padding: 15px; background: #f0fdf4; border-radius: 8px; }}
            .pl-row {{ display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1fae5; }}
            .pl-row.total {{ font-weight: bold; font-size: 18px; border-bottom: none; color: #065f46; }}
            .negative {{ color: #dc2626; }}
            .positive {{ color: #059669; }}
        </style>
    </head>
    <body>
        <h1>Profit & Loss Report</h1>
        <p>Period: {_html.escape(str(data.get('from_date', '')))} - {_html.escape(str(data.get('to_date', '')))}</p>
        <div class="pl-section">
            <div class="pl-row"><span>Total Revenue</span><span>{fmt_money(data.get('total_revenue', 0), currency=currency)}</span></div>
            <div class="pl-row"><span>Cost of Goods</span><span class="negative">-{fmt_money(data.get('cost_of_goods', 0), currency=currency)}</span></div>
            <div class="pl-row total"><span>Gross Profit</span><span class="{'positive' if data.get('gross_profit', 0) >= 0 else 'negative'}">{fmt_money(data.get('gross_profit', 0), currency=currency)}</span></div>
        </div>
        <div class="pl-section">
            <div class="pl-row"><span>Fixed Expenses</span><span class="negative">-{fmt_money(data.get('fixed_expenses', 0), currency=currency)}</span></div>
            <div class="pl-row"><span>Variable Expenses</span><span class="negative">-{fmt_money(data.get('variable_expenses', 0), currency=currency)}</span></div>
        </div>
        <div class="pl-section" style="background: #ecfdf5;">
            <div class="pl-row total"><span>Net Profit</span><span class="{'positive' if data.get('net_profit', 0) >= 0 else 'negative'}">{fmt_money(data.get('net_profit', 0), currency=currency)}</span></div>
            <div class="pl-row"><span>Profit Margin</span><span>{flt(data.get('profit_margin', 0), 1)}%</span></div>
        </div>
    </body>
    </html>"""


def _generic_report_html(report_type, data, company, currency):
    """Generate a generic report HTML."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Helvetica', Arial, sans-serif; margin: 40px; color: #333; }}
            h1 {{ color: #1a56db; }}
            pre {{ background: #f3f4f6; padding: 20px; border-radius: 8px; }}
        </style>
    </head>
    <body>
        <h1>{_html.escape(report_type.replace('_', ' ').title())} Report</h1>
        <pre>{_html.escape(json.dumps(data, indent=2, default=str))}</pre>
    </body>
    </html>"""
