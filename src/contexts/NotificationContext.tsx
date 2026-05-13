import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, AlertTriangle, CheckCircle, Trophy } from 'lucide-react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, orderBy, limit, Timestamp, deleteDoc, doc } from 'firebase/firestore';

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'achievement';
  createdAt: Timestamp;
}

interface NotificationContextType {
  notifications: InAppNotification[];
  addNotification: (notif: Omit<InAppNotification, 'id' | 'createdAt'>) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/in_app_notifications`),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const newNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InAppNotification));
      setNotifications(newNotifs);
      
      // Auto show toast for the newest one if it's new
      if (newNotifs.length > 0) {
        const newest = newNotifs[0];
        // Only show if it's less than 10 seconds old
        if (Date.now() - newest.createdAt.toMillis() < 10000) {
          setActiveToast(newest);
          setTimeout(() => setActiveToast(null), 5000);
        }
      }
    });

    return unsub;
  }, [user]);

  const addNotification = useCallback(async (notif: Omit<InAppNotification, 'id' | 'createdAt'>) => {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/in_app_notifications`), {
      ...notif,
      createdAt: Timestamp.now(),
      userId: user.uid
    });
  }, [user]);

  const removeNotification = useCallback(async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/in_app_notifications/${id}`));
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      
      {/* Global Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
        <AnimatePresence>
          {activeToast && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pointer-events-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl p-4 flex items-start gap-4 min-w-[300px] max-w-[400px]"
            >
              <div className={`p-2 rounded-lg ${
                activeToast.type === 'success' ? 'bg-green-100 text-green-600' :
                activeToast.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                activeToast.type === 'achievement' ? 'bg-purple-100 text-purple-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {activeToast.type === 'success' && <CheckCircle size={20} />}
                {activeToast.type === 'warning' && <AlertTriangle size={20} />}
                {activeToast.type === 'achievement' && <Trophy size={20} />}
                {activeToast.type === 'info' && <Info size={20} />}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">
                  {activeToast.title}
                </h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  {activeToast.message}
                </p>
              </div>
              <button 
                onClick={() => setActiveToast(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                id="close-toast-btn"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
