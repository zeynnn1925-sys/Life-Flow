import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'motion/react';
import { BarChart3, PieChart as PieChartIcon, TrendingDown, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

export default function FinancialVisualization() {
  const { language, t } = useLanguage();
  const { transactions, categories } = useData();

  // 1. Monthly Expenses Data (Bar Chart)
  const monthlyExpensesData = useMemo(() => {
    const data: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', year: 'numeric' });
      data[key] = 0;
    }

    transactions.filter(t => t.type === 'expense').forEach(tx => {
      const date = new Date(tx.date);
      const key = date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', year: 'numeric' });
      if (data[key] !== undefined) {
        data[key] += tx.amount;
      }
    });

    return Object.entries(data).map(([name, amount]) => ({ name, amount }));
  }, [transactions, language]);

  // 2. Category Breakdown Data (Pie Chart)
  const categoryData = useMemo(() => {
    const data: Record<string, { value: number, color: string }> = {};
    
    transactions.filter(t => t.type === 'expense').forEach(tx => {
      const cat = categories.find(c => c.id === tx.category || c.name === tx.category);
      const name = cat ? cat.name : tx.category;
      const color = cat ? cat.color : '#d62828';
      
      if (!data[name]) data[name] = { value: 0, color };
      data[name].value += tx.amount;
    });

    return Object.entries(data)
      .map(([name, { value, color }]) => ({ name, value, color }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  }, [transactions, categories]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{entry.name}</span>
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Rp {entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('financialVisualization')}</h2>
        <p className="text-zinc-500 dark:text-zinc-400">{t('analyticsDesc')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Expenses Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-vivid-tangerine" />
              {t('monthlyExpenses')}
            </h3>
            <Calendar className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyExpensesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                <Bar 
                  dataKey="amount" 
                  name={t('expense')} 
                  fill="#d62828" 
                  radius={[6, 6, 0, 0]} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-sunflower-gold" />
              {t('mainCategories')}
            </h3>
            <TrendingDown className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  nameKey="name"
                  animationDuration={1500}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
          <div className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{t('monthlyExpenses')} (Avg)</div>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            Rp {Math.round(monthlyExpensesData.reduce((acc, d) => acc + d.amount, 0) / (monthlyExpensesData.length || 1)).toLocaleString()}
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
          <div className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{t('expense')} (Total)</div>
          <div className="text-2xl font-black text-flag-red">
            Rp {transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
          <div className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{t('income')} (Total)</div>
          <div className="text-2xl font-black text-vivid-tangerine">
            Rp {transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
