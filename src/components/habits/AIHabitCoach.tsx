import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendUp, ArrowsClockwise } from '@phosphor-icons/react';
import { Habit } from '../../types/habits';
import { useNotifications } from '../../contexts/NotificationContext';

interface AIHabitCoachProps {
  habits: Habit[];
}

export function AIHabitCoach({ habits }: AIHabitCoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const { addNotification } = useNotifications();

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
      const text = data.text || "Belum ada pola yang cukup untuk dianalisis. Coba lagi setelah check-in beberapa hari.";
      setAdvice(text);
      if (data.text) {
        await addNotification({
          title: 'Evaluasi kebiasaan harian',
          message: 'Pola kebiasaan harian telah dianalisis untuk menjaga konsistensi alur kerja.',
          type: 'ai_insight',
          link: 'habits',
        });
      }
    } catch (error) {
      console.warn("Habit Coach network fallback:", error);
      const fallbackTips = [
        "Fokus pada konsistensi 1 kebiasaan prioritas hari ini. Rutinitas kecil yang konsisten lebih berharga daripada intensitas sesaat.",
        "Gunakan teknik penumpukan kebiasaan: kaitkan target baru tepat setelah rutinitas yang sudah otomatis Anda lakukan setiap pagi.",
        "Jangan biarkan kebiasaan terlewat dua hari berturut-turut untuk menjaga momentum konsistensi Anda."
      ];
      setAdvice(fallbackTips[Math.floor(Math.random() * fallbackTips.length)]);
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
        className="w-full p-6 rounded-lg bg-surface-1 border border-hairline hover:border-hairline-strong active:scale-[0.99] transition-all overflow-hidden group cursor-pointer"
        id="ai-habit-coach-toggle"
      >
        <div className="relative flex items-center gap-4">
          <div className="w-10 h-10 bg-surface-2 border border-hairline rounded-lg flex items-center justify-center text-[#C8A27C] shrink-0">
            <TrendUp size={20} weight="regular" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-semibold text-ink">Evaluasi Pola Rutinitas</h4>
            <p className="text-xs text-ink-tertiary">Kajian kontinuitas dari data check-in kebiasaan Anda</p>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t border-hairline text-left"
            >
              {loading ? (
                <div className="flex items-center gap-2.5 text-[#C8A27C] text-xs font-medium animate-pulse">
                  <div className="w-4 h-4 border-2 border-[#C8A27C]/30 border-t-[#C8A27C] rounded-full animate-spin" />
                  <span>Menganalisis data rutinitas...</span>
                </div>
              ) : (
                <div className="bg-surface-2 p-5 rounded-md border border-hairline leading-relaxed text-xs text-ink-subtle relative">
                  <div className="text-[10px] font-semibold text-ink-tertiary mb-2 uppercase tracking-wider">Catatan Evaluasi</div>
                  "{advice}"
                </div>
              )}
              
              {!loading && (
                <button 
                  onClick={(e) => { e.stopPropagation(); getCoachAdvice(); }}
                  className="mt-4 flex items-center gap-2 text-xs font-medium text-ink-tertiary hover:text-[#C8A27C] transition-colors cursor-pointer"
                >
                  <ArrowsClockwise size={14} weight="regular" />
                  <span>Perbarui Evaluasi</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
