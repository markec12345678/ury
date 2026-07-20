# Copyright (c) 2023, Tridz Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import json
import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt
from datetime import datetime
from erpnext.controllers.queries import item_query
from ury.ury.api.utils import _get_user_branch
from ury.ury_pos.api import getBranchRoom
from ury.ury.api.ury_kot_generate import kot_execute
from ury.ury.api.ury_kot_generate import process_items_for_cancel_kot


class URYOrder(Document):
    pass


def _get_order_invoice_doc(table=None, invoiceNo=None, order_type=None, is_payment=None):
    """Internal: returns POS Invoice document object for server-side manipulation.
    Used by sync_order and make_invoice which need the doc, not a dict."""
    # Verify user has access to the table's room (BE-R36-017)
    if table:
        from ury.ury_pos.api import _get_user_branch_rooms
        table_room = frappe.db.get_value("URY Table", table, "restaurant_room")
        if table_room:
            user_rooms = [r.room for r in _get_user_branch_rooms() if r.room]
            if user_rooms and table_room not in user_rooms:
                frappe.throw(_("You do not have access to this table's room"), frappe.PermissionError)

    if table:
        # Lock the table row to prevent concurrent invoice creation (BE-R36-001)
        frappe.db.sql(
            "SELECT name FROM `tabURY Table` WHERE name = %s FOR UPDATE",
            (table,), as_dict=True
        )
        
        if is_payment == "Payments":
            invoice_name = frappe.get_value(
                "POS Invoice", dict(restaurant_table=table, docstatus=0, name=invoiceNo)
            )
            
        else:
            if invoiceNo:
                invoice_name = frappe.get_value(
                    "POS Invoice",
                    dict(restaurant_table=table, docstatus=0, name=invoiceNo),
                )
               
            else:
                invoice_name = frappe.get_value(
                    "POS Invoice",
                    dict(restaurant_table=table, docstatus=0, invoice_printed=0),
                )
                
        branch, menu_name, restaurant = get_restaurant_and_menu_name(table)

        if invoice_name:
            invoice = frappe.get_doc("POS Invoice", invoice_name)

        else:
            invoice = frappe.new_doc("POS Invoice")

            invoice.naming_series = frappe.db.get_value(
                "URY Restaurant", restaurant, "invoice_series_prefix"
            )

            invoice.is_pos = 1
            invoice.update_stock = 1
            invoice.restaurant = restaurant
            invoice.branch = branch

            is_take_away = frappe.db.get_value("URY Table", table, "is_take_away")
            if is_take_away == 1:
                invoice.order_type = "Take Away"
            else:
                invoice.order_type= "Dine In"

        invoice.taxes_and_charges = frappe.db.get_value(
            "URY Restaurant", restaurant, "default_tax_template"
        )

        invoice.selling_price_list = frappe.db.get_value(
            "Price List", dict(restaurant_menu=menu_name, enabled=1)
        )

    else:

        invoice_name = frappe.get_value(
                "POS Invoice", dict(docstatus=0, name=invoiceNo)
            )
            
        if invoice_name:
            invoice = frappe.get_doc("POS Invoice", invoice_name)
            # R44-FIX: Validate that the loaded invoice belongs to the user's branch
            user_branch = _get_user_branch()
            if invoice.branch and invoice.branch != user_branch:
                frappe.throw(_("You do not have access to invoices from another branch"), frappe.PermissionError)
            

        else:
            invoice = frappe.new_doc("POS Invoice")
            invoice.is_pos = 1
            invoice.update_stock = 1
        
        branch = _get_user_branch()
        restaurant = frappe.db.get_value("URY Restaurant", {"branch": branch}, "name")

        menu=get_menu_name(order_type)

        if (order_type == "Aggregators" and frappe.db.get_value("Branch", branch, "custom_no_taxes") == 0) or order_type != "Aggregators":
            invoice.taxes_and_charges = frappe.db.get_value("URY Restaurant", restaurant, "default_tax_template")
        
        invoice.selling_price_list = frappe.db.get_value(
            "Price List", dict(restaurant_menu=menu, enabled=1)
        )
        # R43-FIX: Set branch on non-table invoices to prevent branchless invoices
        invoice.branch = branch

    return invoice


