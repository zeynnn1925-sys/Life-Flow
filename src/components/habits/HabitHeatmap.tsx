import React from 'react';
import { motion } from 'motion/react';
import { HabitLog } from '../../types/habits';

interface HabitHeatmapProps {
  logs: HabitLog[];
  color: string;
}

export function HabitHeatmap({ logs, color }: HabitHeatmapProps) {
  // Generate last 365+ days grid
  const days = Array.from({ length: 182 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (181 - i));
    const dateStr = date.toISOString().split('T')[0];
    const log = logs.find(l => l.date === dateStr);
    return { date: dateStr, intensity: log ? Math.min(log.completedCount, 4) : 0 };
  });

  return (
    <div className="flex flex-wrap gap-1.5 p-4 bg-surface-2 rounded-md border border-hairline shadow-inner">
      {days.map((day, i) => (
        <div
          key={day.date}
          className="w-3.5 h-3.5 rounded-xs transition-all hover:scale-125 hover:z-10 shadow-sm"
          style={{ 
            backgroundColor: day.intensity > 0 ? color : 'var(--color-ink-tertiary)',
            opacity: day.intensity === 0 ? 0.05 : 0.2 + (day.intensity * 0.2)
          }}
          title={`${day.date}: ${day.intensity} completions`}
        />
      ))}
    </div>
  );
}
