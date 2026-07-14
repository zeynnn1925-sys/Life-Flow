import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Calendar, 
  Target as TargetIcon, 
  Sparkles, 
  Wallet, 
  ChevronRight,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  RefreshCw,
  BookOpen,
  CreditCard,
  PiggyBank,
  Brain,
  Flame,
  ArrowRight,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { View } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { generateDailyQuote } from '../../services/aiProductivityService';
// @ts-ignore
import dashboardHeroBg from '../../Smart Budgeting Strategies_ Save Money and Build Financial Freedom 502030🍹_.jpg';

interface DashboardPageProps {
  user: any;
  summary: {
    balance: number;
    completedTasks: number;
    totalTasks: number;
    targetProgress: number;
  };
  weeklyChartData: any[];
  dailyQuote: { text: string; author: string } | null;
  setActiveView: (view: View) => void;
  t: (key: string) => string;
  onStartTour?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, 
      stiffness: 100, 
      damping: 15 
    } 
  }
};

export default function DashboardPage({ 
  user, 
  summary, 
  weeklyChartData, 
  dailyQuote, 
  setActiveView, 
  t,
  onStartTour
}: DashboardPageProps) {
  const { language } = useLanguage();
  const { 
    transactions, 
    tasks, 
    habits, 
    habitLogs, 
    targets, 
    saveDailyQuote, 
    savingsGoals 
  } = useData();

  // Local date formatting helpers
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7); // YYYY-MM
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = lastMonth.toISOString().slice(0, 7);

  // States
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Greet details
  const displayName = user?.displayName?.split(' ')[0] || (language === 'id' ? 'Sahabat' : 'Friend');

  // Digital time and date rendering
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      setTimeStr(new Date().toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, [language]);

  const getTodayDateString = () => {
    return now.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Robot Phrases
  const idPhrases = [
    `Hai ${displayName}! Siap menata alur hidupmu hari ini? Let's go! 🚀`,
    "Pusat kendali Life Flow sudah dipersiapkan dengan penuh cinta! 🌸",
    "Butuh bantuan mendesak? Tekan 'MULAI PANDUAN FLO' untuk berkeliling! 🗺️",
    "Setiap perubahan besar lahir dari kebiasaan kecil hari ini. Semangat! 🔥",
    "Ambil napas dalam-dalam... mari rasakan ketenangan sejenak. 🧘",
    "Gunakan kecerdasan AI untuk merencanakan studimu dengan asyik di menu AI Planner! 🤖"
  ];

  const enPhrases = [
    `Hi ${displayName}! Ready to design your ideal productive day? Let's go! 🚀`,
    "Your Life Flow workspace is fully operational and polished with care! 🌸",
    "First time here? Click 'START FLO'S GUIDE' to tour around instantly! 🗺️",
    "Small daily milestones build extraordinary dreams. Keep pushing! 🔥",
    "Take a deep breath... let's find your cosmic flow state today. 🧘",
    "Let our smart AI engine compile your learning plans inside the AI Planner! 🤖"
  ];

  const activePhrases = language === 'id' ? idPhrases : enPhrases;
  const cycleFloQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % activePhrases.length);
  };

  // Formatting helper
  const formatCurrency = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  // CARD 1 — Balance & Month calculations
  const currentBalance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  const thisMonthTransactions = transactions.filter(t => t.date.slice(0, 7) === currentMonthStr);
  const thisMonthIncome = thisMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const thisMonthExpense = thisMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const thisMonthNet = thisMonthIncome - thisMonthExpense;
  const balanceTrend = thisMonthNet >= 0 
    ? `+${formatCurrency(thisMonthNet)} ${language === 'id' ? 'bulan ini' : 'this month'}` 
    : `-${formatCurrency(Math.abs(thisMonthNet))} ${language === 'id' ? 'bulan ini' : 'this month'}`;

  // CARD 2 — Tasks Hari Ini
  const todayTasks = tasks.filter(t => t.date === todayStr);
  const completedTasksToday = todayTasks.filter(t => t.completed).length;
  const totalTasksToday = todayTasks.length;
  const taskProgressPercentage = totalTasksToday > 0 
    ? Math.round((completedTasksToday / totalTasksToday) * 100) 
    : 0;
  const taskTrend = language === 'id' 
    ? `${taskProgressPercentage}% selesai` 
    : `${taskProgressPercentage}% completed`;

  // CARD 3 — Habit Streak
  const activeHabits = habits.filter(h => !h.isArchived);
  const longestStreak = activeHabits.length > 0 ? Math.max(...activeHabits.map(h => h.longestStreak || 0)) : 0;
  
  const getHabitStatusToday = (habitId: string) => {
    const log = habitLogs.find(l => l.habitId === habitId && l.date === todayStr);
    if (!log) return 'pending';
    if (log.skipped) return 'skipped';
    
    const habit = habits.find(h => h.id === habitId);
    if (habit && log.completedCount >= habit.targetCount) return 'completed';
    return 'in_progress';
  };
  
  const completedTodayHabitsCount = activeHabits.filter(h => getHabitStatusToday(h.id) === 'completed').length;
  const habitTrend = language === 'id'
    ? `${completedTodayHabitsCount} dari ${activeHabits.length} selesai hari ini`
    : `${completedTodayHabitsCount} of ${activeHabits.length} done today`;

  // CARD 4 — Target Progress
  const onTrack = targets.filter(t => t.currentValue >= t.targetValue * 0.5).length;
  const totalTargets = targets.length;
  const targetTrend = language === 'id'
    ? `dari ${totalTargets} total target`
    : `of ${totalTargets} total targets`;

  // Generate dynamic Weekly Chart Data based on last 7 days of transactions
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('en-CA');
    const dayLabel = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' });
    
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    const income = dayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = dayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    return {
      name: dayLabel,
      income,
      expense,
      date: dateStr
    };
  });

  // AI Insight Generator (with custom offline fallbacks if Gemini is unconfigured)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownRemaining > 0) {
      timer = setTimeout(() => {
        setCooldownRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownRemaining]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('life_flow_dashboard_ai_insight');
      if (cached) {
        const parsed = JSON.parse(cached);
        const twoHours = 2 * 60 * 60 * 1000;
        if (parsed.date === todayStr && parsed.timestamp && (Date.now() - parsed.timestamp < twoHours)) {
          setInsight(parsed.text);
          return;
        }
      }
    } catch (e) {
      console.warn("Error reading cached AI insight:", e);
    }
    // Auto-generate if empty/stale
    generateAIInsight();
  }, [todayStr]);

  const generateAIInsight = async (isManual = false) => {
    if (isManual && cooldownRemaining > 0) {
      alert(language === 'id' 
        ? `Tolong tunggu ${cooldownRemaining} detik sebelum me-refresh kembali.` 
        : `Please wait ${cooldownRemaining} seconds before refreshing again.`);
      return;
    }

    setLoadingInsight(true);
    setInsight(''); // Clear old insight to let user see stream from scratch!

    // Gather context
    const recentTx = transactions.slice(-5).map(t => ({
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: t.date
    }));

    const thisMonthExpenseTransactions = thisMonthTransactions.filter(t => t.type === 'expense');
    const expensesByCategory: Record<string, number> = {};
    thisMonthExpenseTransactions.forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });
    const sortedExpenses = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
    const topExpenseCategory = sortedExpenses.length > 0 
      ? { category: sortedExpenses[0][0], amount: sortedExpenses[0][1] }
      : null;

    const targetsProgress = targets.map(t => ({
      title: t.title,
      target: t.targetValue,
      current: t.currentValue
    }));

    const contextData = {
      balance: currentBalance,
      thisMonthIncome,
      thisMonthExpense,
      topExpenseCategory,
      targets: targetsProgress,
      recentTransactions: recentTx
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 seconds timeout

    try {
      const response = await fetch('/api/gemini/generate-insight-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          language,
          context: contextData
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream in response");
      }

      const decoder = new TextDecoder();
      let streamText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamText += chunk;
        const cleaned = streamText.trim().replace(/^["']|["']$/g, '');
        setInsight(cleaned);
      }

      const finalCleaned = streamText.trim().replace(/^["']|["']$/g, '');
      if (finalCleaned) {
        const cacheItem = {
          text: finalCleaned,
          date: todayStr,
          timestamp: Date.now()
        };
        localStorage.setItem('life_flow_dashboard_ai_insight', JSON.stringify(cacheItem));
        if (isManual) {
          setCooldownRemaining(120); // 2 minutes cooldown
        }
      } else {
        throw new Error("Received empty stream content");
      }

    } catch (err: any) {
      console.warn("Failed to stream AI insight (gracefully falling back):", err);
      // Fallback
      const idInsights = [
        "Fokus pada kemajuan hari ini, sekecil apapun itu. Alur kerja yang konsisten mengalahkan lonjakan motivasi yang sesaat.",
        "Kelola energi Anda dengan bijak, bukan hanya waktu Anda. Mulailah hari dengan prioritas keuangan dan tugas yang paling berdampak.",
        "Keseimbangan finansial dan produktivitas harian berjalan beriringan. Mulai catat transaksi Anda hari ini untuk kedamaian pikiran.",
        "Mencapai target harian Anda dimulai dari satu langkah kecil. Selesaikan tugas prioritas pertama Anda sekarang juga.",
        "Ingatlah untuk mengambil napas dalam-dalam dan beristirahat secara teratur. Aliran hidup yang sehat adalah komitmen maraton.",
        "Kebiasaan kecil yang dilakukan dengan konsisten setiap hari akan membuahkan perubahan finansial dan karir yang luar biasa."
      ];
      const enInsights = [
        "Focus on today's progress, no matter how small. A consistent workflow beats short bursts of sudden motivation.",
        "Manage your energy status, not just your clock. Tackle the most impactful financial and habit goals first today.",
        "Financial clarity and daily peace of mind go hand in hand. Track your spending habits early to secure your peace.",
        "Ambitious target completion begins with small daily habits. Smash your highest priority task first today.",
        "Remember to take intentional breathing breaks. A clean, optimized cosmic state is built on sustainable efforts.",
        "Small daily routines compound into massive breakthroughs over time. Stay focused on your targets and flow!"
      ];
      const list = language === 'id' ? idInsights : enInsights;
      const randomInsight = list[Math.floor(Math.random() * list.length)];
      
      const cacheItem = {
        text: randomInsight,
        date: todayStr,
        timestamp: Date.now()
      };
      localStorage.setItem('life_flow_dashboard_ai_insight', JSON.stringify(cacheItem));
      setInsight(randomInsight);
    } finally {
      setLoadingInsight(false);
    }
  };

  // Quote helper
  const handleRefreshQuote = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setLoadingQuote(true);
    try {
      const newQuote = await generateDailyQuote();
      await saveDailyQuote(newQuote);
    } catch (err) {
      console.error("Failed to refresh daily quote", err);
    } finally {
      setLoadingQuote(false);
    }
  };

  return (
    <div 
      className="relative p-4 sm:p-6 flex flex-col gap-6 bg-scroll md:bg-fixed min-h-screen rounded-[24px] border border-white/5 shadow-2xl overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.75) 40%, rgba(10,10,10,0.9) 100%), url("${dashboardHeroBg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Graphic */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl opacity-20">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#5e6ad2]/5 via-transparent to-orange-500/5" />
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#5e6ad2]/8 blur-[100px] dark:bg-[#5e6ad2]/6" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-orange-500/5 blur-[100px] dark:bg-orange-500/3" />
      </div>

      <div className="relative z-10 flex flex-col gap-5">
        
        {/* ============================================================
            1. WELCOME HEADER (Responsive: adapts beautifully for screen)
            ============================================================ */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#141414]/75 backdrop-blur-md border border-white/5 p-4 rounded-xl">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-orange-500 font-extrabold tracking-[0.2em] uppercase mb-0.5">
              {t('dashboard') || 'DASHBOARD'}
            </span>
            <h1 className="text-[20px] lg:text-[22px] font-bold text-white tracking-tight leading-tight">
              {language === 'id' ? `Selamat Datang Kembali, ${displayName}` : `Welcome back, ${displayName}`}
            </h1>
            <p className="text-[11px] text-zinc-300 font-semibold mt-0.5">
              {getTodayDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex flex-col items-end text-right">
              <span className="text-[12px] font-mono font-bold text-zinc-100 bg-black/40 backdrop-blur-sm border border-white/10 py-1 px-2.5 rounded-lg">
                ⏱ {timeStr || '00:00'}
              </span>
            </div>
            <button 
              onClick={() => setActiveView('finance')}
              className="h-8 py-1 px-3 text-xs rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
            >
              <Plus size={13} className="stroke-[2.5px]" />
              <span>{language === 'id' ? 'Entri Baru' : 'New Entry'}</span>
            </button>
          </div>
        </header>

        {/* ============================================================
            2. STAT STRIP (Flex-wrap / Flex-col on mobile, static grid on desktop)
            ============================================================ */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row sm:flex-wrap lg:grid lg:grid-cols-4 gap-3.5 antialiased"
        >
          
          {/* Card 1 — Balance */}
          <motion.div 
            variants={itemVariants}
            onClick={() => setActiveView('finance')}
            className="w-full sm:w-[calc(50%-7px)] lg:w-full bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-xl p-4 cursor-pointer hover:border-orange-500/30 active:scale-[0.98] transition-all duration-150 select-none flex flex-col justify-between min-h-[104px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                {language === 'id' ? 'SALDO' : 'BALANCE'}
              </span>
              <img src="/icons/Finance.png" alt="Balance" className="w-[34px] h-[34px] object-contain shrink-0" />
            </div>
            <div>
              <div className="text-[15px] lg:text-[16px] font-mono font-bold text-zinc-100 truncate">
                {formatCurrency(currentBalance)}
              </div>
              <p className="text-[10px] text-zinc-300 font-semibold truncate mt-0.5">
                {balanceTrend}
              </p>
            </div>
          </motion.div>

          {/* Card 2 — Tasks Hari Ini */}
          <motion.div 
            variants={itemVariants}
            onClick={() => setActiveView('schedule')}
            className="w-full sm:w-[calc(50%-7px)] lg:w-full bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-xl p-4 cursor-pointer hover:border-orange-500/30 active:scale-[0.98] transition-all duration-150 select-none flex flex-col justify-between min-h-[104px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                {language === 'id' ? 'TUGAS HARI INI' : "TODAY'S TASKS"}
              </span>
              <img src="/icons/Schedule.png" alt="Tasks" className="w-[34px] h-[34px] object-contain shrink-0" />
            </div>
            <div>
              <div className="text-[16px] font-mono font-bold text-zinc-100">
                {completedTasksToday} <span className="text-zinc-500 font-normal">/</span> {totalTasksToday}
              </div>
              <p className="text-[10px] text-zinc-300 font-semibold truncate mt-0.5">
                {taskTrend}
              </p>
            </div>
          </motion.div>

          {/* Card 3 — Habit Streak */}
          <motion.div 
            variants={itemVariants}
            onClick={() => setActiveView('habits')}
            className="w-full sm:w-[calc(50%-7px)] lg:w-full bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-xl p-4 cursor-pointer hover:border-orange-500/30 active:scale-[0.98] transition-all duration-150 select-none flex flex-col justify-between min-h-[104px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                {language === 'id' ? 'STREAK TERBAIK' : 'LONGEST STREAK'}
              </span>
              <img src="/icons/Habit_Tracker.png" alt="Streak" className="w-[34px] h-[34px] object-contain shrink-0" />
            </div>
            <div>
              <div className="text-[16px] font-mono font-bold text-zinc-100">
                {longestStreak} {language === 'id' ? 'hari' : 'days'}
              </div>
              <p className="text-[10px] text-zinc-300 font-semibold truncate mt-0.5">
                {habitTrend}
              </p>
            </div>
          </motion.div>

          {/* Card 4 — Target Progress */}
          <motion.div 
            variants={itemVariants}
            onClick={() => setActiveView('targets')}
            className="w-full sm:w-[calc(50%-7px)] lg:w-full bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-xl p-4 cursor-pointer hover:border-orange-500/30 active:scale-[0.98] transition-all duration-150 select-none flex flex-col justify-between min-h-[104px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                {language === 'id' ? 'TARGET AKTIF' : 'ACTIVE TARGETS'}
              </span>
              <img src="/icons/Target.png" alt="Targets" className="w-[34px] h-[34px] object-contain shrink-0" />
            </div>
            <div>
              <div className="text-[16px] font-mono font-bold text-zinc-100">
                {onTrack} On Track
              </div>
              <p className="text-[10px] text-zinc-300 font-semibold truncate mt-0.5">
                {targetTrend}
              </p>
            </div>
          </motion.div>

        </motion.section>


        {/* ============================================================
            3. MAIN DESKTOP GRID (3 Columns - Visible on Desktop >= 1024px)
            ============================================================ */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-3.5 items-start">
          
          {/* Kolom Kiri */}
          <div className="flex flex-col gap-3.5">
            
            {/* A. FINANCE PREVIEW CARD */}
            <div className="bg-gradient-to-br from-[#141414]/75 via-[#141414]/75 to-orange-500/10 border border-white/5 backdrop-blur-md rounded-[12px] p-4 flex flex-col gap-3 transition-colors hover:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-zinc-200 flex items-center gap-2">
                  <img src="/icons/Finance.png" alt="Finance" className="w-[26px] h-[26px] object-contain shrink-0" />
                  {language === 'id' ? 'Keuangan' : 'Finance'}
                </span>
                <span 
                  onClick={() => setActiveView('finance')}
                  className="text-[10px] font-bold text-orange-500 hover:text-orange-400 cursor-pointer flex items-center gap-0.5 select-none transition-colors"
                >
                  {language === 'id' ? 'Lihat' : 'View'} <ChevronRight size={10} />
                </span>
              </div>

              <div className="h-px bg-white/5" />

              <div className="py-1">
                <span className="text-[10px] font-bold text-zinc-400 block leading-none">
                  {language === 'id' ? 'TOTAL SALDO' : 'TOTAL BALANCE'}
                </span>
                <div className="text-[18px] font-mono font-black text-zinc-100 mt-1">
                  {formatCurrency(currentBalance)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/5 rounded-lg p-2 text-left">
                <div>
                  <span className="text-[8px] font-bold text-zinc-400 uppercase block tracking-wider">
                    {language === 'id' ? 'Pemasukan' : 'Income'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    {formatCurrency(thisMonthIncome)}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-zinc-400 uppercase block tracking-wider">
                    {language === 'id' ? 'Pengeluaran' : 'Expense'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-red-400 truncate block">
                    {formatCurrency(thisMonthExpense)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                  {language === 'id' ? 'Aktivitas Terakhir' : 'Recent Activities'}
                </span>
                {transactions.length === 0 ? (
                  <p className="text-[11px] text-zinc-400 italic py-2 text-center">
                    {language === 'id' ? 'Tidak ada transaksi' : 'No recent transactions'}
                  </p>
                ) : (
                  [...transactions]
                    .sort((a,b) => b.date.localeCompare(a.date))
                    .slice(0,3)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-1.5 rounded bg-white/5 text-[11px] border border-white/5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="text-zinc-300 font-medium truncate">{item.description}</span>
                        </div>
                        <span className={`font-mono font-bold shrink-0 ${item.type === 'income' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                          {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* B. HABIT TODAY CARD */}
            <div className="bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-[12px] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-zinc-200 flex items-center gap-2">
                  <img src="/icons/Habit_Tracker.png" alt="Habit Today" className="w-[26px] h-[26px] object-contain shrink-0" />
                  {language === 'id' ? 'Habit Hari Ini' : 'Habit Today'}
                </span>
                <span 
                  onClick={() => setActiveView('habits')}
                  className="text-[10px] font-bold text-orange-500 hover:text-orange-400 cursor-pointer flex items-center gap-0.5 select-none transition-colors"
                >
                  {language === 'id' ? 'Lihat' : 'View'} <ChevronRight size={10} />
                </span>
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex justify-between items-center text-[11px] font-semibold text-zinc-300 mt-1">
                <span>⚡ {language === 'id' ? 'Progres Harian' : 'Daily Progress'}</span>
                <span className="text-orange-500">{completedTodayHabitsCount} / {activeHabits.length} habit</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-1">
                <div 
                  className="bg-orange-500 h-full transition-all duration-300 rounded-full" 
                  style={{ width: `${activeHabits.length > 0 ? (completedTodayHabitsCount / activeHabits.length) * 100 : 0}%` }} 
                />
              </div>

              {/* Habit Lists */}
              <div className="flex flex-col gap-1.5">
                {activeHabits.length === 0 ? (
                  <p className="text-[11px] text-zinc-400 italic py-2 text-center">
                    {language === 'id' ? 'Tidak ada habit aktif' : 'No active habits'}
                  </p>
                ) : (
                  activeHabits.slice(0, 3).map((item) => {
                    const status = getHabitStatusToday(item.id);
                    const isCompleted = status === 'completed';
                    return (
                      <div key={item.id} className="flex items-center justify-between p-1.5 rounded bg-white/5 border border-white/5 text-[11px]">
                        <span className="text-zinc-300 font-medium truncate flex items-center gap-1.5">
                          <span>{item.icon || '✨'}</span>
                          <span className="truncate">{item.title}</span>
                        </span>
                        {isCompleted ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-[10px] bg-emerald-500/10 py-0.5 px-1.5 rounded">
                            ✅ Selesai
                          </span>
                        ) : (
                          <span className="text-zinc-400 border border-zinc-600/50 text-[10px] font-medium py-0.5 px-1.5 rounded">
                            ○ Belum
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Kolom Tengah */}
          <div className="flex flex-col gap-3.5">
            
            {/* C. WEEKLY CHART CARD */}
            <div className="bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-[12px] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-zinc-200 flex items-center gap-2">
                  <img src="/icons/Visualization.png" alt="Weekly Overview" className="w-[26px] h-[26px] object-contain shrink-0" />
                  {language === 'id' ? 'Ikhtisar Mingguan' : 'Weekly Overview'}
                </span>
              </div>
              <div className="h-px bg-white/5" />

              <div className="h-[140px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7Days} margin={{ top: 5, right: 0, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A1A1AA', fontSize: 9 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A1A1AA', fontSize: 9 }} />
                    <RechartsTooltip
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: '#0d0d0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px', color: '#fff' }}
                      labelStyle={{ fontWeight: 'bold', marginBottom: '2px' }}
                    />
                    <Bar dataKey="income" name={language === 'id' ? 'Masuk' : 'Income'} fill="#10b981" radius={[3, 3, 0, 0]} barSize={8} />
                    <Bar dataKey="expense" name={language === 'id' ? 'Keluar' : 'Expense'} fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* D. AI INSIGHT CARD */}
            <div className="bg-[#141414]/75 border border-orange-500/20 backdrop-blur-md rounded-[12px] p-4 flex flex-col gap-2.5 relative overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-16 h-16 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-orange-400 flex items-center gap-2 select-none">
                  <img src="/icons/AI.png" alt="AI Insight" className="w-[26px] h-[26px] object-contain shrink-0" />
                  AI Insight
                </span>
                {loadingInsight && (
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                )}
              </div>

              <div className="h-px bg-orange-500/10" />

              <div className="min-h-[64px] flex flex-col items-start justify-center w-full gap-2">
                {insight ? (
                  <>
                    <p className="text-[12px] leading-relaxed text-zinc-100 font-medium italic text-left">
                      "{insight}"
                    </p>
                    {loadingInsight && (
                      <span className="text-[10px] text-orange-400/80 animate-pulse flex items-center gap-1 mt-1 font-mono">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" />
                        {language === 'id' ? 'Menulis insight finansial...' : 'Writing financial insight...'}
                      </span>
                    )}
                  </>
                ) : loadingInsight ? (
                  <div className="space-y-2 w-full animate-pulse py-2">
                    <div className="h-3.5 bg-white/5 rounded w-11/12 animate-pulse"></div>
                    <div className="h-3.5 bg-white/5 rounded w-10/12 animate-pulse"></div>
                    <div className="h-3.5 bg-white/5 rounded w-8/12 animate-pulse"></div>
                    <span className="text-[10px] text-orange-400/80 animate-pulse flex items-center gap-1 mt-2 font-mono">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" />
                      {language === 'id' ? 'Menganalisis data keuangan...' : 'Analyzing financial data...'}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-400 italic py-2">
                    {language === 'id' ? 'Belum ada insight harian.' : 'No daily insights yet.'}
                  </p>
                )}
              </div>

              <button
                onClick={() => generateAIInsight(true)}
                disabled={loadingInsight || cooldownRemaining > 0}
                className="w-full py-1.5 text-[11px] font-bold bg-[#1f1f1f]/60 hover:bg-[#1f1f1f]/95 text-orange-400 rounded-lg border border-orange-500/25 disabled:opacity-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw size={10} className={`${loadingInsight ? 'animate-spin' : ''}`} />
                {cooldownRemaining > 0 
                  ? (language === 'id' ? `Cooldown ${cooldownRemaining}s` : `Cooldown ${cooldownRemaining}s`) 
                  : (language === 'id' ? 'Segarkan Insight' : 'Refresh Insight')}
              </button>
            </div>

          </div>

          {/* Kolom Kanan */}
          <div className="flex flex-col gap-3.5">
            
            {/* E. SCHEDULE TODAY CARD */}
            <div className="bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-[12px] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-zinc-200 flex items-center gap-2">
                  <img src="/icons/Schedule.png" alt="Schedule Today" className="w-[26px] h-[26px] object-contain shrink-0" />
                  {language === 'id' ? 'Jadwal Hari Ini' : 'Schedule Today'}
                </span>
                <span 
                  onClick={() => setActiveView('schedule')}
                  className="text-[10px] font-bold text-orange-500 hover:text-orange-400 cursor-pointer flex items-center gap-0.5 select-none transition-colors"
                >
                  {language === 'id' ? 'Lihat' : 'View'} <ChevronRight size={10} />
                </span>
              </div>
              <div className="h-px bg-white/5" />

              <p className="text-[10px] font-bold text-zinc-400 leading-none">
                {now.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>

              <div className="flex flex-col gap-1.5">
                {todayTasks.length === 0 ? (
                  <div className="flex flex-col gap-2 items-center py-3">
                    <p className="text-[11px] text-zinc-400 italic">
                      {language === 'id' ? 'Tidak ada jadwal hari ini' : 'No schedules today'}
                    </p>
                    <button 
                      onClick={() => setActiveView('schedule')}
                      className="py-1 px-2 text-[10px] font-bold text-orange-500 border border-orange-500/20 rounded-md bg-orange-500/10 hover:bg-orange-500/20 cursor-pointer transition-colors"
                    >
                      + Tambah 
                    </button>
                  </div>
                ) : (
                  todayTasks.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-1.5 rounded bg-white/5 border border-white/5 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.completed ? 'bg-zinc-600' : 'bg-orange-500'}`} />
                        <span className={`text-zinc-200 truncate font-semibold ${item.completed ? 'line-through text-zinc-500' : ''}`}>
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-semibold text-zinc-400 shrink-0">
                        ⏰ {item.startTime || '09:00'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* F. DAILY QUOTE CARD */}
            <div className="bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-[12px] p-4 flex flex-col gap-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-zinc-300 flex items-center gap-1.5 select-none">
                  {/* TODO: replace with 3D icon */}
                  ✨ {language === 'id' ? 'Inspirasi Harian' : 'Daily Inspiration'}
                </span>
                <button
                  onClick={handleRefreshQuote}
                  disabled={loadingQuote}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-zinc-200 disabled:opacity-50 cursor-pointer"
                  title="Refresh Quote"
                >
                  <RefreshCw size={11} className={`${loadingQuote ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="h-px bg-white/5" />

              <div className="min-h-[56px] flex flex-col justify-center">
                {dailyQuote ? (
                  <>
                    <p className="text-[12.5px] leading-relaxed text-zinc-200 italic font-medium">
                      "{dailyQuote.text}"
                    </p>
                    <span className="text-[10px] text-zinc-400 font-bold mt-1 text-right block pr-1">
                      — {dailyQuote.author}
                    </span>
                  </>
                ) : (
                  <p className="text-[11px] text-zinc-400 italic text-center py-2">
                    {language === 'id' ? 'Mendapatkan quote...' : 'Getting quote...'}
                  </p>
                )}
              </div>
            </div>

            {/* G. QUICK ACTIONS GRID */}
            <div className="bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-[12px] p-4 flex flex-col gap-3">
              <span className="text-[13px] font-bold text-zinc-200">
                ⚡ Quick Actions
              </span>
              <div className="h-px bg-white/5" />

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setActiveView('finance')}
                  className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 hover:bg-[#1f1f1f]/80 border border-white/5 backdrop-blur-sm hover:border-orange-500/25 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] text-zinc-300 group-hover:text-zinc-100 font-semibold truncate">💰 Transaksi</span>
                  <ArrowRight size={10} className="text-zinc-500 group-hover:text-orange-500 transition-colors shrink-0 ml-1" />
                </button>
                <button 
                  onClick={() => setActiveView('schedule')}
                  className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 hover:bg-[#1f1f1f]/80 border border-white/5 backdrop-blur-sm hover:border-orange-500/25 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] text-zinc-300 group-hover:text-zinc-100 font-semibold truncate">✅ Tugas</span>
                  <ArrowRight size={10} className="text-zinc-500 group-hover:text-orange-500 transition-colors shrink-0 ml-1" />
                </button>
                <button 
                  onClick={() => setActiveView('habits')}
                  className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 hover:bg-[#1f1f1f]/80 border border-white/5 backdrop-blur-sm hover:border-orange-500/25 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] text-zinc-300 group-hover:text-zinc-100 font-semibold truncate">🔥 Habit</span>
                  <ArrowRight size={10} className="text-zinc-500 group-hover:text-orange-500 transition-colors shrink-0 ml-1" />
                </button>
                <button 
                  onClick={() => setActiveView('targets')}
                  className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 hover:bg-[#1f1f1f]/80 border border-white/5 backdrop-blur-sm hover:border-orange-500/25 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] text-zinc-300 group-hover:text-zinc-100 font-semibold truncate">🎯 Target</span>
                  <ArrowRight size={10} className="text-zinc-500 group-hover:text-orange-500 transition-colors shrink-0 ml-1" />
                </button>
                <button 
                  onClick={() => setActiveView('ai_planner')}
                  className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 hover:bg-[#1f1f1f]/80 border border-white/5 backdrop-blur-sm hover:border-orange-500/25 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] text-zinc-300 group-hover:text-zinc-100 font-semibold truncate">✨ AI Plan</span>
                  <ArrowRight size={10} className="text-zinc-500 group-hover:text-orange-500 transition-colors shrink-0 ml-1" />
                </button>
                <button 
                  onClick={() => setActiveView('journal')}
                  className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 hover:bg-[#1f1f1f]/80 border border-white/5 backdrop-blur-sm hover:border-orange-500/25 transition-all text-left cursor-pointer group"
                >
                  <span className="text-[11px] text-zinc-300 group-hover:text-zinc-100 font-semibold truncate">📖 Jurnal</span>
                  <ArrowRight size={10} className="text-zinc-500 group-hover:text-orange-500 transition-colors shrink-0 ml-1" />
                </button>
              </div>
            </div>

          </div>

        </div>


        {/* ============================================================
            4. MOBILE ONLY SINGLE COLUMN (Visible on Mobile < 1024px)
            ============================================================ */}
        <div className="flex flex-col lg:hidden gap-3.5">
          
          {/* M3. Finance Card (full width) */}
          <div className="bg-gradient-to-br from-[#141414]/75 via-[#141414]/75 to-orange-500/10 border border-white/5 backdrop-blur-md rounded-[12px] p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-zinc-200 flex items-center gap-2">
                <img src="/icons/Finance.png" alt="Finance" className="w-6 h-6 object-contain shrink-0" />
                Finance
              </span>
              <span 
                onClick={() => setActiveView('finance')}
                className="text-[10px] font-bold text-orange-500 flex items-center gap-0.5 select-none"
              >
                {language === 'id' ? 'Lihat' : 'View'} <ChevronRight size={10} />
              </span>
            </div>
            
            <div className="h-px bg-white/5" />

            <div className="py-0.5">
              <span className="text-[9px] font-bold text-zinc-400 block leading-none">TOTAL SALDO</span>
              <div className="text-[16px] font-mono font-black text-zinc-100 mt-1">
                {formatCurrency(currentBalance)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 bg-white/5 border border-white/5 rounded-lg p-2 text-left">
              <div>
                <span className="text-[8px] font-bold text-zinc-400 uppercase block tracking-wider">Pemasukan</span>
                <span className="text-[10px] font-mono font-bold text-emerald-400">{formatCurrency(thisMonthIncome)}</span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-zinc-400 uppercase block tracking-wider">Pengeluaran</span>
                <span className="text-[10px] font-mono font-bold text-red-400 truncate block">{formatCurrency(thisMonthExpense)}</span>
              </div>
            </div>
          </div>

          {/* M4. Habit Today (full width) */}
          <div className="bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-[12px] p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-zinc-200 flex items-center gap-2">
                <img src="/icons/Habit_Tracker.png" alt="Habit Today" className="w-6 h-6 object-contain shrink-0" />
                Habit Hari Ini
              </span>
              <span 
                onClick={() => setActiveView('habits')}
                className="text-[10px] font-bold text-orange-500 flex items-center gap-0.5 select-none"
              >
                {language === 'id' ? 'Lihat' : 'View'} <ChevronRight size={10} />
              </span>
            </div>

            <div className="h-px bg-white/5" />

            <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-300">
              <span>Progres Harian</span>
              <span className="text-orange-500">{completedTodayHabitsCount} / {activeHabits.length} habit</span>
            </div>

            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-orange-500 h-full transition-all duration-300 rounded-full" 
                style={{ width: `${activeHabits.length > 0 ? (completedTodayHabitsCount / activeHabits.length) * 100 : 0}%` }} 
              />
            </div>

            <div className="flex flex-col gap-1 mt-0.5">
              {activeHabits.slice(0, 3).map((item) => {
                const isCompleted = getHabitStatusToday(item.id) === 'completed';
                return (
                  <div key={item.id} className="flex items-center justify-between p-1.5 rounded bg-white/5 border border-white/5 text-[10px]">
                    <span className="text-zinc-300 truncate font-medium">
                      {item.icon || '✨'} {item.title}
                    </span>
                    <span>{isCompleted ? '✅' : '○'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* M5. Schedule Today (full width) */}
          <div className="bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-[12px] p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-zinc-200 flex items-center gap-2">
                <img src="/icons/Schedule.png" alt="Schedule Today" className="w-6 h-6 object-contain shrink-0" />
                Jadwal Hari Ini
              </span>
              <span 
                onClick={() => setActiveView('schedule')}
                className="text-[10px] font-bold text-orange-500 flex items-center gap-0.5 select-none"
              >
                {language === 'id' ? 'Lihat' : 'View'} <ChevronRight size={10} />
              </span>
            </div>

            <div className="h-px bg-white/5" />

            {todayTasks.length === 0 ? (
              <p className="text-[10px] text-zinc-400 italic text-center py-2">Tidak ada jadwal hari ini</p>
            ) : (
              <div className="flex flex-col gap-1">
                {todayTasks.slice(0,3).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-1.5 bg-white/5 border border-white/5 rounded text-[10px]">
                    <span className={`truncate text-zinc-300 ${item.completed ? 'line-through text-zinc-500' : ''}`}>{item.title}</span>
                    <span className="text-[9px] text-zinc-400 font-mono shrink-0">⏰ {item.startTime}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* M6. Quick Actions (2x3 grid) */}
          <div className="bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-[12px] p-3 flex flex-col gap-2.5">
            <span className="text-[12px] font-bold text-zinc-200">⚡ Quick Actions</span>
            <div className="h-px bg-white/5" />
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => setActiveView('finance')} className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 border border-white/5 backdrop-blur-sm active:bg-[#1f1f1f]/80 text-[11px] text-zinc-300 font-semibold cursor-pointer">💰 Transaksi <ArrowRight size={10} /></button>
              <button onClick={() => setActiveView('schedule')} className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 border border-white/5 backdrop-blur-sm active:bg-[#1f1f1f]/80 text-[11px] text-zinc-300 font-semibold cursor-pointer">✅ Tugas <ArrowRight size={10} /></button>
              <button onClick={() => setActiveView('habits')} className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 border border-white/5 backdrop-blur-sm active:bg-[#1f1f1f]/80 text-[11px] text-zinc-300 font-semibold cursor-pointer">🔥 Habit <ArrowRight size={10} /></button>
              <button onClick={() => setActiveView('targets')} className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 border border-white/5 backdrop-blur-sm active:bg-[#1f1f1f]/80 text-[11px] text-zinc-300 font-semibold cursor-pointer">🎯 Target <ArrowRight size={10} /></button>
              <button onClick={() => setActiveView('ai_planner')} className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 border border-white/5 backdrop-blur-sm active:bg-[#1f1f1f]/80 text-[11px] text-zinc-300 font-semibold cursor-pointer">✨ AI Plan <ArrowRight size={10} /></button>
              <button onClick={() => setActiveView('journal')} className="h-9 px-2 flex items-center justify-between rounded-lg bg-[#1f1f1f]/50 border border-white/5 backdrop-blur-sm active:bg-[#1f1f1f]/80 text-[11px] text-zinc-300 font-semibold cursor-pointer">📖 Jurnal <ArrowRight size={10} /></button>
            </div>
          </div>

          {/* M7. Daily Quote */}
          <div className="bg-[#141414]/75 backdrop-blur-md border border-white/5 rounded-[12px] p-3 flex flex-col gap-2">
            <span className="text-[12px] font-bold text-zinc-300">✨ Daily Inspiration</span>
            <div className="h-px bg-white/5" />
            {dailyQuote ? (
              <p className="text-[11px] leading-relaxed text-zinc-200 italic text-left">
                "{dailyQuote.text}" <span className="text-[9px] text-zinc-400 not-italic block mt-0.5">— {dailyQuote.author}</span>
              </p>
            ) : (
              <p className="text-[10px] text-zinc-400 italic text-center">Loading quote...</p>
            )}
          </div>

        </div>

        {/* ============================================================
            5. FITUR HIGHLIGHT SECTION (Desktop only, full width)
            ============================================================ */}
        <section className="hidden lg:flex flex-col gap-3.5 mt-2">
          <div className="text-left">
            <span className="text-[11px] font-extrabold text-zinc-400 tracking-[0.2em] uppercase">
              SEMUA FITUR LIFEFLOW
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            
            {/* Feature 1 — Finance Tracker */}
            <div 
              onClick={() => setActiveView('finance')}
              className="bg-[#141414]/75 border border-white/5 backdrop-blur-md rounded-[10px] p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[#141414] hover:border-orange-500/25 transition-all duration-150 select-none group"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <img src="/icons/Finance.png" alt="Finance Tracker" className="w-9 h-9 object-contain" />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-[13px] font-bold text-zinc-200 group-hover:text-zinc-100 transition-colors leading-tight">
                  Finance Tracker
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 truncate font-semibold">
                  Catat & analisis keuangan harian
                </p>
              </div>
            </div>

            {/* Feature 2 — Budget & Savings */}
            <div 
              onClick={() => setActiveView('budgets' as View)}
              className="bg-[#141414]/75 border border-white/5 backdrop-blur-md rounded-[10px] p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[#141414] hover:border-orange-500/25 transition-all duration-150 select-none group"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <img src="/icons/Budgets.png" alt="Budget & Savings" className="w-9 h-9 object-contain" />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-[13px] font-bold text-zinc-200 group-hover:text-zinc-100 transition-colors leading-tight">
                  Budget & Savings
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 truncate font-semibold">
                  Rencanakan pengisian tabungan
                </p>
              </div>
            </div>

            {/* Feature 3 — Habit Tracker */}
            <div 
              onClick={() => setActiveView('habits')}
              className="bg-[#141414]/75 border border-white/5 backdrop-blur-md rounded-[10px] p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[#141414] hover:border-orange-500/25 transition-all duration-150 select-none group"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <img src="/icons/Habit_Tracker.png" alt="Habit Tracker" className="w-9 h-9 object-contain" />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-[13px] font-bold text-zinc-200 group-hover:text-zinc-100 transition-colors leading-tight">
                  Habit Tracker
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 truncate font-semibold">
                  Bangun konsistensi harian Anda
                </p>
              </div>
            </div>

            {/* Feature 4 — AI Planner */}
            <div 
              onClick={() => setActiveView('ai_planner')}
              className="bg-[#141414]/75 border border-white/5 backdrop-blur-md rounded-[10px] p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[#141414] hover:border-orange-500/25 transition-all duration-150 select-none group"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <img src="/icons/AI.png" alt="AI Planner" className="w-9 h-9 object-contain" />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-[13px] font-bold text-zinc-200 group-hover:text-zinc-100 transition-colors leading-tight">
                  AI Planner
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 truncate font-semibold">
                  AI compiles automated study plans
                </p>
              </div>
            </div>

            {/* Feature 5 — AI Smart Space */}
            <div 
              onClick={() => setActiveView('smart_space')}
              className="bg-[#141414]/75 border border-white/5 backdrop-blur-md rounded-[10px] p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[#141414] hover:border-orange-500/25 transition-all duration-150 select-none group"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <img src="/icons/Analytics.png" alt="AI Smart Space" className="w-9 h-9 object-contain" />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-[13px] font-bold text-zinc-200 group-hover:text-zinc-100 transition-colors leading-tight">
                  AI Smart Space
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 truncate font-semibold">
                  Focus, mind map & wrap summary
                </p>
              </div>
            </div>

            {/* Feature 6 — Daily Journal */}
            <div 
              onClick={() => setActiveView('journal')}
              className="bg-[#141414]/75 border border-white/5 backdrop-blur-md rounded-[10px] p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[#141414] hover:border-orange-500/25 transition-all duration-150 select-none group"
            >
              <div className="w-9 h-9 flex items-center justify-center shrink-0">
                <img src="/icons/Journal.png" alt="Daily Journal" className="w-9 h-9 object-contain" />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-[13px] font-bold text-zinc-200 group-hover:text-zinc-100 transition-colors leading-tight">
                  Daily Journal
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 truncate font-semibold">
                  Refleksi harian & spiritual ritual
                </p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
