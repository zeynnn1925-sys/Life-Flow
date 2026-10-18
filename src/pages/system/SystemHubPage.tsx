import React, { useState } from 'react';
import { Trophy, Settings, Settings2, ChevronRight, Terminal } from 'lucide-react';
import { View } from '../../types';
import { AboutDeveloperModal } from '../../components/AboutDeveloperModal';

interface SystemHubProps {
  setActiveView: (view: View) => void;
}

export default function SystemHubPage({ setActiveView }: SystemHubProps) {
  const [showAbout, setShowAbout] = useState(false);

  const cards = [
    {
      id: 'achievements',
      icon: Trophy,
      title: "Achievements",
      description: "Lihat pencapaianmu",
      action: () => setActiveView('achievements' as View)
    },
    {
      id: 'settings',
      icon: Settings,
      title: "Settings",
      description: "Pengaturan & notifikasi",
      action: () => setActiveView('settings' as View)
    },
    {
      id: 'developer',
      icon: Terminal,
      title: "About Developer",
      description: "Profil & visi Muhammad Faiz Dzahin",
      action: () => setShowAbout(true)
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#9ca3af]/10 flex items-center justify-center">
          <Settings2 size={20} className="text-[#9ca3af]" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[18px] font-semibold text-[#f7f8f8] leading-tight">System</h1>
          <p className="text-[12px] text-[#8a8f98]">Pengaturan aplikasi</p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={card.action}
            className="bg-[#111318] border border-white/8 rounded-xl p-3 lg:p-6 cursor-pointer transition-all duration-150 hover:bg-[#1a1b22] hover:border-orange-500/30 active:scale-[0.98] flex flex-col gap-2 text-left group"
          >
            <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-lg bg-orange-500/12 flex items-center justify-center transition-colors group-hover:bg-orange-500/20">
              <card.icon size={18} className="text-orange-400 lg:w-5 lg:h-5" />
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

      <AboutDeveloperModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
