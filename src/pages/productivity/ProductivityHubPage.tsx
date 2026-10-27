import React from 'react';
import { 
  CalendarBlank, 
  Repeat, 
  CalendarCheck, 
  Target, 
  Headphones, 
  CaretRight,
  Lightning
} from '@phosphor-icons/react';
import { View } from '../../types';

interface ProductivityHubProps {
  setActiveView: (view: View) => void;
}

export default function ProductivityHubPage({ setActiveView }: ProductivityHubProps) {
  const cards = [
    {
      id: 'schedule',
      icon: CalendarBlank,
      title: "Schedule",
      description: "Jadwal dan aktivitas harian",
      view: 'schedule' as View
    },
    {
      id: 'habit-tracker',
      icon: Repeat,
      title: "Habit Tracker",
      description: "Bangun kebiasaan konsisten",
      view: 'habits' as View
    },
    {
      id: 'ai-planner',
      icon: CalendarCheck,
      title: "Daily Plan",
      description: "Susun rencana fokus hari ini",
      view: 'ai_planner' as View
    },
    {
      id: 'daily-targets',
      icon: Target,
      title: "Daily Targets",
      description: "Pantau pencapaian targetmu",
      view: 'targets' as View
    },
    {
      id: 'smart-space',
      icon: Headphones,
      title: "Smart Space",
      description: "Ruang fokus & ritme produktivitas",
      view: 'smart_space' as View
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#C8A27C]/12 flex items-center justify-center">
          <Lightning size={18} weight="regular" className="text-[#C8A27C]" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[17px] font-semibold text-white/95 leading-tight">Productivity</h1>
          <p className="text-[12px] text-white/50">Kelola fokus, rutinitas, dan target harian</p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => setActiveView(card.view)}
              className="bg-[#14161b] border border-white/[0.07] rounded-xl p-3.5 lg:p-4 cursor-pointer transition-all duration-150 hover:bg-[#1a1d24] hover:border-[#C8A27C]/30 active:scale-[0.99] flex flex-col gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center transition-colors group-hover:bg-[#C8A27C]/15">
                <Icon size={18} weight="light" className="text-white/70 group-hover:text-[#C8A27C] transition-colors" />
              </div>
              
              <div className="flex flex-col gap-1">
                <h3 className="text-[13px] font-medium text-white/90 m-0 leading-tight">
                  {card.title}
                </h3>
                <p className="text-[11px] text-white/45 leading-[1.4] m-0">
                  {card.description}
                </p>
              </div>

              <CaretRight size={13} weight="light" className="text-white/30 self-end mt-auto transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
