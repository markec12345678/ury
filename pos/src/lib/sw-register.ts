/**
 * Service Worker registration utility for URY POS.
 *
 * Registers the service worker in production mode and handles
 * updates gracefully by notifying the user.
 */

import { logger } from './logger';

export function registerServiceWorker(): void {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/pos/sw.js', {
          scope: '/pos/',
        });

        logger.info('Service Worker registered successfully');

        // R39-FIX: Store interval ID so it can be cleaned up if needed.
        // Previously the interval was never cleared, leaking a timer reference.
        const updateIntervalId = setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              logger.info('New Service Worker activated — app updated');
            }
          });
        });

        // Clean up the update interval if the page is unloaded
        window.addEventListener('unload', () => {
          clearInterval(updateIntervalId);
        }, { once: true });
      } catch (error) {
        logger.warn('Service Worker registration failed:', error);
      }
    });
  }
}

/**
 * Unregister the service worker (useful for debugging).
 */
export async function unregisterServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    logger.info('Service Worker unregistered');
  }
}
