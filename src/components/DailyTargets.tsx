import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, Target as TargetIcon, Flame, Heart, Briefcase, User, PieChart as PieIcon, BarChart3, TrendingUp, Sparkles, Compass, Check, Loader2, ExternalLink, Search, Filter, HelpCircle, Table, Kanban, LayoutGrid, CheckSquare, Square, ArrowRight, Coins, DollarSign } from 'lucide-react';
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
  const { targets, saveTarget, deleteTarget: deleteTargetFromDb, saveTransaction, categories } = useData();

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

  // Notion Workspace Layout and View States
  const [notionView, setNotionView] = useState<'table' | 'board' | 'gallery'>('table');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [targetSearch, setTargetSearch] = useState('');

  // Side Drawer detail, subtasks & checklist states
  const [selectedTargetForDetail, setSelectedTargetForDetail] = useState<Target | null>(null);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  
  // Finance integration form states
  const [financeLogAmount, setFinanceLogAmount] = useState('');
  const [financeLogDesc, setFinanceLogDesc] = useState('');
  const [financeLogCat, setFinanceLogCat] = useState('');
  const [financeLogType, setFinanceLogType] = useState<'expense' | 'income'>('expense');
  const [financeLogSuccess, setFinanceLogSuccess] = useState(false);

  const quickTemplates = [
    { title: language === 'id' ? 'Minum Air' : 'Drink Water', targetValue: 8, unit: language === 'id' ? 'Gelas' : 'Glasses', category: 'health', emoji: '💧' },
    { title: language === 'id' ? 'Membaca Buku' : 'Read Book', targetValue: 15, unit: language === 'id' ? 'Halaman' : 'Pages', category: 'personal', emoji: '📚' },
    { title: language === 'id' ? 'Olahraga' : 'Exercise', targetValue: 30, unit: language === 'id' ? 'Menit' : 'Minutes', category: 'health', emoji: '🏋️' },
    { title: language === 'id' ? 'Belajar Coding' : 'Code Practice', targetValue: 60, unit: language === 'id' ? 'Menit' : 'Minutes', category: 'work', emoji: '💻' },
    { title: language === 'id' ? 'Catat Transaksi' : 'Track Expense', targetValue: 1, unit: language === 'id' ? 'Transaksi' : 'Transaction', category: 'finance', emoji: '💸' },
  ];

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

  const handleAddSubTask = (target: Target, titleText: string) => {
    if (!titleText.trim()) return;
    const newST = {
      id: crypto.randomUUID(),
      title: titleText.trim(),
      completed: false
    };
    const updated: Target = {
      ...target,
      subTasks: [...(target.subTasks || []), newST]
    };
    saveTarget(updated);
    setSelectedTargetForDetail(updated);
    setNewSubTaskTitle('');
  };

  const handleToggleSubTask = (target: Target, subTaskId: string) => {
    const updatedSubTasks = (target.subTasks || []).map(st => 
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );
    const updated: Target = {
      ...target,
      subTasks: updatedSubTasks
    };
    saveTarget(updated);
    setSelectedTargetForDetail(updated);
  };

  const handleDeleteSubTask = (target: Target, subTaskId: string) => {
    const updatedSubTasks = (target.subTasks || []).filter(st => st.id !== subTaskId);
    const updated: Target = {
      ...target,
      subTasks: updatedSubTasks
    };
    saveTarget(updated);
    setSelectedTargetForDetail(updated);
  };

  const handleSaveRelatedFinanceLog = (e: React.FormEvent, target: Target) => {
    e.preventDefault();
    if (!financeLogAmount || isNaN(parseFloat(financeLogAmount))) return;

    const amount = parseFloat(financeLogAmount);
    const desc = financeLogDesc.trim() || target.title;
    const txId = crypto.randomUUID();
    
    // Fallback category if none selected
    let catId = financeLogCat;
    if (!catId) {
      const matchedCats = categories.filter(c => c.type === financeLogType);
      catId = matchedCats.length > 0 ? matchedCats[0].id : (financeLogType === 'expense' ? 'e3' : 'i1');
    }

    const newTx = {
      id: txId,
      description: desc,
      amount: amount,
      type: financeLogType,
      category: catId,
      date: new Date().toISOString().split('T')[0],
    };

    // Save transaction
    saveTransaction(newTx);

    // Auto update target value by +1
    const currentProgressVal = target.currentValue;
    const maxVal = target.targetValue;
    const oldProgress = (currentProgressVal / maxVal) * 100;
    const newValue = Math.min(maxVal, currentProgressVal + 1);
    const newProgress = (newValue / maxVal) * 100;

    const updatedTarget: Target = {
      ...target,
      currentValue: newValue
    };

    saveTarget(updatedTarget);
    setSelectedTargetForDetail(updatedTarget);

    if (newProgress === 100 && oldProgress < 100) {
      triggerConfetti();
    }

    // Reset state
    setFinanceLogAmount('');
    setFinanceLogDesc('');
    setFinanceLogCat('');
    setFinanceLogSuccess(true);
    setTimeout(() => setFinanceLogSuccess(false), 3000);
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

  const getNotionCategoryStyles = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'health':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/30',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-900/50',
          bullet: 'bg-rose-500'
        };
      case 'work':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-900/50',
          bullet: 'bg-blue-500'
        };
      case 'finance':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-900/50',
          bullet: 'bg-amber-500'
        };
      case 'personal':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-900/50',
          bullet: 'bg-emerald-500'
        };
      default:
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/30',
          text: 'text-purple-700 dark:text-purple-300',
          border: 'border-purple-200 dark:border-purple-900/50',
          bullet: 'bg-purple-500'
        };
    }
  };

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
                {/* Notion Style Cover & Header Banner */}
                <div className="bg-surface-1 rounded-xl border border-hairline overflow-hidden shadow-sm hover:border-hairline-strong transition-all duration-300">
                  <div className="h-32 w-full relative bg-zinc-100 dark:bg-zinc-800">
                    <img 
                      src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop" 
                      alt="Workspace Cover" 
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-canvas/40 to-transparent" />
                  </div>
                  
                  <div className="p-6 relative pt-10">
                    <div className="absolute -top-12 left-6 w-20 h-20 bg-surface-1 border border-hairline rounded-2xl shadow-md flex items-center justify-center text-4xl select-none transform hover:scale-105 transition-transform duration-300">
                      🎯
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h2 className="text-heading-sm font-black text-ink flex items-center gap-2">
                            {language === 'id' ? 'Workspace Target Harian' : 'Daily Targets Workspace'}
                            <span className="text-xs bg-accent/15 text-accent px-2.5 py-0.5 rounded font-mono font-bold tracking-wider">Notion v2.0</span>
                          </h2>
                          <p className="text-body-xs text-ink-tertiary max-w-2xl mt-1 leading-relaxed font-sans">
                            {language === 'id' 
                              ? 'Kelola target harian Anda dengan antarmuka bergaya Notion yang minimalis, fleksibel, dan profesional.' 
                              : 'Manage your daily targets and habits in a minimal, structured, and elegant personal workspace database.'}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-2 border border-hairline rounded text-xs font-semibold text-ink">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            <strong>{totalActiveTargets}</strong> {language === 'id' ? 'Aktif' : 'Active'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success/10 border border-success/20 rounded text-xs font-semibold text-success">
                            <Check className="w-3.5 h-3.5" />
                            <strong>{completedTodayTargets}</strong> {language === 'id' ? 'Selesai' : 'Completed'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Notion Quick Templates Row */}
                      <div className="border-t border-hairline pt-3.5 mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-ink-tertiary font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                          {language === 'id' ? 'Templat Instan:' : 'Quick Templates:'}
                        </span>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {quickTemplates.map((tpl, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                const newT: Target = {
                                  id: crypto.randomUUID(),
                                  title: tpl.title,
                                  targetValue: tpl.targetValue,
                                  currentValue: 0,
                                  unit: tpl.unit,
                                  category: tpl.category
                                };
                                saveTarget(newT);
                                triggerConfetti();
                              }}
                              className="px-2.5 py-1 bg-surface-2 hover:bg-surface-3 hover:border-hairline-strong border border-hairline rounded text-[11px] font-semibold text-ink-subtle transition-all flex items-center gap-1 active:scale-95"
                            >
                              <span>{tpl.emoji}</span>
                              <span>{tpl.title}</span>
                              <span className="text-ink-tertiary font-normal">({tpl.targetValue})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notion Style Toolbar & View Selector */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-1 p-3.5 rounded-xl border border-hairline shadow-sm">
                  {/* Views Tabs */}
                  <div className="flex gap-1 border-b border-transparent">
                    <button
                      type="button"
                      onClick={() => setNotionView('table')}
                      className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${notionView === 'table' ? 'border-accent text-ink' : 'border-transparent text-ink-tertiary hover:text-ink'}`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      {language === 'id' ? 'Tabel' : 'Table'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotionView('board')}
                      className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${notionView === 'board' ? 'border-accent text-ink' : 'border-transparent text-ink-tertiary hover:text-ink'}`}
                    >
                      <Kanban className="w-3.5 h-3.5" />
                      {language === 'id' ? 'Papan' : 'Board'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotionView('gallery')}
                      className={`pb-2 px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${notionView === 'gallery' ? 'border-accent text-ink' : 'border-transparent text-ink-tertiary hover:text-ink'}`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      {language === 'id' ? 'Galeri' : 'Gallery'}
                    </button>
                  </div>

                  {/* Filters and Search controls */}
                  <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
                    {/* Search query input */}
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-tertiary" />
                      <input
                        type="text"
                        value={targetSearch}
                        onChange={(e) => setTargetSearch(e.target.value)}
                        placeholder={language === 'id' ? 'Cari target...' : 'Search targets...'}
                        className="w-full sm:w-40 h-8 pl-8 pr-3 bg-surface-1 border border-hairline rounded text-xs focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink transition-all"
                      />
                    </div>

                    {/* Category Selector dropdown */}
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-8 px-2 bg-surface-1 border border-hairline rounded text-xs text-ink outline-none cursor-pointer hover:bg-surface-2 transition-colors font-medium"
                    >
                      <option value="all">{language === 'id' ? 'Semua Kategori' : 'All Categories'}</option>
                      <option value="personal">{t('personal')}</option>
                      <option value="health">{t('health')}</option>
                      <option value="work">{t('work')}</option>
                      <option value="finance">{t('finance')}</option>
                      {existingCategories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>

                    {/* Status filter dropdown */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-8 px-2 bg-surface-1 border border-hairline rounded text-xs text-ink outline-none cursor-pointer hover:bg-surface-2 transition-colors font-medium"
                    >
                      <option value="all">{language === 'id' ? 'Semua Status' : 'All Status'}</option>
                      <option value="active">{language === 'id' ? 'Aktif' : 'Active'}</option>
                      <option value="completed">{language === 'id' ? 'Selesai' : 'Completed'}</option>
                      <option value="not-started">{language === 'id' ? 'Belum Mulai' : 'Not Started'}</option>
                    </select>
                  </div>
                </div>

                {/* Render Views dynamically based on selection */}
                {(() => {
                  // Filter targets based on search and filters
                  const filteredTargets = targets.filter(target => {
                    const matchesSearch = target.title.toLowerCase().includes(targetSearch.toLowerCase()) || 
                                          target.category.toLowerCase().includes(targetSearch.toLowerCase());
                    const matchesCategory = categoryFilter === 'all' || target.category.toLowerCase() === categoryFilter.toLowerCase();
                    
                    let matchesStatus = true;
                    if (statusFilter === 'completed') {
                      matchesStatus = target.currentValue >= target.targetValue;
                    } else if (statusFilter === 'active') {
                      matchesStatus = target.currentValue < target.targetValue;
                    } else if (statusFilter === 'not-started') {
                      matchesStatus = target.currentValue === 0;
                    }
                    
                    return matchesSearch && matchesCategory && matchesStatus;
                  });

                  if (filteredTargets.length === 0) {
                    return (
                      <div className="bg-surface-1 p-16 rounded-xl border border-hairline border-dashed text-center">
                        <p className="text-ink-tertiary italic text-sm">
                          {language === 'id' ? 'Tidak ada target harian ditemukan.' : 'No daily targets found.'}
                        </p>
                      </div>
                    );
                  }

                  // TABLE VIEW implementation
                  if (notionView === 'table') {
                    return (
                      <div className="bg-surface-1 border border-hairline rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-hairline bg-surface-2 text-[10px] font-black text-ink-tertiary tracking-widest uppercase select-none">
                                <th className="py-3 px-4 min-w-[200px]">{language === 'id' ? '🎯 TARGET SASARAN' : '🎯 GOAL NAME'}</th>
                                <th className="py-3 px-4 w-32">{language === 'id' ? '🏷️ KATEGORI' : '🏷️ CATEGORY'}</th>
                                <th className="py-3 px-4 min-w-[150px]">{language === 'id' ? '📊 KEMAJUAN' : '📊 PROGRESS BAR'}</th>
                                <th className="py-3 px-4 w-44 text-center">{language === 'id' ? '🔢 PENCAPAIAN' : '🔢 VALUE'}</th>
                                <th className="py-3 px-4 w-24 text-right">{language === 'id' ? 'AKSI' : 'ACTIONS'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-hairline">
                              {filteredTargets.map((target) => {
                                const progress = target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0;
                                const isDone = progress >= 100;
                                const catStyle = getNotionCategoryStyles(target.category);
                                return (
                                  <tr key={target.id} className="hover:bg-surface-2/40 transition-colors group">
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-2">
                                        <span className="text-base select-none">
                                          {target.category === 'health' ? '❤️' : target.category === 'work' ? '💼' : target.category === 'finance' ? '💵' : '👤'}
                                        </span>
                                        <span 
                                          onClick={() => setSelectedTargetForDetail(target)}
                                          className={`text-xs font-bold tracking-tight text-ink hover:text-accent hover:underline cursor-pointer transition-colors ${isDone ? 'line-through text-ink-tertiary opacity-70' : ''}`}
                                          title={language === 'id' ? 'Klik untuk membuka detail & checklist' : 'Click to view details & checklist'}
                                        >
                                          {target.title.toUpperCase()}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize tracking-wide ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${catStyle.bullet}`} />
                                        {target.category}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <div className="space-y-1.5 max-w-[200px]">
                                        <div className="flex items-center justify-between text-[10px]">
                                          <span className={`font-mono font-bold ${isDone ? 'text-accent' : 'text-ink-subtle'}`}>
                                            {Math.round(progress)}%
                                          </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden border border-hairline">
                                          <div 
                                            className={`h-full rounded-full transition-all duration-300 ${isDone ? 'bg-accent' : 'bg-accent/40'}`}
                                            style={{ width: `${progress}%` }}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => updateProgress(target.id, -1)}
                                          className="w-6 h-6 rounded bg-surface-2 border border-hairline text-xs font-bold text-ink-subtle flex items-center justify-center hover:bg-surface-3 active:scale-95 transition-all"
                                        >
                                          -
                                        </button>
                                        
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
                                            className="w-14 h-6 text-center bg-surface-1 border border-accent rounded font-mono text-xs font-bold text-ink outline-none"
                                            autoFocus
                                          />
                                        ) : (
                                          <span
                                            onClick={() => setIsEditingValue(target.id)}
                                            className="font-mono text-xs font-black text-ink hover:bg-surface-2 px-1.5 py-0.5 rounded cursor-pointer border border-dashed border-transparent hover:border-hairline-strong transition-all"
                                            title={language === 'id' ? 'Klik untuk mengedit secara langsung' : 'Click to edit directly'}
                                          >
                                            {target.currentValue}
                                          </span>
                                        )}

                                        <span className="text-[10px] text-ink-tertiary">/ {target.targetValue}</span>
                                        <span className="text-[10px] font-bold text-ink-tertiary truncate max-w-[50px] uppercase tracking-wider">{target.unit}</span>
                                        
                                        <button
                                          type="button"
                                          onClick={() => updateProgress(target.id, 1)}
                                          disabled={isDone}
                                          className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center transition-all ${isDone ? 'bg-surface-2 border border-hairline text-ink-tertiary cursor-not-allowed' : 'bg-accent text-white hover:bg-accent-hover active:scale-95'}`}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                      <div className="flex items-center justify-end gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          type="button"
                                          onClick={() => openEditModal(target)}
                                          className="p-1 text-ink-tertiary hover:text-accent rounded transition-colors"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setTargetToDelete(target.id)}
                                          className="p-1 text-ink-tertiary hover:text-danger rounded transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }

                  // BOARD VIEW implementation
                  if (notionView === 'board') {
                    const customCats = Array.from(new Set(filteredTargets.map(t => t.category.toLowerCase()))).filter(c => !['personal', 'health', 'work', 'finance'].includes(c));
                    const boardColumns = ['personal', 'health', 'work', 'finance', ...customCats];
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                        {boardColumns.map((colCat) => {
                          const colTargets = filteredTargets.filter(t => t.category === colCat);
                          const catStyle = getNotionCategoryStyles(colCat);
                          const colTitle = colCat === 'personal' ? t('personal') : colCat === 'health' ? t('health') : colCat === 'work' ? t('work') : colCat === 'finance' ? t('finance') : colCat;
                          
                          return (
                            <div key={colCat} className="bg-surface-2/45 rounded-xl border border-hairline p-3 space-y-3">
                              <div className="flex items-center justify-between border-b border-hairline pb-2.5 mb-1 select-none">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className={`w-2 h-2 rounded-full ${catStyle.bullet}`} />
                                  <span className="text-xs font-bold text-ink uppercase tracking-wider truncate">
                                    {colTitle}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black px-1.5 py-0.5 bg-surface-3 border border-hairline rounded text-ink-tertiary">
                                  {colTargets.length}
                                </span>
                              </div>

                              <div className="space-y-3 max-h-[480px] overflow-y-auto scrollbar-none">
                                {colTargets.length === 0 ? (
                                  <div className="text-center py-8 text-[10px] text-ink-tertiary italic border border-dashed border-hairline rounded bg-surface-1">
                                    {language === 'id' ? 'Kosong' : 'Empty'}
                                  </div>
                                ) : (
                                  colTargets.map((target) => {
                                    const progress = target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0;
                                    const isDone = progress >= 100;
                                    return (
                                      <div 
                                        key={target.id} 
                                        className={`bg-surface-1 p-3.5 rounded-lg border shadow-sm transition-all relative group ${isDone ? 'border-accent shadow-glow-accent/5' : 'border-hairline hover:border-hairline-strong'}`}
                                      >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                          <h4 
                                            onClick={() => setSelectedTargetForDetail(target)}
                                            className={`text-xs font-bold text-ink line-clamp-2 leading-tight hover:text-accent hover:underline cursor-pointer transition-colors ${isDone ? 'line-through text-ink-tertiary opacity-70' : ''}`}
                                            title={language === 'id' ? 'Klik untuk membuka detail & checklist' : 'Click to view details & checklist'}
                                          >
                                            {target.title.toUpperCase()}
                                          </h4>
                                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => openEditModal(target)}
                                              className="p-1 text-ink-tertiary hover:text-accent rounded transition-colors"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setTargetToDelete(target.id)}
                                              className="p-1 text-ink-tertiary hover:text-danger rounded transition-colors"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>

                                        <div className="space-y-2 mt-3">
                                          <div className="flex items-center justify-between text-[10px] font-mono text-ink-tertiary">
                                            <span>
                                              <strong>{target.currentValue}</strong> / {target.targetValue} {target.unit}
                                            </span>
                                            <span className={`font-bold ${isDone ? 'text-accent' : ''}`}>
                                              {Math.round(progress)}%
                                            </span>
                                          </div>
                                          
                                          <div className="h-1 bg-surface-2 rounded-full overflow-hidden border border-hairline">
                                            <div 
                                              className={`h-full rounded-full transition-all duration-300 ${isDone ? 'bg-accent' : 'bg-accent/40'}`}
                                              style={{ width: `${progress}%` }}
                                            />
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-hairline/50">
                                          <button
                                            type="button"
                                            onClick={() => updateProgress(target.id, -1)}
                                            className="flex-1 h-6 bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-subtle hover:text-ink text-xs font-bold rounded flex items-center justify-center transition-all active:scale-95"
                                          >
                                            -1
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => updateProgress(target.id, 1)}
                                            disabled={isDone}
                                            className={`flex-1 h-6 text-xs font-bold rounded flex items-center justify-center transition-all ${isDone ? 'bg-surface-2 text-ink-tertiary cursor-not-allowed border border-hairline' : 'bg-accent hover:bg-accent-hover text-white shadow-glow-accent'}`}
                                          >
                                            +1
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  // GALLERY VIEW implementation
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredTargets.map((target) => {
                        const progress = target.targetValue > 0 ? (target.currentValue / target.targetValue) * 100 : 0;
                        const isDone = progress >= 100;
                        const catStyle = getNotionCategoryStyles(target.category);
                        return (
                          <div 
                            key={target.id} 
                            className={`bg-surface-1 rounded-xl border shadow-sm transition-all relative overflow-hidden group flex flex-col justify-between ${isDone ? 'border-accent shadow-glow-accent/10' : 'border-hairline hover:border-hairline-strong'}`}
                          >
                            <div className={`h-1.5 w-full ${catStyle.bullet}`} />
                            
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border capitalize tracking-wide ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                                    {target.category}
                                  </span>
                                  
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => openEditModal(target)}
                                      className="p-1 text-ink-tertiary hover:text-accent rounded transition-colors"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setTargetToDelete(target.id)}
                                      className="p-1 text-ink-tertiary hover:text-danger rounded transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                
                                <h4 
                                  onClick={() => setSelectedTargetForDetail(target)}
                                  className={`text-sm font-black text-ink mt-3 leading-snug tracking-tight hover:text-accent hover:underline cursor-pointer transition-colors ${isDone ? 'line-through text-ink-tertiary opacity-70' : ''}`}
                                  title={language === 'id' ? 'Klik untuk membuka detail & checklist' : 'Click to view details & checklist'}
                                >
                                  {target.title.toUpperCase()}
                                </h4>
                              </div>

                              <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-mono text-ink-tertiary">
                                    <strong>{target.currentValue}</strong> / {target.targetValue} {target.unit}
                                  </span>
                                  <span className={`font-mono font-bold ${isDone ? 'text-accent' : 'text-ink-subtle'}`}>
                                    {Math.round(progress)}%
                                  </span>
                                </div>
                                
                                <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden border border-hairline">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-300 ${isDone ? 'bg-accent' : 'bg-accent/40'}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-hairline/50">
                                <button
                                  type="button"
                                  onClick={() => updateProgress(target.id, -1)}
                                  className="flex-1 h-8 bg-surface-2 hover:bg-surface-3 border border-hairline text-xs font-bold rounded text-ink-subtle flex items-center justify-center transition-all active:scale-95"
                                >
                                  -1
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateProgress(target.id, 1)}
                                  disabled={isDone}
                                  className={`flex-1 h-8 text-xs font-bold rounded flex items-center justify-center transition-all ${isDone ? 'bg-surface-2 text-ink-tertiary border border-hairline cursor-not-allowed' : 'bg-accent hover:bg-accent-hover text-white shadow-glow-accent'}`}
                                >
                                  +1
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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

        {/* SIDE DRAWER: Target Details, Checklist & Finance Link */}
        {selectedTargetForDetail && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTargetForDetail(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-full bg-surface-1 border-l border-hairline shadow-modal flex flex-col justify-between z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-hairline flex items-center justify-between bg-surface-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl select-none">
                    {selectedTargetForDetail.category === 'health' ? '❤️' : selectedTargetForDetail.category === 'work' ? '💼' : selectedTargetForDetail.category === 'finance' ? '💵' : '👤'}
                  </span>
                  <div>
                    <h3 className="text-body-sm font-black text-ink tracking-tight uppercase">
                      {language === 'id' ? 'Detail Target' : 'Target Detail'}
                    </h3>
                    <p className="text-[10px] text-ink-tertiary font-bold tracking-widest uppercase">
                      Category: {selectedTargetForDetail.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTargetForDetail(null)}
                  className="p-1.5 hover:bg-surface-3 rounded-pill text-ink-tertiary hover:text-ink transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content (Scrollable) */}
              <div className="flex-1 p-6 overflow-y-auto space-y-8 scrollbar-thin">
                {/* Title and Progress Card */}
                <div className="bg-surface-2/60 p-5 rounded-xl border border-hairline space-y-4">
                  <h4 className="text-heading-xs font-black text-ink uppercase tracking-tight leading-snug">
                    {selectedTargetForDetail.title}
                  </h4>
                  
                  {/* Progress Display */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-ink-tertiary font-mono">
                      <span>
                        Progress: <strong>{selectedTargetForDetail.currentValue}</strong> / {selectedTargetForDetail.targetValue} {selectedTargetForDetail.unit}
                      </span>
                      <span className="text-accent font-black">
                        {Math.round((selectedTargetForDetail.currentValue / selectedTargetForDetail.targetValue) * 100)}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-surface-2 rounded-full overflow-hidden border border-hairline">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-300"
                        style={{ width: `${Math.min(100, (selectedTargetForDetail.currentValue / selectedTargetForDetail.targetValue) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Notion Checklist Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <h4 className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-accent" />
                      {language === 'id' ? 'Sub-tugas / Checklist' : 'Sub-tasks / Checklist'}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-ink-tertiary bg-surface-2 px-2 py-0.5 border border-hairline rounded">
                      {(selectedTargetForDetail.subTasks || []).filter(st => st.completed).length} / {(selectedTargetForDetail.subTasks || []).length}
                    </span>
                  </div>

                  {/* Subtask list */}
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-none pr-1">
                    {(selectedTargetForDetail.subTasks || []).length === 0 ? (
                      <p className="text-xs text-ink-subtle italic text-center py-4">
                        {language === 'id' ? 'Belum ada sub-tugas. Tambahkan di bawah!' : 'No sub-tasks yet. Add one below!'}
                      </p>
                    ) : (
                      (selectedTargetForDetail.subTasks || []).map((st) => (
                        <div key={st.id} className="flex items-center justify-between gap-3 group/item bg-surface-1 p-2 rounded border border-hairline hover:border-hairline-strong transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleSubTask(selectedTargetForDetail, st.id)}
                              className="text-ink-tertiary hover:text-accent transition-colors"
                            >
                              {st.completed ? (
                                <CheckSquare className="w-4.5 h-4.5 text-accent" />
                              ) : (
                                <Square className="w-4.5 h-4.5" />
                              )}
                            </button>
                            <span className={`text-xs font-medium text-ink truncate ${st.completed ? 'line-through text-ink-tertiary opacity-70' : ''}`}>
                              {st.title}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubTask(selectedTargetForDetail, st.id)}
                            className="p-1 text-ink-tertiary hover:text-danger rounded md:opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add subtask input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubTaskTitle}
                      onChange={(e) => setNewSubTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddSubTask(selectedTargetForDetail, newSubTaskTitle);
                        }
                      }}
                      placeholder={language === 'id' ? 'Tambah sub-tugas baru... (Enter)' : 'Add new sub-task... (Enter)'}
                      className="flex-1 h-9 px-3 bg-surface-1 border border-hairline rounded text-xs focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink transition-all placeholder:text-ink-subtle"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubTask(selectedTargetForDetail, newSubTaskTitle)}
                      className="h-9 px-4 bg-accent text-white rounded text-xs font-bold hover:bg-accent-hover transition-colors"
                    >
                      {language === 'id' ? 'Tambah' : 'Add'}
                    </button>
                  </div>
                </div>

                {/* Database Relations: Linked Finance Section */}
                <div className="border-t border-hairline pt-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <h4 className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-2">
                      <Coins className="w-4 h-4 text-accent" />
                      {language === 'id' ? 'Relasi Finansial (LifeFlow Sync)' : 'Financial Relation (LifeFlow Sync)'}
                    </h4>
                    <span className="text-[9px] bg-accent/15 text-accent px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Auto-sync</span>
                  </div>

                  <p className="text-xs text-ink-tertiary leading-relaxed">
                    {language === 'id' 
                      ? 'Catat transaksi pengeluaran atau pemasukan sungguhan untuk memperbarui target produktivitas Anda secara otomatis.' 
                      : 'Log actual expenses or income transactions to automatically update your productivity target.'}
                  </p>

                  <form onSubmit={(e) => handleSaveRelatedFinanceLog(e, selectedTargetForDetail)} className="space-y-3 bg-surface-2/40 p-4 rounded-xl border border-hairline">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-ink-tertiary font-bold uppercase tracking-wider mb-1">
                          {language === 'id' ? 'Tipe Transaksi' : 'Tx Type'}
                        </label>
                        <select
                          value={financeLogType}
                          onChange={(e) => {
                            setFinanceLogType(e.target.value as 'expense' | 'income');
                            setFinanceLogCat(''); 
                          }}
                          className="w-full h-9 px-2 bg-surface-1 border border-hairline rounded text-xs text-ink outline-none cursor-pointer"
                        >
                          <option value="expense">{language === 'id' ? 'Pengeluaran' : 'Expense'}</option>
                          <option value="income">{language === 'id' ? 'Pemasukan' : 'Income'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-ink-tertiary font-bold uppercase tracking-wider mb-1">
                          {language === 'id' ? 'Kategori Finansial' : 'Finance Category'}
                        </label>
                        <select
                          value={financeLogCat}
                          onChange={(e) => setFinanceLogCat(e.target.value)}
                          className="w-full h-9 px-2 bg-surface-1 border border-hairline rounded text-xs text-ink outline-none cursor-pointer"
                        >
                          <option value="">{language === 'id' ? '-- Pilih Kategori --' : '-- Choose Category --'}</option>
                          {categories
                            .filter(c => c.type === financeLogType)
                            .map(c => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-ink-tertiary font-bold uppercase tracking-wider mb-1">
                          {language === 'id' ? 'Jumlah' : 'Amount'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-ink-tertiary font-mono">
                            {financeLogType === 'expense' ? '-' : '+'}
                          </span>
                          <input
                            type="number"
                            required
                            min="1"
                            value={financeLogAmount}
                            onChange={(e) => setFinanceLogAmount(e.target.value)}
                            placeholder="e.g. 50000"
                            className="w-full h-9 pl-6 pr-3 bg-surface-1 border border-hairline rounded text-xs focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink font-mono transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-ink-tertiary font-bold uppercase tracking-wider mb-1">
                          {language === 'id' ? 'Deskripsi Transaksi' : 'Description'}
                        </label>
                        <input
                          type="text"
                          value={financeLogDesc}
                          onChange={(e) => setFinanceLogDesc(e.target.value)}
                          placeholder={selectedTargetForDetail.title}
                          className="w-full h-9 px-3 bg-surface-1 border border-hairline rounded text-xs focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink transition-all placeholder:text-ink-subtle"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-9 bg-accent text-white rounded font-bold hover:bg-accent-hover transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-glow-accent"
                    >
                      <Plus className="w-4 h-4" />
                      {language === 'id' ? 'Simpan Transaksi & Selesaikan Target' : 'Log Tx & Add Progress'}
                    </button>

                    {financeLogSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-black text-success text-center uppercase tracking-wider"
                      >
                        ✅ {language === 'id' ? 'Transaksi Disimpan & Target Diperbarui!' : 'Transaction logged & Target updated!'}
                      </motion.div>
                    )}
                  </form>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-hairline bg-surface-2 flex items-center gap-3">
                <div className="text-[10px] font-mono text-ink-tertiary leading-relaxed uppercase">
                  ID: <span className="font-bold">{selectedTargetForDetail.id.slice(0, 8)}...</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
    </div>
  );
}
