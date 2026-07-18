import frappe


@frappe.whitelist()
def cancel_check():
    frappe.only_for("Restaurant Manager", "Restaurant User")
    return frappe.permissions.has_permission("POS Invoice", "cancel", raise_exception=False)
