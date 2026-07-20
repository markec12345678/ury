import frappe
from datetime import timedelta
from frappe.utils import get_datetime


def kotValidationThread():
    # R38-FIX: Use token-based lock to prevent overlapping runs (previously,
    # a non-atomic check-then-set allowed two workers to both see the lock as
    # free and proceed simultaneously).
    lock_key = "ury_kot_validation_running"
    lock_token = frappe.generate_hash(length=12)
    existing = frappe.cache().get_value(lock_key)
    if existing:
        return  # Previous run still in progress
    # R40-FIX: Reduced TTL from 120s to 60s — each run processes invoices from
    # the last 5 minutes only, so 60s is generous. If a run takes longer,
    # the lock expires and the next worker can proceed rather than blocking
    # indefinitely.
    frappe.cache().set_value(lock_key, lock_token, expires_in_sec=60)
    # Double-check: only proceed if our token is still the current value
    if frappe.cache().get_value(lock_key) != lock_token:
        return  # Another worker won the race

    try:
        current_datetime = get_datetime()
        one_minute_ago = current_datetime - timedelta(minutes=1)
        five_minutes_ago = current_datetime - timedelta(minutes=5)

        # Get a list of unprocessed invoices within the last 5 minutes
        invoice_list = get_unprocessed_invoices(five_minutes_ago, one_minute_ago)

        # Process each invoice independently so one failure doesn't block others
        for invoice in invoice_list:
            try:
                process_invoice(invoice)
            except Exception:
                frappe.log_error(f"Failed to process invoice {invoice.name}: {frappe.get_traceback()}", "URY KOT Validation Error")
    finally:
        # Only delete our own lock token to avoid releasing another worker's lock
        if frappe.cache().get_value(lock_key) == lock_token:
            frappe.cache().delete_value(lock_key)


def get_unprocessed_invoices(start_time, end_time):
    return frappe.db.sql(
        """
        SELECT name, creation
        FROM `tabPOS Invoice`
        WHERE docstatus = 0
            AND creation BETWEEN %s AND %s
        """,
        (start_time, end_time),
        as_dict=True,
    )


def process_invoice(invoice):
    posInvoice = frappe.get_doc("POS Invoice", invoice.name)
    # R41-FIX: Validate invoice has a branch before creating KOTs
    if not posInvoice.branch:
        frappe.log_error(
            f"POS Invoice {invoice.name} has no branch set — skipping KOT creation",
            "URY KOT Validation Warning"
        )
        return
    waiter = posInvoice.waiter
    kot_naming_series = frappe.db.get_value("POS Profile", posInvoice.pos_profile, "custom_kot_naming_series")

    # R50-FIX (C1): Validate KOT naming series before proceeding — if not configured,
    # kotdoc.insert() would throw an unhandled exception that the scheduler only logs,
    # silently skipping the invoice's auto-KOT with no user-facing feedback.
    if not kot_naming_series:
        frappe.log_error(
            f"KOT Naming Series not configured for POS Profile {posInvoice.pos_profile} — "
            f"skipping auto-KOT for invoice {invoice.name}",
            "URY KOT Validation Error"
        )
        return

    # Check if KOT already exists for this invoice
    kot_list = frappe.get_list(
        "URY KOT",
        filters={"creation": (">", posInvoice.creation), "invoice": posInvoice.name},
    )

    if kot_list:
        return  # KOT already generated, nothing to do

    # Fetch production units for the branch
    productions = get_productions_for_branch(posInvoice.branch)

    # Batch-fetch all item groups to avoid N+1 queries
    item_codes = list({i.item_code for i in posInvoice.items})
    item_groups = {}
    if item_codes:
        rows = frappe.db.get_all("Item", filters={"name": ("in", item_codes)}, fields=["name", "item_group"])
        item_groups = {r.name: r.item_group for r in rows}

    # Batch-fetch production unit item groups
    production_names = [p.name for p in productions]
    prod_item_groups = {}
    if production_names:
        pig_rows = frappe.db.get_all(
            "URY Production Item Groups",
            filters={"parent": ("in", production_names)},
            fields=["parent", "item_group"],
        )
        for r in pig_rows:
            prod_item_groups.setdefault(r.parent, set()).add(r.item_group)

    # Group invoice items by production unit
    for production in productions:
        production_item_groups = prod_item_groups.get(production.name, set())

        # Filter items belonging to this production unit
        production_items = [
            i for i in posInvoice.items
            if item_groups.get(i.item_code) in production_item_groups
        ]

        if production_items:
            create_kot(
                posInvoice,
                posInvoice.pos_profile,
                kot_naming_series,
                production_items,
                production.name,
            )


