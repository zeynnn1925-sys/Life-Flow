import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, AlertTriangle, CheckCircle, Trophy, Sparkles, Clock } from 'lucide-react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  limit, 
  Timestamp, 
  deleteDoc, 
  doc, 
  updateDoc, 
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'ai_insight' | 'info' | 'warning' | 'success';
  isRead: boolean;
  createdAt: any;
  link?: string;
}

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  addNotification: (notif: {
    title: string;
    message: string;
    type?: InAppNotification['type'];
    link?: string;
  }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return a safe fallback rather than crashing the component tree
    return {
      notifications: [],
      unreadCount: 0,
      addNotification: async () => {},
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      removeNotification: async () => {},
    };
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);

  // Auto-dismiss toast after 4.5 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [activeToast]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      // Subscribe to users/{userId}/notifications ordered by createdAt descending
      const q = query(
        collection(db, `users/${user.uid}/notifications`),
        orderBy('createdAt', 'desc'),
        limit(30)
      );

      let isInitialLoad = true;

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const newNotifs: InAppNotification[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              userId: data.userId || user.uid,
              title: data.title || '',
              message: data.message || '',
              type: data.type || 'info',
              isRead: data.isRead === true,
              createdAt: data.createdAt || Timestamp.now(),
              link: data.link || undefined,
            };
          });

          setNotifications(newNotifs);

          // Only trigger toast for additions after initial load to prevent toast storms
          if (!isInitialLoad && snapshot.docChanges) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const addedData = change.doc.data();
                if (!addedData.isRead) {
                  setActiveToast({
                    id: change.doc.id,
                    userId: addedData.userId || user.uid,
                    title: addedData.title || '',
                    message: addedData.message || '',
                    type: addedData.type || 'info',
                    isRead: false,
                    createdAt: addedData.createdAt || Timestamp.now(),
                    link: addedData.link || undefined,
                  });
                }
              }
            });
          }

          isInitialLoad = false;
        },
        (error) => {
          console.warn('Notifications snapshot error (handled gracefully):', error);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.warn('Failed to setup notifications listener:', err);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = useCallback(
    async (notif: {
      title: string;
      message: string;
      type?: InAppNotification['type'];
      link?: string;
    }) => {
      if (!user) return;
      try {
        await addDoc(collection(db, `users/${user.uid}/notifications`), {
          userId: user.uid,
          title: notif.title,
          message: notif.message,
          type: notif.type || 'info',
          isRead: false,
          link: notif.link || null,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Failed to add notification:', err);
      }
    },
    [user]
  );

  const markAsRead = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await updateDoc(doc(db, `users/${user.uid}/notifications/${id}`), {
          isRead: true,
        });
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },
    [user]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    try {
      const batch = writeBatch(db);
      unread.forEach((n) => {
        const ref = doc(db, `users/${user.uid}/notifications/${n.id}`);
        batch.update(ref, { isRead: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [user, notifications]);

  const removeNotification = useCallback(
    async (id: string) => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, `users/${user.uid}/notifications/${id}`));
      } catch (err) {
        console.error('Failed to remove notification:', err);
      }
    },
    [user]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
      }}
    >
      {children}

      {/* Global Toast Notification */}
      <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
        <AnimatePresence>
          {activeToast && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-auto bg-surface-1 border border-hairline shadow-2xl rounded-xl p-3.5 flex items-start gap-3 min-w-[280px] max-w-[360px]"
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  activeToast.type === 'achievement'
                    ? 'bg-amber-500/15 text-amber-500'
                    : activeToast.type === 'ai_insight'
                    ? 'bg-accent/15 text-accent'
                    : activeToast.type === 'reminder'
                    ? 'bg-blue-500/15 text-blue-500'
                    : activeToast.type === 'warning'
                    ? 'bg-orange-500/15 text-orange-500'
                    : activeToast.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : 'bg-zinc-500/15 text-zinc-400'
                }`}
              >
                {activeToast.type === 'achievement' && <Trophy size={18} />}
                {activeToast.type === 'ai_insight' && <Sparkles size={18} />}
                {activeToast.type === 'reminder' && <Clock size={18} />}
                {activeToast.type === 'warning' && <AlertTriangle size={18} />}
                {activeToast.type === 'success' && <CheckCircle size={18} />}
                {activeToast.type === 'info' && <Info size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-ink text-xs truncate">{activeToast.title}</h4>
                <p className="text-ink-subtle text-[11px] mt-0.5 line-clamp-2 leading-tight">
                  {activeToast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveToast(null)}
                className="text-ink-subtle hover:text-ink transition-colors p-1"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
