// URY Restaurant Management Evaluation Dashboard - Mock Data
// Restaurant: Spice Garden (Indian Restaurant)

export const RESTAURANT_NAME = "Spice Garden";
export const CURRENCY = "₹";

// ── Tab 1: Overview ──────────────────────────────────────

export const kpiData = {
  dailySales: 124580,
  totalOrders: 187,
  avgBill: 667,
  occupiedTables: 24,
  totalTables: 32,
};

export const hourlySalesData = [
  { hour: "11:00", dineIn: 2400, takeaway: 800 },
  { hour: "12:00", dineIn: 5600, takeaway: 2100 },
  { hour: "13:00", dineIn: 8900, takeaway: 3400 },
  { hour: "14:00", dineIn: 7200, takeaway: 2800 },
  { hour: "15:00", dineIn: 3400, takeaway: 1200 },
  { hour: "16:00", dineIn: 1800, takeaway: 600 },
  { hour: "17:00", dineIn: 2200, takeaway: 900 },
  { hour: "18:00", dineIn: 6100, takeaway: 2500 },
  { hour: "19:00", dineIn: 9800, takeaway: 4200 },
  { hour: "20:00", dineIn: 11200, takeaway: 5100 },
  { hour: "21:00", dineIn: 8400, takeaway: 3800 },
  { hour: "22:00", dineIn: 4600, takeaway: 1900 },
];

export type OrderStatus = "Draft" | "Paid" | "Cancelled";
export type OrderType = "Dine-in" | "Takeaway" | "Delivery";

export interface RecentOrder {
  invoice: string;
  customer: string;
  type: OrderType;
  amount: number;
  status: OrderStatus;
  time: string;
}

export const recentOrders: RecentOrder[] = [
  { invoice: "INV-2026-0187", customer: "Rajesh Sharma", type: "Dine-in", amount: 1850, status: "Paid", time: "21:42" },
  { invoice: "INV-2026-0186", customer: "Priya Patel", type: "Takeaway", amount: 620, status: "Paid", time: "21:38" },
  { invoice: "INV-2026-0185", customer: "Ananya Reddy", type: "Dine-in", amount: 2340, status: "Draft", time: "21:35" },
  { invoice: "INV-2026-0184", customer: "Vikram Singh", type: "Delivery", amount: 890, status: "Paid", time: "21:28" },
  { invoice: "INV-2026-0183", customer: "Neha Gupta", type: "Dine-in", amount: 1560, status: "Draft", time: "21:22" },
  { invoice: "INV-2026-0182", customer: "Arjun Menon", type: "Takeaway", amount: 440, status: "Paid", time: "21:15" },
  { invoice: "INV-2026-0181", customer: "Deepa Nair", type: "Dine-in", amount: 3100, status: "Paid", time: "21:08" },
  { invoice: "INV-2026-0180", customer: "Suresh Kumar", type: "Delivery", amount: 720, status: "Cancelled", time: "21:02" },
];

// ── Tab 2: Tables ────────────────────────────────────────

export type TableStatus = "free" | "occupied" | "attention" | "active";

export interface TableData {
  id: number;
  room: string;
  status: TableStatus;
  pax: number;
  occupiedSince?: string; // minutes ago
  orderItems?: string[];
  orderTotal?: number;
  customer?: string;
}

export const rooms = [
  { id: "glavna", name: "Glavna dvorana", tables: 16 },
  { id: "terasa", name: "Terasa", tables: 8 },
  { id: "vip", name: "VIP", tables: 4 },
  { id: "bar", name: "Bar", tables: 4 },
];

