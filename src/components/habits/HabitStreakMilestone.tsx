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
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
            <Trophy size={20} />
          </div>
          <h4 className="font-bold text-zinc-900 dark:text-white">Streak Milestone</h4>
        </div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Next: {nextMilestone} Days</span>
      </div>

      <div className="relative h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
        <motion.div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 font-bold flex items-center justify-end px-2"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        >
          {progress > 10 && <Star size={10} className="text-white fill-white" />}
        </motion.div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {milestones.map(m => (
          <div 
            key={m}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${
              streak >= m 
                ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' 
                : 'bg-zinc-50 border-zinc-100 dark:bg-zinc-800/10 dark:border-zinc-800/30 grayscale opacity-40'
            }`}
          >
            <Zap size={14} className={streak >= m ? 'text-amber-600' : 'text-zinc-400'} />
            <span className="text-[10px] font-bold">{m}d</span>
          </div>
        ))}
      </div>
    </div>
  );
}
