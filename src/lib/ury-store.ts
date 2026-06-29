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
  RESTAURANT_NAME,
  CURRENCY,
  type TableData,
  type KOTCard,
  type KOTStatus,
  type RecentOrder,
  type APIEndpoint,
} from '@/lib/mock-data';
import {
  getFrappeClient,
  saveConfig,
  loadConfig,
  clearConfig,
  type FrappeConfig,
} from '@/lib/frappe-client';
import {
  useURYSocket,
  type KOTNewEvent,
  type KOTStatusChangeEvent,
  type TableStatusChangeEvent,
} from '@/lib/use-ury-socket';

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
      });
    },

    refreshData: async () => {
      const { isConnected } = get();
      if (!isConnected) return;

      try {
        const client = getFrappeClient();

        // Fetch real data from Frappe
        // KOT list
        const kotResult = await client.getKOTList().catch(() => null);
        if (kotResult?.data) {
          // Transform Frappe KOT data to our format
          // This will be customized based on actual Frappe response structure
        }

        // Tables
        const tablesResult = await client.getRestaurantTables().catch(() => null);
        if (tablesResult?.data) {
          // Transform table data
        }

        // POS invoices for recent orders
        const invoicesResult = await client.getInvoiceForCashier('Paid', '', 10, 0).catch(() => null);
        if (invoicesResult?.data) {
          // Transform invoice data
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
  }));

export const useUIState = () =>
  useURYStore((s) => ({
    activeTab: s.activeTab,
    sidebarOpen: s.sidebarOpen,
    darkMode: s.darkMode,
  }));
