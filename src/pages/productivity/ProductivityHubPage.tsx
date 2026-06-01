import React from 'react';
import { CalendarDays, Flame, Sparkles, Target, Zap, ChevronRight, BrainCircuit } from 'lucide-react';
import { View } from '../../types';

interface ProductivityHubProps {
  setActiveView: (view: View) => void;
}

export default function ProductivityHubPage({ setActiveView }: ProductivityHubProps) {
  const cards = [
    {
      id: 'schedule',
      icon: CalendarDays,
      title: "Schedule",
      description: "Jadwal & tugas harian",
      view: 'schedule' as View
    },
    {
      id: 'habit-tracker',
      icon: Flame,
      title: "Habit Tracker",
      description: "Bangun kebiasaan baik",
      view: 'habits' as View
    },
    {
      id: 'ai-planner',
      icon: Sparkles,
      title: "AI Planner",
      description: "Rencana harian dengan AI",
      view: 'ai_planner' as View
    },
    {
      id: 'daily-targets',
      icon: Target,
      title: "Daily Targets",
      description: "Pantau progress targetmu",
      view: 'targets' as View
    },
    {
      id: 'smart-space',
      icon: BrainCircuit,
      title: "AI Smart Space",
      description: "Sesi Fokus & Analisis Korelasi",
      view: 'smart_space' as View
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center">
          <Zap size={20} className="text-[#f59e0b]" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[18px] font-semibold text-[#f7f8f8] leading-tight">Productivity</h1>
          <p className="text-[12px] text-[#8a8f98]">Tingkatkan produktivitasmu</p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveView(card.view)}
            className="bg-[#111318] border border-white/8 rounded-xl p-3 lg:p-5 cursor-pointer transition-all duration-150 hover:bg-[#1a1b22] hover:border-[#f59e0b]/30 active:scale-[0.98] flex flex-col gap-2 text-left group"
          >
            <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-lg bg-[#f59e0b]/12 flex items-center justify-center transition-colors group-hover:bg-[#f59e0b]/20">
              <card.icon size={18} className="text-[#f59e0b] lg:w-5 lg:h-5" />
            </div>
            
            <div className="flex flex-col gap-1">
              <h3 className="text-[13px] lg:text-[15px] font-semibold text-[#f7f8f8] m-0 leading-tight">
                {card.title}
              </h3>
              <p className="text-[11px] lg:text-[13px] text-[#8a8f98] leading-[1.4] m-0">
                {card.description}
              </p>
            </div>

            <ChevronRight size={14} className="text-[#62666d] self-end mt-auto transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
