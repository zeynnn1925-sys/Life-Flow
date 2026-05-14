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
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import FinanceTracker from './components/FinanceTracker';
import DailySchedule from './components/DailySchedule';
import DailyTargets from './components/DailyTargets';
import FinanceReports from './components/FinanceReports';
import FinancialVisualization from './components/FinancialVisualization';
import AchievementSystem from './components/AchievementSystem';
import NotificationSettings from './components/NotificationSettings';
import AIPlanner from './components/AIPlanner';
import DigitalClock from './components/DigitalClock';
import { BudgetAndSavings } from './components/BudgetAndSavings';
import { Logo } from './components/Logo';
import Login from './components/Login';
import HabitTrackerPage from './pages/productivity/HabitTrackerPage';
import { View, Transaction, Task, Target } from './types';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { notificationService, requestNotificationPermission } from './services/notificationService';
import { startNotificationScheduler, stopNotificationScheduler } from './services/notificationScheduler';

import { ErrorBoundary } from './components/ErrorBoundary';
import { useData } from './contexts/DataContext';
import { useTheme } from './contexts/ThemeContext';
import { useNotifications } from './contexts/NotificationContext';

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

  const navGroups = [
    {
      title: t('finance'),
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { id: 'finance', label: t('finance'), icon: Wallet },
        { id: 'budgets', label: t('budgets') || 'Budgets & Savings', icon: TrendingUp },
        { id: 'visualization', label: t('financialVisualization'), icon: BarChart3 },
        { id: 'reports', label: t('analytics'), icon: PieChart },
      ]
    },
    {
      title: t('productivity'),
      items: [
        { id: 'schedule', label: t('schedule'), icon: Calendar },
        { id: 'habits', label: t('habits') || 'Habit Tracker', icon: Zap },
        { id: 'ai_planner', label: t('aiPlanner'), icon: Sparkles },
        { id: 'targets', label: t('targets'), icon: TargetIcon },
      ]
    },
    {
      title: t('system'),
      items: [
        { id: 'achievements', label: t('achievements'), icon: Trophy },
        { id: 'settings', label: t('settings'), icon: Settings },
      ]
    }
  ];

  const renderView = () => {
    return (
      <ErrorBoundary>
        {(() => {
          switch (activeView) {
            case 'finance': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2011&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/40 backdrop-blur-[1px]" />
          <div className="relative z-10">
            <FinanceTracker />
          </div>
        </div>
      );
      case 'budgets': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/40 backdrop-blur-[1px]" />
          <div className="relative z-10">
            <BudgetAndSavings />
          </div>
        </div>
      );
      case 'reports': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/40 backdrop-blur-[1px]" />
          <div className="relative z-10">
            <FinanceReports />
          </div>
        </div>
      );
      case 'visualization': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=2070&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/40 backdrop-blur-[1px]" />
          <div className="relative z-10">
            <FinancialVisualization />
          </div>
        </div>
      );
      case 'schedule': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=2068&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/40 backdrop-blur-[1px]" />
          <div className="relative z-10">
            <DailySchedule />
          </div>
        </div>
      );
      case 'ai_planner': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/40 backdrop-blur-[1px]" />
          <div className="relative z-10">
            <AIPlanner />
          </div>
        </div>
      );
      case 'targets': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=2070&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/40 backdrop-blur-[1px]" />
          <div className="relative z-10">
            <DailyTargets />
          </div>
        </div>
      );
      case 'habits': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-canvas/40 backdrop-blur-[1px]"
          />
          <div className="relative z-10">
            <HabitTrackerPage />
          </div>
        </div>
      );
      case 'achievements': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/40 backdrop-blur-[1px]" />
          <div className="relative z-10">
            <AchievementSystem />
          </div>
        </div>
      );
      case 'settings': return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop")',
            }}
          />
          <div className="absolute inset-0 z-0 bg-canvas/40 backdrop-blur-[2px]" />
          <div className="relative z-10">
            <NotificationSettings />
          </div>
        </div>
      );
      default: return (
        <div className="relative p-4 lg:p-8 min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] overflow-hidden lg:rounded-3xl">
          {/* Dashboard Background */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2072&auto=format&fit=crop"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-top"
              style={{ opacity: 0.08 }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#010102]" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 space-y-12"
          >
            <header className="hero-section -mx-4 lg:-mx-8 px-8 lg:px-12 py-10 lg:py-16 rounded-3xl mb-12">
              <div className="max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-6"
                >
                  <div className="w-8 h-px bg-accent" />
                  <span className="text-eyebrow text-accent font-black uppercase tracking-[0.2em]">{t('dashboard')}</span>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-display-lg md:text-display-xl text-ink tracking-tight font-black leading-none"
                >
                  {t('welcome')} {user?.displayName?.split(' ')[0] || ''}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-ink-subtle mt-4 text-body-lg font-medium opacity-80 max-w-lg"
                >
                  {t('slogan')}
                </motion.p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="finance-card-primary group cursor-pointer relative overflow-hidden"
                onClick={() => setActiveView('finance')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-pill -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all" />
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md shadow-card border border-white/10">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <span className="text-eyebrow text-white/60 font-black uppercase tracking-widest">{t('finance')}</span>
                </div>
                <div className="text-display-md text-white font-mono tracking-tighter">Rp {summary.balance.toLocaleString()}</div>
                <p className="text-white/60 text-eyebrow font-bold uppercase mt-2 tracking-widest">{t('balance')}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline hover:border-hairline-strong transition-all group"
                onClick={() => setActiveView('schedule')}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center text-accent shadow-sm border border-accent/20 transition-transform group-hover:rotate-6">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <span className="text-eyebrow text-ink-tertiary font-black uppercase tracking-widest">{t('schedule')}</span>
                </div>
                <div className="text-heading-lg text-ink font-mono tracking-tighter">{summary.completedTasks} <span className="text-ink-tertiary opacity-40">/</span> {summary.totalTasks}</div>
                <p className="text-eyebrow text-ink-tertiary font-bold uppercase mt-2 tracking-widest">{t('tasks')}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline hover:border-hairline-strong transition-all group"
                onClick={() => setActiveView('targets')}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-warning/10 rounded-xl flex items-center justify-center text-warning shadow-sm border border-warning/20 transition-transform group-hover:-rotate-6">
                    <TargetIcon className="w-7 h-7" />
                  </div>
                  <span className="text-eyebrow text-ink-tertiary font-black uppercase tracking-widest">{t('targets')}</span>
                </div>
                <div className="text-heading-lg text-ink font-mono tracking-tighter">{Math.round(summary.targetProgress)}%</div>
                <p className="text-eyebrow text-ink-tertiary font-bold uppercase mt-2 tracking-widest">{t('performance')}</p>
              </motion.div>
            </div>

          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.42 }}
            className="bg-surface-1 p-6 rounded-lg shadow-card border border-hairline"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-heading-sm font-bold text-ink flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                {t('weeklyOverview')}
              </h2>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-subtle)', fontSize: 11 }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-subtle)', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-subtle)', fontSize: 11 }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface-3)', borderRadius: '12px', border: '1px solid var(--color-hairline-strong)', boxShadow: 'var(--shadow-modal)' }}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--color-ink)', marginBottom: '4px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="tasks" name={t('tasksCompleted')} stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorTasks)" />
                  <Area yAxisId="right" type="monotone" dataKey="expense" name={t('expenses')} stroke="var(--color-danger)" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline lg:col-span-2 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-24 h-24 text-primary" />
              </div>
              <div className="relative z-10">
                <h2 className="text-eyebrow text-ink-tertiary uppercase mb-4">{t('dailyInspiration')}</h2>
                <div 
                  className="cursor-pointer"
                  onClick={() => setActiveView('ai_planner')}
                >
                  <p className="text-heading-md leading-relaxed text-ink-muted">
                    {dailyQuote 
                      ? `"${dailyQuote.text}"`
                      : "Click to get your daily dose of inspiration..."}
                  </p>
                  <p className="text-body-sm font-bold text-ink-tertiary mt-4">
                    {dailyQuote 
                      ? `— ${dailyQuote.author}`
                      : ""}
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-heading-sm font-bold text-ink">{t('quickActions')}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView('finance')}
                  className="p-4 rounded-md bg-surface-2 hover:bg-surface-3 border border-hairline transition-all text-left"
                >
                  <Wallet className="w-5 h-5 text-ink-subtle mb-3" />
                  <div className="font-semibold text-ink text-body-sm">{t('expense')}</div>
                  <div className="text-[10px] text-ink-tertiary">{t('trackSpending')}</div>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView('schedule')}
                  className="p-4 rounded-md bg-surface-2 hover:bg-surface-3 border border-hairline transition-all text-left"
                >
                  <Calendar className="w-5 h-5 text-ink-subtle mb-3" />
                  <div className="font-semibold text-ink text-body-sm">{t('newTask')}</div>
                  <div className="text-[10px] text-ink-tertiary">{t('planNextHour')}</div>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView('ai_planner')}
                  className="p-4 rounded-md bg-surface-2 hover:bg-surface-3 border border-hairline transition-all text-left"
                >
                  <Sparkles className="w-5 h-5 text-ink-subtle mb-3" />
                  <div className="font-semibold text-ink text-body-sm">{t('aiPlanner')}</div>
                  <div className="text-[10px] text-ink-tertiary">{t('aiPlanDesc')}</div>
                </motion.button>
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-primary p-8 rounded-xxl shadow-glow-primary text-white relative overflow-hidden"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-display-md mb-2">{t('stayProductive')}</h2>
                  <p className="text-white/70 text-body-sm mb-8">{t('stayProductiveDesc')}</p>
                </div>
                <motion.button 
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveView('targets')}
                  className="bg-white text-primary px-8 py-3 rounded-pill font-bold text-button w-fit shadow-lg flex items-center gap-2"
                >
                  {t('viewTargets')} <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" 
              />
            </motion.section>
          </div>
        </motion.div>
      </div>
    );
  }
  })()}
  </ErrorBoundary>
  );
};

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-1 border-r border-hairline transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="mb-8 px-2">
            <div className="flex items-center gap-4 mb-1">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white shadow-card border border-white/10 transition-transform group-hover:scale-105 duration-500">
                <Logo className="w-9 h-9" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-ink tracking-tighter uppercase leading-none">{t('appName')}</span>
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest leading-tight mt-1">Flow</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest ml-11 leading-tight">{t('slogan')}</p>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto pr-2">
            {navGroups.map((group, groupIndex) => (
              <div key={group.title} className="space-y-1">
                <h3 className="px-4 text-eyebrow text-ink-tertiary uppercase mb-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item, index) => (
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (groupIndex * 3 + index) * 0.05 }}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id as View);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all font-black uppercase tracking-tight ${
                        activeView === item.id 
                          ? 'bg-surface-2 text-ink border-l-4 border-accent shadow-sm' 
                          : 'text-ink-tertiary hover:bg-surface-2 hover:text-ink-muted opacity-60 hover:opacity-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-hairline space-y-4">
            {/* Language Switcher */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-ink-subtle">
                <Globe className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('language')}</span>
              </div>
              <div className="flex bg-surface-2 p-1 rounded-md">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-sm transition-all ${language === 'en' ? 'bg-surface-3 text-ink shadow-sm' : 'text-ink-tertiary'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('id')}
                  className={`px-2 py-1 text-[10px] font-bold rounded-sm transition-all ${language === 'id' ? 'bg-surface-3 text-ink shadow-sm' : 'text-ink-tertiary'}`}
                >
                  ID
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <header className="h-14 bg-canvas/85 backdrop-blur-lg border-b border-hairline flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white border border-white/10">
                <Logo className="w-8 h-8" />
              </div>
              <span className="text-xl font-black text-ink tracking-tighter uppercase">{t('appName')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <DigitalClock />
            
            <button
              onClick={toggleTheme}
              className="p-2 text-ink-subtle hover:bg-surface-1 rounded-md transition-colors"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-ink-subtle hover:bg-surface-1 rounded-md relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full border border-canvas" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-surface-3 rounded-xxl shadow-modal border border-hairline-strong overflow-hidden z-50 backdrop-blur-xl"
                  >
                    <div className="p-4 border-b border-hairline flex items-center justify-between">
                      <span className="font-bold text-ink">{t('notifications')}</span>
                      {notifications.length > 0 && (
                        <span className="text-eyebrow text-ink-tertiary uppercase">{notifications.length} {t('newNotifications')}</span>
                      )}
                    </div>
                    <div className="divide-y divide-hairline max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-ink-subtle text-body-sm">
                          {t('noNotifications')}
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div key={notification.id} className="p-4 hover:bg-surface-1 transition-colors flex gap-3">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                              notification.type === 'schedule' ? 'bg-info/10 text-info' :
                              notification.type === 'target' ? 'bg-warning/10 text-warning' :
                              notification.type === 'achievement' ? 'bg-success/10 text-success' :
                              'bg-danger/10 text-danger'
                            }`}>
                              {notification.type === 'schedule' && <Calendar className="w-4 h-4" />}
                              {notification.type === 'target' && <TargetIcon className="w-4 h-4" />}
                              {notification.type === 'achievement' && <Trophy className="w-4 h-4" />}
                              {notification.type === 'finance' && <CreditCard className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="text-body-sm font-bold text-ink">{notification.title}</div>
                              <div className="text-caption text-ink-muted">{notification.message}</div>
                              <div className="text-[10px] text-ink-tertiary mt-1 font-medium">{notification.time}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <button className="w-full p-3 text-caption font-bold text-ink-subtle hover:text-ink transition-colors bg-surface-2 border-t border-hairline">
                      {t('viewAllNotifications')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-hairline">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-pill object-cover border border-hairline" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-pill bg-surface-2 flex items-center justify-center text-ink-muted font-bold text-xs border border-hairline">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden md:block overflow-hidden max-w-[120px]">
                <div className="text-body-sm font-bold text-ink truncate">{user?.displayName || t('userAccount')}</div>
              </div>
              <button 
                onClick={signOut}
                className="p-2 text-danger hover:bg-danger/10 rounded-md transition-colors"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-0 lg:p-8 max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-[calc(100vh-4rem-5rem)] lg:min-h-[calc(100vh-4rem)] p-4 lg:p-0"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-1/90 backdrop-blur-xl border-t border-hairline z-50 px-6 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] flex justify-between items-center">
        {[
          { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
          { id: 'finance', label: t('finance'), icon: Wallet },
          { id: 'visualization', label: t('financialVisualization'), icon: BarChart3 },
          { id: 'schedule', label: t('schedule'), icon: Calendar },
          { id: 'ai_planner', label: t('aiPlanner'), icon: Sparkles },
        ].map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => setActiveView(item.id as View)}
            className={`flex flex-col items-center gap-1 p-2 transition-colors relative ${
              activeView === item.id
                ? 'text-accent'
                : 'text-ink-tertiary hover:text-accent'
            }`}
          >
            {activeView === item.id && (
              <span className="absolute top-0 w-1 h-1 bg-accent rounded-full" />
            )}
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button
          id="nav-menu"
          onClick={() => setIsSidebarOpen(true)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            !['dashboard', 'finance', 'visualization', 'schedule', 'ai_planner'].includes(activeView)
              ? 'text-accent'
              : 'text-ink-tertiary hover:text-accent'
          }`}
        >
          <Menu className="w-6 h-6" />
          <span className="text-[10px] font-medium">{t('menu') || 'Menu'}</span>
        </button>
      </div>
    </div>
  );
}
