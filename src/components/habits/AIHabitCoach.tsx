import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Brain, Target, MessageSquare } from 'lucide-react';
import { Habit } from '../../types/habits';

interface AIHabitCoachProps {
  habits: Habit[];
}

export function AIHabitCoach({ habits }: AIHabitCoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const getCoachAdvice = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/habit-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ habits }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setAdvice(data.text || "Tetap semangat! Konsistensi adalah kunci.");
    } catch (error) {
      console.error("AI Habit Coach Error:", error);
      setAdvice("Gagal terhubung dengan Coach. Coba lagi nanti ya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!advice && !loading) getCoachAdvice();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
            if (!advice && !loading) getCoachAdvice();
          }
        }}
        className="w-full p-8 rounded-lg bg-surface-1 border border-hairline shadow-glow-primary hover:border-accent/40 active:scale-[0.98] transition-all overflow-hidden group cursor-pointer"
        id="ai-habit-coach-toggle"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-pill -mr-16 -mt-16 blur-2xl group-hover:bg-accent/10 transition-all duration-700" />
        
        <div className="relative flex items-center gap-6">
          <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent shadow-sm transition-transform group-hover:rotate-12">
            <Sparkles size={28} />
          </div>
          <div className="text-left">
            <h4 className="text-heading-sm font-black text-ink uppercase tracking-tight">AI Habit Coach</h4>
            <p className="text-body-sm text-ink-tertiary">Dapatkan tips personal hari ini</p>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-8 pt-8 border-t border-hairline text-left"
            >
              {loading ? (
                <div className="flex items-center gap-3 text-accent font-black text-eyebrow uppercase tracking-widest animate-pulse">
                  <div className="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                  <span>Coach sedang berpikir...</span>
                </div>
              ) : (
                <div className="bg-surface-2 p-6 rounded-md border border-hairline shadow-inner italic leading-relaxed text-body-sm text-ink-subtle font-medium relative">
                  <div className="absolute -top-3 left-4 px-2 bg-surface-1 text-[10px] font-black text-accent uppercase tracking-widest">Advice</div>
                   "{advice}"
                </div>
              )}
              
              {!loading && (
                <button 
                  onClick={(e) => { e.stopPropagation(); getCoachAdvice(); }}
                  className="mt-6 flex items-center gap-3 text-eyebrow font-black uppercase tracking-widest text-ink-tertiary hover:text-accent transition-colors active:scale-95"
                >
                  <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                  Coba Advice Lain
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
