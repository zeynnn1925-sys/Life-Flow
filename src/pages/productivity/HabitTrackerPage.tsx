import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trophy, 
  Flame, 
  Settings, 
  Calendar,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  TrendingUp,
  Brain,
  History,
  Sparkles as SparklesIcon,
  Target as TargetIcon,
  CheckSquare,
  Square,
  Smile,
  MessageSquare,
  Coins,
  Trash2,
  Minus,
  Check,
  X,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useHabits } from '../../hooks/useHabits';
import { HabitCard } from '../../components/habits/HabitCard';
import { AIHabitCoach } from '../../components/habits/AIHabitCoach';
import { WeeklyHabitGrid } from '../../components/habits/WeeklyHabitGrid';
import { HabitStreakMilestone } from '../../components/habits/HabitStreakMilestone';
import { HabitHeatmap } from '../../components/habits/HabitHeatmap';
import { useData } from '../../contexts/DataContext';
import { Target } from '../../types';
import { AddHabitModal } from '../../components/habits/AddHabitModal';
import { Habit } from '../../types/habits';
import { Sparkles } from '../../components/ui/sparkles';
import { ExportProductivityReportButton } from '../../components/ExportReportButtons';

export default function HabitTrackerPage() {
  const { t, language } = useLanguage();
  const { activeHabits, getHabitLogToday, getHabitStatus, saveHabit, deleteHabit, logHabit, skipHabit } = useHabits();
  const { habitLogs, saveTransaction, categories, targets } = useData();
  const [viewMode, setViewMode] = useState<'grid' | 'weekly'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);

  // Side Drawer detail, subtasks & checklist states
  const [selectedHabitForDetail, setSelectedHabitForDetail] = useState<Habit | null>(null);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  
  // Daily check-in custom feedback log state
  const [logNoteText, setLogNoteText] = useState('');
  const [selectedMood, setSelectedMood] = useState<number | undefined>(undefined);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Finance relation states
  const [financeLogAmount, setFinanceLogAmount] = useState('');
  const [financeLogDesc, setFinanceLogDesc] = useState('');
  const [financeLogCat, setFinanceLogCat] = useState('');
  const [financeLogType, setFinanceLogType] = useState<'expense' | 'income'>('expense');
  const [financeLogSuccess, setFinanceLogSuccess] = useState(false);

  // Get active version of selected habit for real-time drawer rendering
  const currentHabitDetail = selectedHabitForDetail 
    ? activeHabits.find(h => h.id === selectedHabitForDetail.id) || selectedHabitForDetail 
    : null;

  // Sync log's note & mood when drawer is loaded or today's log updates
  useEffect(() => {
    if (selectedHabitForDetail) {
      const todayLog = getHabitLogToday(selectedHabitForDetail.id);
      setLogNoteText(todayLog?.note || '');
      setSelectedMood(todayLog?.mood || undefined);
    }
  }, [selectedHabitForDetail, habitLogs]);

  const handleAddSubTask = (habit: Habit, titleText: string) => {
    if (!titleText.trim()) return;
    const newST = {
      id: crypto.randomUUID(),
      title: titleText.trim(),
      completed: false
    };
    const updated: Habit = {
      ...habit,
      subTasks: [...(habit.subTasks || []), newST]
    };
    saveHabit(updated);
    setNewSubTaskTitle('');
  };

  const handleToggleSubTask = (habit: Habit, subTaskId: string) => {
    const updatedSubTasks = (habit.subTasks || []).map(st => 
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );
    const updated: Habit = {
      ...habit,
      subTasks: updatedSubTasks
    };
    saveHabit(updated);
  };

  const handleDeleteSubTask = (habit: Habit, subTaskId: string) => {
    const updatedSubTasks = (habit.subTasks || []).filter(st => st.id !== subTaskId);
    const updated: Habit = {
      ...habit,
      subTasks: updatedSubTasks
    };
    saveHabit(updated);
  };

  const handleIncrementCount = async (habit: Habit, incrementVal: number = 1) => {
    try {
      await logHabit(habit.id, incrementVal, logNoteText, selectedMood);
    } catch (error) {
      console.error('Failed to log habit count:', error);
    }
  };

  const handleSaveFeedbackAndMood = async (habit: Habit) => {
    try {
      await logHabit(habit.id, 0, logNoteText, selectedMood);
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 2500);
    } catch (error) {
      console.error('Failed to save habit notes & mood:', error);
    }
  };

  const handleSaveRelatedFinanceLog = (e: React.FormEvent, habit: Habit) => {
    e.preventDefault();
    if (!financeLogAmount || isNaN(parseFloat(financeLogAmount))) return;

    const amount = parseFloat(financeLogAmount);
    const desc = financeLogDesc.trim() || habit.title;
    const txId = crypto.randomUUID();
    
    // Default fallback financial category
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

    // Save actual transaction to Firestore
    saveTransaction(newTx);

    // Auto-update habit count progress by 1!
    logHabit(habit.id, 1, logNoteText, selectedMood);

    // Clear form and display success alert
    setFinanceLogAmount('');
    setFinanceLogDesc('');
    setFinanceLogCat('');
    setFinanceLogSuccess(true);
    setTimeout(() => setFinanceLogSuccess(false), 3000);
  };

  const handleAddHabit = () => {
    setEditingHabit(undefined);
    setIsAddModalOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsAddModalOpen(true);
  };

  const filteredHabits = activeHabits.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalActive: activeHabits.length,
    // @ts-ignore
    completedToday: activeHabits.filter(h => getHabitStatus(h.id) === 'completed').length,
    totalStreak: activeHabits.reduce((acc, h) => acc + h.currentStreak, 0)
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Header & Stats Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-accent" />
            <span className="text-eyebrow text-accent font-black uppercase tracking-[0.2em]">Productivity</span>
          </div>
          
          <div className="h-[12rem] w-full bg-canvas flex flex-col items-center justify-center overflow-hidden rounded-md relative z-0">
            <div className="w-full absolute inset-0 z-0">
              <Sparkles
                id="habit-sparkles"
                background="transparent"
                minSize={0.6}
                maxSize={1.4}
                particleDensity={100}
                className="w-full h-full"
                particleColor="#494FDF"
              />
            </div>
            <h1 className="text-display-lg md:text-display-xl font-black text-ink tracking-tight uppercase leading-none relative z-20">
              Habit Tracker
            </h1>
          </div>
          
          <p className="text-body-sm text-ink-tertiary font-medium lowercase">
            Kembangkan kebiasaan baik setiap hari.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-surface-1 px-6 py-4 rounded-lg border border-hairline flex items-center gap-4 shadow-card hover:border-hairline-strong transition-all group">
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl text-warning shadow-sm group-hover:scale-110 transition-transform">
              <Flame size={24} className="fill-warning" />
            </div>
            <div>
              <div className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest leading-none mb-1.5">Total Streak</div>
              <div className="text-heading-sm font-black text-ink leading-none font-mono tracking-tighter">{stats.totalStreak}d</div>
            </div>
          </div>

          <div className="bg-surface-1 px-6 py-4 rounded-lg border border-hairline flex items-center gap-4 shadow-card hover:border-hairline-strong transition-all group">
            <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-success shadow-sm group-hover:scale-110 transition-transform">
              <Trophy size={24} />
            </div>
            <div>
              <div className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest leading-none mb-1.5">Hari Ini</div>
              <div className="text-heading-sm font-black text-ink leading-none font-mono tracking-tighter">{stats.completedToday} <span className="opacity-20">/</span> {stats.totalActive}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between bg-surface-1 p-3 rounded-lg border border-hairline shadow-sm">
            <div className="relative w-full sm:w-80 group/input">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary group-hover/input:text-accent transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Cari kebiasaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-11 bg-surface-2 border border-hairline rounded-md text-sm font-black text-ink outline-none focus:border-accent transition-all placeholder:font-medium placeholder:text-ink-tertiary/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex p-1 bg-surface-2 rounded-md border border-hairline shadow-inner">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-surface-1 text-accent shadow-card border border-hairline' : 'text-ink-tertiary hover:text-ink'}`}
                >
                  <LayoutGrid size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('weekly')}
                  className={`p-2.5 rounded-md transition-all ${viewMode === 'weekly' ? 'bg-surface-1 text-accent shadow-card border border-hairline' : 'text-ink-tertiary hover:text-ink'}`}
                >
                  <History size={20} />
                </button>
              </div>
              <div className="w-px h-8 bg-hairline mx-2" />
              <ExportProductivityReportButton
                habits={activeHabits.map(h => ({
                  title: h.title,
                  category: h.category,
                  currentStreak: h.currentStreak,
                  totalCompletions: h.totalCompletions
                }))}
                targets={targets.map(t => ({
                  title: t.title,
                  category: t.category,
                  currentValue: t.currentValue,
                  targetValue: t.targetValue,
                  unit: t.unit
                }))}
                periodLabel={new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}
              />
              <div className="w-px h-8 bg-hairline mx-2" />
              <button 
                onClick={handleAddHabit}
                className="h-11 flex items-center gap-3 px-6 bg-accent text-white rounded-pill hover:bg-accent-hover active:scale-[0.98] transition-all shadow-glow-accent font-black text-button uppercase tracking-widest"
              >
                <Plus size={20} strokeWidth={3} />
                {t('add')}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {filteredHabits.map((habit) => (
                  <HabitCard 
                    key={habit.id} 
                    habit={habit} 
                    logToday={getHabitLogToday(habit.id)}
                    status={getHabitStatus(habit.id)}
                    onEdit={() => handleEditHabit(habit)}
                    onViewDetail={() => setSelectedHabitForDetail(habit)}
                  />
                ))}
                
                {filteredHabits.length === 0 && (
                  <div className="md:col-span-2 py-32 text-center bg-surface-2 rounded-lg border border-hairline border-dashed">
                    <div className="p-6 bg-surface-3 rounded-pill w-fit mx-auto mb-6 shadow-inner">
                      <TargetIcon className="text-ink-tertiary/20" size={56} />
                    </div>
                    <h3 className="text-heading-sm font-bold text-ink">Belum ada kebiasaan</h3>
                    <p className="text-body-sm text-ink-subtle mt-2 font-medium">Mulai perjalananmu hari ini dengan kebiasaan baru!</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="weekly"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-surface-1 p-10 rounded-lg border border-hairline shadow-card overflow-hidden"
              >
                <WeeklyHabitGrid habits={activeHabits} logs={habitLogs} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Controls Area */}
        <div className="space-y-10">
          <AIHabitCoach habits={activeHabits} />
          
          <HabitStreakMilestone streak={stats.totalStreak} />
          
          <div className="bg-surface-1 p-8 rounded-lg border border-hairline shadow-card hover:border-hairline-strong transition-all group">
            <h4 className="text-eyebrow font-black text-ink uppercase tracking-widest mb-6 flex items-center gap-3">
              <Calendar size={18} className="text-accent transition-transform group-hover:scale-110" />
              Activity Heatmap
            </h4>
            <div className="bg-surface-2 p-4 rounded-md border border-hairline">
              <HabitHeatmap logs={habitLogs} color="var(--color-accent)" />
            </div>
          </div>

          <div className="bg-ink p-10 rounded-lg text-surface-1 shadow-glow-primary relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
              <Brain size={160} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-accent" />
                <h4 className="text-eyebrow font-black uppercase tracking-[0.2em]">{t('proTip')}</h4>
              </div>
              <p className="text-body-sm text-white/70 leading-loose font-medium italic">
                Studi menunjukkan bahwa butuh waktu rata-rata 66 hari untuk membentuk satu kebiasaan baru. Jangan menyerah jika kamu terlewat satu hari!
              </p>
            </div>
          </div>
        </div>
      </div>

      <AddHabitModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={saveHabit}
        onDelete={deleteHabit}
        initialHabit={editingHabit}
      />

      {/* SIDE DRAWER: Habit Details, Checklist, Mood Tracker & Financial Sync */}
      <AnimatePresence>
        {currentHabitDetail && (
          <div className="fixed inset-0 z-[80] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHabitForDetail(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-full bg-surface-1 border-l border-hairline shadow-modal flex flex-col justify-between z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-hairline flex items-center justify-between bg-surface-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center border border-hairline shadow-sm"
                    style={{ backgroundColor: `${currentHabitDetail.color}15`, color: currentHabitDetail.color }}
                  >
                    {(() => {
                      const IconNode = (LucideIcons as any)[currentHabitDetail.icon] || LucideIcons.Circle;
                      return <IconNode size={24} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-body-sm font-black text-ink tracking-tight uppercase">
                      {language === 'id' ? 'Detail Kebiasaan' : 'Habit Detail'}
                    </h3>
                    <p className="text-[10px] text-ink-tertiary font-bold tracking-widest uppercase">
                      Kategori: {currentHabitDetail.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHabitForDetail(null)}
                  className="p-1.5 hover:bg-surface-3 rounded-pill text-ink-tertiary hover:text-ink transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content (Scrollable) */}
              <div className="flex-1 p-6 overflow-y-auto space-y-8 scrollbar-thin">
                {/* Title and Streak Statistics Card */}
                <div className="bg-surface-2/60 p-5 rounded-xl border border-hairline space-y-4">
                  <div>
                    <h4 className="text-heading-xs font-black text-ink uppercase tracking-tight leading-snug">
                      {currentHabitDetail.title}
                    </h4>
                    {currentHabitDetail.description && (
                      <p className="text-xs text-ink-tertiary mt-1">
                        {currentHabitDetail.description}
                      </p>
                    )}
                  </div>

                  {/* Streaks stats */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-surface-1 p-3 rounded-lg border border-hairline flex items-center gap-2.5">
                      <Flame className="w-5 h-5 text-warning fill-warning" />
                      <div>
                        <p className="text-[9px] text-ink-tertiary font-bold uppercase tracking-wider">Streak</p>
                        <p className="text-xs font-black text-ink font-mono">{currentHabitDetail.currentStreak || 0} Hari</p>
                      </div>
                    </div>
                    <div className="bg-surface-1 p-3 rounded-lg border border-hairline flex items-center gap-2.5">
                      <Trophy className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-[9px] text-ink-tertiary font-bold uppercase tracking-wider">Terbaik</p>
                        <p className="text-xs font-black text-ink font-mono">{currentHabitDetail.longestStreak || 0} Hari</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Controller (Interactive Count Adjustments) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-ink-tertiary font-mono">
                      <span>
                        Progres Hari Ini:{' '}
                        <strong className="text-ink">
                          {getHabitLogToday(currentHabitDetail.id)?.completedCount || 0}
                        </strong>{' '}
                        / {currentHabitDetail.targetCount} {currentHabitDetail.unit || 'kali'}
                      </span>
                      <span className="font-black" style={{ color: currentHabitDetail.color }}>
                        {Math.round(
                          Math.min(
                            100,
                            (((getHabitLogToday(currentHabitDetail.id)?.completedCount || 0) /
                              currentHabitDetail.targetCount) *
                              100)
                          )
                        )}
                        %
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-surface-2 rounded-full overflow-hidden border border-hairline">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: currentHabitDetail.color,
                          width: `${Math.min(
                            100,
                            (((getHabitLogToday(currentHabitDetail.id)?.completedCount || 0) /
                              currentHabitDetail.targetCount) *
                              100)
                          )}%` 
                        }}
                      />
                    </div>

                    {/* Progress Adjuster Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleIncrementCount(currentHabitDetail, -1)}
                        disabled={(getHabitLogToday(currentHabitDetail.id)?.completedCount || 0) <= 0}
                        className="flex-1 h-9 bg-surface-2 hover:bg-surface-3 disabled:opacity-40 border border-hairline rounded text-xs font-bold text-ink transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Minus className="w-4 h-4" />
                        {language === 'id' ? 'Kurangi' : 'Reduce'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleIncrementCount(currentHabitDetail, 1)}
                        className="flex-1 h-9 text-white hover:opacity-90 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        style={{ backgroundColor: currentHabitDetail.color }}
                      >
                        <Plus className="w-4 h-4" />
                        {language === 'id' ? 'Tambah Progres' : 'Add Progress'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Checklist (Notion-style micro-steps) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <h4 className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-accent" />
                      {language === 'id' ? 'Micro-Steps / Checklist' : 'Micro-Steps / Checklist'}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-ink-tertiary bg-surface-2 px-2 py-0.5 border border-hairline rounded">
                      {(currentHabitDetail.subTasks || []).filter(st => st.completed).length} / {(currentHabitDetail.subTasks || []).length}
                    </span>
                  </div>

                  {/* Checklist Subtask list */}
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-none pr-1">
                    {(currentHabitDetail.subTasks || []).length === 0 ? (
                      <p className="text-xs text-ink-subtle italic text-center py-4">
                        {language === 'id' ? 'Belum ada langkah kecil. Tambahkan di bawah!' : 'No micro-steps yet. Add one below!'}
                      </p>
                    ) : (
                      (currentHabitDetail.subTasks || []).map((st) => (
                        <div key={st.id} className="flex items-center justify-between gap-3 group/item bg-surface-1 p-2 rounded border border-hairline hover:border-hairline-strong transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleSubTask(currentHabitDetail, st.id)}
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
                            onClick={() => handleDeleteSubTask(currentHabitDetail, st.id)}
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
                          handleAddSubTask(currentHabitDetail, newSubTaskTitle);
                        }
                      }}
                      placeholder={language === 'id' ? 'Tambah langkah kecil... (Enter)' : 'Add micro-step... (Enter)'}
                      className="flex-1 h-9 px-3 bg-surface-1 border border-hairline rounded text-xs focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink transition-all placeholder:text-ink-subtle"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubTask(currentHabitDetail, newSubTaskTitle)}
                      className="h-9 px-4 bg-accent text-white rounded text-xs font-bold hover:bg-accent-hover transition-colors"
                    >
                      {language === 'id' ? 'Tambah' : 'Add'}
                    </button>
                  </div>
                </div>

                {/* Mood and Notes Reflection Area */}
                <div className="border-t border-hairline pt-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-hairline pb-2">
                    <MessageSquare className="w-4 h-4 text-accent" />
                    <h4 className="text-xs font-black text-ink uppercase tracking-wider">
                      {language === 'id' ? 'Refleksi & Mood Hari Ini' : 'Reflection & Mood Today'}
                    </h4>
                  </div>

                  {/* Mood Selector (1 to 5) */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-ink-tertiary font-bold uppercase tracking-wider">
                      {language === 'id' ? 'Bagaimana perasaan Anda menjalankan kebiasaan ini?' : 'How did you feel doing this habit?'}
                    </label>
                    <div className="flex justify-between max-w-xs mx-auto gap-2 p-1.5 bg-surface-2 rounded-lg border border-hairline shadow-inner">
                      {[
                        { val: 1, label: '😞' },
                        { val: 2, label: '😐' },
                        { val: 3, label: '🙂' },
                        { val: 4, label: '😃' },
                        { val: 5, label: '🤩' },
                      ].map((m) => (
                        <button
                          key={m.val}
                          type="button"
                          onClick={() => setSelectedMood(m.val)}
                          className={`w-10 h-10 rounded-md text-xl flex items-center justify-center transition-all ${
                            selectedMood === m.val
                              ? 'bg-surface-1 border border-hairline scale-115 shadow-glow-accent ring-1 ring-accent/30'
                              : 'opacity-50 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-ink-tertiary font-bold uppercase tracking-wider">
                      {language === 'id' ? 'Catatan Refleksi' : 'Reflection Note'}
                    </label>
                    <textarea
                      rows={2}
                      value={logNoteText}
                      onChange={(e) => setLogNoteText(e.target.value)}
                      placeholder={language === 'id' ? 'Tulis kendala, pelajaran, atau rasa syukur...' : 'Write challenges, takeaways, or gratitude...'}
                      className="w-full p-3 bg-surface-1 border border-hairline rounded text-xs focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink transition-all placeholder:text-ink-subtle resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveFeedbackAndMood(currentHabitDetail)}
                    className="w-full h-9 bg-accent/10 border border-accent/20 text-accent font-black text-[10px] uppercase tracking-widest rounded hover:bg-accent hover:text-white transition-all"
                  >
                    {language === 'id' ? 'Simpan Refleksi & Mood' : 'Save Reflection & Mood'}
                  </button>

                  {feedbackSuccess && (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-black text-success text-center uppercase tracking-wider"
                    >
                      ✅ {language === 'id' ? 'Refleksi Disimpan!' : 'Reflection saved successfully!'}
                    </motion.p>
                  )}
                </div>

                {/* Database Relation (LifeFlow Financial Sync) */}
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
                      ? 'Hubungkan kebiasaan ini dengan log pengeluaran/pemasukan sungguhan untuk memperbarui target produktivitas Anda secara otomatis.' 
                      : 'Sync this habit with an actual expense or income transaction to auto-advance progress.'}
                  </p>

                  <form onSubmit={(e) => handleSaveRelatedFinanceLog(e, currentHabitDetail)} className="space-y-3 bg-surface-2/40 p-4 rounded-xl border border-hairline">
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
                          placeholder={currentHabitDetail.title}
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
                        ✅ {language === 'id' ? 'Transaksi Disimpan & Target Kebiasaan Diperbarui!' : 'Transaction logged & Habit updated!'}
                      </motion.div>
                    )}
                  </form>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-hairline bg-surface-2 flex items-center gap-3">
                <div className="text-[10px] font-mono text-ink-tertiary leading-relaxed uppercase">
                  ID: <span className="font-bold">{currentHabitDetail.id.slice(0, 8)}...</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
