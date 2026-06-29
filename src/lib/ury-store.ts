// URY Dashboard Store — Zustand
// Centralized state management with real-time Socket.io updates
// Falls back to mock data when no Frappe backend is connected

import { create } from 'zustand';
import {
  kpiData,
  hourlySalesData,
  recentOrders,
  tablesData,
  rooms as mockRooms,
  kotCards as mockKotCards,
  plSummary,
  dailyPLData,
  expenseBreakdown,
  plLineItems,
  apiEndpoints,
  frontendApps,
  backendComponents,
  infrastructureComponents,
  doctypes,
  docEventHooks,
  mockCashiers,
  mockShiftInfo,
  RESTAURANT_NAME,
  CURRENCY,
} from '@/lib/mock-data';
import type {
  KPIs,
  HourlySales,
  RecentOrder,
  TableData,
  Room,
  KOTCard,
  KOTStatus,
  PLSummary,
  DailyPL,
  ExpenseBreakdown,
  PLLineItem,
  CashierData,
  ShiftInfo,
  APIEndpoint,
  FrontendApp,
  BackendComponent,
  InfrastructureComponent,
  DocEventHook,
} from '@/lib/ury-types';
export type {
  KPIs,
  HourlySales,
  RecentOrder,
  TableData,
  Room,
  KOTCard,
  KOTStatus,
  PLSummary,
  DailyPL,
  ExpenseBreakdown,
  PLLineItem,
  CashierData,
  ShiftInfo,
  APIEndpoint,
  FrontendApp,
  BackendComponent,
  InfrastructureComponent,
  DocEventHook,
  TableStatus,
  ProductionUnit,
  OrderStatus,
  OrderType,
  KOTItem,
  KOTType,
} from '@/lib/ury-types';
import {
  getFrappeClient,
  saveConfig,
  loadConfig,
  clearConfig,
  type FrappeConfig,
} from '@/lib/frappe-client';
import { reconnectSocket } from '@/lib/use-ury-socket';

// ── Auto-refresh interval (ms) ──────────────────────────
const REFRESH_INTERVAL = 30_000; // 30 seconds

// ── Types ────────────────────────────────────────────────

export interface DashboardState {
  // Connection
  frappeConfig: FrappeConfig | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  authenticatedUser: string | null;
  lastRefreshed: Date | null;
  isRefreshing: boolean;

  // Data
  restaurantName: string;
  currency: string;
  kpis: KPIs;
  hourlySales: HourlySales[];
  recentOrders: RecentOrder[];
  tables: TableData[];
  rooms: Room[];
  kotCards: KOTCard[];
  plSummary: PLSummary;
  dailyPL: DailyPL[];
  expenseBreakdown: ExpenseBreakdown[];
  plLineItems: PLLineItem[];
  apiEndpoints: APIEndpoint[];
  cashiers: CashierData[];
  shiftInfo: ShiftInfo;
  frontendApps: FrontendApp[];
  backendComponents: BackendComponent[];
  infrastructureComponents: InfrastructureComponent[];
  doctypes: string[];
  docEventHooks: DocEventHook[];

  // UI state
  activeTab: string;
  sidebarOpen: boolean;
  darkMode: boolean;

  // Actions
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setFrappeConfig: (config: FrappeConfig) => void;
  testConnection: () => Promise<boolean>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  disconnectBackend: () => void;
  refreshData: () => Promise<void>;
  refreshKPIs: () => Promise<void>;
  refreshPL: () => Promise<void>;
  refreshShift: () => Promise<void>;

  // KOT actions
  updateKOTStatus: (id: string, status: KOTStatus) => void;

  // Shift actions
  openShift: (openingBalance: number, openedBy: string) => void;
  closeShift: () => void;
  transferShift: (fromCashier: string, toCashier: string) => void;

