import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Clock, 
  Trophy, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ExternalLink,
  X
} from 'lucide-react';
import { useNotifications, InAppNotification } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { View } from '../../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: View) => void;
}

export function NotificationDropdown({ isOpen, onClose, onNavigate }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const { language } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && target.closest('#bell-notification-btn')) {
        return; // Let the button toggle itself
      }
      if (dropdownRef.current && target && !dropdownRef.current.contains(target)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const formatTimestamp = (createdAt: any): string => {
    try {
      if (!createdAt) return language === 'id' ? 'Baru saja' : 'Just now';

      let date: Date;
      if (typeof createdAt?.toMillis === 'function') {
        date = new Date(createdAt.toMillis());
      } else if (createdAt instanceof Date) {
        date = createdAt;
      } else if (typeof createdAt === 'number') {
        date = new Date(createdAt);
      } else if (typeof createdAt === 'string') {
        date = new Date(createdAt);
      } else if (createdAt && typeof createdAt.seconds === 'number') {
        date = new Date(createdAt.seconds * 1000);
      } else {
        return language === 'id' ? 'Baru saja' : 'Just now';
      }

      if (isNaN(date.getTime())) {
        return language === 'id' ? 'Baru saja' : 'Just now';
      }

      const diffMs = Date.now() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMin < 1) return language === 'id' ? 'Baru saja' : 'Just now';
      if (diffMin < 60) return `${diffMin}m ${language === 'id' ? 'lalu' : 'ago'}`;
      if (diffHours < 24) return `${diffHours}j ${language === 'id' ? 'lalu' : 'h ago'}`;
      if (diffDays === 1) return language === 'id' ? 'Kemarin' : 'Yesterday';
      if (diffDays < 7) return `${diffDays} ${language === 'id' ? 'hari lalu' : 'days ago'}`;

      return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return language === 'id' ? 'Baru saja' : 'Just now';
    }
  };

  const getNotificationIcon = (type: InAppNotification['type']) => {
    switch (type) {
      case 'achievement':
        return (
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
        );
      case 'ai_insight':
        return (
          <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent border border-accent/25 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'reminder':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      case 'success':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  const handleNotificationClick = (item: InAppNotification) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }

    if (item.link && onNavigate) {
      onNavigate(item.link as View);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-surface-1 rounded-xl shadow-2xl border border-hairline z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[500px]"
          style={{
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-hairline flex items-center justify-between bg-surface-2/40">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-ink tracking-tight flex items-center gap-2">
                <span>{language === 'id' ? 'Notifikasi' : 'Notifications'}</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-accent text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="px-2.5 py-1 text-[11px] font-semibold text-accent hover:bg-accent/10 rounded-md transition-colors flex items-center gap-1.5"
                  title={language === 'id' ? 'Tandai semua sudah dibaca' : 'Mark all as read'}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'id' ? 'Tandai Semua' : 'Mark All'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-ink-subtle hover:text-ink hover:bg-surface-2 rounded-md transition-colors sm:hidden"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-hairline overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-ink-subtle mb-3 border border-hairline">
                  <Bell className="w-6 h-6 opacity-60" />
                </div>
                <p className="text-xs font-semibold text-ink mb-1">
                  {language === 'id' ? 'Belum Ada Notifikasi' : 'No Notifications'}
                </p>
                <p className="text-[11px] text-ink-subtle max-w-[220px]">
                  {language === 'id'
                    ? 'Pengingat jadwal, milestone habit, dan saran AI akan muncul di sini.'
                    : 'Reminders, habit milestones, and AI insights will appear here.'}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition-colors relative flex items-start gap-3 cursor-pointer group ${
                    !item.isRead 
                      ? 'bg-accent/[0.04] hover:bg-accent/[0.08]' 
                      : 'hover:bg-surface-2/60'
                  }`}
                >
                  {/* Icon */}
                  {getNotificationIcon(item.type)}

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-semibold truncate ${!item.isRead ? 'text-ink font-bold' : 'text-ink-secondary'}`}>
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-accent shrink-0 animate-pulse" />
                      )}
                    </div>

                    <p className="text-[12px] text-ink-subtle leading-snug line-clamp-2 mb-1.5">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-ink-tertiary">
                      <span>{formatTimestamp(item.createdAt)}</span>
                      {item.link && (
                        <>
                          <span>•</span>
                          <span className="text-accent flex items-center gap-0.5 font-medium hover:underline">
                            <span>{language === 'id' ? 'Buka' : 'View'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(item.id);
                    }}
                    className="absolute right-2 top-2 p-1.5 text-ink-subtle opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                    title={language === 'id' ? 'Hapus' : 'Delete'}
                    aria-label="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-hairline bg-surface-2/30 text-center">
              <span className="text-[10px] text-ink-tertiary">
                {language === 'id'
                  ? `${notifications.length} notifikasi tersimpan`
                  : `${notifications.length} stored notifications`}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
