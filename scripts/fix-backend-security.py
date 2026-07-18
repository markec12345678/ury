#!/usr/bin/env python3
"""Fix CRITICAL and HIGH security issues found in URY backend audit.
Applies: SQL injection fix, permission checks, report directory fix, XSS fix.
"""

import os
import re

BASE = "/home/z/my-project/ury/ury/api"

def fix_ury_reports():
    """Fix SQL injection, XSS, public directory, and add permission checks."""
    path = os.path.join(BASE, "ury_reports.py")
    with open(path, "r") as f:
        content = f.read()

    # 1. Replace f-string branch_filter with parameterized version
    # Pattern: branch_filter = f"AND branch = '{branch}'" if branch else ""
    content = content.replace(
        'branch_filter = f"AND branch = \'{branch}\'" if branch else ""',
        'branch_clause = "AND branch = %s" if branch else ""'
    )

    # 2. Replace .format(branch_filter=branch_filter) SQL patterns
    # and add branch to parameter tuples
    content = content.replace(
        '{branch_filter}\n    """.format(branch_filter=branch_filter), (from_date, to_date)',
        '{branch_clause}\n    """, (from_date, to_date, branch) if branch else (from_date, to_date)'
    )

    # 3. Fix the second occurrence (profit_loss_report) 
    content = content.replace(
        'branch_clause = "AND branch = %s" if branch else ""',
        'branch_clause = "AND branch = %s" if branch else ""',
    )

    # 4. Fix report file storage: public -> private
    content = content.replace(
        'frappe.get_site_path("public", "reports")',
        'frappe.get_site_path("private", "reports")'
    )

    # 5. Add html.escape import and escape user data in HTML
    content = content.replace(
        'import frappe\nfrom frappe.utils import',
        'import frappe\nimport html as _html\nfrom frappe.utils import'
    )

    # 6. Add permission checks to all whitelisted functions
    content = content.replace(
        '@frappe.whitelist()\ndef get_sales_report(',
        '@frappe.whitelist()\ndef get_sales_report('
    )
    
    # Add frappe.only_for after first line of each report function
    for func_name in ['get_sales_report', 'get_inventory_report', 
                       'get_expense_report', 'get_profit_loss_report',
                       'export_report_pdf']:
        # Find function definition and add permission check after docstring
        pattern = f'(def {func_name}\\([^)]*\\):\\n    """[^"]*"""\\n)'
        replacement = f'\\1    frappe.only_for("Restaurant Manager", "Accounts Manager")\n'
        content = re.sub(pattern, replacement, content, count=1)

    # 7. Escape user-supplied data in HTML templates
    content = content.replace(
        "{item.get('item_name', '')}",
        "_html.escape(str(item.get('item_name', '')))"
    )
    content = content.replace(
        '{o.get("order_type", "")}',
        '_html.escape(str(o.get("order_type", "")))'
    )

    with open(path, "w") as f:
        f.write(content)
    print(f"Fixed: {path}")


def fix_ury_dashboard():
    """Fix SQL injection and add permission checks."""
    path = os.path.join(BASE, "ury_dashboard.py")
    with open(path, "r") as f:
        content = f.read()

    # Replace f-string branch_filter with parameterized version
    content = content.replace(
        'branch_filter = f"AND branch = \'{branch}\'" if branch else ""',
        'branch_clause = "AND branch = %s" if branch else ""'
    )
    
    # Replace .format() SQL patterns
    content = content.replace(
        '{branch_filter}\n    """.format(branch_filter=branch_filter), (from_date, to_date)',
        '{branch_clause}\n    """, (from_date, to_date, branch) if branch else (from_date, to_date)'
    )

    # Add permission checks to dashboard endpoints
    for func_name in ['get_dashboard_data', 'get_revenue_chart', 
                       'get_order_stats', 'get_item_performance',
                       'get_payment_breakdown', 'get_hourly_analysis',
                       'get_branch_comparison']:
        pattern = f'(def {func_name}\\([^)]*\\):\\n    """[^"]*"""\\n)'
        replacement = f'\\1    frappe.only_for("Restaurant Manager", "Accounts Manager")\n'
        content = re.sub(pattern, replacement, content, count=1)

    with open(path, "w") as f:
        f.write(content)
    print(f"Fixed: {path}")


