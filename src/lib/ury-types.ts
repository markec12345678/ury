// URY Dashboard — Shared Type Definitions
// All domain types used across the dashboard, store, and components.
// Separated from mock data for clean architecture.

// ── Overview ─────────────────────────────────────────────

export interface KPIs {
  dailySales: number;
  totalOrders: number;
  avgBill: number;
  occupiedTables: number;
  totalTables: number;
}

export interface HourlySales {
  hour: string;
  dineIn: number;
  takeaway: number;
}

export type OrderStatus = 'Draft' | 'Paid' | 'Cancelled';
export type OrderType = 'Dine-in' | 'Takeaway' | 'Delivery';

export interface RecentOrder {
  invoice: string;
  customer: string;
  type: OrderType;
  amount: number;
  status: OrderStatus;
  time: string;
}

// ── Tables ──────────────────────────────────────────────

export type TableStatus = 'free' | 'occupied' | 'attention' | 'active';

export interface TableData {
  id: number;
  room: string;
  status: TableStatus;
  pax: number;
  occupiedSince?: string;
  orderItems?: string[];
  orderTotal?: number;
  customer?: string;
}

export interface Room {
  id: string;
  name: string;
  tables: number;
}

// ── Kitchen / KOT ───────────────────────────────────────

export type KOTStatus = 'new' | 'modified' | 'cancelled' | 'ready' | 'preparing' | 'served';
export type ProductionUnit = 'Kuhinja 1' | 'Kuhinja 2' | 'Bar';
export type KOTType = 'New Order' | 'Order Modified' | 'Partially cancelled';

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
  timePlaced: string;
  elapsed: number;
  status: KOTStatus;
  production: ProductionUnit;
  kotType: KOTType;
}

// ── P&L ─────────────────────────────────────────────────

export interface PLSummary {
  grossSales: number;
  cogs: number;
  grossProfit: number;
  netProfit: number;
}

export interface DailyPL {
  day: string;
  revenue: number;
  costs: number;
}

export interface ExpenseBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface PLLineItem {
  label: string;
  value: number;
  bold: boolean;
}

// ── Shift / Cashier ─────────────────────────────────────

export interface CashierData {
  name: string;
  role: string;
  openedAt: string;
  status: 'active' | 'closing';
  openingBalance: number;
  currentTotal: number;
  cashPayments: number;
  cardPayments: number;
  upiPayments: number;
  ordersProcessed: number;
  room: string;
}

export interface ShiftInfo {
  status: 'open' | 'closed';
  openedAt: string;
  closesAt: string;
  openedBy: string;
  openingBalance: number;
}

// ── Menu ─────────────────────────────────────────────────

export interface MenuCourse {
  id: string;
  name: string;
  priority: number;
  itemCount: number;
}

export interface MenuItem {
  id: string;
  name: string;
  nameHi?: string;        // Hindi/local name
  course: string;          // Course category ID
  courseName: string;      // Course display name
  price: number;
  image?: string;
  description?: string;
  isVeg: boolean;
  isAvailable: boolean;
  modifiers?: ItemModifier[];
  tags?: string[];
}

export interface ItemModifier {
  name: string;
  options: string[];
  required: boolean;
}

// ── Orders ───────────────────────────────────────────────

export type ActiveOrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface ActiveOrder {
  id: string;
  invoiceNo: string;
  table?: string;
  customer: string;
  type: OrderType;
  items: OrderItem[];
  status: ActiveOrderStatus;
  total: number;
  placedAt: string;
  elapsed: number;
  cashier: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  course?: string;
  comments?: string;
  status?: 'pending' | 'preparing' | 'ready' | 'served';
}

// ── API Explorer ────────────────────────────────────────

export interface APIEndpoint {
  method: string;
  module: string;
  httpMethod: string;
  parameters: string;
  description: string;
  paramDetails?: { name: string; type: string; required: boolean; description: string }[];
  exampleResponse?: string;
}

// ── Architecture ────────────────────────────────────────

export interface FrontendApp {
  name: string;
  tech: string;
  path: string;
  description: string;
}

export interface BackendComponent {
  name: string;
  description: string;
}

export interface InfrastructureComponent {
  name: string;
  description: string;
}

export interface DocEventHook {
  doctype: string;
  events: string[];
}

// ── Menu Management (CRUD) ──────────────────────────────

export type MenuFormMode = 'create' | 'edit';

export interface MenuFormData {
  name: string;
  nameLocal?: string;
  course: string;
  price: number;
  description?: string;
  isVeg: boolean;
  isAvailable: boolean;
  tags?: string[];
  modifiers?: ItemModifier[];
}

export interface CourseFormData {
  name: string;
  priority: number;
}

// ── Advanced Dashboard ─────────────────────────────────

export type DashboardPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'quarter';

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  occupancyRate: number;
  revenueGrowth: number;      // percentage vs previous period
  ordersGrowth: number;
  avgOrderGrowth: number;
  occupancyGrowth: number;
}

export interface SalesTrendPoint {
  label: string;              // date or hour label
  revenue: number;
  orders: number;
}

export interface TopSellingItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  course: string;
  isVeg: boolean;
}

export interface PaymentMethodSplit {
  method: string;             // Gotovina, Kartica, UPI
  count: number;
  amount: number;
  color: string;
}

export interface HourlyHeatmapPoint {
  day: string;                // Mon, Tue, ...
  hour: number;               // 0–23
  value: number;              // revenue or orders
}

// ── Report Generator ───────────────────────────────────

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface ReportSummary {
  period: ReportPeriod;
  periodLabel: string;        // e.g. "30. junij 2026" or "23.–29. junij 2026"
  dateFrom: string;
  dateTo: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalDiscounts: number;
  totalCancellations: number;
  netRevenue: number;
  topItems: TopSellingItem[];
  dailyBreakdown: SalesTrendPoint[];
  paymentSplit: PaymentMethodSplit[];
  orderTypeSplit: { type: string; count: number; revenue: number }[];
  courseRevenue: { course: string; revenue: number; items: number }[];
}
