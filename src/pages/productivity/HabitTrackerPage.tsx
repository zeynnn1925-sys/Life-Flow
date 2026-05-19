import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Target as TargetIcon
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

export default function HabitTrackerPage() {
  const { t } = useLanguage();
  // ... (existing logic)
  const { activeHabits, getHabitLogToday, getHabitStatus, saveHabit } = useHabits();
  const { habitLogs } = useData();
  const [viewMode, setViewMode] = useState<'grid' | 'weekly'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);

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
                  />
                ))}
                
                {filteredHabits.length === 0 && (
                  <div className="md:col-span-2 py-32 text-center bg-surface-2 rounded-lg border border-hairline border-dashed">
                    <div className="p-6 bg-surface-3 rounded-pill w-fit mx-auto mb-6 shadow-inner">
                      <TargetIcon className="text-ink-tertiary/20" size={56} />
                    </div>
                    <h3 className="text-heading-sm font-black text-ink uppercase tracking-tight">Belum ada kebiasaan</h3>
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
        initialHabit={editingHabit}
      />
    </div>
  );
}
