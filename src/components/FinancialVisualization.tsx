import React, { useMemo } from 'react';
import { 
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'motion/react';
import { BarChart3, PieChart as PieChartIcon, TrendingDown, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { BackgroundGradientAnimation } from './ui/background-gradient-animation';

export default function FinancialVisualization() {
  const { language, t } = useLanguage();
  const { transactions, categories } = useData();

  // ... (useMemo logic remains same)
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
        <div className="bg-surface-3 p-6 rounded-md shadow-modal border border-hairline-strong backdrop-blur-xl">
          <p className="text-eyebrow font-black text-ink-subtle uppercase tracking-widest mb-4 border-b border-hairline pb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-12 mb-2 last:mb-0">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-pill shadow-sm" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="text-body-sm font-bold text-ink">{entry.name}</span>
              </div>
              <span className="text-body-sm font-black font-mono text-ink tracking-tighter">Rp {entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative min-h-screen overflow-hidden rounded-3xl">
      <div className="absolute inset-0 z-0">
        <BackgroundGradientAnimation 
          containerClassName="h-full w-full"
          interactive={false}
          gradientBackgroundStart="transparent"
          gradientBackgroundEnd="transparent"
        />
      </div>

      <div className="relative z-10 space-y-12 p-1">
        <header>
          <h2 className="text-display-md font-black text-ink tracking-tight uppercase">{t('financialVisualization')}</h2>
          <p className="text-body-sm text-ink-tertiary mt-2 lowercase font-medium">{t('analyticsDesc')}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Monthly Expenses Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-1 p-8 rounded-lg border border-hairline shadow-card group hover:border-hairline-strong transition-all"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-heading-sm font-black text-ink uppercase tracking-tight flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-accent" />
              {t('monthlyExpenses')}
            </h3>
            <Calendar className="w-5 h-5 text-ink-tertiary/40" />
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyExpensesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 10, fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-2)', radius: 4 }} />
                <Bar 
                  dataKey="amount" 
                  name={t('expense')} 
                  fill="var(--color-danger)" 
                  radius={[4, 4, 0, 0]} 
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
          className="bg-surface-1 p-8 rounded-lg border border-hairline shadow-card group hover:border-hairline-strong transition-all"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-heading-sm font-black text-ink uppercase tracking-tight flex items-center gap-3">
              <PieChartIcon className="w-6 h-6 text-accent" />
              {t('mainCategories')}
            </h3>
            <TrendingDown className="w-5 h-5 text-ink-tertiary/40" />
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  animationDuration={1500}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-eyebrow font-black text-ink-subtle uppercase tracking-widest ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: t('monthlyExpenses') + ' (avg)', value: Math.round(monthlyExpensesData.reduce((acc, d) => acc + d.amount, 0) / (monthlyExpensesData.length || 1)), color: 'text-ink' },
          { label: t('expense') + ' (total)', value: transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), color: 'text-danger' },
          { label: t('income') + ' (total)', value: transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0), color: 'text-success' }
        ].map((item, idx) => (
          <div key={idx} className="bg-surface-1 p-10 rounded-lg border border-hairline shadow-card relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${item.color.replace('text-', 'bg-')}`} />
            <div className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest mb-4 opacity-60">{item.label}</div>
            <div className={`text-display-md font-black font-mono tracking-tighter ${item.color}`}>
              Rp {item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
