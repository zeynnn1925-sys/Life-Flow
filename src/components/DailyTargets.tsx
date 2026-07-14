import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Target as TargetIcon, Flame, Heart, Briefcase, User, PieChart as PieIcon, BarChart3, TrendingUp, Sparkles, Compass, Check, Loader2, ExternalLink, Search, Filter, HelpCircle } from 'lucide-react';
import { Target } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmationModal } from './ConfirmationModal';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import confetti from 'canvas-confetti';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { generateChallenges, AISuggestedChallenge, classifyJobs, AIClassifiedJob } from '../services/aiService';
import { originalCareerLinks } from '../data/careerLinks';

export default function DailyTargets() {
  const { t, language } = useLanguage();
  const { targets, saveTarget, deleteTarget: deleteTargetFromDb } = useData();

  const totalActiveTargets = targets.length;
  const completedTodayTargets = targets.filter(t => t.currentValue >= t.targetValue).length;
  const averageProgress = totalActiveTargets > 0
    ? Math.round(targets.reduce((acc, t) => acc + (t.currentValue / t.targetValue), 0) / totalActiveTargets * 100)
    : 0;

  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState<string>('personal');
  const [customCategory, setCustomCategory] = useState('');
  const [targetToDelete, setTargetToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics' | 'challenges' | 'job-hunt'>('list');

  // Edit Target States
  const [targetToEdit, setTargetToEdit] = useState<Target | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTargetValue, setEditTargetValue] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editCategory, setEditCategory] = useState<string>('personal');
  const [customEditCategory, setCustomEditCategory] = useState('');
  const [editCurrentValue, setEditCurrentValue] = useState('');
  const [isEditingValue, setIsEditingValue] = useState<string | null>(null);

  const defaultCategories = ['personal', 'health', 'work', 'finance'];
  const existingCategories = Array.from(new Set(targets.map(t => t.category.trim().toLowerCase())))
    .filter(cat => cat && !defaultCategories.includes(cat));

  const [aiChallenges, setAiChallenges] = useState<AISuggestedChallenge[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Job Hunt classification states
  const [classifiedJobs, setClassifiedJobs] = useState<Record<string, AIClassifiedJob>>({});
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');

  const presetChallenges = [
    {
      titleId: "Minum Air Hidrasi",
      titleEn: "Hydrate Body Daily",
      descId: "Minum minimal 2 liter air putih hari ini untuk menjaga metabolisme tubuh, stamina, dan konsentrasi kerja.",
      descEn: "Drink at least 2 liters of water today to support your physical energy, stamina, and mental concentration.",
      category: "health" as Target['category'],
      targetValue: 2,
      unitId: "Liter",
      unitEn: "Liters"
    },
    {
      titleId: "Membaca Buku Bermanfaat",
      titleEn: "Read Educational Pages",
      descId: "Membaca minimal 10 halaman buku pengembangan diri, ilmu bisnis, atau artikel ilmiah untuk menambah pengetahuan.",
      descEn: "Read at least 10 pages of any self-improvement, business, or educational book/article to sharpen your mind.",
      category: "personal" as Target['category'],
      targetValue: 10,
      unitId: "Halaman",
      unitEn: "Pages"
    },
    {
      titleId: "Sesi Olahraga Sehat",
      titleEn: "Cardio & Stretching",
      descId: "Lakukan 20 menit olahraga ringan, stretching, jalan kaki cepat, atau workout mandiri agar tubuh tetap bugar.",
      descEn: "Perform 20 minutes of light cardio, stretching, or home workout to keep your heart rate up and muscles active.",
      category: "health" as Target['category'],
      targetValue: 20,
      unitId: "Menit",
      unitEn: "Minutes"
    },
    {
      titleId: "Fokus Belajar Coding",
      titleEn: "Clean Coding Practice",
      descId: "Alokasikan 60 menit fokus penuh belajar bahasa pemograman baru, mengulang teori React, atau menyelesaikan code challenge.",
      descEn: "Allocate 60 minutes of uninterrupted focus to learn a new framework, practice writing clean code, or solve algorithm challenges.",
      category: "work" as Target['category'],
      targetValue: 60,
      unitId: "Menit",
      unitEn: "Minutes"
    },
    {
      titleId: "Catat Pengeluaran Keuangan",
      titleEn: "Track Financial Transactions",
      descId: "Ambil kontrol finansial dengan mencatat minimal 1 pengeluaran atau tabungan Anda hari ini di modul Keuangan LifeFlow.",
      descEn: "Take control of your budget by logging at least 1 expense or savings item in the LifeFlow Finance tracker today.",
      category: "finance" as Target['category'],
      targetValue: 1,
      unitId: "Transaksi",
      unitEn: "Transaction"
    }
  ];

  const handleTryChallenge = (challenge: any) => {
    const isIndo = language === 'id';
    const newTarget: Target = {
      id: crypto.randomUUID(),
      title: isIndo ? (challenge.titleId || challenge.title) : (challenge.titleEn || challenge.title),
      targetValue: challenge.targetValue,
      currentValue: 0,
      unit: isIndo ? (challenge.unitId || challenge.unit) : (challenge.unitEn || challenge.unit),
      category: challenge.category,
    };
    saveTarget(newTarget);
    triggerConfetti();
    setActiveTab('list');
  };

  const fetchAiChallenges = async () => {
    setIsGenerating(true);
    setGenError(null);
    try {
      const res = await generateChallenges(language as 'id' | 'en');
      setAiChallenges(res);
    } catch (err: any) {
      setGenError(err.message || 'Error generating challenges');
    } finally {
      setIsGenerating(false);
    }
  };

  const addTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetValue) return;

    const finalCategory = category === 'custom' 
      ? (customCategory.trim().toLowerCase() || 'personal') 
      : category.toLowerCase();

    const newTarget: Target = {
      id: crypto.randomUUID(),
      title,
      targetValue: parseFloat(targetValue),
      currentValue: 0,
      unit,
      category: finalCategory,
    };

    saveTarget(newTarget);
    setTitle('');
    setTargetValue('');
    setUnit('');
    setCategory('personal');
    setCustomCategory('');
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

  const openEditModal = (target: Target) => {
    setTargetToEdit(target);
    setEditTitle(target.title);
    setEditTargetValue(target.targetValue.toString());
    setEditUnit(target.unit);
    setEditCategory(target.category);
    setCustomEditCategory('');
    setEditCurrentValue(target.currentValue.toString());
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetToEdit || !editTitle || !editTargetValue) return;

    const parsedTargetValue = parseFloat(editTargetValue);
    const parsedCurrentValue = parseFloat(editCurrentValue || '0');
    if (isNaN(parsedTargetValue) || isNaN(parsedCurrentValue)) return;

    const finalCategory = editCategory === 'custom'
      ? (customEditCategory.trim().toLowerCase() || 'personal')
      : editCategory.toLowerCase();

    const updated: Target = {
      ...targetToEdit,
      title: editTitle,
      targetValue: parsedTargetValue,
      unit: editUnit,
      category: finalCategory,
      currentValue: Math.max(0, Math.min(parsedTargetValue, parsedCurrentValue)),
    };

    saveTarget(updated);
    setTargetToEdit(null);
    setCustomEditCategory('');
    triggerConfetti();
  };

  const handleDirectValueUpdate = (id: string, value: number) => {
    setIsEditingValue(null);
    if (isNaN(value)) return;
    
    const target = targets.find(t => t.id === id);
    if (target) {
      const oldProgress = (target.currentValue / target.targetValue) * 100;
      const newValue = Math.max(0, Math.min(target.targetValue, value));
      const newProgress = (newValue / target.targetValue) * 100;
      
      saveTarget({ ...target, currentValue: newValue });
      
      if (newProgress === 100 && oldProgress < 100) {
        triggerConfetti();
      }
    }
  };

  const handleClassifyJobs = async () => {
    setIsClassifying(true);
    setClassifyError(null);
    try {
      const response = await classifyJobs(language as 'id' | 'en', originalCareerLinks);
      const mapped: Record<string, AIClassifiedJob> = {};
      response.forEach(item => {
        mapped[item.id] = item;
      });
      setClassifiedJobs(mapped);
      triggerConfetti();
    } catch (err: any) {
      console.error("Classification error:", err);
      setClassifyError(err.message || 'Error classifying jobs');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleAddCareerTarget = (lnk: any, classified?: AIClassifiedJob) => {
    const titleText = classified?.recommendedGoal || `${language === 'id' ? 'Lamar Pekerjaan di' : 'Apply at'} ${lnk.name}`;
    const value = classified?.targetValue ?? 1;
    const unitText = classified?.unit ?? (language === 'id' ? 'Lamaran' : 'Application');
    
    const newTarget: Target = {
      id: 'job-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9),
      title: titleText,
      targetValue: value,
      currentValue: 0,
      unit: unitText,
      category: 'work',
    };
    saveTarget(newTarget);
    triggerConfetti();
    setActiveTab('list');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'health': return <Heart className="w-5 h-5" />;
      case 'work': return <Briefcase className="w-5 h-5" />;
      case 'finance': return <TrendingUp className="w-5 h-5" />;
      case 'personal': return <User className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'health': return 'var(--color-accent-danger)';
      case 'work': return 'var(--color-accent-blue)';
      case 'finance': return 'var(--color-accent-warning)';
      case 'personal': return 'var(--color-accent-teal)';
      default: return 'var(--color-accent)';
    }
  };

  const getCategoryBg = (cat: string) => {
    switch (cat) {
      case 'health': return 'text-accent-danger bg-accent-danger/10';
      case 'work': return 'text-accent-blue bg-accent-blue/10';
      case 'finance': return 'text-accent-warning bg-accent-warning/10';
      case 'personal': return 'text-accent-teal bg-accent-teal/10';
      default: return 'text-accent bg-accent/10';
    }
  };

  const chartData = targets.map(t => ({
    id: t.id,
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
        <div className="flex bg-surface-2 p-1 rounded-pill border border-hairline shadow-sm overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-2 rounded-pill text-eyebrow font-bold transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${activeTab === 'list' ? 'bg-accent text-white shadow-glow-accent' : 'text-ink-tertiary hover:text-ink'}`}
          >
            <TargetIcon className="w-4 h-4" />
            {t('myTargets')}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2 rounded-pill text-eyebrow font-bold transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${activeTab === 'analytics' ? 'bg-accent text-white shadow-glow-accent' : 'text-ink-tertiary hover:text-ink'}`}
          >
            <BarChart3 className="w-4 h-4" />
            {t('analytics')}
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-6 py-2 rounded-pill text-eyebrow font-bold transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${activeTab === 'challenges' ? 'bg-accent text-white shadow-glow-accent' : 'text-ink-tertiary hover:text-ink'}`}
          >
            <Compass className="w-4 h-4" />
            {language === 'id' ? 'Tantangan Baru' : 'Explore Challenges'}
          </button>
          <button
            onClick={() => setActiveTab('job-hunt')}
            className={`px-6 py-2 rounded-pill text-eyebrow font-bold transition-all flex items-center gap-2 uppercase tracking-widest whitespace-nowrap ${activeTab === 'job-hunt' ? 'bg-accent text-white shadow-glow-accent' : 'text-ink-tertiary hover:text-ink'}`}
          >
            <Briefcase className="w-4 h-4" />
            {language === 'id' ? 'Karir Baru Saya' : 'My New Job'}
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
            <div className="space-y-3">
              <div>
                <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('category')}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm transition-all appearance-none cursor-pointer"
                >
                  <option value="personal">{t('personal')}</option>
                  <option value="health">{t('health')}</option>
                  <option value="work">{t('work')}</option>
                  <option value="finance">{t('finance')}</option>
                  
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}

                  <option value="custom" className="text-accent font-bold">
                    {t('customCategoryOption')}
                  </option>
                </select>
              </div>

              {category === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  <label className="block text-eyebrow text-ink-tertiary uppercase">{t('customCategoryLabel')}</label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm transition-all placeholder:text-ink-subtle"
                    placeholder={t('customCategoryPlaceholder')}
                  />
                </motion.div>
              )}
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
                className="space-y-6"
              >
                {/* Stats Summary Bento Grid */}
                {totalActiveTargets > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Total Active Targets */}
                    <div className="bg-surface-1/80 backdrop-blur-md p-5 rounded-lg border border-hairline shadow-sm flex items-center justify-between group hover:border-hairline-strong transition-all">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-ink-tertiary tracking-wider uppercase block">{t('totalActive')}</span>
                        <div className="text-heading-md font-mono font-black text-ink">{totalActiveTargets}</div>
                        <span className="text-[10px] text-ink-subtle">{language === 'id' ? 'Sasaran aktif harian' : 'Active daily goals'}</span>
                      </div>
                      <div className="w-12 h-12 rounded-pill bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <TargetIcon className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Card 2: Completed Today */}
                    <div className="bg-surface-1/80 backdrop-blur-md p-5 rounded-lg border border-hairline shadow-sm flex items-center justify-between group hover:border-hairline-strong transition-all">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-ink-tertiary tracking-wider uppercase block">{t('completedToday')}</span>
                        <div className="text-heading-md font-mono font-black text-ink">
                          {completedTodayTargets} <span className="text-ink-tertiary text-body-sm font-normal">/ {totalActiveTargets}</span>
                        </div>
                        <span className="text-[10px] text-accent font-semibold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" />
                          {completedTodayTargets === totalActiveTargets && totalActiveTargets > 0 
                            ? (language === 'id' ? 'Luar biasa! Semua beres!' : 'Amazing! All complete!') 
                            : (language === 'id' ? 'Ayo selesaikan hari ini!' : 'Keep going today!')}
                        </span>
                      </div>
                      <div className={`w-12 h-12 rounded-pill flex items-center justify-center border ${completedTodayTargets === totalActiveTargets && totalActiveTargets > 0 ? 'bg-success/15 border-success/30 text-success' : 'bg-accent-warning/15 border-accent-warning/30 text-accent-warning'}`}>
                        <Flame className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Card 3: Average Progress */}
                    <div className="bg-surface-1/80 backdrop-blur-md p-5 rounded-lg border border-hairline shadow-sm flex items-center justify-between group hover:border-hairline-strong transition-all">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-ink-tertiary tracking-wider uppercase block">{t('avgProgress')}</span>
                        <div className="text-heading-md font-mono font-black text-ink">{averageProgress}%</div>
                        <div className="w-32 h-1.5 bg-surface-2 rounded-pill overflow-hidden border border-hairline mt-1.5">
                          <div className="h-full bg-accent" style={{ width: `${averageProgress}%` }} />
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-pill bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            
                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(target)}
                                className="p-2 text-ink-tertiary hover:text-accent transition-colors"
                                title={t('editTarget')}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setTargetToDelete(target.id)}
                                className="p-2 text-ink-tertiary hover:text-danger transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4 mt-8">
                            <div className="flex justify-between items-center h-10">
                              <div className="text-ink-tertiary flex items-center gap-1.5">
                                {isEditingValue === target.id ? (
                                  <input
                                    type="number"
                                    defaultValue={target.currentValue}
                                    onBlur={(e) => handleDirectValueUpdate(target.id, parseFloat(e.target.value))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleDirectValueUpdate(target.id, parseFloat(e.currentTarget.value));
                                      } else if (e.key === 'Escape') {
                                        setIsEditingValue(null);
                                      }
                                    }}
                                    className="w-20 h-9 text-center bg-surface-2 border border-accent rounded-md font-mono text-heading-xs font-black text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <span 
                                    onClick={() => setIsEditingValue(target.id)} 
                                    className="text-heading-sm font-black text-ink font-mono hover:bg-surface-2 px-2 py-1 rounded cursor-pointer transition-colors border border-dashed border-transparent hover:border-hairline-strong mr-1 block"
                                    title={language === 'id' ? 'Klik untuk mengubah nilai secara langsung' : 'Click to change value directly'}
                                  >
                                    {target.currentValue}
                                  </span>
                                )}
                                <span className="text-eyebrow font-bold uppercase ml-1">/ {target.targetValue} {target.unit}</span>
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
                </div>
              </motion.div>
            ) : activeTab === 'analytics' ? (
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
                          dataKey="id" 
                          type="category" 
                          width={100} 
                          tick={{ fontSize: 10, fill: 'var(--color-ink-tertiary)', fontWeight: 700 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(id) => {
                            const found = targets.find(t => t.id === id);
                            return found ? found.title.toUpperCase() : id;
                          }}
                        />
                        <Tooltip 
                          cursor={{ fill: 'var(--color-surface-2)', radius: 4 }}
                          content={({ active, payload, label }: any) => {
                            if (active && payload && payload.length) {
                              const found = targets.find(t => t.id === label);
                              const displayName = found ? found.title.toUpperCase() : label;
                              return (
                                <div className="bg-surface-3 p-4 rounded-md shadow-modal border border-hairline-strong backdrop-blur-xl">
                                  <p className="text-eyebrow font-black text-ink-subtle uppercase tracking-widest mb-2 border-b border-hairline pb-1">{displayName}</p>
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
            ) : activeTab === 'challenges' ? (
              <motion.div
                key="challenges"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* AI Generator Hero Card */}
                <div className="bg-gradient-to-r from-accent/20 to-accent-blue/10 p-6 rounded-lg shadow-card border border-accent/20 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-heading-sm font-black text-ink flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                        {language === 'id' ? 'Rekomendasi Tantangan AI' : 'AI-Powered Custom Challenges'}
                      </h3>
                      <p className="text-body-sm text-ink-subtle max-w-[480px]">
                        {language === 'id' 
                          ? 'Dapatkan 3 target personal khusus yang dirancang pintar oleh Gemini AI sesuai dengan gaya hidup produktif Anda.'
                          : 'Receive 3 highly personalized, smart targets generated on-the-fly by Gemini AI based on your productivity goals.'}
                      </p>
                    </div>
                    <button
                      onClick={fetchAiChallenges}
                      disabled={isGenerating}
                      className="bg-accent text-white px-6 py-3 rounded-pill font-bold hover:bg-accent-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-glow-accent whitespace-nowrap disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {language === 'id' ? 'Menganalisis...' : 'Generating...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {language === 'id' ? 'Generate Target Kustom' : 'Generate Custom Targets'}
                        </>
                      )}
                    </button>
                  </div>

                  {genError && (
                    <div className="mt-4 p-3 bg-danger/10 border border-danger/20 text-danger rounded-md text-caption">
                      {genError}
                    </div>
                  )}

                  {/* AI Generated Challenges Output */}
                  {aiChallenges.length > 0 && !isGenerating && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-hairline pt-6"
                    >
                      {aiChallenges.map((challenge, idx) => (
                        <div 
                          key={idx}
                          className="bg-surface-1/60 backdrop-blur-xs p-5 rounded-lg border border-accent/20 flex flex-col justify-between group/card animate-fade-in"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getCategoryBg(challenge.category)}`}>
                                {challenge.category}
                              </span>
                              <div className="text-ink-tertiary">
                                <span className="font-mono text-heading-xs font-black text-ink">{challenge.targetValue}</span>
                                <span className="text-[10px] font-bold uppercase ml-1">{challenge.unit}</span>
                              </div>
                            </div>
                            <h4 className="text-body-sm font-bold text-ink uppercase tracking-tight group-hover/card:text-accent transition-colors">
                              {challenge.title}
                            </h4>
                            <p className="text-caption text-ink-subtle leading-relaxed">
                              {challenge.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleTryChallenge(challenge)}
                            className="w-full mt-4 h-9 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            {language === 'id' ? 'Coba Target Ini' : 'Try This Target'}
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Handpicked Presets section */}
                <div className="space-y-4">
                  <h3 className="text-heading-xs font-black text-ink uppercase tracking-widest flex items-center gap-2">
                    <Compass className="w-5 h-5 text-accent" />
                    {language === 'id' ? 'Daftar Target Yang Harus Dicoba' : 'Target Challenges to Perform'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presetChallenges.map((challenge, index) => {
                      const isIndo = language === 'id';
                      const titleText = isIndo ? challenge.titleId : challenge.titleEn;
                      const descText = isIndo ? challenge.descId : challenge.descEn;
                      const unitText = isIndo ? challenge.unitId : challenge.unitEn;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-surface-1 p-6 rounded-lg shadow-card border border-hairline hover:border-accent/40 hover:shadow-glow-accent/5 transition-all flex flex-col justify-between group"
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-md flex items-center justify-center border border-hairline-strong shadow-xs ${getCategoryBg(challenge.category)}`}>
                                  {getCategoryIcon(challenge.category)}
                                </div>
                                <div>
                                  <h4 className="text-body-sm font-bold text-ink uppercase tracking-tight group-hover:text-accent transition-colors">
                                    {titleText}
                                  </h4>
                                  <span className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider">{challenge.category}</span>
                                </div>
                              </div>
                              <div className="text-ink-tertiary">
                                <span className="font-mono text-heading-xs font-black text-ink">{challenge.targetValue}</span>
                                <span className="text-[10px] font-bold uppercase ml-1">{unitText}</span>
                              </div>
                            </div>
                            <p className="text-caption text-ink-subtle leading-relaxed">
                              {descText}
                            </p>
                          </div>

                          <button
                            onClick={() => handleTryChallenge(challenge)}
                            className="w-full mt-6 h-10 bg-surface-2 border border-hairline text-ink hover:bg-accent hover:text-white hover:border-accent rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            {language === 'id' ? 'Laksanakan Target Ini' : 'Perform This Target'}
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="job-hunt"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* AI Career Classifier Banner */}
                <div className="bg-gradient-to-r from-accent/20 to-accent-blue/15 p-6 rounded-lg border border-accent/30 overflow-hidden relative group shadow-card">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <h3 className="text-heading-sm font-black text-ink flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                        {language === 'id' ? 'Klasifikasi Karir Cerdas Gemini AI' : 'Gemini AI Intelligent Career Classification'}
                      </h3>
                      <p className="text-body-sm text-ink-subtle max-w-[550px]">
                        {language === 'id'
                          ? 'Minta Gemini AI menganalisis secara mendalam 40+ situs karir terkemuka di atas. AI akan mengklasifikasikan sektor industri secara spesifik, menganalisis prospek karir, dan membuat target lamaran harian khusus.'
                          : 'Ask Gemini AI to deeply analyze 40+ leading career portals listed below. The AI will classify specific industrial sectors, highlight career prospects, and craft tailored application targets for you.'}
                      </p>
                      
                      {Object.keys(classifiedJobs).length > 0 && (
                        <div className="flex items-center gap-2 text-xs font-bold text-success mt-1">
                          <Check className="w-4 h-4" />
                          <span>
                            {language === 'id' 
                              ? `AI Berhasil Mengklasifikasikan ${Object.keys(classifiedJobs).length} Perusahaan!` 
                              : `AI Successfully Classified ${Object.keys(classifiedJobs).length} Companies!`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleClassifyJobs}
                      disabled={isClassifying}
                      className="bg-accent text-white px-6 py-3 rounded-pill font-bold hover:bg-accent-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-glow-accent whitespace-nowrap disabled:opacity-50"
                    >
                      {isClassifying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {language === 'id' ? 'Menganalisis Industri...' : 'Analyzing Industries...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {language === 'id' ? 'Klasifikasikan Dengan AI' : 'Classify with AI'}
                        </>
                      )}
                    </button>
                  </div>

                  {classifyError && (
                    <div className="mt-4 p-3 bg-danger/10 border border-danger/20 text-danger rounded-md text-caption">
                      {classifyError}
                    </div>
                  )}
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col md:flex-row gap-4 bg-surface-1 p-4 rounded-lg border border-hairline shadow-sm">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                    <input
                      type="text"
                      placeholder={language === 'id' ? 'Cari perusahaan atau link karir...' : 'Search companies or portals...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-surface-2 border border-hairline rounded-md focus:border-accent outline-none text-ink text-body-sm transition-all"
                    />
                  </div>
                  <div className="w-full md:w-64 relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="w-full h-11 pl-10 pr-8 bg-surface-2 border border-hairline rounded-md focus:border-accent outline-none text-ink text-body-sm transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">{language === 'id' ? 'Semua Sektor' : 'All Sectors'}</option>
                      {Array.from(new Set(originalCareerLinks.map(lnk => language === 'id' ? lnk.category : lnk.categoryEn))).map((sector, idx) => (
                        <option key={idx} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Career Portal List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {originalCareerLinks.filter(lnk => {
                    const query = searchQuery.toLowerCase();
                    const matchesSearch = lnk.name.toLowerCase().includes(query) || lnk.url.toLowerCase().includes(query);
                    if (selectedSector === 'all') return matchesSearch;
                    return matchesSearch && (lnk.category === selectedSector || lnk.categoryEn === selectedSector);
                  }).length === 0 ? (
                    <div className="col-span-full py-12 text-center text-ink-tertiary">
                      {language === 'id' ? 'Tidak ditemukan link karir yang sesuai.' : 'No matching career portals found.'}
                    </div>
                  ) : (
                    originalCareerLinks.filter(lnk => {
                      const query = searchQuery.toLowerCase();
                      const matchesSearch = lnk.name.toLowerCase().includes(query) || lnk.url.toLowerCase().includes(query);
                      if (selectedSector === 'all') return matchesSearch;
                      return matchesSearch && (lnk.category === selectedSector || lnk.categoryEn === selectedSector);
                    }).map((lnk) => {
                      const aiJob = classifiedJobs[lnk.id];
                      const sectorDisplay = aiJob?.refinedSector || (language === 'id' ? lnk.category : lnk.categoryEn);
                      
                      return (
                        <div 
                          key={lnk.id}
                          className={`bg-surface-1 p-6 rounded-lg shadow-card border transition-all flex flex-col justify-between group ${aiJob ? 'border-accent/30 shadow-glow-accent/2' : 'border-hairline hover:border-hairline-strong'}`}
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="text-body-sm font-black text-ink uppercase tracking-tight group-hover:text-accent transition-colors flex items-center gap-2">
                                  {lnk.name}
                                  {aiJob && <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />}
                                </h4>
                                <span className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider">{sectorDisplay}</span>
                              </div>
                              <a 
                                href={lnk.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-caption font-bold text-accent hover:text-white transition-all whitespace-nowrap border border-accent/10 px-3 py-1.5 rounded bg-accent/5 hover:bg-accent shadow-sm hover:shadow-glow-accent"
                              >
                                {language === 'id' ? 'Kunjungi Portal' : 'Visit Portal'}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>

                            {aiJob ? (
                              <div className="space-y-3 bg-surface-2 p-4 rounded-md border border-hairline">
                                <div>
                                  <span className="text-[9px] font-black uppercase text-accent tracking-widest block">{language === 'id' ? 'PROSPEK KARIR' : 'CAREER PROSPECT'}</span>
                                  <p className="text-caption text-ink-subtle mt-0.5 leading-relaxed">{aiJob.careerProspect}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] font-black uppercase text-accent-blue tracking-widest block">{language === 'id' ? 'REKOMENDASI TARGET' : 'RECOMMENDED TARGET'}</span>
                                  <p className="text-body-xs font-bold text-ink mt-0.5">{aiJob.recommendedGoal} ({aiJob.targetValue} {aiJob.unit})</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 bg-surface-2 p-3 rounded-md border border-hairline border-dashed">
                                <HelpCircle className="w-5 h-5 text-ink-tertiary shrink-0" />
                                <p className="text-caption text-ink-subtle">
                                  {language === 'id' 
                                    ? 'Belum dianalisis oleh AI. Klik tombol Klasifikasikan di atas untuk analisis khusus.' 
                                    : 'Not yet analyzed by AI. Click the Classify button above to unlock.'}
                                </p>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddCareerTarget(lnk, aiJob)}
                            className={`w-full mt-6 h-10 font-bold text-xs uppercase transition-all rounded-md flex items-center justify-center gap-1.5 ${aiJob ? 'bg-accent text-white hover:bg-accent-hover shadow-glow-accent' : 'bg-surface-2 border border-hairline text-ink hover:bg-surface-3'}`}
                          >
                            <Plus className="w-4 h-4" />
                            {language === 'id' ? 'Jadikan Target Aktif Saya' : 'Add to My Active Targets'}
                          </button>
                        </div>
                      );
                    })
                  )}
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

      {/* Edit Target Modal */}
      <AnimatePresence>
        {targetToEdit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTargetToEdit(null)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-surface-3 rounded-xxl shadow-modal border border-hairline-strong overflow-hidden backdrop-blur-xl z-10"
            >
              <form onSubmit={handleSaveEdit} className="p-8 space-y-4">
                <h3 className="text-heading-md font-black text-ink uppercase tracking-tight mb-4">
                  {t('editTarget')}
                </h3>
                
                <div>
                  <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('goalName')}</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('targetValue')}</label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="any"
                      value={editTargetValue}
                      onChange={(e) => setEditTargetValue(e.target.value)}
                      className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm font-mono transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('unit')}</label>
                    <input
                      type="text"
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('currentValueLabel')}</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={editCurrentValue}
                      onChange={(e) => setEditCurrentValue(e.target.value)}
                      className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm font-mono transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('category')}</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm transition-all appearance-none cursor-pointer"
                    >
                      <option value="personal">{t('personal')}</option>
                      <option value="health">{t('health')}</option>
                      <option value="work">{t('work')}</option>
                      <option value="finance">{t('finance')}</option>
                      
                      {existingCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}

                      <option value="custom" className="text-accent font-bold">
                        {t('customCategoryOption')}
                      </option>
                    </select>
                  </div>
                </div>

                {editCategory === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="block text-eyebrow text-ink-tertiary uppercase">{t('customCategoryLabel')}</label>
                    <input
                      type="text"
                      required
                      value={customEditCategory}
                      onChange={(e) => setCustomEditCategory(e.target.value)}
                      className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm transition-all placeholder:text-ink-subtle"
                      placeholder={t('customCategoryPlaceholder')}
                    />
                  </motion.div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setTargetToEdit(null)}
                    className="flex-1 h-12 rounded-pill font-bold text-ink-tertiary bg-surface-2 border border-hairline hover:bg-surface-3 transition-all uppercase tracking-widest text-eyebrow"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 rounded-pill font-bold text-white bg-accent hover:bg-accent-hover shadow-glow-accent transition-all uppercase tracking-widest text-eyebrow shadow-sm"
                  >
                    {t('updateTarget')}
                  </button>
                </div>
              </form>

              <button 
                type="button"
                onClick={() => setTargetToEdit(null)}
                className="absolute top-6 right-6 p-2 hover:bg-surface-2 rounded-pill transition-all group"
              >
                <X className="w-5 h-5 text-ink-tertiary group-hover:text-ink" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
    </div>
  );
}
