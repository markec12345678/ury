import { create } from 'zustand';
import { logger } from '../lib/logger';
import { t } from '../i18n';
import {
  getDashboardSummary,
  getRevenueChart,
  getOrdersChart,
  getCategorySalesChart,
  getPaymentMethodChart,
  getTableOccupancy,
  getLiveMetrics,
  DashboardSummary,
  RevenueChartData,
  CategorySalesData,
  PaymentMethodChartData,
  OrdersChartData,
  TableOccupancy,
  LiveMetrics,
  DashboardPeriod,
  ChartGranularity,
} from '../lib/dashboard-api';

// ---- Previous Period Helper ----

export function getPreviousPeriod(period: DashboardPeriod): DashboardPeriod {
  const mapping: Record<DashboardPeriod, DashboardPeriod> = {
    today: 'yesterday',
    yesterday: 'today', // fallback - no "day before yesterday" period
    this_week: 'last_week',
    last_week: 'last_7_days', // approximate fallback
    this_month: 'last_month',
    last_month: 'last_30_days', // approximate fallback
    last_7_days: 'last_7_days', // will use custom date range in practice
    last_30_days: 'last_30_days',
    last_90_days: 'last_90_days',
  };
  return mapping[period] || 'yesterday';
}

interface DashboardState {
  summary: DashboardSummary | null;
  previousSummary: DashboardSummary | null;
  revenueChart: RevenueChartData | null;
  ordersChart: OrdersChartData | null;
  categorySales: CategorySalesData | null;
  paymentMethodChart: PaymentMethodChartData | null;
  tableOccupancy: TableOccupancy | null;
  liveMetrics: LiveMetrics | null;
  selectedPeriod: DashboardPeriod;
  selectedGranularity: ChartGranularity;
  loading: boolean;
  liveLoading: boolean;
  error: string | null;
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  partialErrors: string[];
  _autoRefreshTimer: ReturnType<typeof setInterval> | null;
}

interface DashboardActions {
  fetchSummary: (period?: DashboardPeriod) => Promise<void>;
  fetchPreviousSummary: (period?: DashboardPeriod) => Promise<void>;
  fetchRevenueChart: (period?: DashboardPeriod, granularity?: ChartGranularity) => Promise<void>;
  fetchOrdersChart: (period?: DashboardPeriod) => Promise<void>;
  fetchCategorySales: (period?: DashboardPeriod) => Promise<void>;
  fetchPaymentMethodChart: (period?: DashboardPeriod) => Promise<void>;
  fetchTableOccupancy: () => Promise<void>;
  fetchLiveMetrics: () => Promise<void>;
  fetchAll: (period?: DashboardPeriod) => Promise<void>;
  setSelectedPeriod: (period: DashboardPeriod) => void;
  setSelectedGranularity: (granularity: ChartGranularity) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (seconds: number) => void;
  /** Stop the auto-refresh interval. Call on unmount. */
  stopAutoRefresh: () => void;
}