export const tablesData: TableData[] = [
  // Glavna dvorana (16 tables)
  { id: 1, room: "glavna", status: "occupied", pax: 4, occupiedSince: "45", customer: "Rajesh Sharma", orderItems: ["Butter Chicken", "Naan x4", "Dal Makhani"], orderTotal: 1850 },
  { id: 2, room: "glavna", status: "free", pax: 0 },
  { id: 3, room: "glavna", status: "occupied", pax: 2, occupiedSince: "20", customer: "Priya Patel", orderItems: ["Paneer Tikka", "Biryani x2"], orderTotal: 940 },
  { id: 4, room: "glavna", status: "attention", pax: 6, occupiedSince: "55", customer: "Vikram Singh", orderItems: ["Mixed Grill", "Butter Naan x6", "Raita"], orderTotal: 3200 },
  { id: 5, room: "glavna", status: "free", pax: 0 },
  { id: 6, room: "glavna", status: "occupied", pax: 4, occupiedSince: "15", customer: "Ananya Reddy", orderItems: ["Chicken Biryani x2", "Raita x2"], orderTotal: 1340 },
  { id: 7, room: "glavna", status: "free", pax: 0 },
  { id: 8, room: "glavna", status: "occupied", pax: 3, occupiedSince: "30", customer: "Neha Gupta", orderItems: ["Dal Makhani", "Jeera Rice", "Tandoori Roti x3"], orderTotal: 870 },
  { id: 9, room: "glavna", status: "free", pax: 0 },
  { id: 10, room: "glavna", status: "occupied", pax: 2, occupiedSince: "10", customer: "Arjun Menon", orderItems: ["Mutton Rogan Josh", "Kulcha x2"], orderTotal: 1560 },
  { id: 11, room: "glavna", status: "free", pax: 0 },
  { id: 12, room: "glavna", status: "attention", pax: 4, occupiedSince: "38", customer: "Deepa Nair", orderItems: ["Fish Curry", "Appam x4", "Curd Rice"], orderTotal: 2100 },
  { id: 13, room: "glavna", status: "occupied", pax: 2, occupiedSince: "25", customer: "Suresh Kumar", orderItems: ["Kadai Paneer", "Garlic Naan x2"], orderTotal: 780 },
  { id: 14, room: "glavna", status: "free", pax: 0 },
  { id: 15, room: "glavna", status: "occupied", pax: 5, occupiedSince: "35", customer: "Meera Iyer", orderItems: ["Butter Chicken x2", "Dal Tadka", "Naan x5", "Jeera Rice"], orderTotal: 2890 },
  { id: 16, room: "glavna", status: "free", pax: 0 },
  // Terasa (8 tables)
  { id: 17, room: "terasa", status: "occupied", pax: 4, occupiedSince: "22", customer: "Kiran Rao", orderItems: ["Tandoori Platter", "Naan x4", "Mango Lassi x4"], orderTotal: 2450 },
  { id: 18, room: "terasa", status: "free", pax: 0 },
  { id: 19, room: "terasa", status: "occupied", pax: 2, occupiedSince: "18", customer: "Pooja Desai", orderItems: ["Paneer Butter Masala", "Pulao x2"], orderTotal: 920 },
  { id: 20, room: "terasa", status: "attention", pax: 6, occupiedSince: "42", customer: "Amit Joshi", orderItems: ["Hyderabadi Biryani x3", "Mirchi ka Salan", "Raita x3"], orderTotal: 3600 },
  { id: 21, room: "terasa", status: "free", pax: 0 },
  { id: 22, room: "terasa", status: "occupied", pax: 3, occupiedSince: "12", customer: "Ritu Saxena", orderItems: ["Chicken Tikka", "Roomali Roti x3"], orderTotal: 1100 },
  { id: 23, room: "terasa", status: "free", pax: 0 },
  { id: 24, room: "terasa", status: "occupied", pax: 2, occupiedSince: "28", customer: "Sanjay Verma", orderItems: ["Lamb Keema", "Paratha x2"], orderTotal: 1050 },
  // VIP (4 tables)
  { id: 25, room: "vip", status: "occupied", pax: 8, occupiedSince: "50", customer: "Corporate - Tata Group", orderItems: ["Royal Thali x8", "Mango Lassi x4", "Gulab Jamun x4"], orderTotal: 8400 },
  { id: 26, room: "vip", status: "occupied", pax: 6, occupiedSince: "32", customer: "Family - Kapoor", orderItems: ["Special Dinner for 6"], orderTotal: 5600 },
  { id: 27, room: "vip", status: "free", pax: 0 },
  { id: 28, room: "vip", status: "attention", pax: 4, occupiedSince: "60", customer: "Mr. Bhatia", orderItems: ["Chef's Special x4", "Wine Pairing"], orderTotal: 7200 },
  // Bar (4 tables)
  { id: 29, room: "bar", status: "occupied", pax: 2, occupiedSince: "15", customer: "Ravi & Swati", orderItems: ["Cocktails x4", "French Fries", "Chicken Wings"], orderTotal: 1800 },
  { id: 30, room: "bar", status: "free", pax: 0 },
  { id: 31, room: "bar", status: "occupied", pax: 3, occupiedSince: "25", customer: "Nikhil & Friends", orderItems: ["Beer x6", "Paneer Tikka", "Nachos"], orderTotal: 2400 },
  { id: 32, room: "bar", status: "free", pax: 0 },
];

