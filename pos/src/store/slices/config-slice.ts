import { StateCreator } from 'zustand';
import { AuthSlice } from './auth-slice';
import type { PosProfileCombined } from '../../lib/pos-profile-api';
import type { RolePermission } from '../../lib/pos-profile-api';
import { getErrorMessage } from '../../lib/error-utils';

// R37-FIX: Eliminate divergent posProfile state.
// config-slice no longer stores its own posProfile copy.
// Instead, it delegates fetching to usePOSStore (app-slice) and reads
// the single source of truth from there. This prevents the two stores
// from holding different posProfile values after a force-refresh.
import { usePOSStore } from '../pos-store';

export interface ConfigState {
  allowedRoles: string[];
  configLoading: boolean;
  configError: string | null;
  hasAccess: boolean;
  /**
   * posProfile is now derived from usePOSStore to avoid divergent state.
   * Use getPosProfile() to read the current value.
   */
  posProfile: PosProfileCombined | null;
}

export interface ConfigActions {
  checkAccess: () => void;
  setAllowedRoles: (roles: string[]) => void;
  fetchPosProfile: (forceRefresh?: boolean) => Promise<void>;
  /** Read posProfile from the single source of truth (usePOSStore) */
  getPosProfile: () => PosProfileCombined | null;
}

export type ConfigSlice = ConfigState & ConfigActions;

const initialState: ConfigState = {
  allowedRoles: [],
  configLoading: false,
  configError: null,
  hasAccess: false,
  posProfile: null,
};

export const createConfigSlice: StateCreator<
  ConfigSlice & AuthSlice,
  [],
  [],
  ConfigSlice
> = (set, get) => ({
  ...initialState,

  getPosProfile: () => {
    // Single source of truth: always read from usePOSStore
    return usePOSStore.getState().posProfile;
  },

  fetchPosProfile: async (forceRefresh = false) => {
    try {
      set({ configLoading: true, configError: null });

      // R37-FIX: Delegate to usePOSStore's fetchPosProfile to avoid divergent state.
      // When force-refresh is requested, invalidate the session cache first so
      // app-slice's fetchPosProfile will re-fetch from the API.
      if (forceRefresh) {
        sessionStorage.removeItem('posProfile');
      }

      // Call the primary store's fetchPosProfile (single source of truth)
      await usePOSStore.getState().fetchPosProfile();

      // Read the profile from the primary store
      const profile = usePOSStore.getState().posProfile;

      // Sync to local state for backwards compatibility with AuthGuard selectors
      set({ posProfile: profile });

      // Extract and set allowed roles from the profile
      const allowedRoles = profile?.role_allowed_for_billing?.map((role: RolePermission) => role.role) || [];
      get().setAllowedRoles(allowedRoles);
      set({ configLoading: false });
    } catch (error) {
      set({ 
        configError: getErrorMessage(error),
        configLoading: false,
      });
    }
  },

  checkAccess: () => {
    const { user } = get();
    const { allowedRoles } = get();

    if (!user || !user.roles || !allowedRoles.length) {
      set({ hasAccess: false });
      return;
    }

    // Check if user has any of the allowed roles
    const hasAccess = user.name === 'Administrator' || user.roles.some(role => allowedRoles.includes(role));
    set({ hasAccess });

    // Note: AuthGuard handles the no-access UI via !hasAccess check with proper i18n
  },

  setAllowedRoles: (roles) => {
    set({ allowedRoles: roles });
    // After setting new roles, recheck access
    get().checkAccess();
  },
}); 