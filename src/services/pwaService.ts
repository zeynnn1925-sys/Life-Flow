import { registerSW } from 'virtual:pwa-register';
import { offlineSync } from './offlineSyncService';

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
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
