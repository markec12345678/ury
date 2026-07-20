import { create } from 'zustand';
import {
  getMenus,
  getMenuDetail,
  addMenuItem,
  updateMenuItem,
  removeMenuItem,
  batchUpdatePrices,
  getCoursesDetail,
  createMenuCourse,
  updateMenuCourse,
  deleteMenuCourse,
  getAvailableItems,
  toggleMenu,
  URYMenu,
  URYMenuCourse,
  AvailableItem,
} from '../lib/menu-management-api';
import { showToast } from '../components/ui/toast';
import { t } from '../i18n';

function extractServerMessage(error: unknown): string {
  try {
    const err = error as { _server_messages?: string };
    if (err?._server_messages) {
      const parsed = JSON.parse(err._server_messages);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return JSON.parse(parsed[0]).message || 'Operation failed';
      }
    }
  } catch { /* ignore parse errors */ }
  return 'Operation failed';
}

interface MenuManagementState {
  menus: URYMenu[];
  selectedMenu: URYMenu | null;
  courses: URYMenuCourse[];
  availableItems: AvailableItem[];
  loading: boolean;
  menuDetailLoading: boolean;
  coursesLoading: boolean;
  itemsLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCourseFilter: string;
}

interface MenuManagementActions {
  fetchMenus: () => Promise<void>;
  fetchMenuDetail: (menuName: string) => Promise<void>;
  fetchCourses: () => Promise<void>;
  fetchAvailableItems: () => Promise<void>;
  toggleMenuStatus: (menuName: string, enabled: number) => Promise<void>;
  addItemToMenu: (
    menuName: string,
    item: string,
    rate: number,
    course?: string | null,
    specialDish?: number
  ) => Promise<void>;
  updateItemInMenu: (
    menuName: string,
    itemRowName: string,
    updates: {
      rate?: number;
      special_dish?: number;
      disabled?: number;
      course?: string;
    }
  ) => Promise<void>;
  removeItemFromMenu: (menuName: string, itemRowName: string) => Promise<void>;
  batchUpdateItemPrices: (
    menuName: string,
    updates: Array<{ item_row_name: string; rate: number }>
  ) => Promise<void>;
  addCourse: (
    course: string,
    servingPriority?: number,
    indicateInKds?: number
  ) => Promise<void>;
  updateCourseItem: (
    courseName: string,
    updates: {
      course?: string;
      serving_priority?: number;
      indicate_in_kds?: number;
    }
  ) => Promise<void>;
  deleteCourse: (courseName: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCourseFilter: (course: string) => void;
  clearSelectedMenu: () => void;
}

export const useMenuManagementStore = create<
  MenuManagementState & MenuManagementActions
>((set, get) => ({
  menus: [],
  selectedMenu: null,
  courses: [],
  availableItems: [],
  loading: false,
  menuDetailLoading: false,
  coursesLoading: false,
  itemsLoading: false,
  error: null,
  searchQuery: '',
  selectedCourseFilter: '',

  fetchMenus: async () => {
    try {
      set({ loading: true, error: null });
      const menus = await getMenus();
      set({ menus, loading: false });
    } catch {
      set({ error: t('menu_management.failed_load_menus'), loading: false });
      showToast.error(t('menu_management.failed_load_menus'));
    }
  },

  fetchMenuDetail: async (menuName: string) => {
    try {
      set({ menuDetailLoading: true, error: null });
      const menu = await getMenuDetail(menuName);
      set({ selectedMenu: menu, menuDetailLoading: false });
    } catch {
      set({ error: t('menu_management.failed_load_menu_details'), menuDetailLoading: false });
      showToast.error(t('menu_management.failed_load_menu_details'));
    }
  },

  fetchCourses: async () => {
    try {
      set({ coursesLoading: true });
      const courses = await getCoursesDetail();
      set({ courses, coursesLoading: false });
    } catch {
      set({ coursesLoading: false });
      showToast.error(t('menu_management.failed_load_courses'));
    }
  },

  fetchAvailableItems: async () => {
    try {
      set({ itemsLoading: true });
      const items = await getAvailableItems();
      set({ availableItems: items, itemsLoading: false });
    } catch {
      set({ itemsLoading: false });
      showToast.error(t('menu_management.failed_load_available_items'));
    }
  },

  toggleMenuStatus: async (menuName: string, enabled: number) => {
    try {
      await toggleMenu(menuName, enabled);
      const menus = await getMenus();
      set({ menus });
      showToast.success(enabled ? t('menu_management.menu_enabled') : t('menu_management.menu_disabled'));
    } catch {
      showToast.error(t('menu_management.failed_toggle_menu'));
    }
  },

  addItemToMenu: async (menuName, item, rate, course, specialDish) => {
    try {
      await addMenuItem(menuName, item, rate, course, specialDish);
      await get().fetchMenuDetail(menuName);
      showToast.success(t('menu_management.item_added'));
    } catch (error: unknown) {
      const msg = extractServerMessage(error) || t('menu_management.failed_add_item'));
      showToast.error(msg);
    }
  },

  updateItemInMenu: async (menuName, itemRowName, updates) => {
    try {
      await updateMenuItem(menuName, itemRowName, updates);
      await get().fetchMenuDetail(menuName);
      showToast.success(t('menu_management.item_updated'));
    } catch {
      showToast.error(t('menu_management.failed_update_item'));
    }
  },

  removeItemFromMenu: async (menuName, itemRowName) => {
    try {
      await removeMenuItem(menuName, itemRowName);
      await get().fetchMenuDetail(menuName);
      showToast.success(t('menu_management.item_removed'));
    } catch {
      showToast.error(t('menu_management.failed_remove_item'));
    }
  },

  batchUpdateItemPrices: async (menuName, updates) => {
    try {
      await batchUpdatePrices(menuName, updates);
      await get().fetchMenuDetail(menuName);
      showToast.success(t('menu_management.prices_updated_count', { count: String(updates.length) }));
    } catch {
      showToast.error(t('menu_management.failed_update_prices'));
    }
  },

  addCourse: async (course, servingPriority, indicateInKds) => {
    try {
      await createMenuCourse(course, servingPriority, indicateInKds);
      await get().fetchCourses();
      showToast.success(t('menu_management.course_created'));
    } catch (error: unknown) {
      const msg = extractServerMessage(error) || t('menu_management.failed_create_course'));
      showToast.error(msg);
    }
  },

  updateCourseItem: async (courseName, updates) => {
    try {
      await updateMenuCourse(courseName, updates);
      await get().fetchCourses();
      showToast.success(t('menu_management.course_updated'));
    } catch {
      showToast.error(t('menu_management.failed_update_course'));
    }
  },

  deleteCourse: async (courseName) => {
    try {
      await deleteMenuCourse(courseName);
      await get().fetchCourses();
      showToast.success(t('menu_management.course_deleted'));
    } catch (error: unknown) {
      const msg = extractServerMessage(error) || t('menu_management.failed_delete_course'));
      showToast.error(msg);
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCourseFilter: (course) => set({ selectedCourseFilter: course }),
  clearSelectedMenu: () => set({ selectedMenu: null }),
}));
