import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from './AuthContext';
import {
  Transaction,
  RecurringTransaction,
  Category,
  Task,
  Target,
  NotificationSetting,
  DailyQuote,
  AIProductivityPlan,
  Budget,
  SavingsGoal
} from '../types';
import { Habit, HabitLog } from '../types/habits';
import { habitService } from '../services/habitService';
import { cleanFirestoreData } from '../lib/utils';
import { offlineSync } from '../services/offlineSyncService';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

interface DataContextType {
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
  tasks: Task[];
  targets: Target[];
  unlockedAchievements: { id: string; unlockedAt: string }[];
  notificationSettings: NotificationSetting[];
  dailyQuote: DailyQuote | null;
  aiPlan: AIProductivityPlan | null;
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  habits: Habit[];
  habitLogs: HabitLog[];

  saveTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  saveRecurringTransaction: (t: RecurringTransaction) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  saveCategory: (c: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveTask: (t: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  saveTarget: (t: Target) => Promise<void>;
  deleteTarget: (id: string) => Promise<void>;
  saveUnlockedAchievement: (id: string, unlockedAt: string) => Promise<void>;
  saveNotificationSetting: (s: NotificationSetting) => Promise<void>;
  saveDailyQuote: (q: DailyQuote) => Promise<void>;
  saveAIPlan: (p: AIProductivityPlan) => Promise<void>;
  saveBudget: (b: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  saveSavingsGoal: (g: SavingsGoal) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  saveHabit: (h: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  logHabit: (habitId: string, count: number, note?: string, mood?: number) => Promise<void>;
  skipHabit: (habitId: string, note?: string) => Promise<void>;
  resetCategories: () => Promise<void>;
  clearError: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<{ id: string; unlockedAt: string }[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);
  const [aiPlan, setAiPlan] = useState<AIProductivityPlan | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [, setError] = useState<Error | null>(null);

  const isOnline = () => (typeof navigator !== 'undefined' ? navigator.onLine : true);

  const handleError = (err: unknown, operationType: OperationType, path: string | null) => {
    try {
      handleFirestoreError(err, operationType, path);
    } catch (e) {
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error(String(e)));
      }
    }
  };

  // Reset categories to defaults
  const resetCategories = async () => {
    if (!user) return;
    try {
      const DEFAULT_CATEGORIES: Category[] = [
        // Income
        { id: 'i1', name: 'Regular Income', icon: 'Briefcase', type: 'income', color: '#f77f00', group: 'Pendapatan Rutin' },
        { id: 'i2', name: 'Irregular Income', icon: 'Gift', type: 'income', color: '#f77f00', group: 'Pendapatan Tidak Rutin' },
        { id: 'i3', name: 'Passive/Investment', icon: 'Landmark', type: 'income', color: '#f77f00', group: 'Pendapatan Pasif' },

        // Expenses - Needs
        { id: 'e1', name: 'Housing', icon: 'Home', type: 'expense', color: '#d62828', group: 'Needs' },
        { id: 'e2', name: 'Utilities', icon: 'Zap', type: 'expense', color: '#d62828', group: 'Needs' },
        { id: 'e3', name: 'Food', icon: 'Utensils', type: 'expense', color: '#d62828', group: 'Needs' },
        { id: 'e4', name: 'Transport', icon: 'Car', type: 'expense', color: '#d62828', group: 'Needs' },
        { id: 'e5', name: 'Health', icon: 'Heart', type: 'expense', color: '#d62828', group: 'Needs' },

        // Expenses - Wants
        { id: 'e6', name: 'Entertainment', icon: 'Gamepad', type: 'expense', color: '#eae2b7', group: 'Wants' },
        { id: 'e7', name: 'Social', icon: 'Users', type: 'expense', color: '#eae2b7', group: 'Wants' },
        { id: 'e8', name: 'Personal Care', icon: 'ShoppingBag', type: 'expense', color: '#eae2b7', group: 'Wants' },

        // Expenses - Savings & Debt
        { id: 'e9', name: 'Emergency Fund', icon: 'ShieldCheck', type: 'expense', color: '#fcbf49', group: 'Savings & Debt' },
        { id: 'e10', name: 'Investment', icon: 'PieChart', type: 'expense', color: '#fcbf49', group: 'Savings & Debt' },
        { id: 'e11', name: 'Debt', icon: 'CreditCard', type: 'expense', color: '#fcbf49', group: 'Savings & Debt' },
      ];

      setCategories(DEFAULT_CATEGORIES);
      await offlineSync.setCachedData(user.uid, 'categories', DEFAULT_CATEGORIES);

      if (isOnline()) {
        for (const cat of categories) {
          await deleteDoc(doc(db, `users/${user.uid}/categories/${cat.id}`));
        }
        for (const cat of DEFAULT_CATEGORIES) {
          await setDoc(doc(db, `users/${user.uid}/categories/${cat.id}`), cleanFirestoreData({ ...cat, userId: user.uid }));
        }
      } else {
        for (const cat of categories) {
          await offlineSync.enqueueMutation({
            operation: 'DELETE',
            collection: 'categories',
            docId: cat.id,
            userId: user.uid,
          });
        }
        for (const cat of DEFAULT_CATEGORIES) {
          await offlineSync.enqueueMutation({
            operation: 'WRITE',
            collection: 'categories',
            docId: cat.id,
            data: cleanFirestoreData({ ...cat, userId: user.uid }),
            userId: user.uid,
          });
        }
      }
    } catch (error) {
      handleError(error, OperationType.DELETE, `users/${user.uid}/categories`);
    }
  };

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setRecurringTransactions([]);
      setCategories([]);
      setTasks([]);
      setTargets([]);
      setUnlockedAchievements([]);
      setNotificationSettings([]);
      setDailyQuote(null);
      setAiPlan(null);
      setBudgets([]);
      setSavingsGoals([]);
      setHabits([]);
      setHabitLogs([]);
      return;
    }

    const userId = user.uid;

    // Load offline cached data immediately for instant render
    const hydrateLocalCache = async () => {
      try {
        const [
          cachedTx,
          cachedRec,
          cachedCat,
          cachedTasks,
          cachedTargets,
          cachedAch,
          cachedSettings,
          cachedQuote,
          cachedPlan,
          cachedBudgets,
          cachedGoals,
          cachedHabits,
          cachedHabitLogs,
        ] = await Promise.all([
          offlineSync.getCachedData<Transaction[]>(userId, 'transactions'),
          offlineSync.getCachedData<RecurringTransaction[]>(userId, 'recurring_transactions'),
          offlineSync.getCachedData<Category[]>(userId, 'categories'),
          offlineSync.getCachedData<Task[]>(userId, 'tasks'),
          offlineSync.getCachedData<Target[]>(userId, 'targets'),
          offlineSync.getCachedData<{ id: string; unlockedAt: string }[]>(userId, 'unlocked_achievements'),
          offlineSync.getCachedData<NotificationSetting[]>(userId, 'notification_settings'),
          offlineSync.getCachedData<DailyQuote>(userId, 'daily_quote'),
          offlineSync.getCachedData<AIProductivityPlan>(userId, 'ai_plan'),
          offlineSync.getCachedData<Budget[]>(userId, 'budgets'),
          offlineSync.getCachedData<SavingsGoal[]>(userId, 'savings_goals'),
          offlineSync.getCachedData<Habit[]>(userId, 'habits'),
          offlineSync.getCachedData<HabitLog[]>(userId, 'habit_logs'),
        ]);

        if (cachedTx) setTransactions(cachedTx);
        if (cachedRec) setRecurringTransactions(cachedRec);
        if (cachedCat) setCategories(cachedCat);
        if (cachedTasks) setTasks(cachedTasks);
        if (cachedTargets) setTargets(cachedTargets);
        if (cachedAch) setUnlockedAchievements(cachedAch);
        if (cachedSettings) setNotificationSettings(cachedSettings);
        if (cachedQuote) setDailyQuote(cachedQuote);
        if (cachedPlan) setAiPlan(cachedPlan);
        if (cachedBudgets) setBudgets(cachedBudgets);
        if (cachedGoals) setSavingsGoals(cachedGoals);
        if (cachedHabits) setHabits(cachedHabits);
        if (cachedHabitLogs) setHabitLogs(cachedHabitLogs);
      } catch (e) {
        console.debug('Error reading local cache:', e);
      }
    };

    hydrateLocalCache();

    // Trigger sync for queued updates if connected
    if (isOnline()) {
      offlineSync.syncQueueForUser(userId);
    }

    const unsubTransactions = onSnapshot(collection(db, `users/${userId}/transactions`), (snapshot) => {
      const data = snapshot.docs.map((docItem) => docItem.data() as Transaction);
      setTransactions(data);
      offlineSync.setCachedData(userId, 'transactions', data);
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/transactions`);
    });

    const unsubRecurring = onSnapshot(collection(db, `users/${userId}/recurring_transactions`), (snapshot) => {
      const data = snapshot.docs.map((docItem) => docItem.data() as RecurringTransaction);
      setRecurringTransactions(data);
      offlineSync.setCachedData(userId, 'recurring_transactions', data);
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/recurring_transactions`);
    });

