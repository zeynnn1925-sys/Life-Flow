import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { generateFinanceReport, generateProductivityReport, downloadReport } from '../lib/reportGenerator';

interface ExportFinanceButtonProps {
  transactions: { date: string; description: string; category: string; type: 'income' | 'expense'; amount: number }[];
  periodLabel: string;
}

export function ExportFinanceReportButton({ transactions, periodLabel }: ExportFinanceButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const doc = generateFinanceReport({ transactions, periodLabel });
      downloadReport(doc, `laporan-keuangan-${periodLabel.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      id="export-finance-report-btn"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 h-11 px-5 bg-accent text-white rounded-pill font-black text-xs uppercase tracking-widest hover:bg-accent-hover active:scale-[0.98] transition-all shadow-glow-accent disabled:opacity-50"
    >
      <FileDown size={16} />
      {loading ? 'Membuat PDF...' : 'Export Laporan'}
    </button>
  );
}

interface ExportProductivityButtonProps {
  habits: { title: string; category: string; currentStreak: number; totalCompletions: number }[];
  targets: { title: string; category: string; currentValue: number; targetValue: number; unit: string }[];
  periodLabel: string;
}

export function ExportProductivityReportButton({ habits, targets, periodLabel }: ExportProductivityButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const doc = generateProductivityReport({ habits, targets, periodLabel });
      downloadReport(doc, `laporan-produktivitas-${periodLabel.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      id="export-productivity-report-btn"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 h-11 px-5 bg-accent text-white rounded-pill font-black text-xs uppercase tracking-widest hover:bg-accent-hover active:scale-[0.98] transition-all shadow-glow-accent disabled:opacity-50"
    >
      <FileDown size={16} />
      {loading ? 'Membuat PDF...' : 'Export Laporan'}
    </button>
  );
}
