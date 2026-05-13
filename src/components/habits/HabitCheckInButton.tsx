import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, SkipForward } from 'lucide-react';

interface HabitCheckInButtonProps {
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  onCheckIn: () => void;
  onSkip: () => void;
  color: string;
}

export function HabitCheckInButton({ status, onCheckIn, onSkip, color }: HabitCheckInButtonProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="relative">
      <AnimatePresence>
        {showOptions && status === 'pending' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-2 bg-white dark:bg-zinc-800 p-2 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 z-10"
          >
            <button
              onClick={() => { onSkip(); setShowOptions(false); }}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full text-zinc-500 transition-colors"
              title="Skip for today"
              id="habit-skip-btn"
            >
              <SkipForward size={18} />
            </button>
            <button
              onClick={() => { onCheckIn(); setShowOptions(false); }}
              className="p-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full hover:opacity-90 transition-opacity"
              title="Check in"
              id="habit-checkin-confirm-btn"
            >
              <Check size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => {
          if (status === 'pending') setShowOptions(!showOptions);
          else if (status === 'in_progress') onCheckIn();
        }}
        disabled={status === 'completed' || status === 'skipped'}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
          status === 'completed' ? 'bg-green-500 text-white shadow-green-500/20' :
          status === 'skipped' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400' :
          status === 'in_progress' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl scale-110' :
          'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
        } shadow-sm group relative`}
        style={status === 'in_progress' ? { backgroundColor: color, color: '#fff' } : {}}
        id="habit-main-action-btn"
      >
        {status === 'completed' ? <Check size={24} /> :
         status === 'skipped' ? <SkipForward size={20} /> :
         status === 'in_progress' ? <Plus size={24} /> :
         <Plus size={24} className="group-hover:scale-110 transition-transform" />}
      </button>
    </div>
  );
}