@frappe.whitelist()
def get_order_invoice(table=None, invoiceNo=None, order_type=None, is_payment=None):
    """returns the active invoice linked to the given table (as a dict for the frontend)"""
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")

    invoice = _get_order_invoice_doc(table, invoiceNo, order_type, is_payment)

    # Return only the fields the frontend needs — prevent full document leakage (BE-R36-003)
    if invoice.name:
        return {
            "name": invoice.name,
            "customer": invoice.customer,
            "restaurant_table": invoice.restaurant_table,
            "restaurant": invoice.get("restaurant"),
            "branch": invoice.branch,
            "order_type": invoice.order_type,
            "is_pos": invoice.is_pos,
            "invoice_printed": invoice.invoice_printed,
            "invoice_created": invoice.invoice_created,
            "grand_total": invoice.grand_total,
            "rounded_total": invoice.get("rounded_total"),
            "total_taxes_and_charges": invoice.get("total_taxes_and_charges"),
            "selling_price_list": invoice.selling_price_list,
            "taxes_and_charges": invoice.taxes_and_charges,
            "naming_series": invoice.naming_series,
            "update_stock": invoice.update_stock,
            "mobile_number": invoice.get("mobile_number"),
            "custom_comments": invoice.get("custom_comments"),
            "custom_aggregator_id": invoice.get("custom_aggregator_id"),
            "custom_restaurant_room": invoice.get("custom_restaurant_room"),
            "no_of_pax": invoice.get("no_of_pax"),
            "pos_profile": invoice.pos_profile,
            "cashier": invoice.cashier,
            "waiter": invoice.waiter,
            "owner": invoice.owner,
            "modified": str(invoice.modified),
            "items": [{"item_code": i.item_code, "item_name": i.item_name, "qty": i.qty, "rate": i.rate, "amount": i.amount, "comment": i.get("comment"), "image": i.get("image"), "description": i.get("description")} for i in invoice.items],
            "payments": [{"mode_of_payment": p.mode_of_payment, "amount": p.amount} for p in invoice.payments],
            "customer_name": invoice.get("customer_name"),
        }
    return invoice


