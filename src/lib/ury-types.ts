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
