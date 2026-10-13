import { registerSW } from 'virtual:pwa-register';
import { offlineSync } from './offlineSyncService';

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  if (import.meta.env.DEV) {
    // In dev mode, unregister any lingering service workers from dev-dist to prevent caching conflicts and blank screens
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('[PWA] Unregistered development service worker:', registration.scope);
          }
        });
      }
    }).catch((err) => {
      console.debug('[PWA] Error checking service worker registrations:', err);
    });

    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      }).catch((err) => {
        console.debug('[PWA] Error clearing cache keys:', err);
      });
    }
    return;
  }

  try {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('[PWA] New content available, updating service worker...');
        try {
          updateSW(true);
        } catch {
          // ignore
        }
      },
      onOfflineReady() {
        console.log('[PWA] Application is offline-ready with local asset and data caching.');
      },
      onRegisterError(error) {
        console.warn('[PWA] Service Worker registration failed:', error);
      },
    });
  } catch (err) {
    console.debug('[PWA] Service Worker initialization handled:', err);
  }

  // Background Sync registration
  window.addEventListener('online', () => {
    offlineSync.syncAllQueues();
  });

  // Check if Background Sync API is supported
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((registration: any) => {
      // Register custom background sync tag
      return registration.sync?.register('sync-offline-updates');
    }).catch((err) => {
      console.debug('[PWA] Background sync registration:', err);
    });
  }
}
