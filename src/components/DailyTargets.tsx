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
      case 'health': return '#ef4444'; // rose-500
      case 'work': return '#3b82f6'; // blue-500
      case 'finance': return '#f59e0b'; // amber-500
      default: return '#fbbf24'; // yellow-400
    }
  };

  const getCategoryBg = (cat: Target['category']) => {
    switch (cat) {
      case 'health': return 'text-rose-500 bg-rose-50';
      case 'work': return 'text-blue-500 bg-blue-50';
      case 'finance': return 'text-amber-500 bg-amber-50';
      default: return 'text-yellow-500 bg-yellow-50';
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
          >
            <TargetIcon className="w-4 h-4" />
            {t('myTargets')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
          >
            <BarChart3 className="w-4 h-4" />
            {t('analytics')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
          <form onSubmit={addTarget} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t('setNewTarget')}</h3>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">{t('goalName')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-deep-space-blue dark:ring-blue-400 transition-all bg-transparent dark:text-white"
                placeholder="e.g. Drink Water, Read Pages"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">{t('targetValue')}</label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-deep-space-blue dark:ring-blue-400 transition-all bg-transparent dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">{t('unit')}</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-deep-space-blue dark:ring-blue-400 transition-all bg-transparent dark:text-white"
                  placeholder="Liters, Pages"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">{t('category')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Target['category'])}
                className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-deep-space-blue dark:ring-blue-400 transition-all bg-white dark:bg-zinc-900 dark:text-white"
              >
                <option value="personal">{t('personal')}</option>
                <option value="health">{t('health')}</option>
                <option value="work">{t('work')}</option>
                <option value="finance">{t('finance')}</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-deep-space-blue text-white py-3 rounded-xl font-semibold hover:bg-deep-space-blue/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-deep-space-blue/20"
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
                  <div className="col-span-full bg-white dark:bg-zinc-900 p-12 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 text-center text-zinc-400 dark:text-zinc-500">
                    {t('noTargets')}
                  </div>
                ) : (
                  targets.map((target) => {
                    const progress = (target.currentValue / target.targetValue) * 100;
                    const isDone = progress === 100;
                    return (
                      <motion.div
                        key={target.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className={`bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border transition-all ${isDone ? 'border-emerald-500/50 dark:border-emerald-500/30' : 'border-black/5 dark:border-white/5'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryBg(target.category)}`}>
                              {getCategoryIcon(target.category)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{target.title}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">{target.category}</span>
                                {isDone && (
                                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                                    <Flame className="w-3 h-3" />
                                    {t('unlocked')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setTargetToDelete(target.id)}
                            className="p-1 text-zinc-300 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400 font-medium lowercase">
                              {target.currentValue} / {target.targetValue} {target.unit}
                            </span>
                            <span className={`font-bold ${isDone ? 'text-emerald-500' : 'text-zinc-900 dark:text-zinc-100'}`}>{Math.round(progress)}%</span>
                          </div>
                          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className={`h-full transition-all ${isDone ? 'bg-emerald-500' : 'bg-deep-space-blue'}`}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => updateProgress(target.id, -1)}
                            className="flex-1 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-medium text-sm"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => updateProgress(target.id, 1)}
                            className={`flex-1 py-2 rounded-lg text-white transition-all font-medium text-sm ${isDone ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-deep-space-blue hover:bg-deep-space-blue/90'}`}
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
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 overflow-hidden">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-deep-space-blue" />
                    {t('overallProgress')}
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                        <XAxis type="number" hide domain={[0, 100]} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={80} 
                          tick={{ fontSize: 12, fill: '#6B7280' }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#F3F4F6' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar 
                          dataKey="progress" 
                          radius={[0, 4, 4, 0]} 
                          barSize={20}
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
                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t('statusDistribution')}</h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 flex flex-col justify-center items-center text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                      <Flame className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h4 className="text-3xl font-black text-zinc-900 dark:text-white">
                      {targets.filter(t => t.currentValue >= t.targetValue).length} / {targets.length}
                    </h4>
                    <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">{t('targetsCompleted')}</p>
                    <div className="pt-4 text-xs text-zinc-400 italic">
                      "Keep it up! Consistency is the key."
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
  );
}