    const unsubCategories = onSnapshot(collection(db, `users/${userId}/categories`), (snapshot) => {
      const data = snapshot.docs.map((docItem) => docItem.data() as Category);
      setCategories(data);
      offlineSync.setCachedData(userId, 'categories', data);
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/categories`);
    });

    const unsubTasks = onSnapshot(collection(db, `users/${userId}/tasks`), (snapshot) => {
      const data = snapshot.docs.map((docItem) => docItem.data() as Task);
      setTasks(data);
      offlineSync.setCachedData(userId, 'tasks', data);
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/tasks`);
    });

    const unsubTargets = onSnapshot(collection(db, `users/${userId}/targets`), (snapshot) => {
      const data = snapshot.docs.map((docItem) => docItem.data() as Target);
      setTargets(data);
      offlineSync.setCachedData(userId, 'targets', data);
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/targets`);
    });

    const unsubAchievements = onSnapshot(collection(db, `users/${userId}/unlocked_achievements`), (snapshot) => {
      const data = snapshot.docs.map((docItem) => docItem.data() as { id: string; unlockedAt: string });
      setUnlockedAchievements(data);
      offlineSync.setCachedData(userId, 'unlocked_achievements', data);
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/unlocked_achievements`);
    });

    const unsubSettings = onSnapshot(collection(db, `users/${userId}/notification_settings`), (snapshot) => {
      const data = snapshot.docs.map((docItem) => docItem.data() as NotificationSetting);
      setNotificationSettings(data);
      offlineSync.setCachedData(userId, 'notification_settings', data);
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/notification_settings`);
    });

    const unsubQuote = onSnapshot(doc(db, `users/${userId}/daily_quote/current`), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as DailyQuote;
        setDailyQuote(data);
        offlineSync.setCachedData(userId, 'daily_quote', data);
      }
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/daily_quote/current`);
    });

    const unsubPlan = onSnapshot(doc(db, `users/${userId}/ai_plan/current`), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AIProductivityPlan;
        setAiPlan(data);
        offlineSync.setCachedData(userId, 'ai_plan', data);
      }
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/ai_plan/current`);
    });

    const unsubBudgets = onSnapshot(collection(db, `users/${userId}/budgets`), (snapshot) => {
      const data = snapshot.docs.map((docItem) => docItem.data() as Budget);
      setBudgets(data);
      offlineSync.setCachedData(userId, 'budgets', data);
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/budgets`);
    });

    const unsubSavingsGoals = onSnapshot(collection(db, `users/${userId}/savings_goals`), (snapshot) => {
      const data = snapshot.docs.map((docItem) => docItem.data() as SavingsGoal);
      setSavingsGoals(data);
      offlineSync.setCachedData(userId, 'savings_goals', data);
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/savings_goals`);
    });

    const unsubHabits = onSnapshot(collection(db, `users/${userId}/habits`), (snapshot) => {
      const data = snapshot.docs.map((docItem) => docItem.data() as Habit);
      setHabits(data);
      offlineSync.setCachedData(userId, 'habits', data);
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/habits`);
    });

    const unsubHabitLogs = onSnapshot(collection(db, `users/${userId}/habit_logs`), (snapshot) => {
      const data = snapshot.docs.map((docItem) => docItem.data() as HabitLog);
      setHabitLogs(data);
      offlineSync.setCachedData(userId, 'habit_logs', data);
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/habit_logs`);
    });

    return () => {
      unsubTransactions();
      unsubRecurring();
      unsubCategories();
      unsubTasks();
      unsubTargets();
      unsubAchievements();
      unsubSettings();
      unsubQuote();
      unsubPlan();
      unsubBudgets();
      unsubSavingsGoals();
      unsubHabits();
      unsubHabitLogs();
    };
  }, [user]);

  const saveTransaction = async (t: Transaction) => {
    if (!user) return;
    const cleanData = cleanFirestoreData({ ...t, userId: user.uid });
    setTransactions((prev) => {
      const idx = prev.findIndex((item) => item.id === t.id);
      const next = idx >= 0 ? prev.map((item) => (item.id === t.id ? t : item)) : [t, ...prev];
      offlineSync.setCachedData(user.uid, 'transactions', next);
      return next;
    });

    if (isOnline()) {
      try {
        await setDoc(doc(db, `users/${user.uid}/transactions/${t.id}`), cleanData);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'transactions',
          docId: t.id,
          data: cleanData,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'transactions',
        docId: t.id,
        data: cleanData,
        userId: user.uid,
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    setTransactions((prev) => {
      const next = prev.filter((item) => item.id !== id);
      offlineSync.setCachedData(user.uid, 'transactions', next);
      return next;
    });

    if (isOnline()) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/transactions/${id}`));
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'DELETE',
          collection: 'transactions',
          docId: id,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'DELETE',
        collection: 'transactions',
        docId: id,
        userId: user.uid,
      });
    }
  };

  const saveRecurringTransaction = async (t: RecurringTransaction) => {
    if (!user) return;
    const cleanData = cleanFirestoreData({ ...t, userId: user.uid });
    setRecurringTransactions((prev) => {
      const idx = prev.findIndex((item) => item.id === t.id);
      const next = idx >= 0 ? prev.map((item) => (item.id === t.id ? t : item)) : [t, ...prev];
      offlineSync.setCachedData(user.uid, 'recurring_transactions', next);
      return next;
    });

    if (isOnline()) {
      try {
        await setDoc(doc(db, `users/${user.uid}/recurring_transactions/${t.id}`), cleanData);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'recurring_transactions',
          docId: t.id,
          data: cleanData,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'recurring_transactions',
        docId: t.id,
        data: cleanData,
        userId: user.uid,
      });
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    if (!user) return;
    setRecurringTransactions((prev) => {
      const next = prev.filter((item) => item.id !== id);
      offlineSync.setCachedData(user.uid, 'recurring_transactions', next);
      return next;
    });

    if (isOnline()) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/recurring_transactions/${id}`));
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'DELETE',
          collection: 'recurring_transactions',
          docId: id,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'DELETE',
        collection: 'recurring_transactions',
        docId: id,
        userId: user.uid,
      });
    }
  };

  const saveCategory = async (c: Category) => {
    if (!user) return;
    const cleanData = cleanFirestoreData({ ...c, userId: user.uid });
    setCategories((prev) => {
      const idx = prev.findIndex((item) => item.id === c.id);
      const next = idx >= 0 ? prev.map((item) => (item.id === c.id ? c : item)) : [...prev, c];
      offlineSync.setCachedData(user.uid, 'categories', next);
      return next;
    });

    if (isOnline()) {
      try {
        await setDoc(doc(db, `users/${user.uid}/categories/${c.id}`), cleanData);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'categories',
          docId: c.id,
          data: cleanData,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'categories',
        docId: c.id,
        data: cleanData,
        userId: user.uid,
      });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    setCategories((prev) => {
      const next = prev.filter((item) => item.id !== id);
      offlineSync.setCachedData(user.uid, 'categories', next);
      return next;
    });

    if (isOnline()) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/categories/${id}`));
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'DELETE',
          collection: 'categories',
          docId: id,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'DELETE',
        collection: 'categories',
        docId: id,
        userId: user.uid,
      });
    }
  };

  const saveTask = async (t: Task) => {
    if (!user) return;
    const cleanData = cleanFirestoreData({ ...t, userId: user.uid });
    setTasks((prev) => {
      const idx = prev.findIndex((item) => item.id === t.id);
      const next = idx >= 0 ? prev.map((item) => (item.id === t.id ? t : item)) : [...prev, t];
      offlineSync.setCachedData(user.uid, 'tasks', next);
      return next;
    });

    if (isOnline()) {
      try {
        await setDoc(doc(db, `users/${user.uid}/tasks/${t.id}`), cleanData);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'tasks',
          docId: t.id,
          data: cleanData,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'tasks',
        docId: t.id,
        data: cleanData,
        userId: user.uid,
      });
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    setTasks((prev) => {
      const next = prev.filter((item) => item.id !== id);
      offlineSync.setCachedData(user.uid, 'tasks', next);
      return next;
    });

    if (isOnline()) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/tasks/${id}`));
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'DELETE',
          collection: 'tasks',
          docId: id,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'DELETE',
        collection: 'tasks',
        docId: id,
        userId: user.uid,
      });
    }
  };

  const saveTarget = async (t: Target) => {
    if (!user) return;
    const cleanData = cleanFirestoreData({ ...t, userId: user.uid });
    setTargets((prev) => {
      const idx = prev.findIndex((item) => item.id === t.id);
      const next = idx >= 0 ? prev.map((item) => (item.id === t.id ? t : item)) : [...prev, t];
      offlineSync.setCachedData(user.uid, 'targets', next);
      return next;
    });

    if (isOnline()) {
      try {
        await setDoc(doc(db, `users/${user.uid}/targets/${t.id}`), cleanData);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'targets',
          docId: t.id,
          data: cleanData,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'targets',
        docId: t.id,
        data: cleanData,
        userId: user.uid,
      });
    }
  };

  const deleteTarget = async (id: string) => {
    if (!user) return;
    setTargets((prev) => {
      const next = prev.filter((item) => item.id !== id);
      offlineSync.setCachedData(user.uid, 'targets', next);
      return next;
    });

    if (isOnline()) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/targets/${id}`));
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'DELETE',
          collection: 'targets',
          docId: id,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'DELETE',
        collection: 'targets',
        docId: id,
        userId: user.uid,
      });
    }
  };

  const saveUnlockedAchievement = async (id: string, unlockedAt: string) => {
    if (!user) return;
    const item = { id, unlockedAt, userId: user.uid };
    const cleanData = cleanFirestoreData(item);
    setUnlockedAchievements((prev) => {
      const next = prev.some((a) => a.id === id) ? prev : [...prev, { id, unlockedAt }];
      offlineSync.setCachedData(user.uid, 'unlocked_achievements', next);
      return next;
    });

    if (isOnline()) {
      try {
        await setDoc(doc(db, `users/${user.uid}/unlocked_achievements/${id}`), cleanData);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'unlocked_achievements',
          docId: id,
          data: cleanData,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'unlocked_achievements',
        docId: id,
        data: cleanData,
        userId: user.uid,
      });
    }
  };

  const saveNotificationSetting = async (s: NotificationSetting) => {
    if (!user) return;
    const cleanData = cleanFirestoreData({ ...s, userId: user.uid });
    setNotificationSettings((prev) => {
      const idx = prev.findIndex((item) => item.id === s.id);
      const next = idx >= 0 ? prev.map((item) => (item.id === s.id ? s : item)) : [...prev, s];
      offlineSync.setCachedData(user.uid, 'notification_settings', next);
      return next;
    });

    if (isOnline()) {
      try {
        await setDoc(doc(db, `users/${user.uid}/notification_settings/${s.id}`), cleanData);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'notification_settings',
          docId: s.id,
          data: cleanData,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'notification_settings',
        docId: s.id,
        data: cleanData,
        userId: user.uid,
      });
    }
  };

  const saveDailyQuote = async (q: DailyQuote) => {
    if (!user) return;
    const cleanData = cleanFirestoreData({ ...q, userId: user.uid });
    setDailyQuote(q);
    await offlineSync.setCachedData(user.uid, 'daily_quote', q);

    if (isOnline()) {
      try {
        await setDoc(doc(db, `users/${user.uid}/daily_quote/current`), cleanData);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'daily_quote',
          docId: 'current',
          data: cleanData,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'daily_quote',
        docId: 'current',
        data: cleanData,
        userId: user.uid,
      });
    }
  };

  const saveAIPlan = async (p: AIProductivityPlan) => {
    if (!user) return;
    const cleanData = cleanFirestoreData({ ...p, userId: user.uid });
    setAiPlan(p);
    await offlineSync.setCachedData(user.uid, 'ai_plan', p);

    if (isOnline()) {
      try {
        await setDoc(doc(db, `users/${user.uid}/ai_plan/current`), cleanData);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'ai_plan',
          docId: 'current',
          data: cleanData,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'ai_plan',
        docId: 'current',
        data: cleanData,
        userId: user.uid,
      });
    }
  };

  const saveBudget = async (b: Budget) => {
    if (!user) return;
    const cleanData = cleanFirestoreData({ ...b, userId: user.uid });
    setBudgets((prev) => {
      const idx = prev.findIndex((item) => item.id === b.id);
      const next = idx >= 0 ? prev.map((item) => (item.id === b.id ? b : item)) : [...prev, b];
      offlineSync.setCachedData(user.uid, 'budgets', next);
      return next;
    });

    if (isOnline()) {
      try {
        await setDoc(doc(db, `users/${user.uid}/budgets/${b.id}`), cleanData);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'budgets',
          docId: b.id,
          data: cleanData,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'budgets',
        docId: b.id,
        data: cleanData,
        userId: user.uid,
      });
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;
    setBudgets((prev) => {
      const next = prev.filter((item) => item.id !== id);
      offlineSync.setCachedData(user.uid, 'budgets', next);
      return next;
    });

    if (isOnline()) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/budgets/${id}`));
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'DELETE',
          collection: 'budgets',
          docId: id,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'DELETE',
        collection: 'budgets',
        docId: id,
        userId: user.uid,
      });
    }
  };

  const saveSavingsGoal = async (g: SavingsGoal) => {
    if (!user) return;
    const cleanData = cleanFirestoreData({ ...g, userId: user.uid });
    setSavingsGoals((prev) => {
      const idx = prev.findIndex((item) => item.id === g.id);
      const next = idx >= 0 ? prev.map((item) => (item.id === g.id ? g : item)) : [...prev, g];
      offlineSync.setCachedData(user.uid, 'savings_goals', next);
      return next;
    });

    if (isOnline()) {
      try {
        await setDoc(doc(db, `users/${user.uid}/savings_goals/${g.id}`), cleanData);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'savings_goals',
          docId: g.id,
          data: cleanData,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'savings_goals',
        docId: g.id,
        data: cleanData,
        userId: user.uid,
      });
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    if (!user) return;
    setSavingsGoals((prev) => {
      const next = prev.filter((item) => item.id !== id);
      offlineSync.setCachedData(user.uid, 'savings_goals', next);
      return next;
    });

    if (isOnline()) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/savings_goals/${id}`));
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'DELETE',
          collection: 'savings_goals',
          docId: id,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'DELETE',
        collection: 'savings_goals',
        docId: id,
        userId: user.uid,
      });
    }
  };

  const saveHabit = async (h: Habit) => {
    if (!user) return;
    setHabits((prev) => {
      const idx = prev.findIndex((item) => item.id === h.id);
      const next = idx >= 0 ? prev.map((item) => (item.id === h.id ? h : item)) : [...prev, h];
      offlineSync.setCachedData(user.uid, 'habits', next);
      return next;
    });

    if (isOnline()) {
      try {
        await habitService.saveHabit(user.uid, h);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'WRITE',
          collection: 'habits',
          docId: h.id,
          data: cleanFirestoreData({ ...h, userId: user.uid }),
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'WRITE',
        collection: 'habits',
        docId: h.id,
        data: cleanFirestoreData({ ...h, userId: user.uid }),
        userId: user.uid,
      });
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    setHabits((prev) => {
      const next = prev.filter((item) => item.id !== id);
      offlineSync.setCachedData(user.uid, 'habits', next);
      return next;
    });

    if (isOnline()) {
      try {
        await habitService.deleteHabit(user.uid, id);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'DELETE',
          collection: 'habits',
          docId: id,
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'DELETE',
        collection: 'habits',
        docId: id,
        userId: user.uid,
      });
    }
  };

  const logHabit = async (habitId: string, count: number, note?: string, mood?: number) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const logId = `${habitId}_${today}`;

    setHabitLogs((prev) => {
      const idx = prev.findIndex((item) => item.id === logId);
      const existing = prev[idx];
      const updatedLog: HabitLog = {
        id: logId,
        habitId,
        date: today,
        completedCount: (existing ? existing.completedCount : 0) + count,
        completedAt: [...(existing?.completedAt || []), new Date().toISOString() as any],
        note: note !== undefined ? note : existing?.note,
        mood: (mood !== undefined ? mood : existing?.mood) as any,
        skipped: false,
      };
      const next = idx >= 0 ? prev.map((item) => (item.id === logId ? updatedLog : item)) : [...prev, updatedLog];
      offlineSync.setCachedData(user.uid, 'habit_logs', next);
      return next;
    });

    if (isOnline()) {
      try {
        await habitService.logHabit(user.uid, habitId, count, note, mood);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'HABIT_LOG',
          collection: 'habit_logs',
          docId: logId,
          data: { habitId, count, note, mood },
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'HABIT_LOG',
        collection: 'habit_logs',
        docId: logId,
        data: { habitId, count, note, mood },
        userId: user.uid,
      });
    }
  };

  const skipHabit = async (habitId: string, note?: string) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const logId = `${habitId}_${today}`;

    setHabitLogs((prev) => {
      const idx = prev.findIndex((item) => item.id === logId);
      const updatedLog: HabitLog = {
        id: logId,
        habitId,
        date: today,
        completedCount: 0,
        completedAt: [],
        note,
        skipped: true,
      };
      const next = idx >= 0 ? prev.map((item) => (item.id === logId ? updatedLog : item)) : [...prev, updatedLog];
      offlineSync.setCachedData(user.uid, 'habit_logs', next);
      return next;
    });

    if (isOnline()) {
      try {
        await habitService.skipHabit(user.uid, habitId, note);
      } catch (error) {
        await offlineSync.enqueueMutation({
          operation: 'HABIT_SKIP',
          collection: 'habit_logs',
          docId: logId,
          data: { habitId, note },
          userId: user.uid,
        });
      }
    } else {
      await offlineSync.enqueueMutation({
        operation: 'HABIT_SKIP',
        collection: 'habit_logs',
        docId: logId,
        data: { habitId, note },
        userId: user.uid,
      });
    }
  };

  const value = useMemo(
    () => ({
      transactions,
      recurringTransactions,
      categories,
      tasks,
      targets,
      unlockedAchievements,
      notificationSettings,
      dailyQuote,
      aiPlan,
      budgets,
      savingsGoals,
      habits,
      habitLogs,
      saveTransaction,
      deleteTransaction,
      saveRecurringTransaction,
      deleteRecurringTransaction,
      saveCategory,
      deleteCategory,
      saveTask,
      deleteTask,
      saveTarget,
      deleteTarget,
      saveUnlockedAchievement,
      saveNotificationSetting,
      saveDailyQuote,
      saveAIPlan,
      saveBudget,
      deleteBudget,
      saveSavingsGoal,
      deleteSavingsGoal,
      saveHabit,
      deleteHabit,
      logHabit,
      skipHabit,
      resetCategories,
      clearError: () => setError(null),
    }),
    [
      transactions,
      recurringTransactions,
      categories,
      tasks,
      targets,
      unlockedAchievements,
      notificationSettings,
      dailyQuote,
      aiPlan,
      budgets,
      savingsGoals,
      habits,
      habitLogs,
      user?.uid,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
