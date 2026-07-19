import frappe
from frappe import _
import os

from pypdf import PdfWriter
from ury.ury.api.utils import _get_user_branch

no_cache = 1

base_template_path = "www/printview.html"
standard_format = "templates/print_formats/standard.html"


@frappe.whitelist()
def network_printing(
    doctype,
    name,
    printer_setting,
    print_format=None,
    doc=None,
    no_letterhead=0,
):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    # R39-FIX: Validate invoice belongs to user's branch
    if doctype == "POS Invoice":
        inv_branch = frappe.db.get_value("POS Invoice", name, "branch")
        if not inv_branch:
            frappe.throw(_("POS Invoice {0} not found").format(name))
        user_branch = _get_user_branch()
        if inv_branch != user_branch:
            frappe.throw(_("You do not have access to invoices from another branch"), frappe.PermissionError)
    elif doctype not in ALLOWED_PRINT_DOCTYPES:
        frappe.throw(_("Invalid doctype for printing"), frappe.ValidationError)
    # file_path is always server-generated to prevent path traversal
    file_path = None
    try:
        print_settings = frappe.get_doc("Network Printer Settings", printer_setting)

        try:
            import cups
        except ImportError:
            frappe.throw(_("CUPS library is not installed on the server"))

        try:
            cups.setServer(print_settings.server_ip)
            cups.setPort(print_settings.port)
            conn = cups.Connection()
        except Exception as e:
            frappe.log_error(str(e))
            frappe.throw(_("An error occurred. Please check the error log."))

        try:
            output = PdfWriter()
            output = frappe.get_print(
                doctype,
                name,
                print_format,
                doc=doc,
                no_letterhead=no_letterhead,
                as_pdf=True,
                output=output,
            )
            if not file_path:
                file_path = os.path.join(
                    "/", "tmp", f"frappe-pdf-{frappe.generate_hash()}.pdf"
                )
            with open(file_path, "wb") as f:
                output.write(f)
            conn.printFile(print_settings.printer_name, file_path, name, {})

            restaurant_table, invoice_printed, invoice_name = frappe.db.get_value(
                "POS Invoice", name, ["restaurant_table", "invoice_printed", "name"]
            )

            if restaurant_table and invoice_printed == 0:
                frappe.db.set_value("POS Invoice", name, "invoice_printed", 1)
                frappe.db.set_value(
                    "URY Table",
                    restaurant_table,
                    {"occupied": 0, "latest_invoice_time": None},
                )
            else:
                frappe.db.set_value("POS Invoice", name, "invoice_printed", 1)

            return "Success"
        except Exception as e:
            frappe.log_error(message=frappe.get_traceback(), title="Network Printing - Print Error")
            frappe.throw(_("An error occurred. Please check the error log."))
        finally:
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except OSError:
                    pass
    except Exception as e:
        frappe.log_error(message=frappe.get_traceback(), title="Network Printing Error")
        frappe.throw(_("An error occurred. Please check the error log."))


@frappe.whitelist()
def select_network_printer(pos_profile, invoice_id):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    # R38-FIX: Validate invoice belongs to user's branch
    inv_branch = frappe.db.get_value("POS Invoice", invoice_id, "branch")
    if not inv_branch:
        frappe.throw(_("POS Invoice {0} not found").format(invoice_id))
    user_branch = _get_user_branch()
    if inv_branch != user_branch:
        frappe.throw(_("You do not have access to invoices from another branch"), frappe.PermissionError)

    table = frappe.db.get_value("POS Invoice", invoice_id, "restaurant_table")
    print_format = frappe.db.get_value("POS Profile", pos_profile, "print_format")

    if table:
        room = frappe.db.get_value("URY Table", table, "restaurant_room")
        room_bill_printer = frappe.db.get_value(
            "URY Printer Settings", {"parent": room, "bill": 1}, "printer"
        )
        if room_bill_printer:
            return network_printing(
                "POS Invoice", invoice_id, room_bill_printer, print_format
            )

    else:
        pos_bill_printer = frappe.db.get_value(
            "URY Printer Settings", {"parent": pos_profile, "bill": 1}, "printer"
        )
        if pos_bill_printer:
            return network_printing(
                "POS Invoice", invoice_id, pos_bill_printer, print_format
            )

    frappe.throw(_("No printer configured for this POS Profile or table"))


