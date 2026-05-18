import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Transaction, Category } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BackgroundBeams } from './ui/background-beams';

interface AIFinanceAdvisorProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function AIFinanceAdvisor({ transactions, categories }: AIFinanceAdvisorProps) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing. Please set VITE_GEMINI_API_KEY in your environment.");
      }

      const ai = new GoogleGenAI({ apiKey });

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
      const targetNeeds = totalIncome * 0.5;
      const targetWants = totalIncome * 0.3;
      const targetSavings = totalIncome * 0.2;

      const prompt = `
        You are an expert financial advisor. The user wants to strictly follow the 50/30/20 budgeting rule (50% Needs, 30% Wants, 20% Savings).
        Please analyze their current finances and provide specific, actionable advice on how to adjust their spending to hit these targets exactly.
        
        Current Financial Data:
        - Total Income: Rp ${totalIncome.toLocaleString()}
        - Total Expenses: Rp ${totalExpense.toLocaleString()}
        
        Current Allocation:
        - Needs: Rp ${allocation.needs.toLocaleString()} (Target: Rp ${targetNeeds.toLocaleString()})
        - Wants: Rp ${allocation.wants.toLocaleString()} (Target: Rp ${targetWants.toLocaleString()})
        - Savings: Rp ${allocation.savings.toLocaleString()} (Target: Rp ${targetSavings.toLocaleString()})
        
        Expenses by Category:
        ${Object.entries(expensesByCategory).map(([cat, amount]) => `- ${cat}: Rp ${amount.toLocaleString()}`).join('\n')}
        
        Please provide your advice in ${language === 'id' ? 'Indonesian' : 'English'}. Keep it concise, practical, and formatted with bullet points or short paragraphs. Focus on exactly what they need to cut or increase to hit the 50/30/20 targets perfectly.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAdvice(response.text || "No advice generated.");
    } catch (err: any) {
      console.error("AI Advisor Error:", err);
      setError(err.message || "Failed to generate advice. Please try again.");
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
        <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex-1">
          <h3 className="text-heading-sm font-bold flex items-center gap-2 text-ink uppercase tracking-tight">
            <Sparkles className="w-5 h-5 text-accent shrink-0" />
            {language === 'id' ? 'Penasihat AI 50/30/20' : '50/30/20 AI Advisor'}
          </h3>
          <p className="text-body-sm text-ink-tertiary mt-1.5 leading-relaxed">
            {language === 'id' 
              ? 'Analisis cerdas berdasarkan metode alokasi 50/30/20 untuk stabilitas keuangan Anda.' 
              : 'Smart analysis based on the 50/30/20 allocation method for your financial stability.'}
          </p>
        </div>
        <button
          onClick={getAdvice}
          disabled={loading}
          className="w-full sm:w-auto px-6 h-12 bg-accent text-white font-bold rounded-pill hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow-accent shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === 'id' ? 'Menganalisis...' : 'Analyzing...'}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {language === 'id' ? 'Minta Saran AI' : 'Get AI Advice'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 p-4 rounded-md flex items-start gap-4 text-danger mb-6 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-body-sm font-bold">{error}</p>
        </div>
      )}

      {advice && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface-2 border border-hairline p-6 rounded-md relative"
        >
          <div className="absolute top-4 right-4 opacity-5">
            <Sparkles size={48} />
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
