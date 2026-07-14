import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Calendar, 
  Target as TargetIcon, 
  Menu, 
  X,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  PieChart,
  BarChart3,
  Trophy,
  Settings,
  Bell,
  Zap,
  CreditCard,
  Globe,
  Sparkles,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import FinanceTracker from './components/FinanceTracker';
import DailySchedule from './components/DailySchedule';
import DailyTargets from './components/DailyTargets';
import FinanceReports from './components/FinanceReports';
import FinancialVisualization from './components/FinancialVisualization';
import AchievementSystem from './components/AchievementSystem';
import NotificationSettings from './components/NotificationSettings';
import AIPlanner from './components/AIPlanner';
import SmartSpace from './components/SmartSpace';
import { FloatingPomodoro } from './components/FloatingPomodoro';
import DigitalClock from './components/DigitalClock';
import { BudgetAndSavings } from './components/BudgetAndSavings';
import { Logo } from './components/Logo';
import MobileNav from './components/layout/MobileNav';
import Login from './components/Login';
import HabitTrackerPage from './pages/productivity/HabitTrackerPage';
import FinanceHubPage from './pages/finance/FinanceHubPage';
import ProductivityHubPage from './pages/productivity/ProductivityHubPage';
import SystemHubPage from './pages/system/SystemHubPage';
import AccountPage from './pages/system/AccountPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AppShell from './components/layout/AppShell';
import { View, Transaction, Task, Target } from './types';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { notificationService, requestNotificationPermission } from './services/notificationService';
import { startNotificationScheduler, stopNotificationScheduler } from './services/notificationScheduler';

import { ErrorBoundary } from './components/ErrorBoundary';
import { useData } from './contexts/DataContext';
import { useTheme } from './contexts/ThemeContext';
import { useNotifications } from './contexts/NotificationContext';
import JournalPage from './components/JournalPage';
import OnboardingTour from './components/OnboardingTour';

interface UINotification {
  id: string;
  title: string;
  message: string;
  type: 'schedule' | 'finance' | 'target' | 'achievement';
  time: string;
}