@frappe.whitelist()
def qz_print_update(invoice):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    # R38-FIX: Validate invoice belongs to user's branch
    inv_branch = frappe.db.get_value("POS Invoice", invoice, "branch")
    if not inv_branch:
        frappe.throw(_("POS Invoice {0} not found").format(invoice))
    user_branch = _get_user_branch()
    if inv_branch != user_branch:
        frappe.throw(_("You do not have access to invoices from another branch"), frappe.PermissionError)

    try:
        table = frappe.db.get_value("POS Invoice", invoice, "restaurant_table")

        if not table:
            frappe.db.set_value(
                "POS Invoice", invoice, "invoice_printed", 1, update_modified=False
            )
        else:
            invoice_printed = frappe.db.get_value("POS Invoice", invoice, "invoice_printed")

            if invoice_printed == 0:
                frappe.db.set_value("POS Invoice", invoice, "invoice_printed", 1, update_modified=False)
                frappe.db.set_value("URY Table", table, {"occupied": 0, "latest_invoice_time": None}, update_modified=False)

        return {"status": "Success"}

    except frappe.ValidationError:
        raise
    except Exception as e:
        frappe.log_error(message=frappe.get_traceback(), title="Print Fail")
        frappe.throw(_("An error occurred. Please check the error log."))


ALLOWED_PRINT_DOCTYPES = {"POS Invoice"}


@frappe.whitelist()
def print_pos_page(doctype, name, print_format):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    if doctype not in ALLOWED_PRINT_DOCTYPES:
        frappe.throw(_("Invalid doctype for printing"), frappe.ValidationError)
    data = {"name": name, "doctype": doctype, "print_format": print_format}

    result = frappe.db.get_value(
        "POS Invoice", name, ["restaurant_table", "branch", "name"]
    )
    if not result:
        frappe.throw(_("POS Invoice {0} not found").format(name))
    restaurant_table, branch, invoice_name = result
    if not branch:
        frappe.throw(_("POS Invoice {0} has no branch assigned").format(name), frappe.PermissionError)
    # R38-FIX: Validate invoice belongs to user's branch
    user_branch = _get_user_branch()
    if branch != user_branch:
        frappe.throw(_("You do not have access to invoices from another branch"), frappe.PermissionError)
    print_channel = "{}_{}".format("print", branch)
    frappe.publish_realtime(print_channel, {"data": data})

    invoice_printed = frappe.db.get_value("POS Invoice", name, "invoice_printed")

    if invoice_printed == 0:
        frappe.db.set_value("POS Invoice", name, "invoice_printed", 1)

        if restaurant_table:
            frappe.db.set_value(
                "URY Table",
                restaurant_table,
                {"occupied": 0, "latest_invoice_time": None},
            )


@frappe.whitelist()
def qz_certificate():
    frappe.only_for("System Manager")
    site_config = frappe.get_site_config()
    qz_key_value = site_config.get("qz_cert")
    return qz_key_value


@frappe.whitelist()
def sign_message(message):
    """Sign a message with the QZ private key server-side. Never expose the key."""
    frappe.only_for("System Manager")
    site_config = frappe.get_site_config()
    private_key_pem = site_config.get("qz_private_key")
    if not private_key_pem:
        frappe.throw(_("QZ private key not configured"))
    try:
        from cryptography.hazmat.primitives import hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import padding
        import base64
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode() if isinstance(private_key_pem, str) else private_key_pem,
            password=None
        )
        signature = private_key.sign(
            message.encode(), padding.PKCS1v15(), hashes.SHA256()
        )
        return base64.b64encode(signature).decode()
    except Exception as e:
        frappe.log_error(f"QZ signing failed: {e}")
        frappe.throw(_("Failed to sign message"), frappe.ValidationError)