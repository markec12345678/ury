"""
URY Shared API Utilities
Common helper functions used across multiple API modules.
"""

import re
import frappe
from frappe import _


def _get_user_branch():
    """Get the branch for the current user.
    Note: This returns only the first matching branch record.
    Multi-branch users should be validated at the permission level
    to ensure correct branch scoping."""
    user = frappe.session.user
    branches = frappe.db.get_all("URY User", filters={"user": user}, fields=["parent"])
    if len(branches) > 1:
        frappe.log_error(
            f"User {user} has multiple branches: {[b.parent for b in branches]}. "
            "Only the first branch will be used. Multi-branch users should be "
            "validated at the permission level.",
            "URY Multi-Branch Warning"
        )
    if not branches:
        frappe.throw(_("User is not associated with any branch"), frappe.ValidationError)
    return branches[0].parent


def _branch_filter(branch, alias=""):
    """Return (sql_fragment, params_list) for optional branch filtering.

    Avoids .format() / f-string interpolation on SQL strings.
    The column reference is hardcoded by the caller; the branch value
    is always passed as a parameterized placeholder.

    Usage:
        branch_sql, branch_params = _branch_filter(branch)
        data = frappe.db.sql(f"SELECT ... WHERE x=%s {{branch_sql}} ...".replace("{branch_sql}", branch_sql), params + branch_params)
        # or simply:
        sql = "SELECT ... WHERE x=%s " + branch_sql + " GROUP BY ..."
        frappe.db.sql(sql, params + branch_params)
    """
    # R38-FIX: Validate alias is alphanumeric to prevent SQL injection
    if alias and not re.match(r'^[a-zA-Z_]\w*$', alias):
        frappe.throw(_("Invalid SQL alias: {0}").format(alias), frappe.ValidationError)
    if branch:
        col = f"{alias}.branch" if alias else "branch"
        return f"AND {col} = %s", [branch]
    return "", []