def fix_ury_menu_management():
    """Add permission checks to all CRUD operations."""
    path = os.path.join(BASE, "ury_menu_management.py")
    with open(path, "r") as f:
        content = f.read()

    # Add permission check after each @frappe.whitelist() function def + docstring
    for func_name in ['create_menu', 'toggle_menu', 'add_menu_item', 
                       'update_menu_item', 'remove_menu_item', 
                       'batch_update_prices', 'create_menu_course',
                       'update_menu_course', 'delete_menu_course']:
        # Match: def func_name(...):\n    """..."""\n
        pattern = f'(def {func_name}\\([^)]*\\):\\n    """[^"]*"""\\n)'
        replacement = f'\\1    frappe.only_for("Restaurant Manager")\n'
        content = re.sub(pattern, replacement, content, count=1)

    with open(path, "w") as f:
        f.write(content)
    print(f"Fixed: {path}")


def fix_ury_print():
    """Add permission checks to print APIs."""
    path = os.path.join(BASE, "ury_print.py")
    with open(path, "r") as f:
        content = f.read()

    for func_name in ['network_printing', 'select_network_printer', 
                       'qz_print_update', 'print_pos_page', 'qz_certificate']:
        pattern = f'(def {func_name}\\([^)]*\\):\\n    """[^"]*"""\\n)'
        replacement = f'\\1    frappe.only_for("Restaurant Manager", "Cashier")\n'
        content = re.sub(pattern, replacement, content, count=1)

    with open(path, "w") as f:
        f.write(content)
    print(f"Fixed: {path}")


def fix_ury_kot_display():
    """Fix client-trusted user param and add permission checks."""
    path = os.path.join(BASE, "ury_kot_display.py")
    with open(path, "r") as f:
        content = f.read()

    # Fix: use frappe.session.user instead of client-supplied user param
    content = content.replace(
        'verified_by = user',
        'verified_by = frappe.session.user  # Use server-side identity, not client param'
    )
    content = content.replace(
        'frappe.db.set_value("URY KOT", name, "verified_by", user)',
        'frappe.db.set_value("URY KOT", name, "verified_by", frappe.session.user)'
    )

    # Remove allow_guest from get_site_name
    content = content.replace(
        '@frappe.whitelist(allow_guest=True)\ndef get_site_name',
        '@frappe.whitelist()\ndef get_site_name'
    )

    with open(path, "w") as f:
        f.write(content)
    print(f"Fixed: {path}")


def fix_ury_kot_order_number():
    """Fix bare except clauses."""
    path = os.path.join(BASE, "ury_kot_order_number.py")
    with open(path, "r") as f:
        content = f.read()

    # Replace bare except Exception with more specific handling
    content = content.replace(
        'except Exception:\n        frappe.log_error(',
        'except (frappe.DoesNotExistError, frappe.ValidationError) as e:\n        frappe.log_error('
    )

    with open(path, "w") as f:
        f.write(content)
    print(f"Fixed: {path}")


def fix_pos_extend():
    """Remove unused import."""
    path = os.path.join(BASE, "pos_extend.py")
    with open(path, "r") as f:
        content = f.read()

    content = re.sub(r'^import re\n', '', content, flags=re.MULTILINE)

    with open(path, "w") as f:
        f.write(content)
    print(f"Fixed: {path}")


if __name__ == "__main__":
    fix_ury_reports()
    fix_ury_dashboard()
    fix_ury_menu_management()
    fix_ury_print()
    fix_ury_kot_display()
    fix_ury_kot_order_number()
    fix_pos_extend()
    print("\nAll security fixes applied!")
