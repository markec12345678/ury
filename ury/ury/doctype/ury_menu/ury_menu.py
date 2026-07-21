# Copyright (c) 2023, Tridz Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class URYMenu(Document):
    def validate(self):
        items_without_rate = [d for d in self.items if not d.rate]
        if items_without_rate:
            item_codes = list({d.item for d in items_without_rate})
            rates = {
                r[0]: r[1]
                for r in frappe.db.get_values(
                    "Item", {"name": ("in", item_codes)}, ["name", "standard_rate"]
                )
            }
            for d in items_without_rate:
                d.rate = rates.get(d.item)

    def on_update(self):
        """Sync Price List"""
        self.make_price_list()

    def on_trash(self):
        """clear prices"""
        self.clear_item_price()

    def clear_item_price(self, price_list=None):
        """clear all item prices for this menu"""
        if not price_list:
            price_list = self.get_price_list()
        frappe.db.sql("delete from `tabItem Price` where price_list = %s", price_list)

    def make_price_list(self):
        # create price list for menu
        price_list_name = self.get_price_list()
        self.db_set("price_list", price_list_name)

        # delete old items
        self.clear_item_price(price_list_name)

        # batch insert item prices using bulk SQL
        # R51-FIX (H1): Include selling=1 and currency in bulk_insert.
        # Previously, only price_list/item_code/price_list_rate were inserted,
        # causing Item Price records with selling=0 (invisible to aggregator
        # and available-items queries that filter by selling=1) and NULL
        # currency (potential currency mismatch with the Price List).
        if self.items:
            currency = frappe.db.get_value("Price List", price_list_name, "currency") or \
                frappe.db.get_single_value("Global Defaults", "default_currency") or "USD"
            rows = []
            for d in self.items:
                rows.append((price_list_name, d.item, d.rate, 1, currency))
            frappe.db.bulk_insert(
                "Item Price",
                ["price_list", "item_code", "price_list_rate", "selling", "currency"],
                rows,
                ignore_duplicates=True,
            )

    def get_price_list(self):
        """Return price list name; create if missing."""
        price_list_name = frappe.db.get_value(
            "Price List", dict(restaurant_menu=self.name)
        )
        if price_list_name:
            # R48-FIX: Use update_modified=False — auxiliary config update
            frappe.db.set_value("Price List", price_list_name, {"enabled": 1, "selling": 1}, update_modified=False)
            return price_list_name

        price_list = frappe.new_doc("Price List")
        price_list.restaurant_menu = self.name
        price_list.price_list_name = self.name
        price_list.enabled = 1
        price_list.selling = 1
        price_list.insert()

        return price_list.name
