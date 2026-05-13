import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Habit, HabitLog } from '../../types/habits';
import { HabitStreakRing } from './HabitStreakRing';
import { HabitCheckInButton } from './HabitCheckInButton';
import { useHabitCheckIn } from '../../hooks/useHabitCheckIn';
import { Flame, Info, Settings } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  logToday?: HabitLog;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  onEdit?: () => void;
}

export function HabitCard({ habit, logToday, status, onEdit }: HabitCardProps) {
  const { handleCheckIn, handleSkip } = useHabitCheckIn();
  const IconComponent = (LucideIcons as any)[habit.icon] || LucideIcons.Circle;

  const progress = logToday ? Math.min(logToday.completedCount / habit.targetCount, 1) : 0;

  return (
    <motion.div
      layout
      onClick={onEdit}
      className={`relative p-5 rounded-3xl transition-all cursor-pointer ${
        status === 'completed' 
          ? 'bg-zinc-50 dark:bg-zinc-900/50 border-2 border-green-500/20' 
          : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800'
      } shadow-sm hover:shadow-md group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <HabitStreakRing progress={progress} color={habit.color} size={56} strokeWidth={3}>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
            >
              <IconComponent size={20} />
            </div>
          </HabitStreakRing>
          
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white leading-tight">
              {habit.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                {habit.category}
              </span>
              {habit.currentStreak > 0 && (
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md">
                  <Flame size={12} className="text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {habit.currentStreak}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <HabitCheckInButton 
            status={status} 
            onCheckIn={() => handleCheckIn(habit.id, habit.title)} 
            onSkip={() => handleSkip(habit.id)}
            color={habit.color}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ backgroundColor: habit.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-zinc-400">
              {logToday?.completedCount || 0}/{habit.targetCount} {habit.unit}
            </span>
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          className="text-zinc-300 hover:text-zinc-500 transition-colors" 
          id="habit-info-btn"
        >
          <Settings size={16} />
        </button>
      </div>
      
      {status === 'completed' && (
        <div className="absolute top-2 right-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center bg-green-500 text-white p-1 rounded-full shadow-lg"
          >
            <LucideIcons.Check size={12} strokeWidth={4} />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
