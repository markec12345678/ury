'use client';

import { useEffect } from 'react';
import { useURYStore } from '@/lib/ury-store';

/**
 * Keyboard shortcuts for URY Dashboard navigation.
 *
 * Alt+1-7: Switch between tabs
 * Alt+R: Refresh data (when connected)
 * Alt+D: Toggle dark mode
 * Escape: Close sidebar on mobile
 */
export function useKeyboardShortcuts() {
  const { setActiveTab, setSidebarOpen, toggleDarkMode, isConnected, refreshData, isRefreshing } = useURYStore();

  const tabIds = ['overview', 'tables', 'kitchen', 'menu', 'menu-mgmt', 'orders', 'dashboard', 'pl', 'reports', 'shift', 'api', 'architecture'];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Alt+1-9: Switch tabs
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (index < tabIds.length) {
          setActiveTab(tabIds[index]);
        }
      }

      // Alt+R: Refresh data
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        if (isConnected && !isRefreshing) {
          refreshData();
        }
      }

      // Alt+D: Toggle dark mode
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
      }

      // Escape: Close sidebar on mobile
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab, setSidebarOpen, toggleDarkMode, isConnected, refreshData, isRefreshing]);
}
