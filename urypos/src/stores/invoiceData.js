import { defineStore } from "pinia";
import { markRaw } from "vue";
import router from "../router";
import { useTableStore } from "./Table.js";
import { useMenuStore } from "./Menu.js";
import { useCustomerStore } from "./Customer.js";
import { useNotifications } from "./Notification.js";
import { usetoggleRecentOrder } from "./recentOrder.js";
import { useAlert } from "./Alert.js";
import { useNotificationModal } from './NotificationModal';
import { useAuthStore } from "./Auth.js";
import frappe from "./frappeSdk.js";
import { extractServerMessage } from "./utils/extractMessage.js";

import {
  printWithQz,
  loadQzPrinter,
  disconnectQzPrinter,
} from "./utils/PrintWithQz";

export const useInvoiceDataStore = defineStore("invoiceData", {
  state: () => ({
    waiter: "",
    cashier: "",
    warehouse: "",
    posProfile: "",
    enableKotReprint:0,
    defaultModeOfPayment: "Cash",
    owner:null,
    branch: null,
    printer: null,
    qz_host: null,
    company: null,
    currency: null,
    qz_print: null,
    paidLimit: null,
    print_type: null,
    grandTotal: null,
    modifiedTime: null,
    print_format: null,
    cancelReason: null,
    invoiceNumber: null,
    multipleCashier:null,
    tableInvoiceNo: null,
    tableAttention: null,
    modeOfPaymentList: null,
    disableRoundedTotal: null,
    showUpdateButton: true,
    isChecked: false,
    isPrinting: false,
    showDialog: false,
    kotPrinting: false,
    editOrderType:false,
    enableDiscount: false,
    invoiceUpdating: false,
    cancelInvoiceFlag: false,
    invoiceDetails: [],
    previousOrderItem: [],
    // TODO: Refactor - db and call (markRaw(frappe.db()/frappe.call())) are duplicated across
    // Customer.js, Table.js, recentOrder.js, posOpening.js, posClosing.js, Auth.js, Menu.js, and here.
    // Extract into a shared composable or singleton to avoid N identical instances.
    db: markRaw(frappe.db()),
    call: markRaw(frappe.call()),
  }),
  actions: {
    async fetchInvoiceDetails() {
      const alert = useAlert();
      try {
        const result = await this.call.get("ury.ury_pos.api.getPosProfile");
        this.invoiceDetails = result.message;
        this.tableAttention = this.invoiceDetails.tableAttention;
        this.warehouse = this.invoiceDetails.warehouse;
        this.posProfile = this.invoiceDetails.pos_profile;
        this.waiter = this.invoiceDetails.waiter;
        this.cashier = this.invoiceDetails.cashier;
        this.owner = this.invoiceDetails.owner
        this.branch = this.invoiceDetails.branch;
        this.company = this.invoiceDetails.company;
        this.print_format = this.invoiceDetails.print_format;
        this.qz_print = this.invoiceDetails.qz_print;
        this.qz_host = this.invoiceDetails.qz_host;
        this.print_type = this.invoiceDetails.print_type;
        this.printer = this.invoiceDetails.printer;
        this.paidLimit = this.invoiceDetails.paid_limit;
        this.disableRoundedTotal = this.invoiceDetails.disable_rounded_total;
        this.enableDiscount = this.invoiceDetails.enable_discount;
        this.enableKotReprint = this.invoiceDetails.enable_kot_reprint;
        this.multipleCashier = this.invoiceDetails.multiple_cashier;
        this.editOrderType = this.invoiceDetails.edit_order_type;

        if (this.qz_host) {
          loadQzPrinter(this.qz_host);
        }

        try {
          const doc = await this.db.getDoc("Company", this.company);
          try {
            const currency = await this.db.getDoc("Currency", doc.default_currency);
            this.currency = currency.symbol;
          } catch (error) {
            if (error._server_messages) {
              alert.createAlert(
                "Message",
                "You do not have Read or Select Permissions for Currency",
                "OK"
              );
            }
          }
        } catch (error) {
          if (error._server_messages) {
            alert.createAlert(
              "Message",
              "You do not have Read or Select Permissions for Company",
              "OK"
            );
          }
        }

        try {
          const modeResult = await this.call.get("ury.ury_pos.api.getModeOfPayment", {
            pos_profile: this.posProfile,
          });
          this.defaultModeOfPayment = modeResult.message;
        } catch (error) {
          if (error._server_messages) {
            const message = extractServerMessage(error);
            alert.createAlert("Message", message, "OK");
          }
        }
      } catch (error) {
        if (error._server_messages) {
          const message = extractServerMessage(error);
          alert.createAlert("Message", message, "OK");
        }
      }
    },

    // Method for creating an invoice
    async invoiceCreation() {
      const alert = useAlert();
      const auth = useAuthStore();
      const menu = useMenuStore();
      const customers = useCustomerStore();
      const table = useTableStore();
      const recentOrders = usetoggleRecentOrder();
      const notification = useNotifications();
      const notificationModal = useNotificationModal();

      this.showUpdateButton = false;
      this.invoiceUpdating = true;
      let selectedTables = "";
      let cart = menu.cart;
      const customerName = customers.search;
      const ordeType =
        menu.selectedOrderType || recentOrders.pastOrderType;
      const numberOfPax = customers.numberOfPax;
      let invoice =
        recentOrders.draftInvoice ||
        table.invoiceNo ||
        this.invoiceNumber ||
        null;
      let lastInvoice =
        this.invoiceNumber ||
        recentOrders.draftInvoice ||
        table.invoiceNo ||
        null;
      let cashier = table.cashier || this.cashier;

      selectedTables =
        table.selectedTable || recentOrders.restaurantTable;
      const cartCopy = JSON.parse(JSON.stringify(cart));
      let waiter = null
      if (lastInvoice) {
        waiter = table.previousWaiter !== null &&
          table.previousWaiter !== undefined
          ? table.previousWaiter
          : recentOrders.recentWaiter !== null &&
            recentOrders.recentWaiter !== undefined
            ? recentOrders.recentWaiter
            : this.waiter;
      } else {
        waiter = this.waiter;
      }
      if (recentOrders.modifiedTime){
        this.modifiedTime =recentOrders.modifiedTime
      }
      else{
        this.modifiedTime =table.modifiedTime
      }

      // Check for modifications in existing invoice
      if (invoice) {
        let pastOrderdItem = [];
        if (table.previousOrderdItem?.length) {
          pastOrderdItem = table.previousOrderdItem;
        } else if (recentOrders.pastOrderdItem?.length) {
          pastOrderdItem = recentOrders.pastOrderdItem;
        }
        
        const originalItems = {};
        pastOrderdItem.forEach(item => {
          originalItems[item.item_code] = {
            qty: item.qty,
            name: item.item_name
          };
        });
        
        const currentItems = {};
        menu.cart.forEach(item => {
          currentItems[item.item] = {
            qty: item.qty,
            name: item.item_name
          };
        });
        
        const removedItems = Object.keys(originalItems).filter(
          itemCode => !currentItems[itemCode]
        );
    
        const reducedQtyItems = [];
        Object.entries(originalItems).forEach(([itemCode, itemData]) => {
          if (currentItems[itemCode] && currentItems[itemCode].qty < itemData.qty) {
            reducedQtyItems.push(
              `${itemData.name} (qty reduced from ${itemData.qty} to ${currentItems[itemCode].qty})`
            );
          }
        });
    
        if (removedItems.length > 0 || reducedQtyItems.length > 0) {
          this.invoiceUpdating = false;
                
          let errorMsg = [];
          if (removedItems.length > 0) {
            const removedItemNames = removedItems.map(
              itemCode => originalItems[itemCode].name
            );
            errorMsg.push(`Removed items: ${removedItemNames.join(', ')}\n`);
          }
          if (reducedQtyItems.length > 0) {
            errorMsg.push(`Modified quantities: ${reducedQtyItems.join(',\n')}`);
          }
    
          // Show confirmation modal and wait for user response
          const modalResult = await new Promise((resolve, reject) => {
            notificationModal.showModal({
              title: "Are You Sure to remove these items?",
              message: errorMsg.join('\n'),
              actionText: "Yes",
              showCancelButton: true,
              onConfirm: () => {
                this.invoiceUpdating = true;
                this.showUpdateButton = true;
                resolve({ cancelled: false });
              },
              onCancel: () => {
                this.showUpdateButton = true;
                this.invoiceUpdating = false;
                resolve({ cancelled: true });
              }
            });
          });
          if (modalResult.cancelled) {
            return;
          }
        }
      }
    
      // Only proceed with API call if no rejection occurred
      const creatingInvoice = {
        table: selectedTables,
        customer: customerName,
        items: JSON.parse(JSON.stringify(cart)),
        no_of_pax: numberOfPax,
        mode_of_payment: this.defaultModeOfPayment,
        cashier: cashier,
        owner:this.owner,
        waiter: waiter,
        last_modified_time: this.modifiedTime,
        pos_profile: this.posProfile,
        invoice: invoice,
        aggregator_id: menu.aggregatorId,
        order_type: ordeType,
        last_invoice: lastInvoice,
        comments: menu.comments,
        room: table.selectedRoom,
      };
      if (!auth.cashier && !numberOfPax && table.takeAwayTable == 0) {
        alert.createAlert(
          "Message",
          "Please Select Customer / No of Pax",
          "OK"
        );
        this.showUpdateButton = true;
        this.invoiceUpdating = false;
        return;
      }
    
      if (!auth.cashier && !selectedTables) {
        alert.createAlert("Message", "Please Select a Table", "OK");
        this.showUpdateButton = true;
        this.invoiceUpdating = false;
        return;
      }
    
      if (auth.cashier && !ordeType && !selectedTables) {
        alert.createAlert("Message", "Please Select Order Type", "OK");
        this.showUpdateButton = true;
        this.invoiceUpdating = false;
        return;
      }
    
      try {
        const response = await this.call.post(
          "ury.ury.doctype.ury_order.ury_order.sync_order",
          creatingInvoice
        );
    
        this.showUpdateButton = true;
        if (response.message.status === "Failure") {
          if (response._server_messages) {
            const message = extractServerMessage(response);
    
            await alert.createAlert("Message", message, "OK");
            await router.push("/Table");
            return;
          }
        }
    
        // Handle successful response
        this.invoiceNumber = response.message.name;
        this.grandTotal = response.message.grand_total;
        notification.createNotification("Order Update");
        table.fetchTable();
        
        let items = menu.items;
        // items.forEach((item) => {
        //   item.comment = "";
        // });
        
        table.previousOrderdItem = JSON.parse(JSON.stringify(response.message.items));
        recentOrders.pastOrderdItem = JSON.parse(JSON.stringify(response.message.items));
        this.previousOrderItem.splice(0, this.previousOrderItem.length, ...cartCopy);
        this.invoiceUpdating = false;
        table.modifiedTime = response.message.modified;
        recentOrders.modifiedTime = response.message.modified;
        if (auth.cashier) {
          this.clearDataAfterUpdate();
          await router.push("/recentOrder");
          recentOrders.viewRecentOrder(response.message);
        }
      } catch (error) {
        this.showUpdateButton = true;
        this.invoiceUpdating = false;
        if (error && error.cancelled) {
          return; // Silently handle cancellation
        }
        if (error._server_messages) {
          const message = extractServerMessage(error);
          await alert.createAlert("Message", message, "OK");
        }
      }
    },

    clearDataAfterUpdate() {
      const menu = useMenuStore();
      const table = useTableStore();
      const customers = useCustomerStore();
      const recentOrders = usetoggleRecentOrder();

      menu.items.forEach((item) => {
        item.comment = "";
        item.qty = "";
      });
      table.cashier=""
      table.takeAwayTable = 0;
      recentOrders.restaurantTable = "";
      table.selectedTable = "";
      customers.numberOfPax = "";
      customers.newCustomerMobileNo=""
      menu.cart = [];
      recentOrders.draftInvoice = "";
      menu.selectedAggregator = "";
      this.invoiceNumber = "";
      this.tableInvoiceNo = "";
      customers.customerFavouriteItems = [];
      customers.search = "";
      recentOrders.pastOrderType = "";
      recentOrders.showOrder = false;
      recentOrders.invoiceNumber = "";
      recentOrders.setBackground = "";
      recentOrders.recentOrderListItems = [];
      recentOrders.taxDetails = [];
      recentOrders.orderType = "";
      recentOrders.netTotal = 0;
      recentOrders.payments = [];
      recentOrders.grandTotal = 0;
      recentOrders.paidAmount = 0;
      recentOrders.billAmount = 0;
      menu.aggregatorItem = []
      recentOrders.invoiceNumber = "";
      recentOrders.selectedOrder = [];
      recentOrders.selectedTable = "";
      customers.selectedOrderType = "";
      menu.selectedOrderType = "";
    },
    billing(tableParam) {
      const auth = useAuthStore();
      const alert = useAlert();

      let tables = tableParam.name;
      const getOrderInvoice = {
        table: tables,
      };
      this.call
        .get(
          "ury.ury.doctype.ury_order.ury_order.get_order_invoice",
          getOrderInvoice
        )
        .then((result) => {
          this.tableInvoiceNo = result.message.name;
          if (
            !auth.hasAccess &&
            !auth.cashier &&
            auth.sessionUser !== result.message.waiter
          ) {
            alert.createAlert(
              "Message",
              "Printing is Blocked Table is assigned to " +
              result.message.waiter,
              "OK"
            );
          } else {
            this.isPrinting = true;
            this.printFunction();
          }
        })
        .catch((error) => console.error(error));
    },
    kotReprint() {
      const recentOrders = usetoggleRecentOrder();
      const table = useTableStore();
      const notification = useNotifications();
      const alert = useAlert();

      this.kotPrinting=true;
      let invoice =
        recentOrders.draftInvoice ||
        table.invoiceNo ||
        this.invoiceNumber ||
        null;
      
      const invoiceData = {
        invoice_number: invoice,
      };
      this.call
        .get("ury.ury.api.ury_kot_reprint.reprint_kot", invoiceData)
        .then((result) => {
          if (result.message === "Success") {
            this.kotPrinting=false;
            notification.createNotification("KOT Reprint Successful");
          }
        })
        .catch((error) =>{
          console.error(error);
          this.kotPrinting=false;
          if (error._server_messages) {
            const message = extractServerMessage(error);
             alert.createAlert("Message", message, "OK");
          }
        } );


    },
    printFunction: async function () {
      const recentOrders = usetoggleRecentOrder();
      const auth = useAuthStore();
      const notification = useNotifications();
      const alert = useAlert();

      this.isPrinting = true;
      let invoiceNo =
        recentOrders.invoiceNumber ||
        this.tableInvoiceNo ||
        this.invoiceNumber;
      try {
        if (this.print_type === "qz") {
          const printHTML = {
            doc: "POS Invoice",
            name: invoiceNo,
            print_format: this.print_format,
            _lang: "en",
          };
          const result = await this.call.get(
            "frappe.www.printview.get_html_and_style",
            printHTML
          );
          if (!result?.message?.html) {
            this.isPrinting = false;
            alert.createAlert(
              "Message",
              "Error while getting the HTML document to print for QZ",
              "OK"
            );
            return;
          }

          const print = await printWithQz(this.qz_host, result?.message?.html);

          if (print === "printed") {
            const updateSuccess = await this.updatePrintTable(invoiceNo);
            this.isPrinting = false
            if (!updateSuccess) {
              notification.createNotification(
                "Print successful but failed to update status"
              );
            }
          }
        } else if (this.print_type === "network") {
          if (auth.cashier && !this.multipleCashier) {
            const sendObj = {
              doctype: "POS Invoice",
              name: invoiceNo,
              printer_setting: this.printer,
              print_format: this.print_format,
            };
            const res = await this.call.post(
              "ury.ury.api.ury_print.network_printing",
              sendObj
            );
            if (res.message === "Success") {
              notification.createNotification("Print Successful");
              await this.call.post("ury.ury.api.ury_print.qz_print_update", { invoice: invoiceNo });
              this.isPrinting = false;
              router.push("/Table").catch(() => {});
            } else {
              this.isPrinting = false;
              await alert.createAlert("Message", `Message: ${res.message}`, "OK");
            }
          } else {
            const networkPrint = {
              invoice_id: invoiceNo,
              pos_profile: this.posProfile,
            };
            const res = await this.call.post(
              "ury.ury.api.ury_print.select_network_printer",
              networkPrint
            );
            if (res.message === "Success") {
              notification.createNotification("Print Successful");
              await this.call.post("ury.ury.api.ury_print.qz_print_update", { invoice: invoiceNo });
              this.isPrinting = false;
              router.push("/Table").catch(() => {});
            } else {
              this.isPrinting = false;
              await alert.createAlert("Message", `Message: ${res.message}`, "OK");
            }
          }
        } else {
          // Socket printing using printview redirection
          const url = `/printview?doctype=POS Invoice&name=${invoiceNo}&format=${this.print_format}&no_letterhead=1&settings={}&letterhead=No Letterhead&trigger_print=1&_lang=en`;
          window.open(url, "_blank", "noopener,noreferrer");
          try {
            await this.call.post("ury.ury.api.ury_print.qz_print_update", {
              invoice: invoiceNo,
            });
          } catch (err) {
            console.error("Failed to update print status for socket print", err);
          }
          notification.createNotification("Print triggered");
          this.isPrinting = false;
        }
      } catch (e) {
        if (e?._server_messages) {
          const message = extractServerMessage(e);
          await alert.createAlert("Message", message, "OK");
        }
        this.isPrinting = false;
      }
    },
    async updatePrintTable(invoiceNo, maxRetries = 3) {
      const notification = useNotifications();
      const alert = useAlert();
      let retryCount = 0;

      const tryUpdate = async () => {
        try {
          const updatePrintTable = {
            invoice: invoiceNo,
          };

          const response = await this.call.post(
            "ury.ury.api.ury_print.qz_print_update",
            updatePrintTable
          );
          if (response.message.status === "Success") {
            notification.createNotification("Print and Update Successful");
            router.push("/Table").catch(() => {});
            return true;
          } else {
            this.isPrinting = false
            throw new Error(response.message);
          }
        } catch (error) {
          console.error(`Update attempt ${retryCount + 1} failed:`, error);
          return false;
        }
      };

      while (retryCount < maxRetries) {
        const success = await tryUpdate();
        if (success) {
          return true;
        }
        retryCount++;
        if (retryCount < maxRetries) {
          // Wait for 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      alert.createAlert(
        "Error",
        "Failed to update print status after multiple attempts",
        "OK"
      );
      return false;
    },

    loadPrinter: async function (qz_host) {
      const notification = useNotifications();
      const alert = useAlert();
      try {
        const res = await loadQzPrinter(qz_host);
        if (res === "success")
          notification.createNotification("Printer loaded");
      } catch (err) {
        alert.createAlert("Message", err.message, "OK");
      }
    },

    showCancelInvoiceModal() {
      const alert = useAlert();
      this.call
        .get("ury.ury.api.button_permission.cancel_check")
        .then((result) => {
          if (result.message === true) {
            this.cancelInvoiceFlag = true;
            this.cancelReason = "";
          } else {
            alert.createAlert(
              "Message",
              "You don't Have Permission to Cancel ",
              "OK"
            );
            this.cancelInvoiceFlag = false;
            this.cancelReason = "";
          }
        })
        .catch(() => {});
    },
    cancelInvoice: async function () {
      const recentOrders = usetoggleRecentOrder();
      const table = useTableStore();
      const notification = useNotifications();
      let invoiceNo =
        recentOrders.invoiceNumber ||
        this.invoiceNumber ||
        table.invoiceNo;

      const updatedFields = {
        invoice_id: invoiceNo,
        reason: this.cancelReason,
      };
      this.call
        .post("ury.ury.doctype.ury_order.ury_order.cancel_order", updatedFields)
        .then(() => {
          notification.createNotification("Invoice Cancelled");
          router.push("/Table").then(() => {
            router.push("/Table").catch(() => {});
          });
        })
        .catch((error) => console.error(error));
    },
  },
});
