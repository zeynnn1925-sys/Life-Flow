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
    <div className="overflow-x-auto pb-4 no-scrollbar">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="border-b border-hairline">
            <th className="text-left py-6 px-4 text-eyebrow font-black text-ink-tertiary uppercase tracking-widest">Habit</th>
            {days.map(day => (
              <th key={day.date} className="py-6 px-4 text-center">
                <span className="text-[10px] font-black text-ink uppercase tracking-widest">{day.display}</span>
                <div className="text-[10px] text-ink-tertiary font-mono font-bold mt-1 opacity-50">{day.date.split('-')[2]}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {habits.map(habit => {
            const Icon = (LucideIcons as any)[habit.icon] || LucideIcons.Circle;
            return (
              <tr key={habit.id} className="group hover:bg-surface-2 transition-colors">
                <td className="py-5 px-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-md flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-hairline"
                      style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-body-sm font-black text-ink uppercase tracking-tight">{habit.title}</span>
                  </div>
                </td>
                {days.map(day => {
                  const log = logs.find(l => l.habitId === habit.id && l.date === day.date);
                  const isCompleted = log && log.completedCount >= habit.targetCount;
                  const isSkipped = log?.skipped;
                  
                  return (
                    <td key={day.date} className="py-5 px-4 text-center">
                      <div className="flex justify-center">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center transition-all shadow-sm ${
                          isCompleted ? 'shadow-glow-accent' : isSkipped ? 'bg-surface-3 text-ink-tertiary opacity-40 italic' : 'bg-surface-2 border border-hairline'
                        }`}
                        style={isCompleted ? { backgroundColor: habit.color, color: '#fff' } : {}}
                        >
                          {isCompleted && <LucideIcons.Check size={20} strokeWidth={4} />}
                          {isSkipped && <LucideIcons.FastForward size={16} />}
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
