"""
URY Menu Management API
CRUD operations for menu items, categories (courses), and prices.
"""

import frappe
import json
from frappe import _
from frappe.utils import flt
from ury.ury.api.utils import _get_user_branch


@frappe.whitelist()
def get_menus():
    """Get all URY Menus with their items for the current branch."""
    frappe.only_for("Restaurant Manager", "Restaurant User")
    branch = _get_user_branch()
    if not branch:
        frappe.throw(_("User branch not found"), frappe.ValidationError)

    menus = frappe.get_all(
        "URY Menu",
        filters={"branch": branch},
        fields=["name", "enabled", "branch", "price_list"],
        order_by="name"
    )

    for menu in menus:
        items = frappe.get_all(
            "URY Menu Item",
            filters={"parent": menu.name, "parenttype": "URY Menu"},
            fields=[
                "name", "item", "item_name", "rate", "special_dish",
                "disabled", "course", "course_icon", "idx"
            ],
            order_by="idx"
        )
        menu["items"] = items
        menu["item_count"] = len(items)
        menu["enabled_count"] = len([i for i in items if not i.get("disabled")])

    return menus


@frappe.whitelist()
def get_menu_detail(menu_name):
    """Get a single URY Menu with full details."""
    frappe.only_for("Restaurant Manager", "Restaurant User")
    menu = frappe.get_doc("URY Menu", menu_name)
    user_branch = _get_user_branch()
    if menu.branch != user_branch:
        frappe.throw(_("Cannot access menu from a different branch"), frappe.PermissionError)
    return {
        "name": menu.name,
        "enabled": menu.enabled,
        "branch": menu.branch,
        "price_list": menu.price_list,
        "items": [
            {
                "name": item.name,
                "item": item.item,
                "item_name": item.item_name,
                "rate": flt(item.rate),
                "special_dish": item.special_dish,
                "disabled": item.disabled,
                "course": item.course,
                "course_icon": item.course_icon,
                "idx": item.idx,
            }
            for item in menu.items
        ]
    }


@frappe.whitelist()
def create_menu(branch, enabled=1):
    """Create a new URY Menu."""
    frappe.only_for("Restaurant Manager")
    if not branch:
        frappe.throw(_("Branch is required"), frappe.ValidationError)
    user_branch = _get_user_branch()
    if branch != user_branch:
        frappe.throw(_("Cannot create menu for a different branch"))
    existing = frappe.get_all("URY Menu", filters={"branch": branch})
    if existing:
        frappe.throw(_("Menu already exists for branch {0}").format(branch), frappe.DuplicateEntryError)

    menu = frappe.get_doc({
        "doctype": "URY Menu",
        "branch": branch,
        "enabled": enabled,
    })
    menu.insert(ignore_permissions=True)
    return menu.name


@frappe.whitelist()
def toggle_menu(menu_name, enabled):
    """Enable or disable a menu."""
    frappe.only_for("Restaurant Manager")
    if not menu_name:
        frappe.throw(_("Menu name is required"), frappe.ValidationError)
    menu = frappe.get_doc("URY Menu", menu_name)
    user_branch = _get_user_branch()
    if menu.branch != user_branch:
        frappe.throw(_("Cannot access menu from a different branch"), frappe.PermissionError)
    menu.enabled = enabled
    menu.save(ignore_permissions=True)
    return {"name": menu.name, "enabled": menu.enabled}


