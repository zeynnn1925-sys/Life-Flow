import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Trash, 
  Clock, 
  Trophy, 
  Compass, 
  Warning, 
  CheckCircle, 
  Info, 
  ArrowSquareOut,
  X
} from '@phosphor-icons/react';
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
            <Trophy size={16} weight="regular" />
          </div>
        );
      case 'ai_insight':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#C8A27C]/15 text-[#C8A27C] border border-[#C8A27C]/25 flex items-center justify-center shrink-0">
            <Compass size={16} weight="regular" />
          </div>
        );
      case 'reminder':
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Clock size={16} weight="regular" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Warning size={16} weight="regular" />
          </div>
        );
      case 'success':
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle size={16} weight="regular" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 flex items-center justify-center shrink-0">
            <Info size={16} weight="regular" />
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
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-24px)] bg-[#14161b] rounded-xl shadow-2xl border border-hairline z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[500px]"
          style={{
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-hairline flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-white/90 tracking-normal flex items-center gap-2">
                <span>{language === 'id' ? 'Notifikasi' : 'Notifications'}</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-[#C8A27C] text-stone-950 rounded-full">
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
                  className="px-2 py-1 text-[11px] font-medium text-[#C8A27C] hover:bg-white/[0.04] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  title={language === 'id' ? 'Tandai semua sudah dibaca' : 'Mark all as read'}
                >
                  <Check size={13} weight="regular" />
                  <span>{language === 'id' ? 'Tandai Semua' : 'Mark All'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-ink-subtle hover:text-ink hover:bg-white/[0.04] rounded-md transition-colors sm:hidden cursor-pointer"
                aria-label="Close"
              >
                <X size={15} weight="light" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-hairline overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center text-ink-subtle mb-3 border border-hairline">
                  <Bell size={18} weight="light" className="opacity-60" />
                </div>
                <p className="text-xs font-medium text-white/80 mb-1">
                  {language === 'id' ? 'Belum ada notifikasi' : 'No notifications'}
                </p>
                <p className="text-[11px] text-white/45 max-w-[240px] leading-relaxed">
                  {language === 'id'
                    ? 'Pengingat jadwal, milestone habit, dan wawasan produktivitas akan muncul di sini.'
                    : 'Reminders, habit milestones, and productivity insights will appear here.'}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition-colors relative flex items-start gap-3 cursor-pointer group ${
                    !item.isRead 
                      ? 'bg-white/[0.03] hover:bg-white/[0.05]' 
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Icon */}
                  {getNotificationIcon(item.type)}

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs truncate ${!item.isRead ? 'text-white/95 font-medium' : 'text-white/70'}`}>
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8A27C] shrink-0" />
                      )}
                    </div>

                    <p className="text-[12px] text-white/50 leading-snug line-clamp-2 mb-1.5">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                      <span>{formatTimestamp(item.createdAt)}</span>
                      {item.link && (
                        <>
                          <span>·</span>
                          <span className="text-[#C8A27C] flex items-center gap-0.5 font-sans hover:underline">
                            <span>{language === 'id' ? 'Buka' : 'View'}</span>
                            <ArrowSquareOut size={12} weight="light" />
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
                    className="absolute right-2 top-2 p-1.5 text-white/40 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                    title={language === 'id' ? 'Hapus' : 'Delete'}
                    aria-label="Delete notification"
                  >
                    <Trash size={14} weight="light" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-hairline bg-white/[0.01] text-center">
              <span className="text-[10px] text-white/40 font-mono">
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