def get_productions_for_branch(branch):
    return frappe.get_all(
        "URY Production Unit",
        filters={"branch": branch},
        fields=["name"],
    )


def create_kot(
    posInvoice, pos_profile_name, kot_naming_series, production_items, production_name
):
    # R49-FIX: Fetch menu and course mapping for Duplicate KOT items,
    # matching create_kot_doc in ury_kot_generate.py which already includes
    # course info. Without this, Duplicate KOTs appear without course on KDS.
    menu = None
    item_courses = {}
    if posInvoice.branch:
        restaurant = frappe.db.get_value("URY Restaurant", {"branch": posInvoice.branch}, "name")
        if restaurant:
            if posInvoice.restaurant_table:
                room = frappe.db.get_value("URY Table", posInvoice.restaurant_table, "restaurant_room")
                room_wise_menu = frappe.db.get_value("URY Restaurant", restaurant, "room_wise_menu")
                if room_wise_menu and room:
                    menu = frappe.db.get_value("Menu for Room", {"parent": restaurant, "room": room}, "menu")
            if not menu:
                menu = frappe.db.get_value("URY Restaurant", restaurant, "active_menu")
    if menu:
        item_codes = list({i.item_code for i in production_items})
        if item_codes:
            rows = frappe.db.sql(
                """SELECT item, course FROM `tabURY Menu Item`
                   WHERE parent = %s AND item IN %s""",
                (menu, item_codes),
                as_dict=True,
            )
            item_courses = {r.item: r.course for r in rows}

    # R49-FIX: Include is_aggregator and aggregator_id fields, matching
    # create_kot_doc in ury_kot_generate.py.
    is_aggregator = 1 if getattr(posInvoice, "order_type", None) == "Aggregators" else 0
    aggregator_id = getattr(posInvoice, "custom_aggregator_id", None)

    kotdoc = frappe.new_doc("URY KOT")
    kotdoc.update(
        {
            "invoice": posInvoice.name,
            "restaurant_table": posInvoice.restaurant_table,
            "naming_series": kot_naming_series,
            "type": "Duplicate",
            "pos_profile": pos_profile_name,
            "customer_name": posInvoice.customer,
            "production": production_name,
            "order_no": getattr(posInvoice, "custom_ury_order_number", None),
            "branch": posInvoice.branch,
            "is_aggregator": is_aggregator,
            "aggregator_id": aggregator_id,
        }
    )

    for item in production_items:
        kotdoc.append(
            "kot_items",
            {
                "item": item.item_code,
                "item_name": item.item_name,
                "quantity": item.qty,
                # R49-FIX: Include course so KDS can sort/display by course
                "course": item_courses.get(item.item_code),
            },
        )

    kotdoc.insert()
    kotdoc.submit()

    # Create a KOT Log entry
    create_kot_log(kotdoc, posInvoice)


def create_kot_log(kotdoc, posInvoice):
    KOTLog = frappe.new_doc("URY KOT Error Log")
    KOTLog.update(
        {
            "kot": kotdoc.name,
            "invoice": posInvoice.name,
            "invoice_creation_time": posInvoice.creation,
        }
    )
    KOTLog.insert()