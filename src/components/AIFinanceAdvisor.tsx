import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChartPieSlice, SpinnerGap, WarningCircle, ArrowUpRight } from '@phosphor-icons/react';
import { Transaction, Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BackgroundBeams } from './ui/background-beams';

interface AIFinanceAdvisorProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function AIFinanceAdvisor({ transactions, categories }: AIFinanceAdvisorProps) {
  const { t, language } = useLanguage();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      
      const allocation = { needs: 0, wants: 0, savings: 0 };
      const expensesByCategory: Record<string, number> = {};

      transactions.filter(t => t.type === 'expense').forEach(t => {
        const cat = categories.find(c => c.id === t.category || c.name === t.category);
        const catName = cat?.name || t.category;
        
        if (cat?.group === 'Needs') allocation.needs += t.amount;
        else if (cat?.group === 'Wants') allocation.wants += t.amount;
        else if (cat?.group === 'Savings & Debt') allocation.savings += t.amount;

        expensesByCategory[catName] = (expensesByCategory[catName] || 0) + t.amount;
      });

      const totalExpense = allocation.needs + allocation.wants + allocation.savings;

      const response = await fetch('/api/gemini/finance-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalIncome,
          totalExpense,
          allocation,
          expensesByCategory,
          language,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.text || "No advice generated.";
      setAdvice(generatedText);
      await addNotification({
        title: language === 'id' ? 'Evaluasi anggaran selesai' : 'Budget evaluation ready',
        message: language === 'id' 
          ? 'Ringkasan alokasi 50/30/20 dan rekomendasi keuangan telah diperbarui.' 
          : '50/30/20 allocation summary and suggestions updated.',
        type: 'ai_insight',
        link: 'finance',
      });
    } catch (err: any) {
      console.warn("AI Advisor network fallback:", err);
      const fallbackAdvice = language === 'id'
        ? `Panduan Alokasi Anggaran 50/30/20:
• Prioritaskan 50% pendapatan untuk Kebutuhan Pokok (Sewa/Cicilan, Makanan, Tagihan).
• Batasi maksimal 30% untuk Keinginan (Hiburan, Kuliner di Luar).
• Sisihkan minimal 20% langsung ke Tabungan & Dana Darurat di awal bulan untuk mengamankan arus kas Anda.`
        : `50/30/20 Budgeting Rule Guidelines:
• Allocate 50% of your income towards Needs (Rent, Groceries, Utilities).
• Keep Wants capped at 30% (Dining out, Entertainment, Hobbies).
• Save at least 20% right at the beginning of the month for investments and emergency reserves.`;
      setAdvice(fallbackAdvice);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-full overflow-hidden p-1">
      <BackgroundBeams className="opacity-40" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-1 p-6 rounded-lg shadow-card border border-hairline mt-8 relative overflow-hidden z-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex-1">
          <h3 className="text-heading-sm font-semibold flex items-center gap-2.5 text-ink tracking-tight">
            <ChartPieSlice size={20} weight="regular" className="text-[#C8A27C] shrink-0" />
            {language === 'id' ? 'Wawasan Alokasi Anggaran' : 'Budget Allocation Insights'}
          </h3>
          <p className="text-body-sm text-ink-tertiary mt-1.5 leading-relaxed">
            {language === 'id' 
              ? 'Evaluasi pengeluaran dan tabungan berdasarkan prinsip alokasi 50/30/20.' 
              : 'Evaluation of spending and savings based on the 50/30/20 allocation framework.'}
          </p>
        </div>
        <button
          onClick={getAdvice}
          disabled={loading}
          className="w-full sm:w-auto px-5 h-10 bg-surface-2 hover:bg-surface-3 text-ink font-medium text-xs rounded-md border border-hairline hover:border-[#C8A27C]/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          {loading ? (
            <>
              <SpinnerGap size={14} weight="regular" className="animate-spin text-[#C8A27C]" />
              {language === 'id' ? 'Menganalisis...' : 'Analyzing...'}
            </>
          ) : (
            <>
              <ArrowUpRight size={14} weight="regular" className="text-[#C8A27C]" />
              {language === 'id' ? 'Evaluasi Anggaran' : 'Evaluate Budget'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-md flex items-start gap-3 text-danger mb-6">
          <WarningCircle size={18} weight="regular" className="shrink-0 mt-0.5" />
          <p className="text-body-sm font-medium">{error}</p>
        </div>
      )}

      {advice && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface-2 border border-hairline p-6 rounded-md relative"
        >
          <div className="text-xs text-ink-subtle mb-3 font-medium">
            {language === 'id' ? 'Rekomendasi Alokasi 50/30/20' : '50/30/20 Allocation Summary'}
          </div>
          <div className="markdown-body text-ink prose prose-sm max-w-none prose-headings:text-ink prose-p:text-ink-subtle prose-strong:text-ink prose-li:text-ink-subtle">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{advice}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </motion.div>
    </div>
  );
}
