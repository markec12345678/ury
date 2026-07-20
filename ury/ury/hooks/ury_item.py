import frappe
from frappe import _


def validate(doc, method):
    update_menu_item(doc, method)
    update_variants_add_on(doc, method)


def update_menu_item(doc, event):
    menu_items = frappe.get_all('URY Menu Item', filters={'item': doc.item_code}, fields=['name'])
    if menu_items:
        # H-06: Use frappe.db.set_value() instead of raw SQL UPDATE to trigger document hooks
        for m in menu_items:
            # R48-FIX: Use update_modified=False — background sync, not user action
            frappe.db.set_value('URY Menu Item', m.name, 'item_name', doc.item_name, update_modified=False)

def update_variants_add_on(doc, event):
    if doc.custom_pos_add_on_items:
        for row in doc.custom_pos_add_on_items:
            if not frappe.db.exists("URY Menu Item", {"item": row.item}):
                frappe.throw(_("Item '{0}' in POS Add On Items is not in URY Menu").format(row.item))

    if doc.custom_pos_item_variants:
        for row in doc.custom_pos_item_variants:
            if not frappe.db.exists("URY Menu Item", {"item": row.item}):
                frappe.throw(_("Item '{0}' in POS Item Variants is not in URY Menu").format(row.item))