@frappe.whitelist()
def sync_order(
    items,
    cashier,
    owner,
    mode_of_payment,
    customer,
    no_of_pax,
    last_invoice,
    waiter,
    pos_profile,
    last_modified_time=None,
    table=None,
    invoice=None,
    comments=None,
    order_type=None,
    aggregator_id=None,
    room=None
):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    # Validate pos_profile belongs to user's branch (BE-R36-002)
    pos_profile_branch = frappe.db.get_value("POS Profile", pos_profile, "branch")
    user_branch = _get_user_branch()
    if pos_profile_branch != user_branch:
        frappe.throw(_("POS Profile does not belong to your branch"), frappe.PermissionError)
    user_role = frappe.get_roles()
    billing_roles = frappe.get_all(
        "POS Profile Role",
        filters={"parent": pos_profile},
        fields=["role"],
        pluck="role",
    )
    billing_user = bool(set(user_role).intersection(billing_roles))

    # Check if the last invoice was already billed
    if (
        last_invoice
        and frappe.db.get_value("POS Invoice", last_invoice, "invoice_printed") == 1
        and (not billing_user)
    ):
        frappe.msgprint(
            title=_("Invoice Already Billed"),
            indicator="red",
            msg=_("This order has already been billed. Please reload the page."),
        )
        return {"status": "Failure"}

    # R41-FIX: Use _get_order_invoice_doc to get the document object, not a dict.
    # The public get_order_invoice returns a dict for frontend safety (BE-R36-003),
    # but sync_order needs the document to call .save() etc.
    invoice = _get_order_invoice_doc(table, invoice, order_type)

    # R41-FIX: Validate last_invoice belongs to user's branch
    if last_invoice:
        last_inv_branch = frappe.db.get_value("POS Invoice", last_invoice, "branch")
        if last_inv_branch and last_inv_branch != user_branch:
            frappe.throw(_("Invoice does not belong to your branch"), frappe.PermissionError)

    if last_invoice and last_modified_time:
        lastModifiedTime = invoice.modified
        if isinstance(last_modified_time, str):
            try:
                last_modified_time = datetime.strptime(
                    last_modified_time, "%Y-%m-%d %H:%M:%S.%f"
                )
            except ValueError:
                last_modified_time = datetime.strptime(
                    last_modified_time, "%Y-%m-%d %H:%M:%S"
                )
        if isinstance(lastModifiedTime, str):
            try:
                lastModifiedTime = datetime.strptime(
                    lastModifiedTime, "%Y-%m-%d %H:%M:%S.%f"
                )
            except ValueError:
                lastModifiedTime = datetime.strptime(
                    lastModifiedTime, "%Y-%m-%d %H:%M:%S"
                )
        if lastModifiedTime != last_modified_time:
            frappe.msgprint(
                title=_("Order has been modified"),
                indicator="red",
                msg=_("This order has been modified. Please reload the page to retrieve the latest edits."),
            )
            return {"status": "Failure"}
    elif last_invoice and not last_modified_time:
        # R49-FIX: When last_invoice is provided but last_modified_time is missing,
        # require the client to provide it — otherwise the optimistic concurrency
        # check is bypassed entirely, allowing silent overwrites.
        frappe.msgprint(
            title=_("Stale Data"),
            indicator="red",
            msg=_("Please reload the page to retrieve the latest edits before saving."),
        )
        return {"status": "Failure"}
    else:
        if invoice.name and invoice.invoice_printed == 0 and not billing_user:
            frappe.msgprint(
                title=_("Table Occupied"),
                indicator="red",
                msg=_("{0} is already occupied. Please refresh the page.").format(table),
            )
            return {"status": "Failure"}

    if not customer:
        frappe.throw(_("Please enter valid customer details"))
    else:
        invoice.customer = customer

    if order_type:
        invoice.order_type = order_type

    invoice.mobile_number = frappe.db.get_value("Customer", customer, "mobile_number")
    if comments:
        invoice.custom_comments = comments
    # R50-FIX (M3): Validate no_of_pax to prevent negative or nonsensical values
    no_of_pax = cint(no_of_pax)
    if no_of_pax < 0:
        frappe.throw(_("Number of pax cannot be negative"), frappe.ValidationError)
    invoice.no_of_pax = no_of_pax
    invoice.pos_profile = pos_profile
    # H-01: Validate cashier and waiter are active users
    for role_user in [("Cashier", cashier), ("Waiter", waiter)]:
        if role_user[1] and not frappe.db.exists("User", {"name": role_user[1], "enabled": 1}):
            frappe.throw(_("Invalid {0}: {1}").format(role_user[0], role_user[1]))

    invoice.cashier = cashier
    invoice.waiter = waiter
    invoice.custom_aggregator_id = aggregator_id
    invoice.custom_restaurant_room =room
    invoice.restaurant_table = table
    
    if order_type == "Aggregators":
        price_list = frappe.db.get_value("Aggregator Settings",{"customer": customer, "parent": invoice.branch, "parenttype": "Branch"},"price_list",)
        
        if not price_list:
            frappe.throw(_("Price list for customer {0} in branch {1} not found in Aggregator Settings.").format(customer, invoice.branch))
    else:
        price_list = invoice.selling_price_list

    # dummy payment
    # C-02: Validate mode_of_payment against POS Profile's allowed payment methods
    allowed_mops = frappe.get_all("POS Profile Payment", filters={"parent": pos_profile}, pluck="mode_of_payment")
    if mode_of_payment not in allowed_mops:
        frappe.throw(_("Invalid mode of payment: {0}").format(mode_of_payment))

    if invoice.invoice_created == 0:
        invoice.append(
            "payments",
            dict(mode_of_payment=mode_of_payment, amount=invoice.grand_total),
        )
        invoice.invoice_created = 1

    past_item = []
    for item in invoice.items:
        previous_item = {
            "item_code": item.item_code,
            "item_name": item.item_name,
            "qty": item.qty,
            "comments": "",
        }
        past_item.append(previous_item)
        

    # Conditional checking for 'items' type:
    # - 'ury': JSON passed, hence using isinstance
    # - 'ury_pos': Already formatted list, hence using else
    if isinstance(items, str):
        try:
            items = json.loads(items)
        except json.JSONDecodeError:
            frappe.throw(_("Invalid items data"), frappe.ValidationError)
    invoice.items = []
    
    menu = frappe.db.get_value("URY Menu", {"branch": invoice.branch}, "name")

    # Batch-fetch courses, prices, and cost_center to avoid N+1 queries
    item_codes = [d.get("item") for d in items]
    item_codes_unique = list(set(item_codes))

    courses = {}
    if item_codes_unique:
        course_rows = frappe.db.get_all(
            "URY Menu Item",
            filters={"item": ("in", item_codes_unique), "parent": menu},
            fields=["item", "course"],
        )
        courses = {r.item: r.course for r in course_rows}

    prices = {}
    if item_codes_unique:
        price_rows = frappe.db.get_all(
            "Item Price",
            filters={"item_code": ("in", item_codes_unique), "price_list": price_list},
            fields=["item_code", "price_list_rate"],
        )
        prices = {r.item_code: r.price_list_rate for r in price_rows}

    cost_center = frappe.db.get_value("POS Profile", pos_profile, "cost_center")

    for d in items:
        # R47-FIX: Validate item qty is positive (create_order_items in kot_generate
        # validates for KOT creation, but sync_order was missing the same check)
        qty = flt(d.get("qty"))
        if qty <= 0:
            frappe.throw(_("Item '{0}' has invalid quantity ({1}). Quantity must be positive.").format(d.get("item_name", d.get("item")), qty))
        course = courses.get(d.get("item"))
        rate = prices.get(d.get("item"))
        if not rate:
            frappe.throw(_("No item price found for Item: {0} in Price List: {1}. Please check the price list settings.").format(d.get("item"), price_list))

        invoice.append(
            "items",
            dict(
                item_code=d.get("item"),
                item_name=d.get("item_name"),
                qty=qty,
                **({"custom_course": course} if course else {}),
                comment=d.get("comment"),
                rate=rate,
                price_list_rate=rate,
                base_price_list_rate=rate,
                cost_center=cost_center,
            ),
        )

    try:
        invoice.save()
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Invoice Save Error")
        frappe.throw(_("An error occurred. Please check the error log."))


    try:
        kot_execute(invoice.name, customer, table, items, past_item, comments)

    except Exception as e:
        # Log the KOT error but also notify the user — kitchen won't see this order
        error_msg = f"KOT Creation Failed: {str(e)}"
        frappe.log_error(f"{error_msg}\n{frappe.get_traceback()}", "KOT Error")
        frappe.msgprint(
            title=_("KOT Creation Failed"),
            indicator="orange",
            msg=_("The order was saved but the KOT was not sent to the kitchen. Please check the error log or retry."),
        )

    # table status
    if invoice.invoice_printed == 0:
        # R47-FIX: Use update_modified=False for auxiliary status updates
        frappe.db.set_value(
            "URY Table", table, {"occupied": 1, "latest_invoice_time": invoice.creation},
            update_modified=False
        )

    invoice.db_set("owner", frappe.session.user)
    return {
        "name": invoice.name,
        "customer": invoice.customer,
        "grand_total": invoice.grand_total,
        "modified": invoice.modified,
        "invoice_printed": invoice.invoice_printed,
        "restaurant_table": invoice.restaurant_table,
    }


