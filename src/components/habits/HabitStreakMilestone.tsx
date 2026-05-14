import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Zap } from 'lucide-react';

interface HabitStreakMilestoneProps {
  streak: number;
}

export function HabitStreakMilestone({ streak }: HabitStreakMilestoneProps) {
  const milestones = [7, 30, 100, 365];
  const nextMilestone = milestones.find(m => m > streak) || milestones[milestones.length - 1];
  const progress = (streak / nextMilestone) * 100;

  return (
    <div className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline hover:border-hairline-strong transition-all group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-warning/10 border border-warning/20 rounded-xl flex items-center justify-center text-warning shadow-sm transition-transform group-hover:rotate-12">
            <Trophy size={24} />
          </div>
          <h4 className="text-heading-sm font-black text-ink uppercase tracking-tight">Streak Milestone</h4>
        </div>
        <span className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest">Next: {nextMilestone} Days</span>
      </div>

      <div className="relative h-6 bg-surface-2 rounded-pill overflow-hidden mb-8 border border-hairline shadow-inner p-1">
        <motion.div 
          className="h-full rounded-pill bg-warning shadow-glow-warning flex items-center justify-end px-3"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        >
          {progress > 15 && <Star size={12} className="text-white fill-white animate-pulse" />}
        </motion.div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {milestones.map(m => (
          <div 
            key={m}
            className={`flex flex-col items-center gap-2 p-3 rounded-md transition-all border ${
              streak >= m 
                ? 'bg-surface-1 border-warning/40 shadow-glow-warning text-warning' 
                : 'bg-surface-2 border-hairline text-ink-tertiary opacity-30 grayscale'
            }`}
          >
            <Zap size={18} className="transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-black font-mono">{m}d</span>
          </div>
        ))}
      </div>
    </div>
  );
}
