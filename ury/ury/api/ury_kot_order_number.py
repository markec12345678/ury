import time
import frappe
from frappe import _


def set_order_number(doc, event):
    pos_profile = doc.pos_profile
    # R36-FIX: Use non-blocking lock check with limited retries
    lock_key = f"ury_order_number_lock:{pos_profile}"
    lock_acquired = False
    for attempt in range(3):
        if not frappe.cache().get_value(lock_key):
            lock_acquired = True
            break
        time.sleep(0.3)
    if not lock_acquired:
        frappe.log_error(f"Order number lock timeout for {pos_profile}", "URY Order Number")
        return
    frappe.cache().set_value(lock_key, True, expires_in_sec=10)

    try:
        _do_set_order_number(doc, pos_profile)
    finally:
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
                agg_suffix = aggregator_invoice.name[-5:]
                aggregator_invoice_number = int(agg_suffix) if agg_suffix.isdigit() else 0
                aggregator_last_order_number = aggregator_invoice_number - 1
            except (frappe.DoesNotExistError, frappe.DoesNotExist):
                aggregator_last_order_number = 0
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
                inv_suffix = invoice.name[-5:]
                invoice_number = int(inv_suffix) if inv_suffix.isdigit() else 0
                last_order_number = invoice_number - 1
            except (frappe.DoesNotExistError, frappe.DoesNotExist):
                last_order_number = 0

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