@frappe.whitelist()
def item_query_restaurant(
    doctype="Item",
    txt="",
    searchfield="name",
    start=0,
    page_len=20,
    filters=None,
    as_dict=False,
):
    """Return items that are selected in active menu of the restaurant"""
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    restaurant, menu = get_restaurant_and_menu_name(filters["table"])
    items = frappe.db.get_all("URY Menu Item", ["item"], dict(parent=menu, disabled=0))
    del filters["table"]
    filters["name"] = ("in", [d.item for d in items])

    return item_query("Item", txt, searchfield, start, page_len, filters, as_dict)


@frappe.whitelist()
def get_restaurant_and_menu_name(table):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    if not table:
        frappe.throw(_("Please select a table"))

    result = frappe.get_value(
        "URY Table",
        table,
        ["restaurant", "branch", "restaurant_room"],
    )
    if not result:
        frappe.throw(_("URY Table {0} not found").format(table))
    restaurant, branch, room = result

    # R50-FIX (H1): Validate that the requested table belongs to the user's branch.
    # Without this, a user from Branch A could query tables from Branch B,
    # violating the branch isolation model enforced everywhere else.
    user_branch = _get_user_branch()
    if branch and user_branch and branch != user_branch:
        frappe.throw(_("You do not have access to tables from another branch"), frappe.PermissionError)

    room_wise_menu = frappe.db.get_value(
        "URY Restaurant",
        restaurant,
        "room_wise_menu",
    )

    if not room_wise_menu:
        menu = frappe.db.get_value("URY Restaurant", restaurant, "active_menu")
    else:
        menu = frappe.db.get_value(
            "Menu for Room",
            {"parent": restaurant, "room": room},
            "menu",
        )

    if not menu:
        frappe.throw(
            _("Please set an active menu for Restaurant {0}").format(restaurant)
        )

    return branch, menu, restaurant

