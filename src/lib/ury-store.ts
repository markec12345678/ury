// URY Dashboard Store — Zustand
// Centralized state management with real-time Socket.io updates
// Falls back to mock data when no Frappe backend is connected

import { create } from 'zustand';
import {
  kpiData,
  hourlySalesData,
  recentOrders,
  tablesData,
  rooms,
  kotCards,
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
  type TableData,
  type KOTCard,
  type KOTStatus,
  type RecentOrder,
  type APIEndpoint,
  type CashierData,
  type ShiftInfo,
} from '@/lib/mock-data';
import {
  getFrappeClient,
  saveConfig,
  loadConfig,
  clearConfig,
  type FrappeConfig,
} from '@/lib/frappe-client';
import { reconnectSocket } from '@/lib/use-ury-socket';

// ── Types ────────────────────────────────────────────────

export interface DashboardState {
  // Connection
  frappeConfig: FrappeConfig | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  authenticatedUser: string | null;

  // Data
  restaurantName: string;
  currency: string;
  kpis: typeof kpiData;
  hourlySales: typeof hourlySalesData;
  recentOrders: RecentOrder[];
  tables: TableData[];
  rooms: typeof rooms;
  kotCards: KOTCard[];
  plSummary: typeof plSummary;
  dailyPL: typeof dailyPLData;
  expenseBreakdown: typeof expenseBreakdown;
  plLineItems: typeof plLineItems;
  apiEndpoints: APIEndpoint[];
  cashiers: CashierData[];
  shiftInfo: ShiftInfo;
  frontendApps: typeof frontendApps;
  backendComponents: typeof backendComponents;
  infrastructureComponents: typeof infrastructureComponents;
  doctypes: typeof doctypes;
  docEventHooks: typeof docEventHooks;

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

  // KOT actions
  updateKOTStatus: (id: string, status: KOTStatus) => void;

  // Shift actions
  openShift: (openingBalance: number, openedBy: string) => void;
  closeShift: () => void;
  transferShift: (fromCashier: string, toCashier: string) => void;

  // Real-time listeners (called from components)
  subscribeToRealtime: () => void;
  unsubscribeFromRealtime: () => void;
}

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

    // Data (mock defaults)
    restaurantName: RESTAURANT_NAME,
    currency: CURRENCY,
    kpis: { ...kpiData },
    hourlySales: [...hourlySalesData],
    recentOrders: [...recentOrders],
    tables: [...tablesData],
    rooms: [...rooms],
    kotCards: [...kotCards],
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
          return true;
        }
        set({
          isConnected: false,
          isConnecting: false,
          connectionError: 'Ne morem vzpostaviti povezave s Frappe strežnikom',
        });
        return false;
      } catch (err) {
        set({
          isConnected: false,
          isConnecting: false,
          connectionError: err instanceof Error ? err.message : 'Napaka povezave',
        });
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
        return true;
      } catch (err) {
        set({
          isConnecting: false,
          connectionError: err instanceof Error ? err.message : 'Prijava ni uspela',
        });
        return false;
      }
    },

    logout: () => {
      set({
        isConnected: false,
        authenticatedUser: null,
        connectionError: null,
      });
    },

    disconnectBackend: () => {
      clearConfig();
      set({
        frappeConfig: null,
        isConnected: false,
        authenticatedUser: null,
        connectionError: null,
        // Reset to mock data
        restaurantName: RESTAURANT_NAME,
        currency: CURRENCY,
        kpis: { ...kpiData },
        hourlySales: [...hourlySalesData],
        recentOrders: [...recentOrders],
        tables: [...tablesData],
        kotCards: [...kotCards],
        cashiers: [...mockCashiers],
        shiftInfo: { ...mockShiftInfo },
      });
    },

    refreshData: async () => {
      const { isConnected } = get();
      if (!isConnected) return;

      try {
        const client = getFrappeClient();

        // Fetch KOT list
        const kotResult = await client.getKOTList().catch(() => null);
        if (kotResult?.data) {
          const transformedKOTs: KOTCard[] = Array.isArray(kotResult.data)
            ? kotResult.data.map((kot: Record<string, unknown>) => ({
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

        // Fetch tables
        const tablesResult = await client.getRestaurantTables().catch(() => null);
        if (tablesResult?.data) {
          const transformedTables: TableData[] = Array.isArray(tablesResult.data)
            ? tablesResult.data.map((t: Record<string, unknown>) => ({
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

        // Fetch POS invoices for recent orders
        const invoicesResult = await client.getInvoiceForCashier('Paid', '', 10, 0).catch(() => null);
        if (invoicesResult?.data) {
          const transformedOrders: RecentOrder[] = Array.isArray(invoicesResult.data)
            ? invoicesResult.data.map((inv: Record<string, unknown>) => ({
                invoice: String(inv.name || ''),
                customer: String(inv.customer || ''),
                type: (inv.type === 'Dine-in' ? 'Dine-in' : inv.type === 'Takeaway' ? 'Takeaway' : 'Delivery') as RecentOrder['type'],
                amount: Number(inv.grand_total || 0),
                status: (inv.status as RecentOrder['status']) || 'Paid',
                time: inv.posting_time ? String(inv.posting_time).slice(0, 5) : '',
              }))
            : [];
          set({ recentOrders: transformedOrders });
        }

        // Fetch rooms
        const roomsResult = await client.getRestaurantRooms().catch(() => null);
        if (roomsResult?.data) {
          const transformedRooms = Array.isArray(roomsResult.data)
            ? roomsResult.data.map((r: Record<string, unknown>) => ({
                id: String(r.name || r.id || '').toLowerCase().replace(/\s+/g, '-'),
                name: String(r.room_name || r.name || ''),
                tables: Number(r.no_of_tables || r.tables || 0),
              }))
            : [];
          if (transformedRooms.length > 0) set({ rooms: transformedRooms });
        }

        // Fetch production units for kitchen
        const unitsResult = await client.getProductionUnits().catch(() => null);
        if (unitsResult?.data) {
          // Could be used to dynamically populate production units
        }
      } catch (err) {
        console.error('Failed to refresh data:', err);
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
      if (isConnected && status === 'served') {
        const client = getFrappeClient();
        client.serveKOT(id, new Date().toISOString()).catch(console.error);
      }
    },

    openShift: (openingBalance, openedBy) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
      set((s) => ({
        shiftInfo: {
          status: 'open',
          openedAt: timeStr,
          closesAt: '23:00',
          openedBy,
          openingBalance,
        },
      }));

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

    transferShift: (fromCashier, toCashier) => {
      // In a real system this would call Frappe API to transfer
      set((s) => ({
        cashiers: s.cashiers.map((c) =>
          c.name === fromCashier ? { ...c, status: 'closing' as const } : c
        ),
      }));
    },

    subscribeToRealtime: () => {
      // This will be called from components that use the socket hook
      // The actual subscription happens via useURYSocket hook
    },

    unsubscribeFromRealtime: () => {
      // Cleanup handled by useURYSocket hook
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
