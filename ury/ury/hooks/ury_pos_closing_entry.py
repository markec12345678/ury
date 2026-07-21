import frappe
from frappe import _

def before_save(doc, method):
    sub_pos_close_check(doc, method)

def validate(doc, method):
    calculate_closing_amount(doc, method)
    validate_cashier(doc, method)


def sub_pos_close_check(doc, method):
    cashier = None
    multiple_cashier = frappe.db.get_value("POS Profile", doc.pos_profile, "custom_enable_multiple_cashier")
    if multiple_cashier:
        # R51-FIX (H3): Use get_all instead of get_value to fetch ALL sub-cashiers.
        # Previously, get_value returned only the first sub-cashier, so other
        # sub-cashiers' open POS entries were not checked, allowing a POS Closing
        # Entry to be created while other sub-cashiers still had open POS sessions.
        sub_cashiers = frappe.get_all(
            "POS Profile User",
            filters={"parent": doc.pos_profile, "custom_main_cashier": 0},
            fields=["user"],
            pluck="user",
        )
        if not sub_cashiers:
            return

        branch = frappe.db.get_value("POS Profile", doc.pos_profile, "branch")

        # If the current user is a sub-cashier, they cannot create closing entries
        if frappe.session.user in sub_cashiers:
            frappe.throw(_("Sub Cashiers are not allowed to make POS Closing Entries."))

        # Check that ALL sub-cashiers have closed their POS
        for cashier in sub_cashiers:
            has_open = frappe.db.exists(
                "POS Opening Entry",
                {"branch": branch, "user": cashier, "status": "Open", "docstatus": 1},
            )
            if has_open:
                frappe.throw(
                    _("Sub Cashier {0}'s POS must be closed").format(cashier),
                    title=_("Sub Cashier POS Closing Required"),
                )


def calculate_closing_amount(doc, method):
    multiple_cashier = frappe.db.get_value("POS Profile", doc.pos_profile, "custom_enable_multiple_cashier")
    if multiple_cashier:
        sub_pos_closing = frappe.get_all(
            "Sub POS Closing",
            filters=[
                ["posting_date", "<=", doc.posting_date],
                ["period_start_date", ">=", doc.period_start_date],
                ["docstatus", "=", 1]
            ],
            pluck="name",
        )
        if sub_pos_closing:
            modes = [d.mode_of_payment for d in doc.payment_reconciliation]
            # R51-FIX (H4): Aggregate across ALL sub-closing entries, not just
            # the first one. Previously, only sub_pos_closing[0].name was used,
            # so other sub-cashiers' payment amounts were silently dropped,
            # causing the POS Closing Entry to have incorrect totals.
            if modes:
                sub_amount_rows = frappe.db.sql("""
                    SELECT mode_of_payment, SUM(closing_amount) as closing_amount
                    FROM `tabSub POS Closing Payment`
                    WHERE parent IN %s AND mode_of_payment IN %s
                    GROUP BY mode_of_payment
                """, (tuple(sub_pos_closing), tuple(modes)), as_dict=True)
                sub_amounts = {r.mode_of_payment: r.closing_amount for r in sub_amount_rows}
            else:
                sub_amounts = {}

            for closing_details in doc.payment_reconciliation:
                sub_closing_amount = sub_amounts.get(closing_details.mode_of_payment, 0) or 0
                main_closing_amount = closing_details.custom_closing_amount or 0
                total_closing_amount = sub_closing_amount + main_closing_amount
                closing_details.closing_amount = total_closing_amount
                closing_details.difference = total_closing_amount - closing_details.expected_amount
        else:
            frappe.throw(_("No Sub POS Closing entries found between the given dates"))


def validate_cashier(doc, method):
    multiple_cashier = frappe.db.get_value("POS Profile", doc.pos_profile, "custom_enable_multiple_cashier")
    if multiple_cashier:
        # R51-FIX (H3): Use get_all to fetch ALL sub-cashiers
        sub_cashiers = frappe.get_all(
            "POS Profile User",
            filters={"parent": doc.pos_profile, "custom_main_cashier": 0},
            fields=["user"],
            pluck="user",
        )
        if not sub_cashiers:
            return

        # If the current user is a sub-cashier, they cannot create closing entries
        if frappe.session.user in sub_cashiers:
            frappe.throw(_("Sub Cashiers are not allowed to make POS Closing Entries."))
