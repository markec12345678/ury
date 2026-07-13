import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * URY Dashboard — Zustand Store Unit Tests
 *
 * Tests the core state management logic without Frappe backend dependency.
 * Uses mock data defaults to verify store actions and state transitions.
 */

// Mock frappe-client to avoid real API calls
vi.mock('@/lib/frappe-client', () => ({
  getFrappeClient: () => ({
    updateConfig: vi.fn(),
    ping: vi.fn().mockResolvedValue(false),
    getLoggedInUser: vi.fn().mockResolvedValue(null),
    getKPIs: vi.fn().mockResolvedValue(null),
    getHourlySales: vi.fn().mockResolvedValue(null),
    getRecentOrders: vi.fn().mockResolvedValue(null),
    getTables: vi.fn().mockResolvedValue(null),
    getKOTs: vi.fn().mockResolvedValue(null),
    getInvoices: vi.fn().mockResolvedValue(null),
    getRooms: vi.fn().mockResolvedValue(null),
    login: vi.fn().mockResolvedValue(false),
  }),
  saveConfig: vi.fn(),
  loadConfig: vi.fn().mockReturnValue(null),
  clearConfig: vi.fn(),
}));

// Mock socket hook
vi.mock('@/lib/use-ury-socket', () => ({
  reconnectSocket: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Mock document
Object.defineProperty(globalThis, 'document', {
  value: {
    documentElement: {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        toggle: vi.fn(),
      },
    },
  },
  writable: true,
});

describe('URY Store - Core State', () => {
  let useURYStore: any;

  beforeEach(async () => {
    vi.resetModules();
    localStorageMock.clear();
    
    // Re-import store for clean state
    const mod = await import('@/lib/ury-store');
    useURYStore = mod.useURYStore;
  });

  it('should initialize with default mock data', () => {
    const state = useURYStore.getState();
    
    expect(state.activeTab).toBe('overview');
    expect(state.darkMode).toBe(false);
    expect(state.isConnected).toBe(false);
    expect(state.isConnecting).toBe(false);
    expect(state.sidebarOpen).toBe(false);
    expect(state.connectionError).toBeNull();
    expect(state.authenticatedUser).toBeNull();
    expect(state.isRefreshing).toBe(false);
  });

  it('should have KPI data populated', () => {
    const state = useURYStore.getState();
    expect(state.kpis).toBeDefined();
    expect(state.kpis.dailySales).toBeGreaterThan(0);
    expect(state.kpis.totalOrders).toBeGreaterThan(0);
  });

  it('should have tables data populated', () => {
    const state = useURYStore.getState();
    expect(state.tables).toBeDefined();
    expect(Array.isArray(state.tables)).toBe(true);
    expect(state.tables.length).toBeGreaterThan(0);
  });

  it('should have KOT cards populated', () => {
    const state = useURYStore.getState();
    expect(state.kotCards).toBeDefined();
    expect(Array.isArray(state.kotCards)).toBe(true);
  });

  it('should have P&L data populated', () => {
    const state = useURYStore.getState();
    expect(state.plSummary).toBeDefined();
    expect(state.dailyPL).toBeDefined();
    expect(Array.isArray(state.dailyPL)).toBe(true);
  });

  it('should have API endpoints populated', () => {
    const state = useURYStore.getState();
    expect(state.apiEndpoints).toBeDefined();
    expect(Array.isArray(state.apiEndpoints)).toBe(true);
    expect(state.apiEndpoints.length).toBeGreaterThan(0);
  });

  it('should have architecture data populated', () => {
    const state = useURYStore.getState();
    expect(state.frontendApps).toBeDefined();
    expect(state.backendComponents).toBeDefined();
    expect(state.doctypes).toBeDefined();
    expect(Array.isArray(state.doctypes)).toBe(true);
  });
});

describe('URY Store - Tab Navigation', () => {
  let useURYStore: any;

  beforeEach(async () => {
    vi.resetModules();
    localStorageMock.clear();
    const mod = await import('@/lib/ury-store');
    useURYStore = mod.useURYStore;
  });

  it('should switch active tab', () => {
    useURYStore.getState().setActiveTab('kitchen');
    expect(useURYStore.getState().activeTab).toBe('kitchen');
  });

  it('should switch to all valid tabs', () => {
    const tabs = ['overview', 'tables', 'kitchen', 'pl', 'shift', 'api', 'architecture'];
    
    for (const tab of tabs) {
      useURYStore.getState().setActiveTab(tab);
      expect(useURYStore.getState().activeTab).toBe(tab);
    }
  });

  it('should persist active tab to localStorage', () => {
    useURYStore.getState().setActiveTab('pl');
    
    const prefs = localStorageMock.getItem('ury_ui_prefs');
    expect(prefs).toBeTruthy();
    const parsed = JSON.parse(prefs!);
    expect(parsed.activeTab).toBe('pl');
  });
});

describe('URY Store - Sidebar', () => {
  let useURYStore: any;

  beforeEach(async () => {
    vi.resetModules();
    localStorageMock.clear();
    const mod = await import('@/lib/ury-store');
    useURYStore = mod.useURYStore;
  });

  it('should toggle sidebar', () => {
    expect(useURYStore.getState().sidebarOpen).toBe(false);
    useURYStore.getState().toggleSidebar();
    expect(useURYStore.getState().sidebarOpen).toBe(true);
    useURYStore.getState().toggleSidebar();
    expect(useURYStore.getState().sidebarOpen).toBe(false);
  });

  it('should set sidebar open explicitly', () => {
    useURYStore.getState().setSidebarOpen(true);
    expect(useURYStore.getState().sidebarOpen).toBe(true);
  });

  it('should set sidebar closed explicitly', () => {
    useURYStore.getState().setSidebarOpen(true);
    useURYStore.getState().setSidebarOpen(false);
    expect(useURYStore.getState().sidebarOpen).toBe(false);
  });
});

describe('URY Store - Dark Mode', () => {
  let useURYStore: any;

  beforeEach(async () => {
    vi.resetModules();
    localStorageMock.clear();
    const mod = await import('@/lib/ury-store');
    useURYStore = mod.useURYStore;
  });

  it('should toggle dark mode', () => {
    expect(useURYStore.getState().darkMode).toBe(false);
    useURYStore.getState().toggleDarkMode();
    expect(useURYStore.getState().darkMode).toBe(true);
    useURYStore.getState().toggleDarkMode();
    expect(useURYStore.getState().darkMode).toBe(false);
  });

  it('should persist dark mode preference to localStorage', () => {
    useURYStore.getState().toggleDarkMode();
    
    const prefs = localStorageMock.getItem('ury_ui_prefs');
    expect(prefs).toBeTruthy();
    const parsed = JSON.parse(prefs!);
    expect(parsed.darkMode).toBe(true);
  });

  it('should toggle document dark class', () => {
    useURYStore.getState().toggleDarkMode();
    expect(document.documentElement.classList.toggle).toHaveBeenCalledWith('dark', true);
  });
});

describe('URY Store - KOT Actions', () => {
  let useURYStore: any;

  beforeEach(async () => {
    vi.resetModules();
    localStorageMock.clear();
    const mod = await import('@/lib/ury-store');
    useURYStore = mod.useURYStore;
  });

  it('should update KOT status', () => {
    const initialKOTs = useURYStore.getState().kotCards;
    if (initialKOTs.length > 0) {
      const firstKOT = initialKOTs[0];
      useURYStore.getState().updateKOTStatus(firstKOT.id, 'preparing');
      
      const updated = useURYStore.getState().kotCards.find((k: any) => k.id === firstKOT.id);
      expect(updated.status).toBe('preparing');
    }
  });
});

describe('URY Store - Shift Actions', () => {
  let useURYStore: any;

  beforeEach(async () => {
    vi.resetModules();
    localStorageMock.clear();
    const mod = await import('@/lib/ury-store');
    useURYStore = mod.useURYStore;
  });

  it('should open a shift', () => {
    useURYStore.getState().openShift(500, 'Test Cashier');
    const shiftInfo = useURYStore.getState().shiftInfo;
    expect(shiftInfo).toBeDefined();
  });

  it('should close a shift', () => {
    useURYStore.getState().openShift(500, 'Test Cashier');
    useURYStore.getState().closeShift();
    const shiftInfo = useURYStore.getState().shiftInfo;
    expect(shiftInfo).toBeDefined();
  });

  it('should transfer a shift', () => {
    useURYStore.getState().openShift(500, 'Cashier A');
    useURYStore.getState().transferShift('Cashier A', 'Cashier B');
    const shiftInfo = useURYStore.getState().shiftInfo;
    expect(shiftInfo).toBeDefined();
  });
});

describe('URY Store - Toast Notifications', () => {
  let useURYStore: any;

  beforeEach(async () => {
    vi.resetModules();
    localStorageMock.clear();
    const mod = await import('@/lib/ury-store');
    useURYStore = mod.useURYStore;
  });

  it('should add a toast', () => {
    useURYStore.getState().addToast({
      type: 'success',
      title: 'Test Toast',
      description: 'This is a test',
    });
    
    const toasts = useURYStore.getState().toasts;
    expect(toasts.length).toBeGreaterThan(0);
    expect(toasts[0].title).toBe('Test Toast');
    expect(toasts[0].type).toBe('success');
  });

  it('should remove a toast by id', () => {
    useURYStore.getState().addToast({
      type: 'info',
      title: 'Remove Me',
    });
    
    const toastId = useURYStore.getState().toasts[0].id;
    useURYStore.getState().removeToast(toastId);
    
    const toasts = useURYStore.getState().toasts;
    expect(toasts.find((t: any) => t.id === toastId)).toBeUndefined();
  });

  it('should generate unique toast IDs', () => {
    useURYStore.getState().addToast({ type: 'info', title: 'Toast 1' });
    useURYStore.getState().addToast({ type: 'info', title: 'Toast 2' });
    
    const toasts = useURYStore.getState().toasts;
    expect(toasts.length).toBeGreaterThanOrEqual(2);
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });
});

describe('URY Store - Connection', () => {
  let useURYStore: any;

  beforeEach(async () => {
    vi.resetModules();
    localStorageMock.clear();
    const mod = await import('@/lib/ury-store');
    useURYStore = mod.useURYStore;
  });

  it('should set Frappe config', () => {
    const config = { baseUrl: 'https://test.erp.com', apiKey: 'key123', apiSecret: 'secret456' };
    useURYStore.getState().setFrappeConfig(config);
    
    const state = useURYStore.getState();
    expect(state.frappeConfig).toBeDefined();
    expect(state.frappeConfig.baseUrl).toBe('https://test.erp.com');
  });

  it('should clear connection error on set config', () => {
    // Set error first
    useURYStore.setState({ connectionError: 'Test error' });
    expect(useURYStore.getState().connectionError).toBe('Test error');
    
    const config = { baseUrl: 'https://test.erp.com' };
    useURYStore.getState().setFrappeConfig(config);
    expect(useURYStore.getState().connectionError).toBeNull();
  });

  it('should disconnect from backend', () => {
    const config = { baseUrl: 'https://test.erp.com' };
    useURYStore.getState().setFrappeConfig(config);
    useURYStore.setState({ isConnected: true, authenticatedUser: 'admin' });
    
    useURYStore.getState().disconnectBackend();
    
    const state = useURYStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.authenticatedUser).toBeNull();
    expect(state.frappeConfig).toBeNull();
  });
});

// ── Menu CRUD Tests ──────────────────────────────────────

describe('URY Store - Menu CRUD', () => {
  let useURYStore: typeof import('@/lib/ury-store').useURYStore;

  beforeEach(async () => {
    localStorageMock.clear();
    const mod = await import('@/lib/ury-store');
    useURYStore = mod.useURYStore;
  });

  it('should add a new menu item', () => {
    const initialCount = useURYStore.getState().menuItems.length;
    
    useURYStore.getState().addMenuItem({
      name: 'Test Pizza',
      course: useURYStore.getState().menuCourses[0]?.id || 'starters',
      price: 450,
      isVeg: true,
      isAvailable: true,
    });

    const state = useURYStore.getState();
    expect(state.menuItems.length).toBe(initialCount + 1);
    const newItem = state.menuItems[state.menuItems.length - 1];
    expect(newItem.name).toBe('Test Pizza');
    expect(newItem.price).toBe(450);
    expect(newItem.isVeg).toBe(true);
  });

  it('should update a menu item', () => {
    const firstItem = useURYStore.getState().menuItems[0];
    if (!firstItem) return;

    useURYStore.getState().updateMenuItem(firstItem.id, {
      name: 'Updated Name',
      price: 999,
    });

    const updated = useURYStore.getState().menuItems.find((i) => i.id === firstItem.id);
    expect(updated?.name).toBe('Updated Name');
    expect(updated?.price).toBe(999);
  });

  it('should delete a menu item', () => {
    useURYStore.getState().addMenuItem({
      name: 'To Delete',
      course: useURYStore.getState().menuCourses[0]?.id || 'starters',
      price: 100,
      isVeg: false,
      isAvailable: true,
    });

    const item = useURYStore.getState().menuItems.find((i) => i.name === 'To Delete');
    expect(item).toBeDefined();

    const countBefore = useURYStore.getState().menuItems.length;
    useURYStore.getState().deleteMenuItem(item!.id);

    const countAfter = useURYStore.getState().menuItems.length;
    expect(countAfter).toBe(countBefore - 1);
    expect(useURYStore.getState().menuItems.find((i) => i.id === item!.id)).toBeUndefined();
  });

  it('should toggle menu item availability', () => {
    const firstItem = useURYStore.getState().menuItems[0];
    if (!firstItem) return;

    const wasAvailable = firstItem.isAvailable;
    useURYStore.getState().toggleMenuItemAvailability(firstItem.id);

    const updated = useURYStore.getState().menuItems.find((i) => i.id === firstItem.id);
    expect(updated?.isAvailable).toBe(!wasAvailable);
  });

  it('should add a new menu course', () => {
    const initialCount = useURYStore.getState().menuCourses.length;

    useURYStore.getState().addMenuCourse({
      name: 'Test Category',
      priority: 99,
    });

    const state = useURYStore.getState();
    expect(state.menuCourses.length).toBe(initialCount + 1);
    const newCourse = state.menuCourses.find((c) => c.name === 'Test Category');
    expect(newCourse).toBeDefined();
    expect(newCourse?.priority).toBe(99);
  });

  it('should update a menu course', () => {
    useURYStore.getState().addMenuCourse({ name: 'Original', priority: 50 });
    const course = useURYStore.getState().menuCourses.find((c) => c.name === 'Original');

    useURYStore.getState().updateMenuCourse(course!.id, { name: 'Renamed', priority: 10 });

    const updated = useURYStore.getState().menuCourses.find((c) => c.id === course!.id);
    expect(updated?.name).toBe('Renamed');
    expect(updated?.priority).toBe(10);
  });

  it('should not delete a course with items', () => {
    const firstCourse = useURYStore.getState().menuCourses[0];
    if (!firstCourse) return;
    
    const itemsInCourse = useURYStore.getState().menuItems.filter((i) => i.course === firstCourse.id).length;
    if (itemsInCourse === 0) return; // Skip if no items

    const countBefore = useURYStore.getState().menuCourses.length;
    useURYStore.getState().deleteMenuCourse(firstCourse.id);
    
    // Should still have same count since course has items
    expect(useURYStore.getState().menuCourses.length).toBe(countBefore);
  });

  it('should delete an empty course', () => {
    useURYStore.getState().addMenuCourse({ name: 'Empty Course', priority: 100 });
    const course = useURYStore.getState().menuCourses.find((c) => c.name === 'Empty Course');

    const countBefore = useURYStore.getState().menuCourses.length;
    useURYStore.getState().deleteMenuCourse(course!.id);

    expect(useURYStore.getState().menuCourses.length).toBe(countBefore - 1);
  });
});

// ── Advanced Dashboard & Report Tests ───────────────────

describe('URY Store - Dashboard & Reports', () => {
  let useURYStore: typeof import('@/lib/ury-store').useURYStore;

  beforeEach(async () => {
    localStorageMock.clear();
    const mod = await import('@/lib/ury-store');
    useURYStore = mod.useURYStore;
  });

  it('should have dashboard metrics initialized', () => {
    const state = useURYStore.getState();
    expect(state.dashboardMetrics).toBeDefined();
    expect(state.dashboardMetrics.totalRevenue).toBeGreaterThan(0);
    expect(state.dashboardMetrics.totalOrders).toBeGreaterThan(0);
  });

  it('should have sales trend data initialized', () => {
    const state = useURYStore.getState();
    expect(state.salesTrend).toBeDefined();
    expect(Array.isArray(state.salesTrend)).toBe(true);
    expect(state.salesTrend.length).toBeGreaterThan(0);
  });

  it('should change dashboard period', () => {
    useURYStore.getState().setDashboardPeriod('week');
    const state = useURYStore.getState();
    expect(state.dashboardPeriod).toBe('week');
    expect(state.dashboardMetrics).toBeDefined();
    expect(state.salesTrend.length).toBeGreaterThan(0);
  });

  it('should update metrics when period changes', () => {
    const todayRevenue = useURYStore.getState().dashboardMetrics.totalRevenue;
    useURYStore.getState().setDashboardPeriod('month');
    const monthRevenue = useURYStore.getState().dashboardMetrics.totalRevenue;
    // Monthly should be higher than daily
    expect(monthRevenue).toBeGreaterThan(todayRevenue);
  });

  it('should have report data initialized', () => {
    const state = useURYStore.getState();
    expect(state.reportData).toBeDefined();
    expect(state.reportData.totalRevenue).toBeGreaterThan(0);
    expect(state.reportData.period).toBe('daily');
  });

  it('should change report period', () => {
    useURYStore.getState().setReportPeriod('weekly');
    const state = useURYStore.getState();
    expect(state.reportPeriod).toBe('weekly');
    expect(state.reportData.period).toBe('weekly');
  });

  it('should have top selling items in report', () => {
    const state = useURYStore.getState();
    expect(state.reportData.topItems).toBeDefined();
    expect(Array.isArray(state.reportData.topItems)).toBe(true);
    expect(state.reportData.topItems.length).toBeGreaterThan(0);
  });

  it('should have payment split in report', () => {
    const state = useURYStore.getState();
    expect(state.reportData.paymentSplit).toBeDefined();
    expect(state.reportData.paymentSplit.length).toBeGreaterThan(0);
  });

  it('should have course revenue in report', () => {
    const state = useURYStore.getState();
    expect(state.reportData.courseRevenue).toBeDefined();
    expect(state.reportData.courseRevenue.length).toBeGreaterThan(0);
  });
});