@frappe.whitelist()
def add_menu_item(menu_name, item, rate, course=None, special_dish=0):
    """Add an item to a URY Menu."""
    frappe.only_for("Restaurant Manager")
    if not item:
        frappe.throw(_("Item is required"), frappe.ValidationError)
    try:
        rate = flt(rate)
    except (ValueError, TypeError):
        frappe.throw(_("Invalid rate value"))
    if rate < 0:
        frappe.throw(_("Rate cannot be negative"))
    menu = frappe.get_doc("URY Menu", menu_name)
    # R37-FIX: Validate menu belongs to user's branch (was missing)
    user_branch = _get_user_branch()
    if menu.branch != user_branch:
        frappe.throw(_("Cannot access menu from a different branch"), frappe.PermissionError)

    for existing_item in menu.items:
        if existing_item.item == item:
            frappe.throw(_("Item {0} already exists in this menu").format(item), frappe.DuplicateEntryError)

    item_name = frappe.db.get_value("Item", item, "item_name")

    menu.append("items", {
        "item": item,
        "item_name": item_name,
        "rate": rate,
        "special_dish": special_dish,
        "disabled": 0,
        "course": course,
    })
    menu.save(ignore_permissions=True)
    return {"success": True, "item": item, "item_name": item_name, "rate": flt(rate)}


@frappe.whitelist()
def update_menu_item(menu_name, item_row_name, rate=None, special_dish=None, disabled=None, course=None):
    """Update a menu item's properties."""
    frappe.only_for("Restaurant Manager")
    menu = frappe.get_doc("URY Menu", menu_name)
    user_branch = _get_user_branch()
    if menu.branch != user_branch:
        frappe.throw(_("Cannot access menu from a different branch"), frappe.PermissionError)
    for item in menu.items:
        if item.name == item_row_name:
            if rate is not None:
                rate = flt(rate)
                if rate < 0:
                    frappe.throw(_("Rate cannot be negative"))
                item.rate = rate
            if special_dish is not None:
                item.special_dish = int(special_dish)
            if disabled is not None:
                item.disabled = int(disabled)
            if course is not None:
                item.course = course
            break
    else:
        frappe.throw(_("Menu item row {0} not found").format(item_row_name), frappe.DoesNotExistError)

    menu.save(ignore_permissions=True)
    return {"success": True}


@frappe.whitelist()
def remove_menu_item(menu_name, item_row_name):
    """Remove an item from a URY Menu."""
    frappe.only_for("Restaurant Manager")
    menu = frappe.get_doc("URY Menu", menu_name)
    user_branch = _get_user_branch()
    if menu.branch != user_branch:
        frappe.throw(_("Cannot access menu from a different branch"), frappe.PermissionError)
    original_count = len(menu.items)

    menu.items = [item for item in menu.items if item.name != item_row_name]

    if len(menu.items) == original_count:
        frappe.throw(_("Menu item row {0} not found").format(item_row_name), frappe.DoesNotExistError)

    menu.save(ignore_permissions=True)
    return {"success": True}


@frappe.whitelist()
def batch_update_prices(menu_name, updates):
    """Batch update prices for menu items.
    updates: list of dicts with {item_row_name, rate}
    """
    frappe.only_for("Restaurant Manager")
    if isinstance(updates, str):
        updates = json.loads(updates)
    if not updates:
        frappe.throw(_("No updates provided"), frappe.ValidationError)
    if len(updates) > 500:
        frappe.throw(_("Maximum 500 price updates per batch"))

    menu = frappe.get_doc("URY Menu", menu_name)
    user_branch = _get_user_branch()
    if menu.branch != user_branch:
        frappe.throw(_("Cannot access menu from a different branch"), frappe.PermissionError)

    # Build a lookup dict for O(1) access instead of O(n×m) nested loop
    item_by_name = {item.name: item for item in menu.items}
    updated = 0

    for update in updates:
        row_name = update.get("item_row_name")
        item = item_by_name.get(row_name)
        if not item:
            continue
        try:
            rate = flt(update.get("rate", item.rate))
        except (ValueError, TypeError):
            frappe.throw(_("Invalid rate value for item {0}").format(item.item_name))
        if rate < 0:
            frappe.throw(_("Rate cannot be negative"))
        item.rate = rate
        updated += 1

    menu.save(ignore_permissions=True)
    return {"success": True, "updated_count": updated}


