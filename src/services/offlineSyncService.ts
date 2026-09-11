import { get, set, del } from 'idb-keyval';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { habitService } from './habitService';
import { cleanFirestoreData } from '../lib/utils';

export interface QueuedMutation {
  id: string;
  userId: string;
  operation: 'WRITE' | 'DELETE' | 'HABIT_LOG' | 'HABIT_SKIP';
  collection: string;
  docId: string;
  data?: any;
  createdAt: number;
  retryCount: number;
  description?: string;
}

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';

type SyncListener = (status: {
  isOnline: boolean;
  status: SyncStatus;
  pendingCount: number;
  lastSyncedAt: Date | null;
  error?: string | null;
}) => void;

class OfflineSyncService {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private lastSyncedAt: Date | null = null;
  private syncError: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private heartbeatTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);

      // Listen for messages from the service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SYNC_OFFLINE_UPDATES') {
            console.log('[OfflineSync] Received sync trigger from Service Worker');
            this.syncAllQueues();
          }
        });
      }

      // Check for pending items periodically when online
      this.heartbeatTimer = setInterval(() => {
        if (this.isOnline && !this.isSyncing) {
          this.syncAllQueues();
        }
      }, 20000);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.notify();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const status: SyncStatus = !this.isOnline 
      ? 'offline' 
      : this.isSyncing 
        ? 'syncing' 
        : this.syncError 
          ? 'error' 
          : 'online';

    // Calculate total pending count across current storage
    this.getGlobalPendingCount().then((pendingCount) => {
      const payload = {
        isOnline: this.isOnline,
        status,
        pendingCount,
        lastSyncedAt: this.lastSyncedAt,
        error: this.syncError
      };
      this.listeners.forEach(l => l(payload));
    });
  }

  private handleOnline = () => {
    console.log('[OfflineSync] Network status: ONLINE');
    this.isOnline = true;
    this.syncError = null;
    this.notify();
    this.syncAllQueues();
  };

  private handleOffline = () => {
    console.log('[OfflineSync] Network status: OFFLINE');
    this.isOnline = false;
    this.notify();
  };

  // Helper key generators
  private getCacheKey(userId: string, collection: string): string {
    return `lifeflow_cache_${userId}_${collection}`;
  }

  private getQueueKey(userId: string): string {
    return `lifeflow_queue_${userId}`;
  }

  // Local Cache API (IndexedDB)
  public async getCachedData<T>(userId: string, collection: string): Promise<T | null> {
    try {
      const key = this.getCacheKey(userId, collection);
      const data = await get(key);
      return (data as T) || null;
    } catch (e) {
      console.warn(`[OfflineSync] Failed to read cache for ${collection}:`, e);
      return null;
    }
  }

  public async setCachedData<T>(userId: string, collection: string, data: T): Promise<void> {
    try {
      const key = this.getCacheKey(userId, collection);
      await set(key, data);
    } catch (e) {
      console.warn(`[OfflineSync] Failed to save cache for ${collection}:`, e);
    }
  }

  // Mutation Queue API
  public async getQueue(userId: string): Promise<QueuedMutation[]> {
    try {
      const key = this.getQueueKey(userId);
      const list = await get(key);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.warn('[OfflineSync] Failed to read queue:', e);
      return [];
    }
  }

  public async getGlobalPendingCount(): Promise<number> {
    try {
      // Find current user id if available in auth or check active queue
      if (typeof window !== 'undefined') {
        const lastUserId = localStorage.getItem('lifeflow_last_uid');
        if (lastUserId) {
          const q = await this.getQueue(lastUserId);
          return q.length;
        }
      }
      return 0;
    } catch {
      return 0;
    }
  }

  public async enqueueMutation(mutation: Omit<QueuedMutation, 'id' | 'createdAt' | 'retryCount'>): Promise<void> {
    const userId = mutation.userId;
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem('lifeflow_last_uid', userId);
    }

    const item: QueuedMutation = {
      ...mutation,
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
      retryCount: 0,
    };

    const currentQueue = await this.getQueue(userId);
    // Deduplicate or replace write with latest state for the same docId
    const filtered = currentQueue.filter(
      q => !(q.collection === mutation.collection && q.docId === mutation.docId)
    );
    filtered.push(item);

    await set(this.getQueueKey(userId), filtered);
    this.notify();

    // Trigger Service Worker background sync if supported
    this.requestServiceWorkerSync();
  }

  public requestServiceWorkerSync() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((reg: any) => {
          if (reg && reg.sync) {
            return reg.sync.register('sync-offline-updates');
          }
        })
        .catch((err) => {
          console.debug('[OfflineSync] Background sync registration skipped:', err);
        });
    }
  }

  // Synchronization Execution
  public async syncQueueForUser(userId: string): Promise<boolean> {
    if (!this.isOnline || this.isSyncing) return false;

    const queue = await this.getQueue(userId);
    if (queue.length === 0) {
      this.notify();
      return true;
    }

    console.log(`[OfflineSync] Syncing ${queue.length} offline changes for user ${userId}...`);
    this.isSyncing = true;
    this.syncError = null;
    this.notify();

    const remainingQueue: QueuedMutation[] = [];
    let successCount = 0;

    for (const item of queue) {
      try {
        await this.executeMutation(item);
        successCount++;
      } catch (err: any) {
        console.error(`[OfflineSync] Failed to execute queued mutation ${item.id}:`, err);
        item.retryCount += 1;
        // Keep in queue if retry count is under 5, else discard to prevent permanent blocking
        if (item.retryCount < 5) {
          remainingQueue.push(item);
        }
        this.syncError = err?.message || 'Sync error';
      }
    }

    await set(this.getQueueKey(userId), remainingQueue);
    this.isSyncing = false;
    this.lastSyncedAt = new Date();
    this.notify();

    console.log(`[OfflineSync] Sync complete. ${successCount} processed, ${remainingQueue.length} remaining.`);
    return remainingQueue.length === 0;
  }

  public async syncAllQueues(): Promise<void> {
    if (!this.isOnline || this.isSyncing) return;
    if (typeof window !== 'undefined') {
      const lastUserId = localStorage.getItem('lifeflow_last_uid');
      if (lastUserId) {
        await this.syncQueueForUser(lastUserId);
      }
    }
  }

  private async executeMutation(item: QueuedMutation): Promise<void> {
    const { userId, operation, collection: colName, docId, data } = item;

    if (operation === 'WRITE') {
      const docRef = doc(db, `users/${userId}/${colName}/${docId}`);
      await setDoc(docRef, cleanFirestoreData({ ...data, userId }));
    } else if (operation === 'DELETE') {
      const docRef = doc(db, `users/${userId}/${colName}/${docId}`);
      await deleteDoc(docRef);
    } else if (operation === 'HABIT_LOG') {
      await habitService.logHabit(userId, docId, data?.count || 1, data?.note, data?.mood);
    } else if (operation === 'HABIT_SKIP') {
      await habitService.skipHabit(userId, docId, data?.note);
    }
  }

  public async clearUserData(userId: string): Promise<void> {
    try {
      await del(this.getQueueKey(userId));
    } catch (e) {
      console.warn('[OfflineSync] Error clearing queue:', e);
    }
  }
}

export const offlineSync = new OfflineSyncService();
