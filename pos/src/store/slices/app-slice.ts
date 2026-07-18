import { StateCreator } from 'zustand';
import { storage } from '../../lib/storage';
import { setCurrencySymbol } from '../../lib/utils';
import { getCurrencyInfo, type PosProfileCombined, getCombinedPosProfile } from '../../lib/pos-profile-api';
import { getPaymentModes } from '../../lib/payment-api';
import { DEFAULT_ORDER_TYPE } from '../../data/order-types';
import { getErrorMessage } from '../../lib/error-utils';
import type { POSSliceAll } from './combined';

// --- Types ---

export interface AppState {
  isInitializing: boolean;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
  posProfile: PosProfileCombined | null;
  currency: string;
  currencySymbol: string | null;
  paymentModes: string[];
  paymentModesError: string | null;
}

export interface AppActions {
  initializeApp: () => Promise<void>;
  fetchPosProfile: () => Promise<void>;
  fetchCurrencySymbol: () => Promise<void>;
  fetchPaymentModes: () => Promise<void>;
  resetOrderState: () => void;
  isMenuInteractionDisabled: () => boolean;
  isOrderInteractionDisabled: () => boolean;
}

export type AppSlice = AppState & AppActions;

// --- Slice ---

export const createAppSlice: StateCreator<POSSliceAll, [], [], AppSlice> = (set, get) => ({
  isInitializing: true,
  loading: false,
  profileLoading: false,
  error: null,
  posProfile: null,
  currency: storage.getItem('currency') || 'INR',
  currencySymbol: storage.getItem('currencySymbol') || null,
  paymentModes: ['Cash'],
  paymentModesError: null,

  initializeApp: async () => {
    try {
      set({ isInitializing: true, error: null });

      const [profileResult, menuResult, categoriesResult, paymentModesResult] = await Promise.allSettled([
        get().fetchPosProfile(),
        get().fetchMenuItems(),
        get().fetchCategories(),
        get().fetchPaymentModes(),
      ]);

      if (
        profileResult.status === 'rejected' ||
        menuResult.status === 'rejected' ||
        categoriesResult.status === 'rejected' ||
        paymentModesResult.status === 'rejected'
      ) {
        set({
          error: 'Failed to initialize app. Please refresh the page.',
          isInitializing: false,
        });
        return;
      }

      set({ isInitializing: false });
    } catch {
      set({
        error: 'Failed to initialize app. Please refresh the page.',
        isInitializing: false,
      });
    }
  },

  fetchPosProfile: async () => {
    try {
      const cached = sessionStorage.getItem('posProfile');
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          const requiredFields = ['name', 'owner', 'cashier', 'branch'];
          if (!requiredFields.every(f => typeof profile[f] === 'string')) {
            sessionStorage.removeItem('posProfile');
            // fall through to API fetch
          } else {
            set({
              posProfile: profile,
              profileLoading: false,
              currency: profile.currency || 'INR',
            });
            if (!storage.getItem('currencySymbol')) {
              await get().fetchCurrencySymbol();
            }
            return;
          }
        } catch {
          sessionStorage.removeItem('posProfile');
        }
      }

      set({ profileLoading: true, error: null });
      const combinedProfile = await getCombinedPosProfile();

      sessionStorage.setItem('posProfile', JSON.stringify(combinedProfile));
      set({
        posProfile: combinedProfile,
        profileLoading: false,
        currency: combinedProfile.currency || 'INR',
      });

      if (!storage.getItem('currencySymbol')) {
        await get().fetchCurrencySymbol();
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching POS profile:', error);
      set({
        error: 'Failed to fetch POS profile',
        profileLoading: false,
      });
    }
  },

  fetchCurrencySymbol: async () => {
    try {
      const currency = get().currency;
      const response = await getCurrencyInfo(currency);
      const { symbol } = response;

      set({ currencySymbol: symbol });
      setCurrencySymbol(symbol);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching currency symbol:', error);
      set({ currencySymbol: get().currency });
      setCurrencySymbol(get().currency);
    }
  },

  fetchPaymentModes: async () => {
    try {
      set({ paymentModesError: null });
      const modes = await getPaymentModes();
      set({ paymentModes: modes });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to fetch payment modes:', error);
      set({ paymentModesError: getErrorMessage(error) });
    }
  },

  resetOrderState: () => {
    set({
      selectedCustomer: null,
      selectedTable: null,
      selectedRoom: null,
      selectedAggregator: null,
      isUpdatingOrder: false,
      orderId: null,
      activeOrders: [],
      selectedItem: null,
      orderLoading: false,
      error: null,
      selectedOrderType: DEFAULT_ORDER_TYPE,
      orderComment: '',
    });

    get().fetchMenuItems();
  },

  isMenuInteractionDisabled: () => {
    const state = get();
    return state.menuLoading || state.profileLoading;
  },

  isOrderInteractionDisabled: () => {
    return get().orderLoading;
  },
});