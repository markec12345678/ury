"""
URY Shared API Utilities
Common helper functions used across multiple API modules.
"""

import frappe


def _get_user_branch():
    """Get the branch for the current user."""
    user = frappe.session.user
    branch = frappe.db.get_value("URY User", {"user": user}, "parent")
    return branch
