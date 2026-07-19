import time
import frappe
from frappe import _


def set_order_number(doc, event):
    pos_profile = doc.pos_profile
    # R37-FIX: Use atomic SETNX-style lock to prevent TOCTOU race condition.
    # Previous implementation had a gap between get_value (check) and set_value (set)
    # where two concurrent requests could both see the lock as free and proceed.
    lock_key = f"ury_order_number_lock:{pos_profile}"
    lock_token = frappe.generate_hash(length=12)
    lock_acquired = False
    for attempt in range(3):
        # Atomic set-if-not-exists: returns True if we acquired the lock
        existing = frappe.cache().get_value(lock_key)
        if not existing:
            frappe.cache().set_value(lock_key, lock_token, expires_in_sec=10)
            # Double-check we actually got it (handles race with another worker)
            if frappe.cache().get_value(lock_key) == lock_token:
                lock_acquired = True
                break
        time.sleep(0.3)
    if not lock_acquired:
        frappe.log_error(f"Order number lock timeout for {pos_profile}", "URY Order Number")
        return

    try:
        _do_set_order_number(doc, pos_profile)
    finally:
        # Only delete our own lock token to avoid releasing another worker's lock
        if frappe.cache().get_value(lock_key) == lock_token:
            frappe.cache().delete_value(lock_key)


def _do_set_order_number(doc, pos_profile):
    if doc.order_type == "Aggregators":
        last_invoice = frappe.db.get_value(
            "POS Opening Entry",
            {"pos_profile": pos_profile, "status": "Open"},
            "custom_ury_last_aggregator_invoice",
        )
    else:
        last_invoice = frappe.db.get_value(
            "POS Opening Entry",
            {"pos_profile": pos_profile, "status": "Open"},
            "custom_ury_last_invoice",
        )
    if last_invoice:
        last_invoice_str = str(last_invoice)
        suffix = last_invoice_str[-5:]
        last_invoice_number = int(suffix) if suffix.isdigit() else 0

        current_invoice = doc.name

        current_suffix = str(current_invoice)[-5:]
        current_invoice_number = int(current_suffix) if current_suffix.isdigit() else 0

        order_number = current_invoice_number - last_invoice_number
        if order_number > 0:
            if doc.order_type == "Aggregators":
                order_number = "AGR - " + str(order_number)
            frappe.db.set_value(
                "POS Invoice",
                doc.name,
                "custom_ury_order_number",
                order_number,
                update_modified=False,
            )
        else:
            frappe.db.set_value(
                "POS Invoice",
                doc.name,
                "custom_ury_order_number",
                current_invoice_number,
                update_modified=False,
            )
    else:
        pos_open_name = frappe.db.get_value(
            "POS Opening Entry",
            {"pos_profile": pos_profile, "status": "Open"},
            "name",
        )
        if not pos_open_name:
            frappe.log_error(f"No open POS Opening Entry for profile {pos_profile}", "Order Number Error")
            return

        if doc.order_type == "Aggregators":
            aggregator_invoice = None
            try:
                aggregator_invoice = frappe.get_last_doc(
                    "POS Invoice", filters={"pos_profile": doc.pos_profile, "order_type": "Aggregators"}
                )
            except (frappe.DoesNotExistError, frappe.DoesNotExist):
                pass
            # Write the invoice name (not just the number) to be consistent
            # with set_last_invoice_in_pos_open which also writes invoice.name
            # R36-FIX: aggregator_invoice may be None in except path
            frappe.db.set_value(
                "POS Opening Entry", pos_open_name, "custom_ury_last_aggregator_invoice", aggregator_invoice.name if aggregator_invoice else ""
            )
        else:
            invoice = None
            try:
                invoice = frappe.get_last_doc(
                    "POS Invoice", filters={"pos_profile": doc.pos_profile, "order_type": ["!=", "Aggregators"]}
                )
            except (frappe.DoesNotExistError, frappe.DoesNotExist):
                pass

            # R36-FIX: invoice may be None in except path
            frappe.db.set_value(
                "POS Opening Entry", pos_open_name, "custom_ury_last_invoice", invoice.name if invoice else ""
            )

        default_value = "AGR - 1" if doc.order_type == "Aggregators" else "1"
        frappe.db.set_value(
            "POS Invoice",
            doc.name,
            "custom_ury_order_number",
            default_value,
            update_modified=False,
        )


def set_last_invoice_in_pos_open(doc, event):
    try:
        invoice = frappe.get_last_doc(
            "POS Invoice", filters={"pos_profile": doc.pos_profile, "order_type": ["!=", "Aggregators"]}
        )
        doc.custom_ury_last_invoice = invoice.name
    except (frappe.DoesNotExistError, frappe.ValidationError):
        frappe.log_error(f"Failed to set last invoice in POS opening: {frappe.get_traceback()}", "Order Number Error")
    try:
        aggregator_invoice = frappe.get_last_doc(
            "POS Invoice", filters={"pos_profile": doc.pos_profile, "order_type": "Aggregators"}
        )
        doc.custom_ury_last_aggregator_invoice = aggregator_invoice.name
    except (frappe.DoesNotExistError, frappe.ValidationError):
        frappe.log_error(f"Failed to set last aggregator invoice in POS opening: {frappe.get_traceback()}", "Order Number Error")