@frappe.whitelist()
def get_menu_name(order_type):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    branch = _get_user_branch()
    restaurant = frappe.get_value(
        "URY Restaurant",
        {"branch": branch},
        "name",
    )
    order_type_wise_menu = frappe.db.get_value(
            "URY Restaurant", restaurant, "order_type_wise_menu"
        )
    
    if order_type_wise_menu:
        menu = frappe.db.get_value(
            "Order Type Menu",
            {"parent": restaurant, "order_type": order_type},
            "menu"
        )
        if not menu:
            menu = frappe.db.get_value("URY Restaurant", restaurant, "active_menu")
    else:
        menu = frappe.db.get_value("URY Restaurant", restaurant, "active_menu")   
    return menu  
    

@frappe.whitelist()
def pos_opening_check():
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    user = frappe.session.user
    # Handle the administrator case differently
    if user == "Administrator":
        return {
            "opening_exists": False,  # Assuming no POS opening entry is needed for Administrator
            "cashier": None,
            "pos_profile": None,
        }
    
    details = getBranchRoom()
    if not details:
        frappe.throw(_("No room/branch configuration found for the current user."))
    room = details[0].get('name')
    branch = details[0].get('branch')
    
    pos_opening_list = frappe.db.sql("""
        SELECT DISTINCT `tabPOS Opening Entry`.name 
        FROM `tabPOS Opening Entry`
        INNER JOIN `tabMultiple Rooms` 
        ON `tabMultiple Rooms`.parent = `tabPOS Opening Entry`.name
        WHERE `tabPOS Opening Entry`.branch = %s
        AND `tabPOS Opening Entry`.status = 'Open'
        AND `tabPOS Opening Entry`.docstatus = 1
        AND `tabMultiple Rooms`.room = %s
    """, (branch, room), as_dict=True)
    
    
    result = {
        "opening_exists": len(pos_opening_list) > 0,
        "cashier": None,
        "pos_profile": None,
    }

    if result["opening_exists"]:
        opening_vals = frappe.db.get_value(
            "POS Opening Entry", pos_opening_list[0].name,
            ["user", "pos_profile"],
            as_dict=True,
        )
        result["cashier"] = opening_vals.user
        result["pos_profile"] = opening_vals.pos_profile
        
    return result


@frappe.whitelist()
def table_transfer(table, newTable, invoice):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    if not frappe.has_permission("POS Invoice", "write", invoice):
        frappe.throw(_("Not permitted to transfer tables"), frappe.PermissionError)
    # R39-FIX: Validate invoice belongs to user's branch
    inv_branch = frappe.db.get_value("POS Invoice", invoice, "branch")
    if not inv_branch:
        frappe.throw(_("POS Invoice {0} not found").format(invoice))
    user_branch = _get_user_branch()
    if inv_branch != user_branch:
        frappe.throw(_("You do not have access to invoices from another branch"), frappe.PermissionError)
    # Lock both source and destination tables to prevent race conditions (BE-R36-007)
    table_data = frappe.db.sql(
        """SELECT name, restaurant_room, occupied FROM `tabURY Table`
           WHERE name IN %s FOR UPDATE""",
        ((table, newTable),), as_dict=True
    )
    table_map = {t.name: t for t in table_data}
    current_room = table_map[table].restaurant_room if table in table_map else frappe.db.get_value("URY Table", table, "restaurant_room")
    new_table_data = [table_map[newTable]] if newTable in table_map else []
    if not new_table_data:
        frappe.throw(_("Table {0} not found").format(newTable))
    new_table_room = new_table_data[0].restaurant_room
    new_table_occupied = new_table_data[0].occupied
    pos_invoice = frappe.get_doc("POS Invoice", invoice)

    if current_room == new_table_room:
        if new_table_occupied == 1:
            frappe.throw(_("Table {0} is already occupied").format(newTable))

        # Update table status
        # R47-FIX: Use update_modified=False for auxiliary status updates
        frappe.db.set_value(
            "URY Table",
            newTable,
            {"occupied": 1, "latest_invoice_time": pos_invoice.creation},
            update_modified=False,
        )
        frappe.db.set_value(
            "URY Table",
            table,
            {"occupied": 0, "latest_invoice_time": None},
            update_modified=False,
        )

        # Update POS Invoice
        pos_invoice.restaurant_table = newTable
        pos_invoice.save()

        try:
            change_table_in_kot(
                    pos_invoice.name, newTable, pos_invoice.branch
                )

        except Exception as e:
            frappe.log_error(
                f"KOT table transfer failed for {pos_invoice.name}: {frappe.get_traceback()}",
                "KOT Table Transfer Error"
            )

    else:
        frappe.throw(_("Table transfer between different rooms is restricted."))