// ── Tab 3: Kitchen / KOT ─────────────────────────────────

export type KOTStatus = "new" | "modified" | "cancelled" | "ready" | "preparing" | "served";
export type ProductionUnit = "Kuhinja 1" | "Kuhinja 2" | "Bar";

export interface KOTItem {
  name: string;
  qty: number;
  course?: string;
  comments?: string;
}

export interface KOTCard {
  id: string;
  orderNo: string;
  table: string;
  items: KOTItem[];
  timePlaced: string; // HH:MM
  elapsed: number; // minutes
  status: KOTStatus;
  production: ProductionUnit;
  kotType: "New Order" | "Order Modified" | "Partially cancelled";
}

export const kotCards: KOTCard[] = [
  {
    id: "KOT-0247",
    orderNo: "#042",
    table: "T1",
    items: [
      { name: "Butter Chicken", qty: 2, course: "Main Course" },
      { name: "Naan", qty: 4, course: "Breads" },
      { name: "Dal Makhani", qty: 1, course: "Main Course" },
    ],
    timePlaced: "21:42",
    elapsed: 3,
    status: "new",
    production: "Kuhinja 1",
    kotType: "New Order",
  },
  {
    id: "KOT-0246",
    orderNo: "#041",
    table: "T4",
    items: [
      { name: "Mixed Grill", qty: 1, course: "Starters" },
      { name: "Butter Naan", qty: 6, course: "Breads" },
      { name: "Raita", qty: 1, course: "Accompaniments" },
    ],
    timePlaced: "21:35",
    elapsed: 10,
    status: "preparing",
    production: "Kuhinja 1",
    kotType: "New Order",
  },
  {
    id: "KOT-0245",
    orderNo: "#040",
    table: "T3",
    items: [
      { name: "Paneer Tikka", qty: 1, course: "Starters", comments: "Extra spicy" },
      { name: "Biryani", qty: 2, course: "Rice" },
    ],
    timePlaced: "21:38",
    elapsed: 7,
    status: "modified",
    production: "Kuhinja 2",
    kotType: "Order Modified",
  },
  {
    id: "KOT-0244",
    orderNo: "#039",
    table: "T17",
    items: [
      { name: "Tandoori Platter", qty: 1, course: "Starters" },
      { name: "Naan", qty: 4, course: "Breads" },
      { name: "Mango Lassi", qty: 4, course: "Beverages" },
    ],
    timePlaced: "21:22",
    elapsed: 23,
    status: "ready",
    production: "Kuhinja 1",
    kotType: "New Order",
  },
  {
    id: "KOT-0243",
    orderNo: "#038",
    table: "Takeaway",
    items: [
      { name: "Chicken Biryani", qty: 3, course: "Rice" },
      { name: "Raita", qty: 3, course: "Accompaniments" },
    ],
    timePlaced: "21:28",
    elapsed: 17,
    status: "preparing",
    production: "Kuhinja 2",
    kotType: "New Order",
  },
  {
    id: "KOT-0242",
    orderNo: "#037",
    table: "T25",
    items: [
      { name: "Royal Thali", qty: 8, course: "Thali" },
      { name: "Gulab Jamun", qty: 4, course: "Desserts" },
    ],
    timePlaced: "21:15",
    elapsed: 30,
    status: "ready",
    production: "Kuhinja 1",
    kotType: "New Order",
  },
  {
    id: "KOT-0241",
    orderNo: "#036",
    table: "T29",
    items: [
      { name: "Cocktails", qty: 4, course: "Beverages" },
      { name: "French Fries", qty: 1, course: "Snacks" },
      { name: "Chicken Wings", qty: 1, course: "Starters" },
    ],
    timePlaced: "21:35",
    elapsed: 10,
    status: "new",
    production: "Bar",
    kotType: "New Order",
  },
  {
    id: "KOT-0240",
    orderNo: "#035",
    table: "T6",
    items: [
      { name: "Mutton Rogan Josh", qty: 1, course: "Main Course" },
      { name: "Kulcha", qty: 2, course: "Breads" },
    ],
    timePlaced: "21:08",
    elapsed: 37,
    status: "cancelled",
    production: "Kuhinja 1",
    kotType: "Partially cancelled",
  },
];