  // Auto-refresh
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

// ── Toast Types ──────────────────────────────────────────

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

// ── Auto-refresh timer ──────────────────────────────────
let refreshTimer: ReturnType<typeof setInterval> | null = null;

// ── Toast auto-remove timer ─────────────────────────────
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

// ── Store ────────────────────────────────────────────────

export const useURYStore = create<DashboardState>((set, get) => {
  // Load saved config
  const savedConfig = typeof window !== 'undefined' ? loadConfig() : null;

  return {
    // Connection
    frappeConfig: savedConfig,
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    authenticatedUser: null,
    lastRefreshed: null,
    isRefreshing: false,

    // Data (mock defaults)
    restaurantName: RESTAURANT_NAME,
    currency: CURRENCY,
    kpis: { ...kpiData },
    hourlySales: [...hourlySalesData],
    recentOrders: [...recentOrders],
    tables: [...tablesData],
    rooms: [...mockRooms],
    kotCards: [...mockKotCards],
    plSummary: { ...plSummary },
    dailyPL: [...dailyPLData],
    expenseBreakdown: [...expenseBreakdown],
    plLineItems: [...plLineItems],
    apiEndpoints: [...apiEndpoints],
    cashiers: [...mockCashiers],
    shiftInfo: { ...mockShiftInfo },
    frontendApps: [...frontendApps],
    backendComponents: [...backendComponents],
    infrastructureComponents: [...infrastructureComponents],
    doctypes: [...doctypes],
    docEventHooks: [...docEventHooks],

    // UI state
    activeTab: 'overview',
    sidebarOpen: false,
    darkMode: false,

    // Toast notifications
    toasts: [],

    // ── Actions ────────────────────────────────────────

    setActiveTab: (tab) => set({ activeTab: tab }),

    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    toggleDarkMode: () => set((s) => {
      const newDark = !s.darkMode;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', newDark);
      }
      return { darkMode: newDark };
    }),

    setFrappeConfig: (config) => {
      saveConfig(config);
      const client = getFrappeClient();
      client.updateConfig(config);
      set({ frappeConfig: config, connectionError: null });
    },

    testConnection: async () => {
      set({ isConnecting: true, connectionError: null });
      try {
        const client = getFrappeClient();
        const config = get().frappeConfig;
        if (config) {
          client.updateConfig(config);
        }
        const ok = await client.ping();
        if (ok) {
          // Try to get logged-in user
          const user = await client.getLoggedInUser();
          set({
            isConnected: true,
            isConnecting: false,
            authenticatedUser: user,
          });
          // Reconnect socket to Frappe server
          reconnectSocket();
          // Fetch real data from Frappe
          get().refreshData();
          // Start auto-refresh
          get().startAutoRefresh();
          // Toast notification
          get().addToast({ type: 'success', title: 'Povezava uspešna', description: `Povezan s Frappe strežnikom${user ? ` kot ${user}` : ''}` });
          return true;
        }
        set({
          isConnected: false,
          isConnecting: false,
          connectionError: 'Ne morem vzpostaviti povezave s Frappe strežnikom',
        });
        get().addToast({ type: 'error', title: 'Povezava ni uspela', description: 'Ne morem vzpostaviti povezave s Frappe strežnikom' });
        return false;
      } catch (err) {
        set({
          isConnected: false,
          isConnecting: false,
          connectionError: err instanceof Error ? err.message : 'Napaka povezave',
        });
        get().addToast({ type: 'error', title: 'Napaka povezave', description: err instanceof Error ? err.message : 'Napaka povezave' });
        return false;
      }
    },

    login: async (username, password) => {
      set({ isConnecting: true, connectionError: null });
      try {
        const client = getFrappeClient();
        const config = get().frappeConfig;
        if (config) {
          client.updateConfig(config);
        }
        const result = await client.login(username, password);
        set({
          isConnected: true,
          isConnecting: false,
          authenticatedUser: result.user || result.full_name || username,
        });
        // Reconnect socket to Frappe server
        reconnectSocket();
        // Fetch real data from Frappe
        get().refreshData();
        // Start auto-refresh
        get().startAutoRefresh();
        get().addToast({ type: 'success', title: 'Prijava uspešna', description: `Dobrodošli, ${result.full_name || username}` });
        return true;
      } catch (err) {
        set({
          isConnecting: false,
          connectionError: err instanceof Error ? err.message : 'Prijava ni uspela',
        });
        get().addToast({ type: 'error', title: 'Prijava ni uspela', description: err instanceof Error ? err.message : 'Prijava ni uspela' });
        return false;
      }
    },

    logout: () => {
      get().stopAutoRefresh();
      set({
        isConnected: false,
        authenticatedUser: null,
        connectionError: null,
      });
    },

    disconnectBackend: () => {
      get().stopAutoRefresh();
      clearConfig();
      set({
        frappeConfig: null,
        isConnected: false,
        authenticatedUser: null,
        connectionError: null,
        lastRefreshed: null,
        isRefreshing: false,
        // Reset to mock data
        restaurantName: RESTAURANT_NAME,
        currency: CURRENCY,
        kpis: { ...kpiData },
        hourlySales: [...hourlySalesData],
        recentOrders: [...recentOrders],
        tables: [...tablesData],
        rooms: [...mockRooms],
        kotCards: [...mockKotCards],
        plSummary: { ...plSummary },
        dailyPL: [...dailyPLData],
        expenseBreakdown: [...expenseBreakdown],
        plLineItems: [...plLineItems],
        cashiers: [...mockCashiers],
        shiftInfo: { ...mockShiftInfo },
      });
    },

    // ── Main Data Refresh ──────────────────────────────

    refreshData: async () => {
      const { isConnected } = get();
      if (!isConnected) return;

      set({ isRefreshing: true });

      try {
        const client = getFrappeClient();

        // Run all fetches in parallel for better performance
        const [
          kotResult,
          tablesResult,
          invoicesResult,
          roomsResult,
          plResult,
          shiftResult,
        ] = await Promise.allSettled([
          client.getKOTList(),
          client.getRestaurantTables(),
          client.getInvoiceForCashier('Paid', '', 20, 0),
          client.getRestaurantRooms(),
          client.getDailyPL(),
          client.getPOSOpeningEntry('Open'),
        ]);

        // ── Process KOTs ────────────────────────────────
        if (kotResult.status === 'fulfilled' && kotResult.value?.data) {
          const transformedKOTs: KOTCard[] = Array.isArray(kotResult.value.data)
            ? kotResult.value.data.map((kot: Record<string, unknown>) => ({
                id: String(kot.name || kot.id || ''),
                orderNo: String(kot.order_no || kot.orderNo || ''),
                table: String(kot.restaurant_table || kot.table || ''),
                items: Array.isArray(kot.items)
                  ? kot.items.map((item: Record<string, unknown>) => ({
                      name: String(item.item_name || item.name || ''),
                      qty: Number(item.qty || 1),
                      course: item.course ? String(item.course) : undefined,
                      comments: item.comments ? String(item.comments) : undefined,
                    }))
                  : [],
                timePlaced: String(kot.time_placed || kot.timePlaced || ''),
                elapsed: Number(kot.elapsed || 0),
                status: (kot.status as KOTStatus) || 'new',
                production: String(kot.production_unit || kot.production || 'Kuhinja 1') as KOTCard['production'],
                kotType: (kot.kot_type || kot.kotType || 'New Order') as KOTCard['kotType'],
              }))
            : [];
          set({ kotCards: transformedKOTs });
        }

        // ── Process Tables ──────────────────────────────
        if (tablesResult.status === 'fulfilled' && tablesResult.value?.data) {
          const transformedTables: TableData[] = Array.isArray(tablesResult.value.data)
            ? tablesResult.value.data.map((t: Record<string, unknown>) => ({
                id: Number(t.name || t.id || 0),
                room: String(t.room || ''),
                status: (t.status as TableData['status']) || 'free',
                pax: Number(t.no_of_seats || t.pax || 0),
                occupiedSince: t.occupied_since ? String(t.occupied_since) : undefined,
                orderItems: t.order_items ? String(t.order_items).split(', ') : undefined,
                orderTotal: t.order_total ? Number(t.order_total) : undefined,
                customer: t.customer ? String(t.customer) : undefined,
              }))
            : [];
          set({ tables: transformedTables });
        }

        // ── Process Invoices → Recent Orders + KPIs ─────
        if (invoicesResult.status === 'fulfilled' && invoicesResult.value?.data) {
          const invoices = Array.isArray(invoicesResult.value.data)
            ? invoicesResult.value.data
            : [];

          // Recent orders
          const transformedOrders: RecentOrder[] = invoices.map((inv: Record<string, unknown>) => ({
            invoice: String(inv.name || ''),
            customer: String(inv.customer || ''),
            type: (inv.type === 'Dine-in' ? 'Dine-in' : inv.type === 'Takeaway' ? 'Takeaway' : 'Delivery') as RecentOrder['type'],
            amount: Number(inv.grand_total || 0),
            status: (inv.status as RecentOrder['status']) || 'Paid',
            time: inv.posting_time ? String(inv.posting_time).slice(0, 5) : '',
          }));
          set({ recentOrders: transformedOrders });

          // Compute KPIs from invoices
          const totalSales = invoices.reduce((sum: number, inv: Record<string, unknown>) => sum + Number(inv.grand_total || 0), 0);
          const totalOrders = invoices.length;
          const occupiedTables = invoices.filter((inv: Record<string, unknown>) => inv.type === 'Dine-in').length;
          const allTables = get().tables;
          set({
            kpis: {
              dailySales: totalSales,
              totalOrders,
              avgBill: totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0,
              occupiedTables,
              totalTables: allTables.length || 32,
            },
          });

          // Compute hourly sales from invoices
          const hourMap = new Map<string, { dineIn: number; takeaway: number }>();
          // Initialize all hours from 11:00 to 22:00
          for (let h = 11; h <= 22; h++) {
            const key = `${String(h).padStart(2, '0')}:00`;
            hourMap.set(key, { dineIn: 0, takeaway: 0 });
          }
          // Aggregate invoice totals by hour
          invoices.forEach((inv: Record<string, unknown>) => {
            const timeStr = String(inv.posting_time || '').slice(0, 5);
            if (!timeStr) return;
            const hour = timeStr.split(':')[0];
            const key = `${hour}:00`;
            const entry = hourMap.get(key);
            if (entry) {
              const amount = Number(inv.grand_total || 0);
              if (inv.type === 'Takeaway' || inv.type === 'Delivery') {
                entry.takeaway += amount;
              } else {
                entry.dineIn += amount;
              }
            }
          });
          const hourlyData: HourlySales[] = Array.from(hourMap.entries()).map(([hour, data]) => ({
            hour,
            dineIn: data.dineIn,
            takeaway: data.takeaway,
          }));
          if (hourlyData.length > 0) set({ hourlySales: hourlyData });
        }

        // ── Process Rooms ───────────────────────────────
        if (roomsResult.status === 'fulfilled' && roomsResult.value?.data) {
          const transformedRooms: Room[] = Array.isArray(roomsResult.value.data)
            ? roomsResult.value.data.map((r: Record<string, unknown>) => ({
                id: String(r.name || r.id || '').toLowerCase().replace(/\s+/g, '-'),
                name: String(r.room_name || r.name || ''),
                tables: Number(r.no_of_tables || r.tables || 0),
              }))
            : [];
          if (transformedRooms.length > 0) set({ rooms: transformedRooms });
        }

        // ── Process P&L ─────────────────────────────────
        if (plResult.status === 'fulfilled' && plResult.value?.data) {
          const plDocs = Array.isArray(plResult.value.data) ? plResult.value.data : [];
          if (plDocs.length > 0) {
            // Use the latest P&L document
            const latest = plDocs[0] as Record<string, unknown>;

            // P&L Summary
            const grossSales = Number(latest.gross_sales || latest.total_revenue || 0);
            const cogs = Number(latest.cogs || latest.cost_of_goods_sold || 0);
            const grossProfit = grossSales - cogs;
            const netProfit = Number(latest.net_profit || grossProfit - Number(latest.total_expenses || 0));
            set({
              plSummary: { grossSales, cogs, grossProfit, netProfit },
            });

            // Daily P&L from multiple docs
            const dailyData: DailyPL[] = plDocs.slice(0, 7).reverse().map((doc: Record<string, unknown>) => {
              const date = String(doc.date || doc.posting_date || '');
              const dayName = date
                ? new Date(date).toLocaleDateString('sl-SI', { weekday: 'short' })
                : '';
              return {
                day: dayName,
                revenue: Number(doc.gross_sales || doc.total_revenue || 0),
                costs: Number(doc.cogs || doc.total_expenses || 0),
              };
            });
            if (dailyData.length > 0) set({ dailyPL: dailyData });

            // Expense breakdown — try to extract from P&L doc
            const breakdownData: ExpenseBreakdown[] = [];
            if (latest.breakup || latest.expense_breakdown) {
              const items = Array.isArray(latest.breakup || latest.expense_breakdown)
                ? (latest.breakup || latest.expense_breakdown) as Record<string, unknown>[]
                : [];
              const colors = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#10b981'];
              items.forEach((item, i) => {
                breakdownData.push({
                  name: String(item.expense_type || item.category || item.name || ''),
                  value: Number(item.percentage || item.value || 0),
                  color: colors[i % colors.length],
                });
              });
            }
            if (breakdownData.length > 0) set({ expenseBreakdown: breakdownData });

            // Line items
            const lines: PLLineItem[] = [];
            if (latest.breakup || latest.line_items) {
              const items = Array.isArray(latest.breakup || latest.line_items)
                ? (latest.breakup || latest.line_items) as Record<string, unknown>[]
                : [];
              items.forEach((item) => {
                lines.push({
                  label: String(item.label || item.expense_type || item.name || ''),
                  value: Number(item.amount || item.value || 0),
                  bold: Boolean(item.is_total || item.bold || false),
                });
              });
            }
            if (lines.length > 0) set({ plLineItems: lines });
          }
        }

        // ── Process Shift / Cashier ─────────────────────
        if (shiftResult.status === 'fulfilled' && shiftResult.value?.data) {
          const openings = Array.isArray(shiftResult.value.data) ? shiftResult.value.data : [];
          if (openings.length > 0) {
            const latestOpening = openings[0] as Record<string, unknown>;
            const openedAt = String(latestOpening.period_start || latestOpening.opening_time || '').slice(0, 5);
            const openedBy = String(latestOpening.user || latestOpening.opened_by || '');
            const openingBalance = Number(latestOpening.opening_amount || latestOpening.balance_details?.[0]?.amount || 0);

            set({
              shiftInfo: {
                status: 'open',
                openedAt: openedAt || '09:00',
                closesAt: '23:00',
                openedBy: openedBy || 'Administrator',
                openingBalance,
              },
            });

            // Build cashier data from POS opening entry
            const cashierList: CashierData[] = [];
            const balanceRows = Array.isArray(latestOpening.balance_details)
              ? latestOpening.balance_details as Record<string, unknown>[]
              : [];
            if (balanceRows.length > 0) {
              balanceRows.forEach((row) => {
                cashierList.push({
                  name: String(row.user || openedBy || 'Cashier'),
                  role: 'URY Cashier',
                  openedAt: openedAt || '09:00',
                  status: 'active',
                  openingBalance: Number(row.opening_amount || 0),
                  currentTotal: Number(row.closing_amount || row.opening_amount || 0),
                  cashPayments: Number(row.cash_amount || 0),
                  cardPayments: Number(row.card_amount || 0),
                  upiPayments: Number(row.upi_amount || 0),
                  ordersProcessed: Number(row.orders_processed || 0),
                  room: String(row.room || 'Glavna dvorana'),
                });
              });
            }
            if (cashierList.length > 0) set({ cashiers: cashierList });
          } else {
            // No open shift found
            set({
              shiftInfo: {
                status: 'closed',
                openedAt: '',
                closesAt: '',
                openedBy: '',
                openingBalance: 0,
              },
            });
          }
        }

        // Mark refresh time
        set({ lastRefreshed: new Date(), isRefreshing: false });
      } catch (err) {
        console.error('Failed to refresh data:', err);
        set({ isRefreshing: false });
      }
    },

    // ── Targeted Refresh: KPIs only ────────────────────
    refreshKPIs: async () => {
      const { isConnected } = get();
      if (!isConnected) return;

      try {
        const client = getFrappeClient();
        const invoicesResult = await client.getInvoiceForCashier('Paid', '', 50, 0).catch(() => null);
        if (invoicesResult?.data && Array.isArray(invoicesResult.data)) {
          const invoices = invoicesResult.data as Record<string, unknown>[];
          const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.grand_total || 0), 0);
          const totalOrders = invoices.length;
          const occupiedTables = invoices.filter((inv) => inv.type === 'Dine-in').length;
          const allTables = get().tables;
          set({
            kpis: {
              dailySales: totalSales,
              totalOrders,
              avgBill: totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0,
              occupiedTables,
              totalTables: allTables.length || 32,
            },
          });
        }
      } catch (err) {
        console.error('Failed to refresh KPIs:', err);
      }
    },

