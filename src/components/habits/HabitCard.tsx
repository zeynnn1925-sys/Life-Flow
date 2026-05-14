import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { Habit, HabitLog } from '../../types/habits';
import { HabitStreakRing } from './HabitStreakRing';
import { HabitCheckInButton } from './HabitCheckInButton';
import { useHabitCheckIn } from '../../hooks/useHabitCheckIn';
import { Flame, Info, Settings } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface HabitCardProps {
  habit: Habit;
  logToday?: HabitLog;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  onEdit?: () => void;
}

export function HabitCard({ habit, logToday, status, onEdit }: HabitCardProps) {
  const { t } = useLanguage();
  const { handleCheckIn, handleSkip } = useHabitCheckIn();
  const IconComponent = (LucideIcons as any)[habit.icon] || LucideIcons.Circle;

  const progress = logToday ? Math.min(logToday.completedCount / habit.targetCount, 1) : 0;

  return (
    <motion.div
      layout
      onClick={onEdit}
      className={`relative p-8 rounded-lg transition-all cursor-pointer ${
        status === 'completed' 
          ? 'bg-surface-3 border-2 border-hairline-strong' 
          : 'bg-surface-1 border border-hairline'
      } shadow-card hover:shadow-glow-accent hover:border-accent/40 group`}
    >
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-6">
          <HabitStreakRing progress={progress} color={habit.color} size={64} strokeWidth={4}>
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
              style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
            >
              <IconComponent size={24} />
            </div>
          </HabitStreakRing>
          
          <div>
            <h3 className="text-heading-sm font-black text-ink leading-none tracking-tight uppercase">
              {habit.title}
            </h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest">
                {habit.category}
              </span>
              {habit.currentStreak > 0 && (
                <div className="flex items-center gap-1.5 bg-warning/10 border border-warning/20 px-2.5 py-1 rounded-md shadow-sm">
                  <Flame size={12} className="text-warning fill-warning" />
                  <span className="text-[10px] font-black text-warning">
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

      <div className="flex items-end justify-between mt-auto">
        <div className="flex flex-col gap-3 w-full max-w-[12rem]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest">
              {t('progress')}
            </span>
            <span className="text-[10px] font-black text-ink font-mono">
              {logToday?.completedCount || 0}/{habit.targetCount} {habit.unit}
            </span>
          </div>
          <div className="h-2 bg-surface-2 rounded-pill overflow-hidden border border-hairline shadow-inner p-0.5">
            <motion.div 
              className="h-full rounded-pill shadow-sm"
              style={{ backgroundColor: habit.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          className="w-10 h-10 flex items-center justify-center bg-surface-2 border border-hairline rounded-md text-ink-tertiary hover:text-accent hover:border-accent hover:shadow-sm transition-all" 
          id="habit-info-btn"
        >
          <Settings size={18} />
        </button>
      </div>
      
      {status === 'completed' && (
        <div className="absolute -top-2 -right-2">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex items-center justify-center bg-accent text-white p-2 rounded-full shadow-glow-accent border-2 border-white"
          >
            <LucideIcons.Check size={14} strokeWidth={4} />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