// ── Tab 4: P&L ───────────────────────────────────────────

export const plSummary = {
  grossSales: 124580,
  cogs: 56061,
  grossProfit: 68519,
  netProfit: 9966,
};

export const dailyPLData = [
  { day: "Pon", revenue: 98500, costs: 74200 },
  { day: "Tor", revenue: 112000, costs: 81200 },
  { day: "Sre", revenue: 89600, costs: 68400 },
  { day: "Čet", revenue: 105400, costs: 76800 },
  { day: "Pet", revenue: 132800, costs: 92400 },
  { day: "Sob", revenue: 145200, costs: 98600 },
  { day: "Ned", revenue: 124580, costs: 89614 },
];

export const expenseBreakdown = [
  { name: "COGS", value: 45, color: "#ef4444" },
  { name: "Direktni stroški", value: 15, color: "#f97316" },
  { name: "Stroški zaposlenih", value: 20, color: "#eab308" },
  { name: "Neposredni stroški", value: 12, color: "#8b5cf6" },
  { name: "Neto dobiček", value: 8, color: "#10b981" },
];

export const plLineItems = [
  { label: "Bruto prodaja", value: 124580, bold: true },
  { label: "COGS", value: -56061, bold: false },
  { label: "Bruto dobiček", value: 68519, bold: true },
  { label: "Stroški zaposlenih", value: -24916, bold: false },
  { label: "Direktni stroški", value: -18687, bold: false },
  { label: "Neposredni stroški", value: -14950, bold: false },
  { label: "Neto dobiček / Izguba", value: 9966, bold: true },
];

// ── Tab 5: API Explorer ──────────────────────────────────

export interface APIEndpoint {
  method: string;
  module: string;
  httpMethod: string;
  parameters: string;
  description: string;
  paramDetails?: { name: string; type: string; required: boolean; description: string }[];
  exampleResponse?: string;
}

