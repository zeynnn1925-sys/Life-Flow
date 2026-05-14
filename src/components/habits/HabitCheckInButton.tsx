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
            className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 flex gap-3 bg-surface-1 p-2 rounded-md shadow-modal border border-hairline z-20 whitespace-nowrap"
          >
            <button
              onClick={() => { onSkip(); setShowOptions(false); }}
              className="p-3 bg-surface-2 hover:bg-surface-3 rounded-md text-ink-tertiary transition-all border border-hairline hover:border-hairline-strong shadow-sm active:scale-95"
              title="Skip for today"
              id="habit-skip-btn"
            >
              <SkipForward size={20} />
            </button>
            <button
              onClick={() => { onCheckIn(); setShowOptions(false); }}
              className="p-3 bg-accent text-white rounded-md hover:bg-accent-hover transition-all shadow-glow-accent active:scale-95"
              title="Check in"
              id="habit-checkin-confirm-btn"
            >
              <Check size={20} />
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
        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
          status === 'completed' ? 'bg-accent text-white shadow-glow-accent' :
          status === 'skipped' ? 'bg-surface-3 text-ink-tertiary opacity-40 italic' :
          status === 'in_progress' ? 'shadow-glow-accent scale-110 border-2 border-white' :
          'bg-surface-2 border border-hairline text-ink-tertiary hover:border-accent hover:text-accent hover:bg-surface-1'
        } shadow-card group relative active:scale-95`}
        style={status === 'in_progress' ? { backgroundColor: color, color: '#fff' } : {}}
        id="habit-main-action-btn"
      >
        {status === 'completed' ? <Check size={28} strokeWidth={3} /> :
         status === 'skipped' ? <SkipForward size={22} /> :
         status === 'in_progress' ? <Plus size={28} strokeWidth={3} /> :
         <Plus size={28} strokeWidth={3} className="group-hover:scale-110 transition-transform" />}
      </button>
    </div>
  );
}
