import React, { useState } from 'react';
import { Plus, Trash2, Target as TargetIcon, Flame, Heart, Briefcase, User, PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react';
import { Target } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmationModal } from './ConfirmationModal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import confetti from 'canvas-confetti';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

export default function DailyTargets() {
  const { t } = useLanguage();
  const { targets, saveTarget, deleteTarget: deleteTargetFromDb } = useData();

  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState<Target['category']>('personal');
  const [targetToDelete, setTargetToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');

  const addTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetValue) return;

    const newTarget: Target = {
      id: crypto.randomUUID(),
      title,
      targetValue: parseFloat(targetValue),
      currentValue: 0,
      unit,
      category,
    };

    saveTarget(newTarget);
    setTitle('');
    setTargetValue('');
    setUnit('');
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const updateProgress = (id: string, amount: number) => {
    const target = targets.find(t => t.id === id);
    if (target) {
      const oldProgress = (target.currentValue / target.targetValue) * 100;
      const newValue = Math.max(0, Math.min(target.targetValue, target.currentValue + amount));
      const newProgress = (newValue / target.targetValue) * 100;
      
      saveTarget({ ...target, currentValue: newValue });

      if (newProgress === 100 && oldProgress < 100) {
        triggerConfetti();
      }
    }
  };

  const deleteTarget = (id: string) => {
    deleteTargetFromDb(id);
    setTargetToDelete(null);
  };

  const getCategoryIcon = (cat: Target['category']) => {
    switch (cat) {
      case 'health': return <Heart className="w-5 h-5" />;
      case 'work': return <Briefcase className="w-5 h-5" />;
      case 'finance': return <TrendingUp className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (cat: Target['category']) => {
    switch (cat) {
      case 'health': return 'var(--color-accent-danger)';
      case 'work': return 'var(--color-accent-blue)';
      case 'finance': return 'var(--color-accent-warning)';
      default: return 'var(--color-accent-teal)';
    }
  };

  const getCategoryBg = (cat: Target['category']) => {
    switch (cat) {
      case 'health': return 'text-accent-danger bg-accent-danger/10';
      case 'work': return 'text-accent-blue bg-accent-blue/10';
      case 'finance': return 'text-accent-warning bg-accent-warning/10';
      default: return 'text-accent-teal bg-accent-teal/10';
    }
  };

  const chartData = targets.map(t => ({
    name: t.title,
    progress: Math.round((t.currentValue / t.targetValue) * 100),
    current: t.currentValue,
    target: t.targetValue,
    category: t.category,
    color: getCategoryColor(t.category)
  }));

  const pieData = [
    { name: 'Completed', value: targets.filter(t => t.currentValue >= t.targetValue).length },
    { name: 'In Progress', value: targets.filter(t => t.currentValue < t.targetValue && t.currentValue > 0).length },
    { name: 'Not Started', value: targets.filter(t => t.currentValue === 0).length }
  ].filter(d => d.value > 0);

  const COLORS = ['#10b981', '#3b82f6', '#94a3b8'];

  return (
    <div className="relative min-h-full overflow-hidden lg:rounded-3xl p-1">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=2070&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 z-0 bg-canvas/60 backdrop-blur-[2px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 relative z-10"
      >
      <div className="flex items-center justify-between mb-4">
        <div className="flex bg-surface-2 p-1 rounded-pill border border-hairline shadow-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-2 rounded-pill text-eyebrow font-bold transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'list' ? 'bg-accent text-white shadow-glow-accent' : 'text-ink-tertiary hover:text-ink'}`}
          >
            <TargetIcon className="w-4 h-4" />
            {t('myTargets')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2 rounded-pill text-eyebrow font-bold transition-all flex items-center gap-2 uppercase tracking-widest ${activeTab === 'analytics' ? 'bg-accent text-white shadow-glow-accent' : 'text-ink-tertiary hover:text-ink'}`}
          >
            <BarChart3 className="w-4 h-4" />
            {t('analytics')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
          <form onSubmit={addTarget} className="bg-surface-1 p-6 rounded-lg shadow-card border border-hairline space-y-4">
            <h3 className="text-heading-sm font-bold text-ink mb-4">{t('setNewTarget')}</h3>
            <div>
              <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('goalName')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm transition-all placeholder:text-ink-subtle"
                placeholder="e.g. Drink Water, Read Pages"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('targetValue')}</label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm font-mono transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('unit')}</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm transition-all"
                  placeholder="Liters, Pages"
                />
              </div>
            </div>
            <div>
              <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('category')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Target['category'])}
                className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm transition-all appearance-none cursor-pointer"
              >
                <option value="personal">{t('personal')}</option>
                <option value="health">{t('health')}</option>
                <option value="work">{t('work')}</option>
                <option value="finance">{t('finance')}</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-accent text-white h-12 rounded-pill font-bold hover:bg-accent-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-glow-accent"
            >
              <Plus className="w-5 h-5" />
              {t('setTarget')}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {targets.length === 0 ? (
                  <div className="col-span-full bg-surface-1 p-16 rounded-lg shadow-card border border-hairline border-dashed text-center">
                    <p className="text-ink-tertiary italic text-body-sm">{t('noTargets')}</p>
                  </div>
                ) : (
                  targets.map((target) => {
                    const progress = (target.currentValue / target.targetValue) * 100;
                    const isDone = progress === 100;
                    return (
                      <motion.div
                        key={target.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`bg-surface-1 p-6 rounded-lg shadow-card border transition-all relative overflow-hidden group ${isDone ? 'border-accent shadow-glow-accent opacity-80' : 'border-hairline hover:border-hairline-strong'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-md flex items-center justify-center border border-hairline-strong shadow-sm ${getCategoryBg(target.category)}`}>
                              {getCategoryIcon(target.category)}
                            </div>
                            <div>
                              <h4 className={`text-heading-xs font-bold transition-all ${isDone ? 'text-accent' : 'text-ink'}`}>{target.title.toUpperCase()}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-eyebrow text-ink-tertiary font-bold uppercase tracking-widest">{target.category}</span>
                                {isDone && (
                                  <span className="flex items-center gap-1.5 text-eyebrow text-accent font-black uppercase tracking-widest">
                                    <Flame className="w-3 h-3" />
                                    {t('unlocked')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setTargetToDelete(target.id)}
                            className="p-2 text-ink-tertiary hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-4 mt-8">
                          <div className="flex justify-between items-end">
                            <div className="text-ink-tertiary">
                              <span className="text-heading-sm font-black text-ink font-mono">{target.currentValue}</span>
                              <span className="text-eyebrow font-bold uppercase ml-2">/ {target.targetValue} {target.unit}</span>
                            </div>
                            <div className={`text-heading-xs font-black ${isDone ? 'text-accent' : 'text-ink-subtle'}`}>{Math.round(progress)}%</div>
                          </div>
                          <div className="h-3 bg-surface-2 rounded-pill overflow-hidden border border-hairline">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className={`h-full transition-all ${isDone ? 'bg-accent shadow-glow-accent' : 'bg-accent/40'}`}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                          <button
                            onClick={() => updateProgress(target.id, -1)}
                            className="flex-1 h-10 rounded-md bg-surface-2 border border-hairline text-ink-tertiary hover:bg-surface-3 transition-all font-bold text-xs uppercase"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => updateProgress(target.id, 1)}
                            className={`flex-1 h-10 rounded-md text-white transition-all font-bold text-xs uppercase shadow-sm ${isDone ? 'bg-accent/50 cursor-not-allowed' : 'bg-accent hover:bg-accent-hover shadow-glow-accent'}`}
                          >
                            +1
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline overflow-hidden group hover:border-hairline-strong transition-all">
                  <h3 className="text-heading-sm font-black text-ink mb-8 flex items-center gap-3 uppercase tracking-tight">
                    <TrendingUp className="w-6 h-6 text-accent" />
                    {t('overallProgress')}
                  </h3>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-hairline)" />
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={100} 
                          tick={{ fontSize: 10, fill: 'var(--color-ink-tertiary)', fontWeight: 700 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{ fill: 'var(--color-surface-2)', radius: 4 }}
                          content={({ active, payload, label }: any) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-surface-3 p-4 rounded-md shadow-modal border border-hairline-strong backdrop-blur-xl">
                                  <p className="text-eyebrow font-black text-ink-subtle uppercase tracking-widest mb-2 border-b border-hairline pb-1">{label}</p>
                                  <div className="flex items-center justify-between gap-6">
                                    <span className="text-body-sm font-bold text-ink uppercase tracking-tight">{t('progress')}</span>
                                    <span className="text-body-sm font-black text-accent font-mono tracking-tighter">{payload[0].value}%</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="progress" 
                          radius={[0, 4, 4, 0]} 
                          barSize={16}
                          animationDuration={1500}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline group hover:border-hairline-strong transition-all">
                    <h3 className="text-heading-xs font-black text-ink mb-6 uppercase tracking-tight flex items-center gap-3">
                      <PieIcon className="w-5 h-5 text-accent" />
                      {t('statusDistribution')}
                    </h3>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                            animationDuration={1500}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['var(--color-success)', 'var(--color-accent)', 'var(--color-ink-subtle)'][index % 3]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-surface-3 p-4 rounded-md shadow-modal border border-hairline-strong backdrop-blur-xl">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-2 h-2 rounded-pill" style={{ backgroundColor: payload[0].payload.fill || payload[0].color }} />
                                      <span className="text-eyebrow font-black text-ink-subtle uppercase tracking-widest">{payload[0].name}</span>
                                    </div>
                                    <div className="text-body-sm font-black text-ink font-mono tracking-tighter ml-4">{payload[0].value} {t('target')}</div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => <span className="text-eyebrow font-black text-ink-subtle uppercase tracking-widest ml-1">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-surface-1 p-10 rounded-lg shadow-card border border-hairline group hover:border-hairline-strong transition-all flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-pill -mr-16 -mt-16 blur-2xl" />
                    <div className="w-20 h-20 bg-accent/10 rounded-pill flex items-center justify-center mb-6 shadow-sm border border-accent/20">
                      <Flame className="w-10 h-10 text-accent animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-display-md font-black text-ink font-mono tracking-tighter">
                        {targets.filter(t => t.currentValue >= t.targetValue).length} <span className="text-ink-tertiary opacity-40">/</span> {targets.length}
                      </h4>
                      <p className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest">{t('targetsCompleted')}</p>
                    </div>
                    <div className="mt-8 text-eyebrow font-bold text-ink-tertiary italic tracking-tight opacity-60 max-w-[180px] lowercase">
                      "Keep it up! Consistency is the key to mastery."
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!targetToDelete}
        title={t('deleteTarget')}
        message={t('deleteTargetConfirm')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        type="danger"
        onConfirm={() => targetToDelete && deleteTarget(targetToDelete)}
        onCancel={() => setTargetToDelete(null)}
      />
    </motion.div>
    </div>
  );
}
