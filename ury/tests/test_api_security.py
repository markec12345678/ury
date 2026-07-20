# URY Backend Tests
# 
# These tests require a running Frappe/ERPNext instance.
# Run with: bench run-tests --app ury
#
# For unit tests that don't need Frappe, use:
#   python -m pytest ury/tests/ -v
#
# Note: Most URY API functions depend on frappe.db, so they need
# the full Frappe environment. These tests provide the structure
# for when a Frappe test bench is available.

import unittest


class TestURYReportsAPI(unittest.TestCase):
    """Tests for ury_reports.py API endpoints."""

    def test_get_sales_report_returns_dict(self):
        """get_sales_report should return a dictionary with expected keys."""
        # This test requires Frappe context
        # When running with bench run-tests, frappe is available
        try:
            import frappe
            from ury.ury.api.ury_reports import get_sales_report
            result = get_sales_report(period="daily")
            self.assertIsInstance(result, dict)
            self.assertIn("summary", result)
            self.assertIn("item_sales", result)
            self.assertIn("order_type_sales", result)
        except ImportError:
            self.skipTest("Frappe environment not available")

    def test_sales_report_parameterized_sql(self):
        """Verify branch filter uses parameterized queries (no f-string SQL)."""
        import inspect
        try:
            from ury.ury.api.ury_reports import get_sales_report
            source = inspect.getsource(get_sales_report)
            # Should NOT contain f-string SQL injection pattern
            self.assertNotIn("f\"AND branch = '", source)
            self.assertNotIn("f'AND branch = \"", source)
            # Should contain parameterized version
            self.assertIn("branch_clause", source)
        except ImportError:
            self.skipTest("Frappe environment not available")


class TestURYMenuManagementAPI(unittest.TestCase):
    """Tests for ury_menu_management.py API endpoints."""

    def test_create_menu_has_permission_check(self):
        """create_menu should enforce role-based access."""
        import inspect
        try:
            from ury.ury.api.ury_menu_management import create_menu
            source = inspect.getsource(create_menu)
            self.assertIn("frappe.only_for", source)
        except ImportError:
            self.skipTest("Frappe environment not available")

    def test_all_write_endpoints_have_permission_checks(self):
        """All write endpoints should have frappe.only_for checks."""
        import inspect
        try:
            from ury.ury.api import ury_menu_management
            write_functions = [
                'create_menu', 'toggle_menu', 'add_menu_item',
                'update_menu_item', 'remove_menu_item', 'batch_update_prices',
                'create_menu_course', 'update_menu_course', 'delete_menu_course',
            ]
            for func_name in write_functions:
                func = getattr(ury_menu_management, func_name)
                source = inspect.getsource(func)
                self.assertIn(
                    "frappe.only_for", source,
                    f"{func_name} is missing frappe.only_for permission check"
                )
        except ImportError:
            self.skipTest("Frappe environment not available")


class TestURYKotDisplayAPI(unittest.TestCase):
    """Tests for ury_kot_display.py API endpoints."""

    def test_get_site_name_no_guest_access(self):
        """get_site_name should NOT allow guest access."""
        import inspect
        try:
            from ury.ury.api.ury_kot_display import get_site_name
            source = inspect.getsource(get_site_name)
            self.assertNotIn("allow_guest=True", source)
        except ImportError:
            self.skipTest("Frappe environment not available")

    def test_confirm_cancel_uses_session_user(self):
        """confirm_cancel_kot should use frappe.session.user, not client param."""
        import inspect
        try:
            from ury.ury.api.ury_kot_display import confirm_cancel_kot
            source = inspect.getsource(confirm_cancel_kot)
            self.assertIn("frappe.session.user", source)
        except ImportError:
            self.skipTest("Frappe environment not available")


class TestURYDashboardAPI(unittest.TestCase):
    """Tests for ury_dashboard.py API endpoints."""

    def test_dashboard_uses_parameterized_sql(self):
        """Dashboard queries should use parameterized branch filtering."""
        import inspect
        try:
            from ury.ury.api.ury_dashboard import get_dashboard_summary
            source = inspect.getsource(get_dashboard_summary)
            self.assertNotIn("f\"AND branch = '", source)
        except ImportError:
            self.skipTest("Frappe environment not available")


class TestURYPrintAPI(unittest.TestCase):
    """Tests for ury_print.py API endpoints."""

    def test_print_endpoints_have_permission_checks(self):
        """All print endpoints should require role-based access."""
        import inspect
        try:
            from ury.ury.api import ury_print
            print_functions = [
                'network_printing', 'select_network_printer',
                'qz_print_update', 'print_pos_page', 'qz_certificate',
            ]
            for func_name in print_functions:
                func = getattr(ury_print, func_name)
                source = inspect.getsource(func)
                self.assertIn(
                    "frappe.only_for", source,
                    f"{func_name} is missing frappe.only_for permission check"
                )
        except ImportError:
            self.skipTest("Frappe environment not available")


if __name__ == "__main__":
    unittest.main()
