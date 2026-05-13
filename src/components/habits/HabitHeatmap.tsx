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
    <div className="flex flex-wrap gap-1">
      {days.map((day, i) => (
        <div
          key={day.date}
          className="w-3 h-3 rounded-sm transition-all"
          style={{ 
            backgroundColor: day.intensity > 0 ? color : undefined,
            opacity: day.intensity === 0 ? 0.1 : 0.2 + (day.intensity * 0.2)
          }}
          title={`${day.date}: ${day.intensity} completions`}
        />
      ))}
    </div>
  );
}
