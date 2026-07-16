import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, query } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from './AuthContext';
import { Transaction, RecurringTransaction, Category, Task, Target, Achievement, NotificationSetting, DailyQuote, AIProductivityPlan, Budget, SavingsGoal } from '../types';
import { Habit, HabitLog } from '../types/habits';
import { habitService } from '../services/habitService';
import { cleanFirestoreData } from '../lib/utils';

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
  }
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
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface DataContextType {
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
  tasks: Task[];
  targets: Target[];
  unlockedAchievements: { id: string, unlockedAt: string }[];
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
  const [unlockedAchievements, setUnlockedAchievements] = useState<{ id: string, unlockedAt: string }[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);
  const [aiPlan, setAiPlan] = useState<AIProductivityPlan | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const handleError = (err: unknown, operationType: OperationType, path: string | null) => {
    try {
      handleFirestoreError(err, operationType, path);
    } catch (e) {
      console.error("Firestore error captured by DataProvider:", e);
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error(String(e)));
      }
    }
  };

  const resetCategories = async () => {
    if (!user) return;
    try {
      // Delete existing categories first
      for (const cat of categories) {
        await deleteDoc(doc(db, `users/${user.uid}/categories/${cat.id}`));
      }
      // Add default categories
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
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, `users/${user.uid}/categories/${cat.id}`), cleanFirestoreData({ ...cat, userId: user.uid }));
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

    const unsubTransactions = onSnapshot(collection(db, `users/${userId}/transactions`), (snapshot) => {
      setTransactions(snapshot.docs.map(doc => doc.data() as Transaction));
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/transactions`);
    });

    const unsubRecurring = onSnapshot(collection(db, `users/${userId}/recurring_transactions`), (snapshot) => {
      setRecurringTransactions(snapshot.docs.map(doc => doc.data() as RecurringTransaction));
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/recurring_transactions`);
    });

    const unsubCategories = onSnapshot(collection(db, `users/${userId}/categories`), (snapshot) => {
      setCategories(snapshot.docs.map(doc => doc.data() as Category));
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/categories`);
    });

    const unsubTasks = onSnapshot(collection(db, `users/${userId}/tasks`), (snapshot) => {
      setTasks(snapshot.docs.map(doc => doc.data() as Task));
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/tasks`);
    });

    const unsubTargets = onSnapshot(collection(db, `users/${userId}/targets`), (snapshot) => {
      setTargets(snapshot.docs.map(doc => doc.data() as Target));
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/targets`);
    });

    const unsubAchievements = onSnapshot(collection(db, `users/${userId}/unlocked_achievements`), (snapshot) => {
      setUnlockedAchievements(snapshot.docs.map(doc => doc.data() as { id: string, unlockedAt: string }));
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/unlocked_achievements`);
    });

    const unsubSettings = onSnapshot(collection(db, `users/${userId}/notification_settings`), (snapshot) => {
      const settings = snapshot.docs.map(doc => doc.data() as NotificationSetting);
      setNotificationSettings(settings);

      // Initialize default settings if they don't exist
      const requiredTypes: NotificationSetting['type'][] = ['schedule', 'bill', 'target', 'habit_reminder', 'streak_warning'];
      requiredTypes.forEach(async (type) => {
        if (!settings.find(s => s.type === type)) {
          const id = `notif_${type}`;
          await setDoc(doc(db, `users/${userId}/notification_settings/${id}`), cleanFirestoreData({
            id,
            type,
            enabled: true,
            time: type === 'streak_warning' ? '20:00' : '09:00',
            frequency: 'daily',
            userId
          }));
        }
      });
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/notification_settings`);
    });

    const unsubQuote = onSnapshot(doc(db, `users/${userId}/daily_quote/current`), (doc) => {
      if (doc.exists()) {
        setDailyQuote(doc.data() as DailyQuote);
      } else {
        setDailyQuote(null);
      }
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/daily_quote/current`);
    });

    const unsubPlan = onSnapshot(doc(db, `users/${userId}/ai_plan/current`), (doc) => {
      if (doc.exists()) {
        setAiPlan(doc.data() as AIProductivityPlan);
      } else {
        setAiPlan(null);
      }
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/ai_plan/current`);
    });

    const unsubBudgets = onSnapshot(collection(db, `users/${userId}/budgets`), (snapshot) => {
      setBudgets(snapshot.docs.map(doc => doc.data() as Budget));
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/budgets`);
    });

    const unsubSavingsGoals = onSnapshot(collection(db, `users/${userId}/savings_goals`), (snapshot) => {
      setSavingsGoals(snapshot.docs.map(doc => doc.data() as SavingsGoal));
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/savings_goals`);
    });

    const unsubHabits = onSnapshot(collection(db, `users/${userId}/habits`), (snapshot) => {
      setHabits(snapshot.docs.map(doc => doc.data() as Habit));
    }, (error) => {
      handleError(error, OperationType.GET, `users/${userId}/habits`);
    });

    const unsubHabitLogs = onSnapshot(collection(db, `users/${userId}/habit_logs`), (snapshot) => {
      setHabitLogs(snapshot.docs.map(doc => doc.data() as HabitLog));
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
    try {
      await setDoc(doc(db, `users/${user.uid}/transactions/${t.id}`), cleanFirestoreData({ ...t, userId: user.uid }));
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/transactions/${t.id}`);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/transactions/${id}`));
    } catch (error) {
      handleError(error, OperationType.DELETE, `users/${user.uid}/transactions/${id}`);
    }
  };

  const saveRecurringTransaction = async (t: RecurringTransaction) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/recurring_transactions/${t.id}`), cleanFirestoreData({ ...t, userId: user.uid }));
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/recurring_transactions/${t.id}`);
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/recurring_transactions/${id}`));
    } catch (error) {
      handleError(error, OperationType.DELETE, `users/${user.uid}/recurring_transactions/${id}`);
    }
  };

  const saveCategory = async (c: Category) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/categories/${c.id}`), cleanFirestoreData({ ...c, userId: user.uid }));
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/categories/${c.id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/categories/${id}`));
    } catch (error) {
      handleError(error, OperationType.DELETE, `users/${user.uid}/categories/${id}`);
    }
  };

  const saveTask = async (t: Task) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/tasks/${t.id}`), cleanFirestoreData({ ...t, userId: user.uid }));
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/tasks/${t.id}`);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/tasks/${id}`));
    } catch (error) {
      handleError(error, OperationType.DELETE, `users/${user.uid}/tasks/${id}`);
    }
  };

  const saveTarget = async (t: Target) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/targets/${t.id}`), cleanFirestoreData({ ...t, userId: user.uid }));
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/targets/${t.id}`);
    }
  };

  const deleteTarget = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/targets/${id}`));
    } catch (error) {
      handleError(error, OperationType.DELETE, `users/${user.uid}/targets/${id}`);
    }
  };

  const saveUnlockedAchievement = async (id: string, unlockedAt: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/unlocked_achievements/${id}`), cleanFirestoreData({ id, unlockedAt, userId: user.uid }));
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/unlocked_achievements/${id}`);
    }
  };

  const saveNotificationSetting = async (s: NotificationSetting) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/notification_settings/${s.id}`), cleanFirestoreData({ ...s, userId: user.uid }));
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/notification_settings/${s.id}`);
    }
  };

  const saveDailyQuote = async (q: DailyQuote) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/daily_quote/current`), cleanFirestoreData({ ...q, userId: user.uid }));
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/daily_quote/current`);
    }
  };

  const saveAIPlan = async (p: AIProductivityPlan) => {
    if (!user) return ;
    try {
      await setDoc(doc(db, `users/${user.uid}/ai_plan/current`), cleanFirestoreData({ ...p, userId: user.uid }));
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/ai_plan/current`);
    }
  };

  const saveBudget = async (b: Budget) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/budgets/${b.id}`), cleanFirestoreData({ ...b, userId: user.uid }));
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/budgets/${b.id}`);
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/budgets/${id}`));
    } catch (error) {
      handleError(error, OperationType.DELETE, `users/${user.uid}/budgets/${id}`);
    }
  };

  const saveSavingsGoal = async (g: SavingsGoal) => {
    if (!user) return;
    try {
      await setDoc(doc(db, `users/${user.uid}/savings_goals/${g.id}`), cleanFirestoreData({ ...g, userId: user.uid }));
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/savings_goals/${g.id}`);
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/savings_goals/${id}`));
    } catch (error) {
      handleError(error, OperationType.DELETE, `users/${user.uid}/savings_goals/${id}`);
    }
  };

  const saveHabit = async (h: Habit) => {
    if (!user) return;
    try {
      await habitService.saveHabit(user.uid, h);
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/habits/${h.id}`);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    try {
      await habitService.deleteHabit(user.uid, id);
    } catch (error) {
      handleError(error, OperationType.DELETE, `users/${user.uid}/habits/${id}`);
    }
  };

  const logHabit = async (habitId: string, count: number, note?: string, mood?: number) => {
    if (!user) return;
    try {
      await habitService.logHabit(user.uid, habitId, count, note, mood);
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/habit_logs/${habitId}`);
    }
  };

  const skipHabit = async (habitId: string, note?: string) => {
    if (!user) return;
    try {
      await habitService.skipHabit(user.uid, habitId, note);
    } catch (error) {
      handleError(error, OperationType.WRITE, `users/${user.uid}/habit_logs/${habitId}_skip`);
    }
  };

  const value = useMemo(() => ({
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
    clearError: () => setError(null)
  }), [
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
    user?.uid
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