export const useDashboardStore = create<DashboardState & DashboardActions>(
  (set, get) => ({
    summary: null,
    previousSummary: null,
    revenueChart: null,
    ordersChart: null,
    categorySales: null,
    paymentMethodChart: null,
    tableOccupancy: null,
    liveMetrics: null,
    selectedPeriod: 'today',
    selectedGranularity: 'daily',
    loading: false,
    liveLoading: false,
    error: null,
    autoRefresh: false,
    refreshInterval: 30,
    partialErrors: [],
    _autoRefreshTimer: null,

    fetchSummary: async (period) => {
      const p = period || get().selectedPeriod;
      try {
        const summary = await getDashboardSummary(p);
        set({ summary });
      } catch (error) {
        // R41-FIX: Set error state so the UI can display the failure.
        // Previously errors were only logged, leaving the UI showing stale
        // or null data with no indication something went wrong.
        logger.error('Failed to fetch dashboard summary:', error);
        set({ error: t('dashboard.failed_load_summary') });
      }
    },

    fetchPreviousSummary: async (period) => {
      const currentPeriod = period || get().selectedPeriod;
      const previousPeriod = getPreviousPeriod(currentPeriod);
      try {
        const previousSummary = await getDashboardSummary(previousPeriod);
        set({ previousSummary });
      } catch (error) {
        logger.error('Failed to fetch previous period summary:', error);
        set({ previousSummary: null });
      }
    },

    fetchRevenueChart: async (period, granularity) => {
      const p = period || get().selectedPeriod;
      const g = granularity || get().selectedGranularity;
      try {
        const revenueChart = await getRevenueChart(p, g);
        set({ revenueChart });
      } catch (error) {
        logger.error('Failed to fetch revenue chart:', error);
        // R44-FIX: Record partial error so UI can indicate failure
        set((s) => ({ partialErrors: [...s.partialErrors, t('dashboard.failed_load_revenue_chart')] }));
      }
    },

    fetchOrdersChart: async (period) => {
      const p = period || get().selectedPeriod;
      try {
        const ordersChart = await getOrdersChart(p);
        set({ ordersChart });
      } catch (error) {
        logger.error('Failed to fetch orders chart:', error);
        set((s) => ({ partialErrors: [...s.partialErrors, t('dashboard.failed_load_orders_chart')] }));
      }
    },

    fetchCategorySales: async (period) => {
      const p = period || get().selectedPeriod;
      try {
        const categorySales = await getCategorySalesChart(p);
        set({ categorySales });
      } catch (error) {
        logger.error('Failed to fetch category sales:', error);
        set((s) => ({ partialErrors: [...s.partialErrors, t('dashboard.failed_load_category_sales')] }));
      }
    },

    fetchPaymentMethodChart: async (period) => {
      const p = period || get().selectedPeriod;
      try {
        const paymentMethodChart = await getPaymentMethodChart(p);
        set({ paymentMethodChart });
      } catch (error) {
        logger.error('Failed to fetch payment method chart:', error);
        set((s) => ({ partialErrors: [...s.partialErrors, t('dashboard.failed_load_payment_chart')] }));
      }
    },

    fetchTableOccupancy: async () => {
      try {
        const tableOccupancy = await getTableOccupancy();
        set({ tableOccupancy });
      } catch (error) {
        logger.error('Failed to fetch table occupancy:', error);
        set((s) => ({ partialErrors: [...s.partialErrors, t('dashboard.failed_load_table_occupancy')] }));
      }
    },

    fetchLiveMetrics: async () => {
      try {
        set({ liveLoading: true });
        const liveMetrics = await getLiveMetrics();
        set({ liveMetrics, liveLoading: false });
      } catch (error) {
        set((s) => ({
          liveLoading: false,
          partialErrors: [...s.partialErrors, t('dashboard.failed_load_live_metrics')],
        }));
        logger.error('Failed to fetch live metrics:', error);
      }
    },

    fetchAll: async (period) => {
      const p = period || get().selectedPeriod;
      try {
        set({ loading: true, error: null, partialErrors: [] });
        const results = await Promise.allSettled([
          get().fetchSummary(p),
          get().fetchPreviousSummary(p),
          get().fetchRevenueChart(p),
          get().fetchOrdersChart(p),
          get().fetchCategorySales(p),
          get().fetchPaymentMethodChart(p),
          get().fetchTableOccupancy(),
          get().fetchLiveMetrics(),
        ]);
        const rejected = results.filter(r => r.status === 'rejected');
        const partialErrors = rejected.map(r =>
          r.status === 'rejected' ? String(r.reason ?? 'Unknown error') : ''
        ).filter(Boolean);
        if (rejected.length === results.length) {
          set({ error: t('dashboard.failed_load'), loading: false, partialErrors });
        } else {
          set({ loading: false, partialErrors });
        }
      } catch {
        set({ error: t('dashboard.failed_load'), loading: false });
      }
    },

    setSelectedPeriod: (period) => {
      set({ selectedPeriod: period });
      get().fetchAll(period).catch(() => { /* fetchAll sets its own error state */ });
    },

    setSelectedGranularity: (granularity) => {
      set({ selectedGranularity: granularity });
      get().fetchRevenueChart(undefined, granularity).catch(() => { /* error handled in method */ });
    },

    setAutoRefresh: (enabled) => {
      set({ autoRefresh: enabled });
      // R44-FIX: Actually start/stop the auto-refresh interval.
      // Previously, setting autoRefresh=true only set a flag but never
      // created an interval, making the feature non-functional.
      const state = get();
      // Clear any existing timer first
      if (state._autoRefreshTimer) {
        clearInterval(state._autoRefreshTimer);
        set({ _autoRefreshTimer: null });
      }
      if (enabled) {
        const timer = setInterval(() => {
          get().fetchAll().catch(() => { /* fetchAll sets its own error state */ });
        }, state.refreshInterval * 1000);
        set({ _autoRefreshTimer: timer });
      }
    },

    setRefreshInterval: (seconds) => {
      set({ refreshInterval: seconds });
      // R44-FIX: If auto-refresh is active, restart with new interval
      if (get().autoRefresh) {
        get().setAutoRefresh(true);
      }
    },

    stopAutoRefresh: () => {
      const timer = get()._autoRefreshTimer;
      if (timer) {
        clearInterval(timer);
      }
      set({ _autoRefreshTimer: null, autoRefresh: false });
    },
  })
);
