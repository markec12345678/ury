import frappe
from frappe import _
import os

from pypdf import PdfWriter
from ury.ury.api.utils import _get_user_branch

no_cache = 1

base_template_path = "www/printview.html"
standard_format = "templates/print_formats/standard.html"

ALLOWED_PRINT_DOCTYPES = {"POS Invoice"}


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
    # R47-FIX: Validate printer_setting belongs to user's branch or POS Profile.
    # Without this, a user could print to any printer on the system.
    printer_branch = frappe.db.get_value("Network Printer Settings", printer_setting, "branch")
    if printer_branch and printer_branch != _get_user_branch():
        frappe.throw(_("Printer does not belong to your branch"), frappe.PermissionError)
    # R49-FIX: Validate print_format belongs to the doctype to prevent
    # rendering arbitrary print formats. Without this, a user could specify
    # any print format name, potentially accessing formats they shouldn't.
    if print_format:
        pf_doctype = frappe.db.get_value("Print Format", print_format, "doc_type")
        if pf_doctype and pf_doctype != doctype:
            frappe.throw(_("Print Format '{0}' is not valid for {1}").format(print_format, doctype), frappe.ValidationError)
    # file_path is always server-generated to prevent path traversal
    file_path = None
    try:
        print_settings = frappe.get_doc("Network Printer Settings", printer_setting)

        try:
            import cups
        except ImportError:
            frappe.throw(_("CUPS library is not installed on the server"))

        try:
            # R51-FIX: Validate server_ip is a valid IP address or hostname
            # to prevent SSRF via CUPS connection to internal services.
            # Network Printer Settings are admin-controlled, but a compromised
            # admin account could set server_ip to an internal service.
            import ipaddress
            import re as _re
            server_ip = print_settings.server_ip
            if server_ip:
                # Allow valid IP addresses and RFC-compliant hostnames
                try:
                    ipaddress.ip_address(server_ip)
                except ValueError:
                    # Not an IP — validate as a hostname (alphanumeric, hyphens, dots)
                    if not _re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9\-\.]*[a-zA-Z0-9])?$', server_ip):
                        frappe.throw(_("Invalid printer server address: {0}").format(server_ip), frappe.ValidationError)
                    # Block obvious internal/metadata endpoints
                    blocked_prefixes = ("169.254.", "metadata.google", "metadata.azure")
                    if any(server_ip.lower().startswith(p) for p in blocked_prefixes):
                        frappe.throw(_("Printer server address cannot be a metadata endpoint"), frappe.ValidationError)
            cups.setServer(print_settings.server_ip)
            cups.setPort(print_settings.port)
            conn = cups.Connection()
        except Exception as e:
            frappe.log_error(frappe.get_traceback(), "CUPS Connection Error")
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
                frappe.db.set_value("POS Invoice", name, "invoice_printed", 1, update_modified=False)
                frappe.db.set_value(
                    "URY Table",
                    restaurant_table,
                    {"occupied": 0, "latest_invoice_time": None},
                    update_modified=False,
                )
            else:
                frappe.db.set_value("POS Invoice", name, "invoice_printed", 1, update_modified=False)

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
    # R49-FIX: Validate POS Profile belongs to user's branch
    pos_profile_branch = frappe.db.get_value("POS Profile", pos_profile, "branch")
    if pos_profile_branch and pos_profile_branch != user_branch:
        frappe.throw(_("POS Profile does not belong to your branch"), frappe.PermissionError)

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
        # R48-FIX: Combine two get_value calls into one for efficiency
        result = frappe.db.get_value("POS Invoice", invoice, ["restaurant_table", "invoice_printed"])
        if not result:
            frappe.throw(_("POS Invoice {0} not found").format(invoice))
        table, invoice_printed = result

        if not table:
            frappe.db.set_value(
                "POS Invoice", invoice, "invoice_printed", 1, update_modified=False
            )
        else:
            if invoice_printed == 0:
                frappe.db.set_value("POS Invoice", invoice, "invoice_printed", 1, update_modified=False)
                frappe.db.set_value("URY Table", table, {"occupied": 0, "latest_invoice_time": None}, update_modified=False)

        return {"status": "Success"}

    except frappe.ValidationError:
        raise
    except Exception as e:
        frappe.log_error(message=frappe.get_traceback(), title="Print Fail")
        frappe.throw(_("An error occurred. Please check the error log."))


@frappe.whitelist()
def print_pos_page(doctype, name, print_format):
    frappe.only_for("Restaurant Manager", "Restaurant User", "Cashier")
    if doctype not in ALLOWED_PRINT_DOCTYPES:
        frappe.throw(_("Invalid doctype for printing"), frappe.ValidationError)
    # R49-FIX: Validate print_format belongs to the correct doctype
    if print_format:
        pf_doctype = frappe.db.get_value("Print Format", print_format, "doc_type")
        if pf_doctype and pf_doctype != doctype:
            frappe.throw(_("Print Format '{0}' is not valid for {1}").format(print_format, doctype))
    data = {"name": name, "doctype": doctype, "print_format": print_format}

    result = frappe.db.get_value(
        "POS Invoice", name, ["restaurant_table", "branch", "name", "invoice_printed"]
    )
    if not result:
        frappe.throw(_("POS Invoice {0} not found").format(name))
    restaurant_table, branch, invoice_name, invoice_printed = result
    if not branch:
        frappe.throw(_("POS Invoice {0} has no branch assigned").format(name), frappe.PermissionError)
    # R38-FIX: Validate invoice belongs to user's branch
    user_branch = _get_user_branch()
    if branch != user_branch:
        frappe.throw(_("You do not have access to invoices from another branch"), frappe.PermissionError)
    print_channel = "{}_{}".format("print", branch)
    frappe.publish_realtime(print_channel, {"data": data})

    if invoice_printed == 0:
        frappe.db.set_value("POS Invoice", name, "invoice_printed", 1, update_modified=False)

        if restaurant_table:
            frappe.db.set_value(
                "URY Table",
                restaurant_table,
                {"occupied": 0, "latest_invoice_time": None},
                update_modified=False,
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
    if len(str(message)) > 10000:
        frappe.throw(_("Message too long for signing (max 10000 characters)"), frappe.ValidationError)
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
        frappe.log_error(f"QZ signing failed: {e}\n{frappe.get_traceback()}", "QZ Signing Error")
        frappe.throw(_("Failed to sign message"), frappe.ValidationError)