@frappe.whitelist()
def captain_transfer(currentCaptain, newCaptain, invoice):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    if not frappe.has_permission("POS Invoice", "write", invoice):
        frappe.throw(_("Not permitted to transfer captain"), frappe.PermissionError)
    # R39-FIX: Validate invoice belongs to user's branch
    inv_branch = frappe.db.get_value("POS Invoice", invoice, "branch")
    if not inv_branch:
        frappe.throw(_("POS Invoice {0} not found").format(invoice))
    user_branch = _get_user_branch()
    if inv_branch != user_branch:
        frappe.throw(_("You do not have access to invoices from another branch"), frappe.PermissionError)
    # Validate newCaptain user exists and has restaurant role (BE-R36-009)
    if not frappe.db.exists("User", newCaptain):
        frappe.throw(_("User {0} does not exist").format(newCaptain))
    if not frappe.db.get_value("User", newCaptain, "enabled"):
        frappe.throw(_("User {0} is not active").format(newCaptain))
    user_roles = frappe.get_roles(newCaptain)
    if not set(user_roles).intersection({"Restaurant Manager", "Restaurant User", "Cashier"}):
        frappe.throw(_("User {0} does not have a restaurant role").format(newCaptain))
    # R50-FIX: Validate captain belongs to user's branch even in single-cashier mode
    captain_branch = frappe.db.get_value("URY User", {"user": newCaptain}, "parent")
    if captain_branch and captain_branch != user_branch:
        frappe.throw(_("Captain does not belong to your branch"), frappe.PermissionError)
    pos_profile=frappe.get_value("POS Invoice", invoice,"pos_profile")
    # R50-FIX (M5): Validate new captain is assigned to the POS Profile.
    # A user from the same branch but not configured in the POS Profile
    # could be set as captain, bypassing POS Profile-level access controls.
    if not frappe.db.exists("POS Profile User", {"parent": pos_profile, "user": newCaptain}):
        frappe.throw(_("User {0} is not assigned to this POS Profile").format(newCaptain))
    multiple_cashier = frappe.db.get_value("POS Profile",pos_profile,"custom_enable_multiple_cashier")
    branch=frappe.get_value("POS Invoice", invoice,"branch")
    if multiple_cashier:
        table = frappe.get_value("POS Invoice", invoice, "restaurant_table")
        current_room = frappe.get_value("URY Table", table,"restaurant_room")
        new_captain_room =  frappe.db.sql("""
                SELECT room
                FROM `tabURY User`
                WHERE parent=%s AND user=%s         
            """,(branch,newCaptain),as_dict=True)
        room_match = any(room['room'] == current_room for room in new_captain_room)
        if not room_match:
            frappe.throw(_("Captain transfer is not allowed between different rooms"))

    pos_invoice = frappe.get_doc("POS Invoice", invoice)
    pos_invoice.waiter = newCaptain
    pos_invoice.save()


@frappe.whitelist()
def customer_favourite_item(customer_name):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    # R39-FIX: Scope invoices to user's branch to prevent cross-branch data access
    branch = _get_user_branch()
    # Get invoice names for this customer within the user's branch
    invoice_names = frappe.db.get_list(
        "POS Invoice",
        filters={"customer": customer_name, "branch": branch, "posting_date": [">=", frappe.utils.add_days(frappe.utils.today(), -90)]},
        fields=["name"],
        pluck="name",
    )
    if not invoice_names:
        return []

    # Batch-fetch all items for these invoices in a single query (avoids N+1 get_doc)
    invoice_items = frappe.db.get_all(
        "POS Invoice Item",
        filters={"parent": ("in", invoice_names)},
        fields=["item_name", "qty"],
    )

    item_qty = {}
    for row in invoice_items:
        item_qty[row.item_name] = item_qty.get(row.item_name, 0) + flt(row.qty)

    result = [
        {"item_name": item_name, "qty": qty}
        for item_name, qty in item_qty.items()
        if qty > 1
    ]
    result = sorted(result, key=lambda x: x["qty"], reverse=True)[:3]

    return result


