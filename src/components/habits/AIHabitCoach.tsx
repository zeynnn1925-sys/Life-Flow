import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Brain, Target, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
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
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is missing");
      
      const ai = new GoogleGenAI({ apiKey });

      const habitData = habits.map(h => `${h.title} (Streak: ${h.currentStreak}, Completions: ${h.totalCompletions})`).join(', ');
      
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are the LifeFlow AI Habit Coach. Based on these habits: ${habitData}, 
        give me ONE specific, actionable, and motivating tip to improve consistency today. 
        Keep it under 150 characters. Be supportive but professional.`
      });
      
      setAdvice(result.text || "Tetap semangat! Konsistensi adalah kunci.");
    } catch (error) {
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
        className="w-full p-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden group cursor-pointer"
        id="ai-habit-coach-toggle"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Brain size={80} />
        </div>
        
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <Sparkles size={24} className="text-white" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-lg">AI Habit Coach</h4>
            <p className="text-indigo-100 text-sm opacity-80">Dapatkan tips personal hari ini</p>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t border-white/20 text-left"
            >
              {loading ? (
                <div className="flex items-center gap-2 text-indigo-100 italic animate-pulse">
                  <Sparkles size={16} />
                  <span>Coach sedang berpikir...</span>
                </div>
              ) : (
                <div className="bg-white/10 p-4 rounded-2xl italic leading-relaxed text-sm">
                   "{advice}"
                </div>
              )}
              
              {!loading && (
                <button 
                  onClick={(e) => { e.stopPropagation(); getCoachAdvice(); }}
                  className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-200 hover:text-white transition-colors"
                >
                  <Send size={12} />
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
