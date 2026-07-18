"""
URY Shared API Utilities
Common helper functions used across multiple API modules.
"""

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