@frappe.whitelist()
def cancel_order(invoice_id, reason):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    if not frappe.has_permission("POS Invoice", "cancel", invoice_id):
        frappe.throw(_("Not permitted to cancel orders"), frappe.PermissionError)
    # R49-FIX: Validate reason length to prevent excessively long strings
    if reason and len(str(reason)) > 500:
        frappe.throw(_("Cancel reason is too long (max 500 characters)"), frappe.ValidationError)
    # R39-FIX: Validate invoice belongs to user's branch
    inv_branch = frappe.db.get_value("POS Invoice", invoice_id, "branch")
    if not inv_branch:
        frappe.throw(_("POS Invoice {0} not found").format(invoice_id))
    user_branch = _get_user_branch()
    if inv_branch != user_branch:
        frappe.throw(_("You do not have access to invoices from another branch"), frappe.PermissionError)
    # R49-FIX: Dedup lock to prevent duplicate cancellation KOTs from concurrent requests
    dedup_key = f"ury_cancel_order_lock:{invoice_id}"
    lock_token = frappe.generate_hash(length=12)
    if frappe.cache().get_value(dedup_key):
        frappe.throw(_("Cancellation already in progress for {0}").format(invoice_id))
    frappe.cache().set_value(dedup_key, lock_token, expires_in_sec=30)
    if frappe.cache().get_value(dedup_key) != lock_token:
        frappe.throw(_("Cancellation already in progress for {0}").format(invoice_id))
    pos_invoice = frappe.get_doc("POS Invoice", invoice_id)

    frappe.db.savepoint("before_cancel")
    try:
        try:
            cancel_kot(invoice_id)
        except Exception as e:
            frappe.log_error(f"Failed to create cancellation KOT for {invoice_id}: {frappe.get_traceback()}", "Cancel KOT Error")
            frappe.publish_realtime("order_cancelled_{}".format(user_branch), {"invoice": invoice_id})
            frappe.msgprint(
                title=_("KOT Cancellation Failed"),
                indicator="orange",
                msg=_("The order was cancelled but the kitchen was not notified automatically. Please inform the kitchen manually."),
            )

        # Use standard Frappe cancellation instead of raw SQL
        pos_invoice.cancel()
        if reason:
            # R48-FIX: Use update_modified=False — auxiliary metadata update after cancel()
            frappe.db.set_value("POS Invoice", invoice_id, "cancel_reason", reason, update_modified=False)
    except Exception:
        frappe.db.rollback(savepoint="before_cancel")
        frappe.cache().delete_value(dedup_key)  # R49-FIX: Release lock on failure
        raise

    # R50-FIX (H3): Verify lock token before deleting to match the standard
    # dedup pattern used in kot_execute, serve_kot, confirm_cancel_kot.
    # Without this, a concurrent request could delete another's lock.
    if frappe.cache().get_value(dedup_key) == lock_token:
        frappe.cache().delete_value(dedup_key)

    # Update table status
    if pos_invoice.restaurant_table:
        # R47-FIX: Use update_modified=False for auxiliary status updates
        frappe.db.set_value(
            "URY Table",
            pos_invoice.restaurant_table,
            {"occupied": 0, "latest_invoice_time": None},
            update_modified=False,
        )