    // ── Targeted Refresh: P&L only ─────────────────────
    refreshPL: async () => {
      const { isConnected } = get();
      if (!isConnected) return;

      try {
        const client = getFrappeClient();
        const plResult = await client.getDailyPL().catch(() => null);
        if (plResult?.data && Array.isArray(plResult.data)) {
          const plDocs = plResult.data as Record<string, unknown>[];
          if (plDocs.length > 0) {
            const latest = plDocs[0];
            const grossSales = Number(latest.gross_sales || latest.total_revenue || 0);
            const cogs = Number(latest.cogs || latest.cost_of_goods_sold || 0);
            const grossProfit = grossSales - cogs;
            const netProfit = Number(latest.net_profit || grossProfit - Number(latest.total_expenses || 0));
            set({ plSummary: { grossSales, cogs, grossProfit, netProfit } });

            const dailyData: DailyPL[] = plDocs.slice(0, 7).reverse().map((doc) => {
              const date = String(doc.date || doc.posting_date || '');
              return {
                day: date ? new Date(date).toLocaleDateString('sl-SI', { weekday: 'short' }) : '',
                revenue: Number(doc.gross_sales || doc.total_revenue || 0),
                costs: Number(doc.cogs || doc.total_expenses || 0),
              };
            });
            if (dailyData.length > 0) set({ dailyPL: dailyData });
          }
        }
      } catch (err) {
        console.error('Failed to refresh P&L:', err);
      }
    },