@frappe.whitelist()
def get_courses_detail():
    """Get all menu courses with their details."""
    frappe.only_for("Restaurant Manager", "Restaurant User")
    courses = frappe.get_all(
        "URY Menu Course",
        fields=["name", "course", "custom_serving_priority", "custom_indicate_in_kds"],
        order_by="custom_serving_priority asc"
    )
    return courses


@frappe.whitelist()
def create_menu_course(course, serving_priority=0, indicate_in_kds=0):
    """Create a new menu course/category."""
    frappe.only_for("Restaurant Manager")
    if not course or not course.strip():
        frappe.throw(_("Course name is required"), frappe.ValidationError)
    course = course.strip()
    existing = frappe.get_all("URY Menu Course", filters={"course": course})
    if existing:
        frappe.throw(_("Course '{0}' already exists").format(course), frappe.DuplicateEntryError)

    doc = frappe.get_doc({
        "doctype": "URY Menu Course",
        "course": course,
        "custom_serving_priority": serving_priority,
        "custom_indicate_in_kds": indicate_in_kds,
    })
    doc.insert(ignore_permissions=True)
    return doc.name


@frappe.whitelist()
def update_menu_course(course_name, course=None, serving_priority=None, indicate_in_kds=None):
    """Update a menu course."""
    frappe.only_for("Restaurant Manager")
    doc = frappe.get_doc("URY Menu Course", course_name)
    if course is not None:
        doc.course = course
    if serving_priority is not None:
        doc.custom_serving_priority = int(serving_priority)
    if indicate_in_kds is not None:
        doc.custom_indicate_in_kds = int(indicate_in_kds)
    doc.save(ignore_permissions=True)
    return {"success": True}


@frappe.whitelist()
def delete_menu_course(course_name):
    """Delete a menu course if not used by any menu items."""
    frappe.only_for("Restaurant Manager")
    used_items = frappe.get_all(
        "URY Menu Item",
        filters={"course": course_name},
        fields=["name", "parent"]
    )
    if used_items:
        frappe.throw(
            _("Cannot delete course. It is used by {0} menu items.").format(len(used_items)),
            frappe.ValidationError
        )

    frappe.delete_doc("URY Menu Course", course_name, ignore_permissions=True)
    return {"success": True}


@frappe.whitelist()
def get_available_items():
    """Get all Items that can be added to a menu (food/beverage items), scoped to branch."""
    frappe.only_for("Restaurant Manager", "Restaurant User")
    branch = _get_user_branch()
    # Get the menu for this branch to find which items are already in the menu
    menu_name = frappe.db.get_value("URY Menu", {"branch": branch}, "name")

    # Get items from the active price list of this branch's menu
    if menu_name:
        price_list = frappe.db.get_value("URY Menu", menu_name, "price_list")
        if price_list:
            items = frappe.get_all(
                "Item Price",
                filters={"price_list": price_list, "selling": 1},
                fields=["item_code as name", "item_name", "price_list_rate as standard_rate"],
                order_by="item_name",
                limit_page_length=500,
            )
            # Batch-fetch item_group and image
            item_codes = [i.name for i in items]
            item_info = {}
            if item_codes:
                rows = frappe.db.get_all(
                    "Item",
                    filters={"name": ("in", item_codes), "disabled": 0, "is_sales_item": 1},
                    fields=["name", "item_group", "image"],
                )
                item_info = {r.name: r for r in rows}
            # Filter to only enabled sales items and enrich with group/image
            result = []
            for i in items:
                info = item_info.get(i.name)
                if info:
                    result.append({
                        "name": i.name,
                        "item_name": i.item_name,
                        "item_group": info.item_group,
                        "standard_rate": i.standard_rate,
                        "image": info.image,
                    })
            return result

    # Fallback: return all active sales items if no menu/price_list configured
    items = frappe.get_all(
        "Item",
        filters={
            "disabled": 0,
            "is_sales_item": 1,
        },
        fields=["name", "item_name", "item_group", "standard_rate", "image"],
        order_by="item_name",
        limit_page_length=500
    )
    return items



