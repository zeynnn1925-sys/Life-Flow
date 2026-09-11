import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { offlineSync, SyncStatus } from '../services/offlineSyncService';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export const SyncStatusIndicator: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [syncState, setSyncState] = useState<{
    isOnline: boolean;
    status: SyncStatus;
    pendingCount: number;
    lastSyncedAt: Date | null;
    error?: string | null;
  }>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    status: 'online',
    pendingCount: 0,
    lastSyncedAt: null,
  });

  const [showSyncedToast, setShowSyncedToast] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSync.subscribe((state) => {
      setSyncState((prev) => {
        // If we transitioned from having pending items to 0 pending items while online, show quick success toast
        if (prev.pendingCount > 0 && state.pendingCount === 0 && state.isOnline) {
          setShowSyncedToast(true);
          setTimeout(() => setShowSyncedToast(false), 3500);
        }
        return state;
      });
    });

    return unsubscribe;
  }, []);

  const handleManualSync = () => {
    if (user) {
      offlineSync.syncQueueForUser(user.uid);
    } else {
      offlineSync.syncAllQueues();
    }
  };

  const getText = () => {
    if (!syncState.isOnline) {
      if (syncState.pendingCount > 0) {
        switch (language) {
          case 'id':
            return `Offline (${syncState.pendingCount} tersimpan)`;
          case 'de':
            return `Offline (${syncState.pendingCount} gespeichert)`;
          case 'ar':
            return `غير متصل (${syncState.pendingCount} محفوظة)`;
          case 'en':
          default:
            return `Offline (${syncState.pendingCount} queued)`;
        }
      }
      switch (language) {
        case 'id': return 'Mode Offline';
        case 'de': return 'Offline-Modus';
        case 'ar': return 'وضع عدم الاتصال';
        case 'en':
        default: return 'Offline Mode';
      }
    }

    if (syncState.status === 'syncing') {
      switch (language) {
        case 'id': return 'Menyinkronkan...';
        case 'de': return 'Synchronisieren...';
        case 'ar': return 'جاري المزامنة...';
        case 'en':
        default: return 'Syncing...';
      }
    }

    if (syncState.pendingCount > 0) {
      switch (language) {
        case 'id': return `${syncState.pendingCount} tertunda`;
        case 'de': return `${syncState.pendingCount} ausstehend`;
        case 'ar': return `${syncState.pendingCount} معلق`;
        case 'en':
        default: return `${syncState.pendingCount} pending`;
      }
    }

    switch (language) {
      case 'id': return 'Tersinkronisasi';
      case 'de': return 'Synchronisiert';
      case 'ar': return 'متزامن';
      case 'en':
      default: return 'Synced';
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleManualSync}
        disabled={syncState.status === 'syncing' || !syncState.isOnline}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
          !syncState.isOnline
            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            : syncState.status === 'syncing'
            ? 'bg-accent/10 text-accent border border-accent/20 animate-pulse'
            : syncState.pendingCount > 0
            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            : 'bg-surface-2 text-ink-tertiary hover:text-ink border border-hairline'
        }`}
        title={syncState.isOnline ? 'Click to trigger synchronization' : 'Offline: Changes queued in local cache'}
      >
        {!syncState.isOnline ? (
          <CloudOff className="w-3.5 h-3.5 text-amber-500" />
        ) : syncState.status === 'syncing' ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />
        ) : syncState.pendingCount > 0 ? (
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        )}
        <span>{getText()}</span>
      </button>
    );
  }

  return (
    <>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-caption transition-all ${
          !syncState.isOnline
            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            : syncState.status === 'syncing'
            ? 'bg-accent/10 text-accent border-accent/30 animate-pulse'
            : syncState.pendingCount > 0
            ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
            : 'bg-surface-1 text-ink-secondary border-hairline'
        }`}
      >
        {!syncState.isOnline ? (
          <CloudOff className="w-4 h-4 text-amber-500 shrink-0" />
        ) : syncState.status === 'syncing' ? (
          <RefreshCw className="w-4 h-4 animate-spin text-accent shrink-0" />
        ) : syncState.pendingCount > 0 ? (
          <RefreshCw className="w-4 h-4 text-blue-500 shrink-0" />
        ) : (
          <Cloud className="w-4 h-4 text-emerald-500 shrink-0" />
        )}

        <div className="flex flex-col">
          <span className="font-semibold leading-tight">{getText()}</span>
          {syncState.lastSyncedAt && syncState.isOnline && syncState.pendingCount === 0 && (
            <span className="text-[10px] text-ink-tertiary">
              {syncState.lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {syncState.isOnline && syncState.pendingCount > 0 && (
          <button
            onClick={handleManualSync}
            disabled={syncState.status === 'syncing'}
            className="ml-auto text-[11px] font-bold text-accent hover:underline"
          >
            {language === 'id' ? 'Sinkron' : language === 'de' ? 'Sync' : language === 'ar' ? 'مزامنة' : 'Sync'}
          </button>
        )}
      </div>

      {showSyncedToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3 text-body-sm font-medium text-white shadow-xl transition-all animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>
            {language === 'id'
              ? 'Koneksi pulih: Semua pembaruan lokal telah disinkronkan!'
              : language === 'de'
              ? 'Verbindung wiederhergestellt: Alle lokalen Änderungen synchronisiert!'
              : language === 'ar'
              ? 'تمت استعادة الاتصال: تمت مزامنة جميع التغييرات المحلية!'
              : 'Connection restored: All offline changes synced!'}
          </span>
        </div>
      )}
    </>
  );
};
