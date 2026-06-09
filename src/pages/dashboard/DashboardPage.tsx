import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Target as TargetIcon, 
  Sparkles, 
  Wallet, 
  ChevronRight,
  Play
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { View } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const [quoteIndex, setQuoteIndex] = useState(0);

  const displayName = user?.displayName?.split(' ')[0] || (language === 'id' ? 'Sahabat' : 'Friend');

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

  return (
    <div className="relative p-0 lg:p-0">
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
        <header className="hero-section -mx-4 lg:-mx-8 px-8 lg:px-12 py-10 lg:py-14 rounded-3xl mb-12 bg-surface-1/40 border border-hairline relative overflow-hidden shadow-card">
          {/* Ambient Glows */}
          <div className="absolute top-[-50px] right-[-50px] w-72 h-72 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-100px] left-[10%] w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content Column */}
            <div className="md:col-span-8 flex flex-col justify-center text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-8 h-px bg-accent" />
                <span className="text-eyebrow text-accent font-black uppercase tracking-[0.2em]">{t('dashboard')}</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-display-md md:text-display-lg text-ink tracking-tight font-black leading-tight uppercase"
              >
                {language === 'id' ? 'SELAMAT DATANG DI LIFE FLOW' : 'WELCOME TO LIFE FLOW'}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-ink-subtle mt-3 text-body-normal md:text-body-lg font-medium opacity-90 max-w-xl leading-relaxed"
              >
                {language === 'id' 
                  ? `Perkenalkan Flo, Pemandu Pintar Anda yang siap membantu mengelola seluruh alur kerja dengan mudah.`
                  : `Meet Flo, your Intelligent Companion ready to help you coordinate finances, tasks, and mindfulness with blissful ease.`}
              </motion.p>

              {/* Interactive Start Tour Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartTour}
                className="mt-6 px-6 py-3 w-fit bg-gradient-to-r from-accent to-violet-600 hover:from-accent/90 hover:to-violet-500 text-white font-black text-button uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-accent/25 flex items-center gap-2 border border-white/10"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                {language === 'id' ? 'MULAI PANDUAN FLO' : "START FLO'S GUIDE"}
              </motion.button>
            </div>

            {/* Right Interactive Flo Companion Avatar Column */}
            <div className="md:col-span-4 flex flex-col items-center justify-center relative min-h-[180px]">
              {/* Dynamic Speech bubble */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIndex}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-[-50px] bg-[#0d0e12] border border-white/10 px-4 py-2.5 rounded-2xl max-w-[240px] text-center shadow-lg pointer-events-auto cursor-pointer select-none"
                  onClick={cycleFloQuote}
                >
                  <p className="text-[12.5px] leading-relaxed text-slate-200 font-semibold italic">
                    {activePhrases[quoteIndex]}
                  </p>
                  <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#0d0e12] border-r border-b border-white/10 rotate-45" />
                </motion.div>
              </AnimatePresence>

              {/* Flo Levitating Body Vector */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                whileHover={{ scale: 1.08, rotate: [0, 2, -2, 0] }}
                onClick={cycleFloQuote}
                className="relative cursor-pointer z-10 w-32 h-32 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.35)]"
                title={language === 'id' ? "Sapa Flo!" : "Greet Flo!"}
              >
                {/* Custom Glowing Vector Robot SVG */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Outer Orbit Light Ring */}
                  <motion.circle 
                    cx="50" 
                    cy="50" 
                    r="44" 
                    fill="none" 
                    stroke="url(#orbit-glow)" 
                    strokeWidth="1.5" 
                    strokeDasharray="10 6"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  />

                  <defs>
                    <linearGradient id="robot-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <linearGradient id="orbit-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
                      <stop offset="100%" stopColor="rgba(16, 185, 129, 0.4)" />
                    </linearGradient>
                    <linearGradient id="glass-visor" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e1e24" />
                      <stop offset="100%" stopColor="#0a0a0d" />
                    </linearGradient>
                    <radialGradient id="eyes-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#67e8f9" />
                      <stop offset="100%" stopColor="#0891b2" />
                    </radialGradient>
                  </defs>

                  {/* Antenna projection */}
                  <line x1="50" y1="28" x2="50" y2="16" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
                  <motion.circle 
                    cx="50" 
                    cy="14" 
                    r="5" 
                    fill="#10b981"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  />

                  {/* Robot Head Body */}
                  <rect x="24" y="28" width="52" height="42" rx="20" fill="url(#robot-metal)" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="2" />

                  {/* Black screen futuristic glass visor */}
                  <rect x="30" y="36" width="40" height="24" rx="10" fill="url(#glass-visor)" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

                  {/* Smiling Eyes Vector */}
                  <motion.g
                    animate={{ scaleY: [1, 0.05, 1] }}
                    transition={{ repeat: Infinity, duration: 4, repeatDelay: 3 }}
                  >
                    {/* Left Eye (Cute arc shape) */}
                    <path d="M 37 46 Q 42 42 47 46" fill="none" stroke="url(#eyes-glow)" strokeWidth="3.5" strokeLinecap="round" />
                    {/* Right Eye (Cute arc shape) */}
                    <path d="M 53 46 Q 58 42 63 46" fill="none" stroke="url(#eyes-glow)" strokeWidth="3.5" strokeLinecap="round" />
                  </motion.g>

                  {/* Soft Rosy Cheeks */}
                  <circle cx="34" cy="53" r="2.5" fill="#f43f5e" opacity="0.6" />
                  <circle cx="66" cy="53" r="2.5" fill="#f43f5e" opacity="0.6" />

                  {/* Smiling Cute Mouth */}
                  <path d="M 46 51 Q 50 54 54 51" fill="none" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" />
                </svg>

                {/* Sparkling Mini Magic Stars */}
                <div className="absolute top-2 left-2 text-yellow-300 animate-ping opacity-70">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
              </motion.div>

              {/* Levitating Shadow Effect Beneath Robot */}
              <motion.div 
                animate={{ 
                  scaleX: [0.6, 0.8, 0.6], 
                  opacity: [0.3, 0.5, 0.3] 
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-14 h-1.5 bg-black/40 rounded-full blur-[2px] mt-2 filter pointer-events-none" 
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="finance-card-primary group cursor-pointer relative overflow-hidden p-4 lg:p-6"
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
            className="bg-surface-1 p-4 lg:p-6 rounded-lg shadow-card border border-hairline hover:border-hairline-strong transition-all group"
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
            className="bg-surface-1 p-4 lg:p-6 rounded-lg shadow-card border border-hairline hover:border-hairline-strong transition-all group"
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <motion.section 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.42 }}
            className="bg-surface-1 p-6 rounded-lg shadow-card border border-hairline lg:col-span-3"
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-heading-sm font-bold text-ink">{t('quickActions')}</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
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
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView('targets')}
                className="p-4 rounded-md bg-surface-2 hover:bg-surface-3 border border-hairline transition-all text-left"
              >
                <TargetIcon className="w-5 h-5 text-ink-subtle mb-3" />
                <div className="font-semibold text-ink text-body-sm">{t('targets')}</div>
                <div className="text-[10px] text-ink-tertiary">{t('viewTargets')}</div>
              </motion.button>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-primary p-5 lg:p-8 rounded-xxl shadow-glow-primary text-white relative overflow-hidden"
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
