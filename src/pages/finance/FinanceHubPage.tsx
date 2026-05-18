import React from 'react';
import { CreditCard, PiggyBank, BarChart2, LineChart, Wallet, ChevronRight } from 'lucide-react';
import { View } from '../../types';

interface FinanceHubProps {
  setActiveView: (view: View) => void;
}

export default function FinanceHubPage({ setActiveView }: FinanceHubProps) {
  const cards = [
    {
      id: 'finance-tracker',
      icon: CreditCard,
      title: "Finance Tracker",
      description: "Catat pemasukan & pengeluaran",
      view: 'finance' as View
    },
    {
      id: 'budgets-savings',
      icon: PiggyBank,
      title: "Budget & Savings",
      description: "Atur anggaran & tabungan",
      view: 'budgets' as View
    },
    {
      id: 'visualization',
      icon: BarChart2,
      title: "Visualisasi",
      description: "Grafik & chart keuangan",
      view: 'visualization' as View
    },
    {
      id: 'analytics',
      icon: LineChart,
      title: "Analytics",
      description: "Laporan & analisis data",
      view: 'reports' as View
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#5e6ad2]/10 flex items-center justify-center">
          <Wallet size={20} className="text-[#5e6ad2]" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[18px] font-semibold text-[#f7f8f8] leading-tight">Finance</h1>
          <p className="text-[12px] text-[#8a8f98]">Kelola keuanganmu</p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveView(card.view)}
            className="bg-[#111318] border border-white/8 rounded-xl p-3 lg:p-5 cursor-pointer transition-all duration-150 hover:bg-[#1a1b22] hover:border-[#5e6ad2]/30 active:scale-[0.98] flex flex-col gap-2 text-left group"
          >
            <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-lg bg-[#5e6ad2]/12 flex items-center justify-center transition-colors group-hover:bg-[#5e6ad2]/20">
              <card.icon size={18} className="text-[#5e6ad2] lg:w-5 lg:h-5" />
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
