import { StateCreator } from 'zustand';
import { getTableOrder, type TableOrder } from '../../lib/order-api';
import { DEFAULT_ORDER_TYPE, type OrderType } from '../../data/order-types';
import type { Customer, Aggregator, OrderItem, MenuItem } from './types';
import { generateUniqueId } from './helpers';
import type { POSSliceAll } from './combined';

// --- Types ---

export interface SelectionState {
  selectedCategory: string;
  searchQuery: string;
  selectedCustomer: Customer | null;
  selectedTable: string | null;
  selectedRoom: string | null;
  selectedOrderType: OrderType;
  quickFilter: 'all' | 'special';
  selectedItem: MenuItem | null;
  selectedAggregator: Aggregator | null;
  orderComment: string;
  tableOrder: TableOrder | null;
  isUpdatingOrder: boolean;
  orderId: string | null;
  orderLoading: boolean;
  _loadTableOrderSeq: number;
}

export interface SelectionActions {
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setSelectedTable: (table: string | null, room: string | null, doNotLoadOrder?: boolean) => void;
  setSelectedOrderType: (type: OrderType) => void;
  setQuickFilter: (filter: 'all' | 'special') => void;
  setSelectedItem: (item: MenuItem | null) => void;
  setSelectedAggregator: (aggregator: Aggregator | null) => void;
  setOrderComment: (comment: string) => void;
  loadTableOrder: (table: string) => Promise<void>;
  clearTableOrder: () => void;
  setOrderForUpdate: (orderId: string | null) => void;
}

export type SelectionSlice = SelectionState & SelectionActions;

// --- Slice ---

export const createSelectionSlice: StateCreator<POSSliceAll, [], [], SelectionSlice> = (set, get) => ({
  selectedCategory: '',
  searchQuery: '',
  selectedCustomer: null,
  selectedTable: null,
  selectedRoom: null,
  selectedOrderType: DEFAULT_ORDER_TYPE as OrderType,
  quickFilter: 'all',
  selectedItem: null,
  selectedAggregator: null,
  orderComment: '',
  tableOrder: null,
  isUpdatingOrder: false,
  orderId: null,
  orderLoading: false,
  _loadTableOrderSeq: 0,

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setQuickFilter: (filter) => set({ quickFilter: filter }),
  setSelectedItem: (item) => set({ selectedItem: item }),
  setSelectedAggregator: (aggregator) => set({ selectedAggregator: aggregator }),
  setOrderComment: (comment: string) => set({ orderComment: comment }),

  setSelectedTable: (table: string | null, room: string | null, doNotLoadOrder = false) => {
    set({ selectedTable: table, selectedRoom: room });
    if (table) {
      if (!doNotLoadOrder) get().loadTableOrder(table).catch(() => { /* error set in slice */ });
    } else {
      get().clearTableOrder();
    }
    if (room) {
      get().fetchMenuItems().catch(() => { /* error set in slice */ });
    }
  },

  setSelectedOrderType: (type) => {
    get().clearOrder().catch(() => { /* error set in slice */ });
    set({
      selectedOrderType: type,
      isUpdatingOrder: false,
      orderId: null,
    });

    if (type !== 'Aggregators') {
      get().fetchMenuItems().catch(() => { /* error set in slice */ });
    }
  },

  loadTableOrder: async (table: string) => {
    const seq = get()._loadTableOrderSeq + 1;
    set({ _loadTableOrderSeq: seq, orderLoading: true, error: null });
    try {
      const response = await getTableOrder(table);
      // Discard stale response if a newer request was started
      if (get()._loadTableOrderSeq !== seq) {
        // R36-FIX: Clear orderLoading on stale response to prevent stuck loading state
        set({ orderLoading: false });
        return;
      }
      const order = response.message;
      if (order && order.name && order.items && order.items.length > 0) {
        const orderItems: OrderItem[] = order.items.map(item => {
          const orderItem = {
            id: item.item_code,
            name: item.item_name,
            price: item.rate,
            quantity: item.qty,
            amount: item.amount,
            image: item.image || null,
            item: item.item_code,
            item_name: item.item_name,
            item_image: null,
            course: '',
            description: item.description || '',
            special_dish: 0 as 0 | 1,
            tax_rate: 0,
            comment: item.comment || '',
          };
          return {
            ...orderItem,
            uniqueId: generateUniqueId(orderItem as OrderItem),
          } as OrderItem;
        });

        set({
          tableOrder: response,
          activeOrders: orderItems,
          selectedCustomer: order.customer ? {
            id: order.customer,
            name: order.customer_name,
            phone: order.mobile_number,
          } : null,
          isUpdatingOrder: true,
          orderId: order.name,
        });
      } else {
        set({
          tableOrder: null,
          activeOrders: [],
          selectedCustomer: null,
          isUpdatingOrder: false,
          orderId: null,
        });
      }
    } catch {
      set({
        error: 'Failed to load table order',
        tableOrder: null,
        activeOrders: [],
        selectedCustomer: null,
        isUpdatingOrder: false,
        orderId: null,
      });
    } finally {
      set({ orderLoading: false });
    }
  },

  clearTableOrder: () => {
    set({
      tableOrder: null,
      activeOrders: [],
      selectedCustomer: null,
      isUpdatingOrder: false,
      orderId: null,
    });
  },

  setOrderForUpdate: (orderId: string | null) => {
    set({
      isUpdatingOrder: orderId !== null,
      orderId,
    });
  },
});