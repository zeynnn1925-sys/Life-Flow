import React from 'react';
import { motion } from 'motion/react';
import { Habit, HabitLog } from '../../types/habits';
import * as LucideIcons from 'lucide-react';

interface WeeklyHabitGridProps {
  habits: Habit[];
  logs: HabitLog[];
}

export function WeeklyHabitGrid({ habits, logs }: WeeklyHabitGridProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split('T')[0],
      display: date.toLocaleDateString('id-ID', { weekday: 'short' })
    };
  });

  return (
    <div className="overflow-x-auto pb-4">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="text-left py-4 px-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Habit</th>
            {days.map(day => (
              <th key={day.date} className="py-4 px-2 text-center">
                <span className="text-xs font-bold text-zinc-500 lowercase">{day.display}</span>
                <div className="text-[10px] text-zinc-400 mt-0.5">{day.date.split('-')[2]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
          {habits.map(habit => {
            const Icon = (LucideIcons as any)[habit.icon] || LucideIcons.Circle;
            return (
              <tr key={habit.id} className="group">
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-xl group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{habit.title}</span>
                  </div>
                </td>
                {days.map(day => {
                  const log = logs.find(l => l.habitId === habit.id && l.date === day.date);
                  const isCompleted = log && log.completedCount >= habit.targetCount;
                  const isSkipped = log?.skipped;
                  
                  return (
                    <td key={day.date} className="py-4 px-2 text-center">
                      <div className="flex justify-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isCompleted ? '' : isSkipped ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400' : 'bg-zinc-50 dark:bg-zinc-800/30'
                        }`}
                        style={isCompleted ? { backgroundColor: habit.color, color: '#fff' } : {}}
                        >
                          {isCompleted && <LucideIcons.Check size={16} strokeWidth={3} />}
                          {isSkipped && <LucideIcons.FastForward size={14} />}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