    // ── Targeted Refresh: Shift only ───────────────────
    refreshShift: async () => {
      const { isConnected } = get();
      if (!isConnected) return;

      try {
        const client = getFrappeClient();
        const shiftResult = await client.getPOSOpeningEntry('Open').catch(() => null);
        if (shiftResult?.data && Array.isArray(shiftResult.data)) {
          const openings = shiftResult.data as Record<string, unknown>[];
          if (openings.length > 0) {
            const latestOpening = openings[0];
            const openedAt = String(latestOpening.period_start || latestOpening.opening_time || '').slice(0, 5);
            const openedBy = String(latestOpening.user || latestOpening.opened_by || '');
            const openingBalance = Number(latestOpening.opening_amount || 0);
            set({
              shiftInfo: {
                status: 'open',
                openedAt: openedAt || '09:00',
                closesAt: '23:00',
                openedBy: openedBy || 'Administrator',
                openingBalance,
              },
            });
          } else {
            set({
              shiftInfo: {
                status: 'closed',
                openedAt: '',
                closesAt: '',
                openedBy: '',
                openingBalance: 0,
              },
            });
          }
        }
      } catch (err) {
        console.error('Failed to refresh shift:', err);
      }
    },

    updateKOTStatus: (id, status) => {
      set((s) => ({
        kotCards: s.kotCards.map((c) =>
          c.id === id ? { ...c, status } : c
        ),
      }));

      // If connected to backend, also push the status change
      const { isConnected } = get();
      if (isConnected) {
        const client = getFrappeClient();
        if (status === 'served') {
          client.serveKOT(id, new Date().toISOString()).catch(console.error);
        } else if (status === 'preparing') {
          // Could call a confirm/update endpoint
        }
      }
    },

