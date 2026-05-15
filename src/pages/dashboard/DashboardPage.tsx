import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Calendar, 
  Target as TargetIcon, 
  Sparkles, 
  Wallet, 
  ChevronRight 
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
}

export default function DashboardPage({ 
  user, 
  summary, 
  weeklyChartData, 
  dailyQuote, 
  setActiveView, 
  t 
}: DashboardPageProps) {
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
              className="text-display-lg md:text-display-xl text-ink tracking-tight font-black leading-none text-3xl lg:text-5xl"
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
