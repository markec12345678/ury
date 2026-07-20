import { StateCreator } from 'zustand';
import { getRestaurantMenu, getAggregatorMenu } from '../../lib/menu-api';
import { getMenuCourses } from '../../lib/menu-course-api';
import { getCustomerGroups, getCustomerTerritories } from '../../lib/customer-api';
import { logger } from '../../lib/logger';
import type { MenuItem, Category } from './types';
import type { POSSliceAll } from './combined';

// --- Types ---

export interface MenuState {
  menuItems: MenuItem[];
  categories: Category[];
  menuLoading: boolean;
  customerGroups: string[];
  territories: string[];
  /** R37-FIX: Sequence counter to discard stale menu fetch responses */
  _fetchMenuSeq: number;
}

export interface MenuActions {
  fetchMenuItems: () => Promise<void>;
  fetchAggregatorMenu: (aggregator: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCustomerGroups: () => Promise<void>;
  fetchTerritories: () => Promise<void>;
}

export type MenuSlice = MenuState & MenuActions;

// --- Slice ---

export const createMenuSlice: StateCreator<POSSliceAll, [], [], MenuSlice> = (set, get) => ({
  menuItems: [],
  categories: [],
  menuLoading: false,
  customerGroups: [],
  territories: [],
  _fetchMenuSeq: 0,

  fetchMenuItems: async () => {
    const { posProfile, selectedRoom, selectedOrderType } = get();
    if (!posProfile?.restaurant) return;

    // R37-FIX: Increment sequence counter to detect stale responses
    const seq = get()._fetchMenuSeq + 1;
    set({ _fetchMenuSeq: seq, menuLoading: true, error: null });

    try {
      const items = await getRestaurantMenu(posProfile.name, selectedRoom, selectedOrderType);

      // Discard stale response if a newer fetch was started
      if (get()._fetchMenuSeq !== seq) return;

      const menuItems: MenuItem[] = items.map(item => ({
        id: item.item,
        name: item.item_name,
        image: item.item_image || null,
        price: typeof item.rate === 'string' ? (parseFloat(item.rate) || 0) : (item.rate || 0),
        item: item.item,
        item_name: item.item_name,
        item_image: item.item_image,
        course: item.course,
        course_label: item.course_label || item.course,
        description: item.description || '',
        special_dish: item.special_dish || 0,
        tax_rate: 0,
      }));

      set({ menuItems, menuLoading: false });
    } catch (error) {
      if (get()._fetchMenuSeq !== seq) return;
      set({ error: 'Failed to load menu items', menuLoading: false });
      logger.error('Error loading menu items:', error);
    }
  },

  fetchAggregatorMenu: async (aggregator: string) => {
    // R39-FIX: Add sequence counter to discard stale responses,
    // matching the pattern used in fetchMenuItems.
    const seq = get()._fetchMenuSeq + 1;
    set({ _fetchMenuSeq: seq, menuLoading: true, error: null });
    try {
      const items = await getAggregatorMenu(aggregator);
      // Discard stale response if a newer fetch was started
      if (get()._fetchMenuSeq !== seq) return;

      const menuItems: MenuItem[] = items.map(item => ({
        ...item,
        id: item.item,
        name: item.item_name,
        image: item.item_image || null,
        price: typeof item.rate === 'string' ? (parseFloat(item.rate) || 0) : (item.rate || 0),
      }));

      set({ menuItems, menuLoading: false });
    } catch (error) {
      if (get()._fetchMenuSeq !== seq) return;
      set({ error: 'Failed to load aggregator menu', menuLoading: false });
      logger.error('Error loading aggregator menu:', error);
    }
  },

  fetchCategories: async () => {
    try {
      const cached = sessionStorage.getItem('menuCategories');
      if (cached) {
        try {
          const categories = JSON.parse(cached);
          set({ categories });
          return;
        } catch {
          sessionStorage.removeItem('menuCategories');
        }
      }

      const courses = await getMenuCourses();
      sessionStorage.setItem('menuCategories', JSON.stringify(courses));
      set({ categories: courses });
    } catch {
      set({ error: 'Failed to load menu categories' });
    }
  },

  fetchCustomerGroups: async () => {
    const cached = sessionStorage.getItem('customerGroups');
    if (cached) {
      try {
        set({ customerGroups: JSON.parse(cached) });
        return;
      } catch {
        sessionStorage.removeItem('customerGroups');
      }
    }
    try {
      const groups = await getCustomerGroups();
      const names = groups.map((g: { name: string }) => g.name);
      set({ customerGroups: names });
      sessionStorage.setItem('customerGroups', JSON.stringify(names));
    } catch {
      set({ error: 'Failed to load customer groups' });
    }
  },

  fetchTerritories: async () => {
    const cached = sessionStorage.getItem('territories');
    if (cached) {
      try {
        set({ territories: JSON.parse(cached) });
        return;
      } catch {
        sessionStorage.removeItem('territories');
      }
    }
    try {
      const terrs = await getCustomerTerritories();
      const names = terrs.map((t: { name: string }) => t.name);
      set({ territories: names });
      sessionStorage.setItem('territories', JSON.stringify(names));
    } catch {
      set({ error: 'Failed to load territories' });
    }
  },
});