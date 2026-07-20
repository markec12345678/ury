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
    max_retries = 10
    for attempt in range(max_retries):
        # Atomic set-if-not-exists: returns True if we acquired the lock
        existing = frappe.cache().get_value(lock_key)
        if not existing:
            frappe.cache().set_value(lock_key, lock_token, expires_in_sec=30)
            # Double-check we actually got it (handles race with another worker)
            if frappe.cache().get_value(lock_key) == lock_token:
                lock_acquired = True
                break
        # Short, non-blocking Redis-based wait: check again after a brief pause
        # Reduced from 0.3s to 0.05s with max 10 retries (0.5s total max wait)
        time.sleep(0.05)
    if not lock_acquired:
        frappe.log_error(f"Order number lock timeout for {pos_profile}\n{frappe.get_traceback()}", "URY Order Number")
        frappe.throw(_("Could not acquire order number lock for POS Profile {0}. Please try again.").format(pos_profile))

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
        if not suffix.isdigit():
            frappe.log_error(
                "Non-numeric suffix in last invoice reference: '{}'. "
                "Expected the last 5 characters to be digits. "
                "Invoice: {}".format(suffix, last_invoice_str),
                "URY Order Number Error",
            )
            frappe.throw(
                _("Unable to parse order number: invoice reference '{0}' has a non-numeric suffix '{1}'. "
                  "Please check the invoice naming series.").format(last_invoice_str, suffix)
            )
        last_invoice_number = int(suffix)

        current_invoice = doc.name

        current_suffix = str(current_invoice)[-5:]
        if not current_suffix.isdigit():
            frappe.log_error(
                "Non-numeric suffix in current invoice reference: '{}'. "
                "Expected the last 5 characters to be digits. "
                "Invoice: {}".format(current_suffix, current_invoice),
                "URY Order Number Error",
            )
            frappe.throw(
                _("Unable to parse order number: invoice reference '{0}' has a non-numeric suffix '{1}'. "
                  "Please check the invoice naming series.").format(current_invoice, current_suffix)
            )
        current_invoice_number = int(current_suffix)

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
            frappe.log_error(f"No open POS Opening Entry for profile {pos_profile}\n{frappe.get_traceback()}", "Order Number Error")
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
            # R48-FIX: Use update_modified=False — auxiliary reference update
            frappe.db.set_value(
                "POS Opening Entry", pos_open_name, "custom_ury_last_aggregator_invoice", aggregator_invoice.name if aggregator_invoice else "",
                update_modified=False,
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
            # R48-FIX: Use update_modified=False — auxiliary reference update
            frappe.db.set_value(
                "POS Opening Entry", pos_open_name, "custom_ury_last_invoice", invoice.name if invoice else "",
                update_modified=False,
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
    # R44-FIX: Also catch frappe.DoesNotExist — get_last_doc raises this
    # when no matching document is found (distinct from DoesNotExistError)
    except (frappe.DoesNotExistError, frappe.DoesNotExist, frappe.ValidationError):
        frappe.log_error(f"Failed to set last invoice in POS opening: {frappe.get_traceback()}", "Order Number Error")
    try:
        aggregator_invoice = frappe.get_last_doc(
            "POS Invoice", filters={"pos_profile": doc.pos_profile, "order_type": "Aggregators"}
        )
        doc.custom_ury_last_aggregator_invoice = aggregator_invoice.name
    except (frappe.DoesNotExistError, frappe.DoesNotExist, frappe.ValidationError):
        frappe.log_error(f"Failed to set last aggregator invoice in POS opening: {frappe.get_traceback()}", "Order Number Error")