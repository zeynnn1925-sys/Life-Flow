import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Target as TargetIcon
} from 'lucide-react';
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

export default function HabitTrackerPage() {
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
    completedToday: activeHabits.filter(h => getHabitStatus(h.id) === 'completed').length,
    totalStreak: activeHabits.reduce((acc, h) => acc + h.currentStreak, 0)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-24 lg:pb-8">
      {/* Header & Stats Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Habit Tracker
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            Kembangkan kebiasaan baik setiap hari.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white dark:bg-zinc-900 px-4 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-500">
              <Flame size={20} className="fill-amber-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Total Streak</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-white leading-none">{stats.totalStreak}d</div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 px-4 py-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-500">
              <Trophy size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Hari Ini</div>
              <div className="text-lg font-bold text-zinc-900 dark:text-white leading-none">{stats.completedToday}/{stats.totalActive}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text"
                placeholder="Cari kebiasaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('weekly')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'weekly' ? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <History size={20} />
              </button>
              <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-2" />
              <button 
                onClick={handleAddHabit}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 font-bold text-sm"
              >
                <Plus size={18} />
                Baru
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid md:grid-cols-2 gap-4"
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
                  <div className="md:col-span-2 py-20 text-center">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-full w-fit mx-auto mb-4">
                      <TargetIcon className="text-zinc-300" size={40} />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">Belum ada kebiasaan</h3>
                    <p className="text-zinc-500 text-sm mt-1">Mulai perjalananmu hari ini dengan kebiasaan baru!</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="weekly"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden"
              >
                <WeeklyHabitGrid habits={activeHabits} logs={habitLogs} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Controls Area */}
        <div className="space-y-8">
          <AIHabitCoach habits={activeHabits} />
          <HabitStreakMilestone streak={stats.totalStreak} />
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h4 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              Activity Heatmap
            </h4>
            <HabitHeatmap logs={habitLogs} color="#6366f1" />
          </div>

          <div className="bg-zinc-900 dark:bg-zinc-100 p-6 rounded-3xl text-zinc-100 dark:text-zinc-900 shadow-xl border border-zinc-800 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Brain size={120} />
            </div>
            <h4 className="font-bold mb-2">Pro Tip</h4>
            <p className="text-sm opacity-80 leading-relaxed font-medium">
              Studi menunjukkan bahwa butuh waktu rata-rata 66 hari untuk membentuk satu kebiasaan baru. Jangan menyerah jika kamu terlewat satu hari!
            </p>
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