export const apiEndpoints: APIEndpoint[] = [
  // POS API
  { method: "getRestaurantMenu", module: "ury_pos/api.py", httpMethod: "POST", parameters: "pos_profile, room?, order_type?", description: "Fetches restaurant menu items with images, rates, and courses based on POS profile, room, or order type", paramDetails: [{ name: "pos_profile", type: "string", required: true, description: "Name of the POS Profile" }, { name: "room", type: "string", required: false, description: "Room name for room-wise menu" }, { name: "order_type", type: "string", required: false, description: "Order type for type-wise menu" }], exampleResponse: '{ "items": [...], "modified_time": "2026-01-01 12:00:00", "name": "Spice Garden Menu" }' },
  { method: "getMenuCourses", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns all available menu courses (categories) from URY Menu Course doctype" },
  { method: "getBranch", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Gets the branch name associated with the current logged-in user via URY User mapping" },
  { method: "getBranchRoom", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns branch and room details for the current user" },
  { method: "getRoom", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns all rooms assigned to the current user across branches" },
  { method: "getModeOfPayment", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Fetches available modes of payment configured in the POS Profile" },
  { method: "getInvoiceForCashier", module: "ury_pos/api.py", httpMethod: "POST", parameters: "status, cashier, limit, limit_start", description: "Gets POS invoices filtered by status for a specific cashier with pagination", paramDetails: [{ name: "status", type: "string", required: true, description: "Draft / Unbilled / Recently Paid / Paid" }, { name: "cashier", type: "string", required: true, description: "Cashier user ID" }, { name: "limit", type: "int", required: true, description: "Page size" }, { name: "limit_start", type: "int", required: true, description: "Offset for pagination" }] },
  { method: "getPosInvoice", module: "ury_pos/api.py", httpMethod: "POST", parameters: "status, limit, limit_start", description: "Gets POS invoices filtered by status for the current branch with pagination" },
  { method: "searchPosInvoice", module: "ury_pos/api.py", httpMethod: "POST", parameters: "query, status", description: "Searches POS invoices by name, customer, or mobile number with status filter" },
  { method: "get_select_field_options", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns order type options from POS Invoice doctype metadata" },
  { method: "fav_items", module: "ury_pos/api.py", httpMethod: "POST", parameters: "customer", description: "Returns frequently ordered items for a specific customer based on past invoices", paramDetails: [{ name: "customer", type: "string", required: true, description: "Customer name" }] },
  { method: "getCashier", module: "ury_pos/api.py", httpMethod: "POST", parameters: "room", description: "Returns the cashier user assigned to a specific room from POS Opening Entry" },
  { method: "getPosProfile", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns full POS profile configuration including printer settings, cashier, QZ config, and feature flags" },
  { method: "getPosInvoiceItems", module: "ury_pos/api.py", httpMethod: "POST", parameters: "invoice", description: "Returns item details and tax breakdown for a specific POS Invoice" },
  { method: "posOpening", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Checks if a POS Opening Entry exists and is open for the current branch" },
  { method: "getAggregator", module: "ury_pos/api.py", httpMethod: "POST", parameters: "none", description: "Returns aggregator settings (Swiggy, Zomato etc.) configured for the branch" },
  { method: "getAggregatorItem", module: "ury_pos/api.py", httpMethod: "POST", parameters: "aggregator", description: "Returns menu items with prices for a specific aggregator's price list" },
  { method: "getAggregatorMOP", module: "ury_pos/api.py", httpMethod: "POST", parameters: "aggregator", description: "Returns mode of payment configured for a specific aggregator" },
  { method: "create_customer", module: "ury_pos/api.py", httpMethod: "POST", parameters: "customer_name, mobile_number, customer_group?, territory?", description: "Creates a new customer with phone validation", paramDetails: [{ name: "customer_name", type: "string", required: true, description: "Customer name" }, { name: "mobile_number", type: "string", required: true, description: "Valid mobile number" }, { name: "customer_group", type: "string", required: false, description: "Default: Individual" }, { name: "territory", type: "string", required: false, description: "Default: India" }] },
  { method: "validate_pos_close", module: "ury_pos/api.py", httpMethod: "POST", parameters: "pos_profile", description: "Validates if previous day's POS opening has been properly closed before allowing new operations" },
  // KOT API
  { method: "kot_execute", module: "ury/api/ury_kot_generate.py", httpMethod: "POST", parameters: "invoice_id, customer, restaurant_table?, current_items, previous_items, comments?", description: "Main KOT generation endpoint - compares current vs previous items, creates new/modified/cancel KOTs per production unit", paramDetails: [{ name: "invoice_id", type: "string", required: true, description: "POS Invoice ID" }, { name: "customer", type: "string", required: true, description: "Customer name" }, { name: "restaurant_table", type: "string", required: false, description: "Table ID" }, { name: "current_items", type: "JSON", required: true, description: "Current order items" }, { name: "previous_items", type: "JSON", required: true, description: "Previous order items for diff" }, { name: "comments", type: "string", required: false, description: "Order comments" }] },
  { method: "get_kot_list", module: "ury/api/ury_kot_display.py", httpMethod: "POST", parameters: "none", description: "Returns active KOT list for KDS display with production unit filtering and order type support" },
  { method: "serve_kot", module: "ury/api/ury_kot_display.py", httpMethod: "POST", parameters: "name, time", description: "Marks a KOT as served with production time tracking", paramDetails: [{ name: "name", type: "string", required: true, description: "KOT document name" }, { name: "time", type: "string", required: true, description: "Serve timestamp" }] },
  { method: "confirm_kot", module: "ury/api/ury_kot_display.py", httpMethod: "POST", parameters: "name, user", description: "Confirms/verifies a cancelled KOT by an authorized user" },
  { method: "get_production_units", module: "ury/api/ury_kot_display.py", httpMethod: "POST", parameters: "none", description: "Returns all production units for the current branch" },
  { method: "ury_kot_reprint", module: "ury/api/ury_kot_reprint.py", httpMethod: "POST", parameters: "invoice_number", description: "Reprints a KOT for a given invoice if enabled in POS Profile settings" },
  { method: "order_delay_notification", module: "ury/api/ury_kot_notification.py", httpMethod: "POST", parameters: "id", description: "Sends delay notification to configured recipients when a KOT exceeds the warning time threshold" },
  { method: "kotValidationThread", module: "ury/api/ury_kot_validation.py", httpMethod: "POST", parameters: "none", description: "Scheduled task (cron) that validates and auto-generates missing KOTs for invoices created in the last 5 minutes" },
  { method: "validate_priority", module: "ury/api/ury_menu_course_validation.py", httpMethod: "POST", parameters: "none", description: "Validates that serving priority is unique across menu courses" },
  { method: "cancel_check", module: "ury/api/button_permission.py", httpMethod: "POST", parameters: "none", description: "Checks if the current user has permission to cancel POS Invoices" },
  { method: "overrided_past_order_list", module: "ury/api/pos_extend.py", httpMethod: "POST", parameters: "search_term, status, limit?", description: "Overrides the default past order list with branch and room filtering for URY users" },
  // Print API
  { method: "network_printing", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "doctype, name, printer_setting, print_format?, doc?, no_letterhead?, file_path?", description: "Sends a document to a network printer via CUPS, handles invoice_printed and table status updates" },
  { method: "select_network_printer", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "pos_profile, invoice_id", description: "Selects the appropriate network printer (room-based or POS profile-based) for printing an invoice" },
  { method: "qz_print_update", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "invoice", description: "Updates invoice_printed status and table occupancy after QZ Tray printing" },
  { method: "print_pos_page", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "doctype, name, print_format", description: "Publishes print job via Frappe realtime (WebSocket) channel for browser-based printing" },
  { method: "qz_certificate", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "none", description: "Returns the QZ Tray certificate from site config for secure printing" },
  { method: "signature_promise", module: "ury/api/ury_print.py", httpMethod: "POST", parameters: "none", description: "Returns the QZ Tray private key from site config for signing print requests" },
];

// ── Tab 6: Architecture ──────────────────────────────────

export const frontendApps = [
  { name: "POS React", tech: "React + Vite", path: "ury/pos/", description: "Modern POS interface built with React, TypeScript, and Vite" },
  { name: "KOT Mosaic Vue", tech: "Vue 3 + Vite", path: "ury/URYMosaic/", description: "Kitchen Display System (KDS) built with Vue 3 for real-time KOT management" },
  { name: "POS v1 Vue", tech: "Vue 3 + Vite", path: "ury/urypos/", description: "Legacy POS interface built with Vue 3 for order management" },
];

export const backendComponents = [
  { name: "Frappe/ERPNext", description: "Core backend framework providing REST API, database ORM, authentication, and doctype management" },
];

export const infrastructureComponents = [
  { name: "MariaDB", description: "Primary database for all Frappe/ERPNext data" },
  { name: "Socket.io", description: "Real-time communication for KOT updates and print jobs" },
  { name: "QZ Tray", description: "Desktop utility for direct thermal printer communication" },
];

export const doctypes = [
  "URY Restaurant",
  "URY Room",
  "URY Table",
  "URY Menu",
  "URY Menu Item",
  "URY Menu Course",
  "URY Order",
  "URY Order Item",
  "URY KOT",
  "URY KOT Items",
  "URY KOT Error Log",
  "URY Production Unit",
  "URY Production Item Groups",
  "URY User",
  "URY Printer Settings",
  "URY Daily P&L",
  "URY P&L Breakup",
  "URY Cost of Goods",
  "URY Materials",
  "URY P&L Materials",
  "URY Fixed Expenses",
  "URY Variable Expenses",
  "URY Report Settings",
  "URY Notification Recipient",
  "Aggregator Settings",
  "Item Add On",
  "Menu for Room",
  "Multiple Rooms",
  "Order Type Menu",
  "POS Item Variants",
  "Role Permitted",
  "Sub POS Invoices",
  "Sub POS Closing",
  "Sub POS Closing Payment",
  "KDS Order Type",
];

export const docEventHooks = [
  { doctype: "POS Invoice", events: ["before_insert", "validate", "after_insert", "before_submit", "on_cancel", "on_trash"] },
  { doctype: "POS Profile", events: ["validate"] },
  { doctype: "Sales Invoice", events: ["before_insert", "on_update"] },
  { doctype: "Item", events: ["validate"] },
  { doctype: "POS Opening Entry", events: ["validate", "before_save", "before_insert"] },
  { doctype: "POS Closing Entry", events: ["before_save", "validate"] },
  { doctype: "URY Menu Course", events: ["validate"] },
];
