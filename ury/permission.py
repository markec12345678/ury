import frappe

def check_app_permission():
    if frappe.session.user == "Administrator":
        return True
    roles = frappe.get_roles()
    if "System Manager" in roles or "Restaurant Manager" in roles or "Restaurant User" in roles:
        return True
    return False