    openShift: (openingBalance, openedBy) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
      set({
        shiftInfo: {
          status: 'open',
          openedAt: timeStr,
          closesAt: '23:00',
          openedBy,
          openingBalance,
        },
      });

      // If connected, call Frappe POS Opening
      if (get().isConnected) {
        const client = getFrappeClient();
        client.posOpening().catch(console.error);
      }
    },

    closeShift: () => {
      set((s) => ({
        shiftInfo: {
          ...s.shiftInfo,
          status: 'closed',
        },
      }));
    },

    transferShift: (fromCashier) => {
      set((s) => ({
        cashiers: s.cashiers.map((c) =>
          c.name === fromCashier ? { ...c, status: 'closing' as const } : c
        ),
      }));
    },

    // ── Auto-Refresh ───────────────────────────────────

    startAutoRefresh: () => {
      if (refreshTimer) return; // Already running
      refreshTimer = setInterval(() => {
        const { isConnected } = get();
        if (isConnected) {
          get().refreshData();
        } else {
          get().stopAutoRefresh();
        }
      }, REFRESH_INTERVAL);
    },

    stopAutoRefresh: () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    },

    // ── Toast Notifications ──────────────────────────────

    addToast: (toast) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const duration = toast.duration ?? 5000;
      set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));

      // Auto-remove after duration
      const timer = setTimeout(() => {
        get().removeToast(id);
        toastTimers.delete(id);
      }, duration);
      toastTimers.set(id, timer);
    },

    removeToast: (id) => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      const timer = toastTimers.get(id);
      if (timer) {
        clearTimeout(timer);
        toastTimers.delete(id);
      }
    },
  };
});

// ── Selector Hooks ───────────────────────────────────────

export const useConnectionStatus = () =>
  useURYStore((s) => ({
    isConnected: s.isConnected,
    isConnecting: s.isConnecting,
    connectionError: s.connectionError,
    authenticatedUser: s.authenticatedUser,
    frappeConfig: s.frappeConfig,
    lastRefreshed: s.lastRefreshed,
    isRefreshing: s.isRefreshing,
  }));

export const useDashboardData = () =>
  useURYStore((s) => ({
    restaurantName: s.restaurantName,
    currency: s.currency,
    kpis: s.kpis,
    hourlySales: s.hourlySales,
    recentOrders: s.recentOrders,
    tables: s.tables,
    rooms: s.rooms,
    kotCards: s.kotCards,
    plSummary: s.plSummary,
    dailyPL: s.dailyPL,
    expenseBreakdown: s.expenseBreakdown,
    plLineItems: s.plLineItems,
    apiEndpoints: s.apiEndpoints,
    cashiers: s.cashiers,
    shiftInfo: s.shiftInfo,
  }));

export const useUIState = () =>
  useURYStore((s) => ({
    activeTab: s.activeTab,
    sidebarOpen: s.sidebarOpen,
    darkMode: s.darkMode,
  }));