# Method for URY POS
@frappe.whitelist()
def make_invoice(customer, payments, cashier, pos_profile, additionalDiscount=None, table=None, invoice=None):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")

    # R39-FIX: Validate POS Profile belongs to user's branch
    pos_profile_branch = frappe.db.get_value("POS Profile", pos_profile, "branch")
    user_branch = _get_user_branch()
    if pos_profile_branch != user_branch:
        frappe.throw(_("POS Profile does not belong to your branch"), frappe.PermissionError)

    # Validate additional discount
    if additionalDiscount is not None:
        additionalDiscount = flt(additionalDiscount)
        if additionalDiscount < 0 or additionalDiscount > 100:
            frappe.throw(_("Additional discount must be between 0 and 100"))

    # Check if discounts are enabled for this POS Profile (BE-R36-006)
    if additionalDiscount:
        enable_discount = frappe.db.get_value("POS Profile", pos_profile, "custom_enable_discount")
        if not enable_discount:
            frappe.throw(_("Discounts are not enabled for this POS Profile"), frappe.PermissionError)

    # Validate payments
    if isinstance(payments, str):
        try:
            payments = json.loads(payments)
        except json.JSONDecodeError:
            frappe.throw(_("Invalid payments data"), frappe.ValidationError)
    if not payments:
        frappe.throw(_("At least one payment is required"))
    # H-03: Validate each payment's mode_of_payment against POS Profile's configured payment methods
    allowed_mops = frappe.get_all("POS Profile Payment", filters={"parent": pos_profile}, pluck="mode_of_payment")
    for p in payments:
        amount = flt(p.get("amount", 0))
        if amount < 0:
            frappe.throw(_("Payment amount cannot be negative"))
        mop = p.get("mode_of_payment")
        if mop not in allowed_mops:
            frappe.throw(_("Invalid mode of payment: {0}").format(mop))

    # R44-FIX: At least one of invoice or table must be provided — otherwise
    # we would create an orphaned invoice with no way to reference it.
    if not invoice and not table:
        frappe.throw(_("Invoice or table is required to make a payment"), frappe.ValidationError)

    # R43-FIX: Guard against None invoice — get_value with None returns None/error
    order_type = None
    if invoice:
        order_type = frappe.get_value("POS Invoice", invoice, "order_type")
    # R41-FIX: Use _get_order_invoice_doc to get the document object, not a dict.
    # make_invoice needs to call .save() and .submit() on the document.
    invoice = _get_order_invoice_doc(table, invoice, order_type, "Payments")

    if table:
        _, _, restaurant = get_restaurant_and_menu_name(table)
        invoice.restaurant = restaurant
    elif not invoice.restaurant:
        restaurant = frappe.db.get_value("URY Restaurant", {"branch": invoice.branch}, "name")
        if restaurant:
            invoice.restaurant = restaurant

    invoice.customer = customer
    invoice.pos_profile = pos_profile
    invoice.additional_discount_percentage=additionalDiscount
    invoice.calculate_taxes_and_totals()

    # H-07: Validate that payment amounts match the grand total (prevent negative invoice from discount)
    total_payments = flt(sum(flt(p.get("amount", 0)) for p in payments))
    if flt(total_payments - invoice.grand_total, 2) < 0:
        frappe.throw(_("Total payment amount ({0}) is less than grand total ({1}). Discount may have created a negative balance.").format(total_payments, invoice.grand_total))

    invoice.payments = []

    for d in payments:
        invoice.append(
            "payments", dict(mode_of_payment=d["mode_of_payment"], amount=d["amount"])
        )

    # invoice.owner = owner
    invoice.save()
    try:
        invoice.submit()
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Invoice Submit Error")
        frappe.throw(_("An error occurred. Please check the error log."))


# Cancel KOT Doc Creation
def cancel_kot(invoice_id):

    pos_invoice = frappe.get_doc("POS Invoice", invoice_id)
    pos_profile_id = pos_invoice.pos_profile
    kot_naming_series = frappe.db.get_value("POS Profile", pos_profile_id, "custom_kot_naming_series")
    cancel_kot_naming_series = "CNCL-" + (kot_naming_series or "")

    items = []
    # Create a list of items for the canceled KOT
    for item in pos_invoice.items:
        order_item = {
            "item_code": item.item_code,
            "qty": item.qty,
            "item_name": item.item_name,
        }
        items.append(order_item)

    if pos_invoice.restaurant_table:
        restaurant_table = pos_invoice.restaurant_table
    else:
        restaurant_table = None

    # Build invoiceItems list for comparison in cancel KOT processing
    invoice_items = [
        {"item_code": item.item_code, "item_name": item.item_name, "qty": item.qty}
        for item in pos_invoice.items
    ]

    # Process items for a canceled KOT
    process_items_for_cancel_kot(
        invoice_id,
        pos_invoice.customer,
        restaurant_table,
        items,
        "",
        pos_profile_id,
        cancel_kot_naming_series,
        "Cancelled",
        invoice_items,
        pos_invoice,
        pos_invoice.branch,
    )

    # Set the KOTs associated with the invoice as canceled via batch SQL
    kot_names = frappe.db.get_list(
        "URY KOT",
        filters={
            "invoice": invoice_id,
            "type": ("in", ("New Order", "Order Modified")),
            "docstatus": 1,
        },
        fields=["name"],
        pluck="name",
    )

    if kot_names:
        for kot_name in kot_names:
            frappe.get_doc("URY KOT", kot_name).cancel()


def change_table_in_kot(invoice, new_table, branch):
    # Get a list of KOTs associated with the POS Invoice
    kot_list = frappe.get_all(
        "URY KOT",
        filters={
            "invoice": invoice,
            "docstatus": 1,
            "order_status": "Ready For Prepare",
            "verified": 0,
        },
        fields=["name", "production"],
    )

    # Update each KOT's restaurant_table and send a real-time update
    for kot in kot_list:
        # R47-FIX: Use update_modified=False for auxiliary status updates
        frappe.db.set_value("URY KOT", kot.name, "restaurant_table", new_table, update_modified=False)
        kot_channel = "{}_{}_{}".format("kot_update", branch, kot.production)
        frappe.publish_realtime(kot_channel)