export default function App() {
  const { user, loading, signOut } = useAuth();
  const { 
    transactions, 
    recurringTransactions, 
    tasks, 
    targets, 
    habits, 
    habitLogs, 
    unlockedAchievements, 
    dailyQuote, 
    notificationSettings 
  } = useData();
  const { notifications: inAppNotifications, removeNotification, addNotification } = useNotifications();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Auto start onboarding tour for new users on successful login/load
  useEffect(() => {
    if (user && !loading) {
      const completed = localStorage.getItem('lifeflow_onboarding_completed');
      if (!completed) {
        setIsOnboardingOpen(true);
      }
    }
  }, [user, loading]);

  // Handle manual tour trigger
  useEffect(() => {
    if (activeView === 'tour') {
      setIsOnboardingOpen(true);
      setActiveView('dashboard');
    }
  }, [activeView]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Check for localStorage availability
  useEffect(() => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
    } catch (e) {
      console.error('LocalStorage is not available:', e);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect Hubs on Desktop
  useEffect(() => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    if (isDesktop) {
      if (activeView === 'finance-hub') setActiveView('finance');
      else if (activeView === 'productivity-hub') setActiveView('schedule');
      else if (activeView === 'system-hub') setActiveView('settings');
    }
  }, [activeView]);

  useEffect(() => {
    if (!user) {
      stopNotificationScheduler();
      return;
    }

    requestNotificationPermission();

    startNotificationScheduler(() => ({
      tasks,
      recurringTransactions,
      targets,
      habits,
      habitLogs,
      notificationSettings,
    }), addNotification);

    return () => stopNotificationScheduler();
  }, [user, tasks, recurringTransactions, targets, habits, habitLogs, notificationSettings]);

  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: UINotification[] = [];
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // 1. Check Tasks
      const todaysTasks = tasks.filter(t => t.date === today && !t.completed);
      if (todaysTasks.length > 0) {
        newNotifications.push({
          id: 'tasks_today',
          title: t('schedule'),
          message: `${todaysTasks.length} ${t('tasksRemaining')}`,
          type: 'schedule',
          time: t('justNow')
        });
      }

      // 2. Check Targets
      const nearCompletionTargets = targets.filter(t => (t.currentValue / t.targetValue) >= 0.8 && t.currentValue < t.targetValue);
      if (nearCompletionTargets.length > 0) {
        newNotifications.push({
          id: 'targets_near',
          title: t('targets'),
          message: `${nearCompletionTargets.length} ${t('targetsNear')}`,
          type: 'target',
          time: t('justNow')
        });
      }

      // 3. Check Achievements
      const recentAchievements = unlockedAchievements.filter(a => {
        if (!a.unlockedAt) return false;
        const unlockDate = new Date(a.unlockedAt);
        // Unlocked in the last 24 hours
        return (now.getTime() - unlockDate.getTime()) < 24 * 60 * 60 * 1000;
      });
      
      if (recentAchievements.length > 0) {
        newNotifications.push({
          id: 'achievements_recent',
          title: t('achievements'),
          message: `${recentAchievements.length} ${t('achievementsRecent')}`,
          type: 'achievement',
          time: t('todayText')
        });
      }

      setNotifications(newNotifications);
    };

    generateNotifications();
    const interval = setInterval(generateNotifications, 60000); // Update every minute
    
    return () => {
      clearInterval(interval);
    };
  }, [t, tasks, targets, unlockedAchievements]);

  const weeklyChartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' });
      
      const dayTasks = tasks.filter(t => t.date === dateStr);
      const completed = dayTasks.filter(t => t.completed).length;
      
      const dayExpenses = transactions
        .filter(t => t.date === dateStr && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      data.push({
        name: displayDate,
        tasks: completed,
        expense: dayExpenses,
        fullDate: dateStr
      });
    }
    return data;
  }, [tasks, transactions, language]);

  // Helper to get summary data for dashboard
  const getSummary = useMemo(() => {
    const balance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    const completedTasks = tasks.filter(t => t.completed).length;
    const avgTargetProgress = targets.length > 0 
      ? targets.reduce((acc, t) => acc + (t.currentValue / t.targetValue), 0) / targets.length 
      : 0;

    return { balance, completedTasks, totalTasks: tasks.length, targetProgress: avgTargetProgress * 100 };
  }, [transactions, tasks, targets]);

  const summary = getSummary;

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    return (
      <ErrorBoundary>
        {(() => {
          switch (activeView) {
            case 'finance-hub': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl bg-surface-1">
          <FinanceHubPage setActiveView={setActiveView} />
        </div>
      );
      case 'productivity-hub': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl bg-surface-1">
          <ProductivityHubPage setActiveView={setActiveView} />
        </div>
      );
      case 'system-hub': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl bg-surface-1">
          <SystemHubPage setActiveView={setActiveView} />
        </div>
      );
      case 'finance': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2011&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/65 backdrop-blur-[16px]" />
          <div className="relative z-10">
            <FinanceTracker />
          </div>
        </div>
      );
      case 'budgets': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/65 backdrop-blur-[16px]" />
          <div className="relative z-10">
            <BudgetAndSavings />
          </div>
        </div>
      );
      case 'reports': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/65 backdrop-blur-[16px]" />
          <div className="relative z-10">
            <FinanceReports />
          </div>
        </div>
      );
      case 'visualization': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2070&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/65 backdrop-blur-[16px]" />
          <div className="relative z-10">
            <FinancialVisualization />
          </div>
        </div>
      );
      case 'schedule': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=2068&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/65 backdrop-blur-[16px]" />
          <div className="relative z-10">
            <DailySchedule />
          </div>
        </div>
      );
      case 'ai_planner': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/65 backdrop-blur-[16px]" />
          <div className="relative z-10">
            <AIPlanner />
          </div>
        </div>
      );
      case 'smart_space': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div className="absolute inset-0 z-0 bg-canvas/65 backdrop-blur-[16px]" />
          <div className="relative z-10">
            <SmartSpace />
          </div>
        </div>
      );
      case 'targets': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=2070&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/65 backdrop-blur-[16px]" />
          <div className="relative z-10">
            <DailyTargets />
          </div>
        </div>
      );
      case 'habits': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-canvas/65 backdrop-blur-[16px]"
          />
          <div className="relative z-10">
            <HabitTrackerPage />
          </div>
        </div>
      );
      case 'achievements': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/65 backdrop-blur-[16px]" />
          <div className="relative z-10">
            <AchievementSystem />
          </div>
        </div>
      );
      case 'settings': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl bg-surface-1">
          <NotificationSettings />
        </div>
      );
      case 'account': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl bg-surface-1">
          <AccountPage />
        </div>
      );
      case 'journal': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div className="absolute inset-0 z-0 bg-canvas/65 backdrop-blur-[16px]" />
          <div className="relative z-10">
            <JournalPage />
          </div>
        </div>
      );
      default: return (
        <DashboardPage
          user={user}
          summary={summary}
          weeklyChartData={weeklyChartData}
          dailyQuote={dailyQuote}
          setActiveView={setActiveView}
          t={t}
          onStartTour={() => setIsOnboardingOpen(true)}
        />
      );
    }
  })()}
  </ErrorBoundary>
  );
};

  return (
    <>
      <AppShell
        activeView={activeView}
        setActiveView={setActiveView}
        isSidebarCollapsed={!isSidebarOpen}
        setIsSidebarCollapsed={(val: boolean | ((p: boolean) => boolean)) => {
          if (typeof val === 'function') {
            setIsSidebarOpen(prev => !val(!prev));
          } else {
            setIsSidebarOpen(!val);
          }
        }}
      >
        {renderView()}
      </AppShell>
      <FloatingPomodoro activeView={activeView} setActiveView={setActiveView} />
      <OnboardingTour
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </>
  );
}
