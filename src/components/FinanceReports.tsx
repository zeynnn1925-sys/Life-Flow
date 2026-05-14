import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Transaction, Category } from '../types';
import { Filter, TrendingUp, PieChart as PieChartIcon, Download, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import AIFinanceAdvisor from './AIFinanceAdvisor';
import { exportTransactions } from '../services/exportService';

export default function FinanceReports() {
  const { language, t } = useLanguage();
  const { transactions, categories } = useData();
  const { user } = useAuth();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [hiddenData, setHiddenData] = useState<string[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  const getCategoryName = (idOrName: string) => {
    const cat = categories.find(c => c.id === idOrName || c.name === idOrName);
    return cat ? cat.name : idOrName;
  };

  const COLORS = ['var(--color-accent)', 'var(--color-danger)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-primary)'];

  const chartData = useMemo(() => {
    const data: Record<string, { name: string; income: number; expense: number }> = {};

    transactions.forEach(t => {
      const date = new Date(t.date);
      let key = '';
      
      if (period === 'daily') {
        key = date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' });
      } else if (period === 'weekly') {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = language === 'id' ? `Minggu ${weekNum}` : `Week ${weekNum}`;
      } else {
        key = date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short' });
      }

      if (!data[key]) {
        data[key] = { name: key, income: 0, expense: 0 };
      }

      if (t.type === 'income') data[key].income += t.amount;
      else data[key].expense += t.amount;
    });

    return Object.values(data).slice(-7);
  }, [transactions, period]);

  const categoryData = useMemo(() => {
    const data: Record<string, { value: number, color: string }> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = categories.find(c => c.id === t.category || c.name === t.category);
      const name = cat ? cat.name : t.category;
      const color = cat ? cat.color : '#d62828';
      if (!data[name]) data[name] = { value: 0, color };
      data[name].value += t.amount;
    });
    return Object.entries(data)
      .map(([name, { value, color }]) => ({ name, value, color }))
      .filter(item => !hiddenCategories.includes(item.name));
  }, [transactions, hiddenCategories, categories]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    transactions.filter(t => t.type === 'expense').forEach(t => cats.add(getCategoryName(t.category)));
    return Array.from(cats);
  }, [transactions, categories]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  const budgetAllocation = useMemo(() => {
    const allocation = {
      needs: 0,
      wants: 0,
      savings: 0,
    };

    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = categories.find(c => c.id === t.category || c.name === t.category);
      if (cat?.group === 'Needs') allocation.needs += t.amount;
      else if (cat?.group === 'Wants') allocation.wants += t.amount;
      else if (cat?.group === 'Savings & Debt') allocation.savings += t.amount;
    });

    const total = allocation.needs + allocation.wants + allocation.savings || 1;
    return [
      { name: `${t('needs')} (50%)`, value: allocation.needs, percent: Math.round((allocation.needs / total) * 100), target: 50, color: 'var(--color-danger)' },
      { name: `${t('wants')} (30%)`, value: allocation.wants, percent: Math.round((allocation.wants / total) * 100), target: 30, color: 'var(--color-warning)' },
      { name: `${t('savings')} (20%)`, value: allocation.savings, percent: Math.round((allocation.savings / total) * 100), target: 20, color: 'var(--color-success)' },
    ];
  }, [transactions, categories]);

  const toggleData = (dataKey: string) => {
    setHiddenData(prev => 
      prev.includes(dataKey) ? prev.filter(k => k !== dataKey) : [...prev, dataKey]
    );
  };

  const toggleCategory = (category: string) => {
    setHiddenCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleExport = () => {
    exportTransactions(transactions, user?.displayName || 'User', getCategoryName, t);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-1 p-4 rounded-md shadow-card border border-hairline">
          <p className="text-eyebrow text-ink-tertiary uppercase mb-3">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8 mb-2 last:mb-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-body-sm font-bold text-ink">{entry.name}</span>
              </div>
              <span className="text-body-sm font-black text-ink font-mono">Rp {entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-heading-md font-bold text-ink">{t('analytics')}</h2>
          <p className="text-body-sm text-ink-tertiary mt-1">{t('analyticsDesc')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 h-10 bg-surface-1 border border-hairline rounded-md text-eyebrow font-bold text-ink-tertiary hover:text-ink hover:border-hairline-strong transition-all shadow-sm uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            <span>{t('exportCSV')}</span>
          </button>
          
          <div className="flex items-center bg-surface-2 p-1 rounded-pill border border-hairline shadow-sm overflow-x-auto no-scrollbar max-w-full">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-1.5 rounded-pill text-eyebrow font-bold transition-all whitespace-nowrap uppercase tracking-widest ${
                  period === p ? 'bg-accent text-white shadow-glow-accent outline-none' : 'text-ink-tertiary hover:text-ink'
                }`}
              >
                {t(p)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface-1 p-8 rounded-lg border border-hairline shadow-card"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-heading-xs font-black flex items-center gap-3 text-ink uppercase tracking-tight">
              <TrendingUp className="w-5 h-5 text-accent" />
              {t('incomeVsExpense')}
            </h3>
            <div className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest bg-surface-2 px-2.5 py-1 rounded-md border border-hairline">
              {t('clickLegend')}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={1}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="colorExpenseBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={1}/>
                    <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 10, fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-2)', opacity: 0.4 }} />
                <Legend 
                  iconType="rect" 
                  wrapperStyle={{ paddingTop: '24px' } }
                  formatter={(value) => <span className="text-ink-tertiary text-[10px] font-black uppercase tracking-widest ml-1">{value}</span>}
                  onClick={(e) => toggleData(String(e.dataKey))}
                />
                {!hiddenData.includes('income') && (
                  <Bar dataKey="income" name={t('income').toUpperCase()} fill="url(#colorIncome)" radius={[2, 2, 0, 0]} barSize={24} />
                )}
                {!hiddenData.includes('expense') && (
                  <Bar dataKey="expense" name={t('expense').toUpperCase()} fill="url(#colorExpenseBar)" radius={[2, 2, 0, 0]} barSize={24} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface-1 p-8 rounded-lg border border-hairline shadow-card"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-heading-xs font-black flex items-center gap-3 text-ink uppercase tracking-tight">
              <DollarSign className="w-5 h-5 text-ink-tertiary" />
              {t('budgetHealth')} (50/30/20)
            </h3>
          </div>
          <div className="space-y-8">
            {budgetAllocation.map((item) => (
              <div key={item.name} className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-body-sm font-black text-ink uppercase tracking-tight">{item.name}</div>
                    <div className="text-eyebrow text-ink-tertiary uppercase mt-0.5">{t('target')}: {item.target}%</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-heading-sm font-black transition-colors ${item.percent > item.target ? 'text-danger' : 'text-accent'}`}>
                      {item.percent}%
                    </div>
                    <div className="text-eyebrow text-ink-tertiary font-bold font-mono">Rp {item.value.toLocaleString()}</div>
                  </div>
                </div>
                <div className="relative group">
                  <div className="h-4 bg-surface-2 rounded-pill overflow-hidden border border-hairline p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      className="h-full rounded-pill shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-ink text-surface-1 text-[10px] font-black rounded-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20 shadow-xl scale-95 group-hover:scale-100">
                    Rp {item.value.toLocaleString()}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-6 border-transparent border-t-ink" />
                  </div>
                </div>
                {item.percent > item.target && (
                  <p className="text-eyebrow text-danger font-black italic mt-1.5 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" />
                    {t('overspendingMsg').replace('{percent}', (item.percent - item.target).toString())}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <AIFinanceAdvisor transactions={transactions} categories={categories} />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-surface-1 p-8 rounded-lg border border-hairline shadow-card"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-heading-xs font-black flex items-center gap-3 text-ink uppercase tracking-tight">
            <PieChartIcon className="w-5 h-5 text-ink-tertiary" />
            {t('expenseBreakdown')}
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-1 h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 flex flex-wrap gap-2.5 content-start">
            {allCategories.map((cat, idx) => {
              const catObj = categories.find(c => c.name === cat);
              const catColor = catObj ? catObj.color : COLORS[idx % COLORS.length];
              const isHidden = hiddenCategories.includes(cat);
              return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2.5 shadow-sm active:scale-95 ${
                  isHidden
                    ? 'bg-surface-2 border-hairline text-ink-tertiary opacity-40 italic'
                    : 'bg-surface-1 border-hairline-strong text-ink hover:border-accent hover:shadow-md'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: isHidden ? '#ccc' : catColor }} />
                {cat}
              </button>
            )})}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-1 p-8 rounded-lg border border-hairline shadow-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-500" />
          <div className="text-eyebrow text-accent font-black uppercase tracking-widest mb-2 flex items-center gap-2">
            <TrendingUp size={14} />
            {t('totalSavings')}
          </div>
          <div className="text-heading-md font-black text-ink font-mono tracking-tighter">Rp {(totalIncome - totalExpense).toLocaleString()}</div>
          <div className="mt-4 text-eyebrow text-ink-tertiary lowercase font-bold">{t('netBalanceDesc')}</div>
        </div>
        
        <div className="bg-surface-1 p-8 rounded-lg border border-hairline shadow-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-danger/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-500" />
          <div className="text-eyebrow text-danger font-black uppercase tracking-widest mb-2 flex items-center gap-2">
            <Download size={14} className="rotate-180" />
            {t('burnRate')}
          </div>
          <div className="text-heading-md font-black text-ink font-mono tracking-tighter">Rp {Math.round(totalExpense / (chartData.length || 1)).toLocaleString()}</div>
          <div className="mt-4 text-eyebrow text-ink-tertiary lowercase font-bold">{t('burnRateDesc').replace('{period}', t(period))}</div>
        </div>

        <div className="bg-ink p-8 rounded-lg border border-hairline shadow-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-surface-1/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-500" />
          <div className="text-eyebrow text-accent font-black uppercase tracking-widest mb-2 flex items-center gap-2">
            <Filter size={14} />
            {t('savingsRate')}
          </div>
          <div className="text-heading-md font-black text-ink font-mono tracking-tighter">
            {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
          </div>
          <div className="mt-4 text-eyebrow text-ink-tertiary lowercase font-bold font-mono opacity-60">{t('savingsRateDesc')}</div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-surface-1 rounded-lg border border-hairline shadow-card overflow-hidden"
      >
        <div className="p-8 border-b border-hairline flex items-center justify-between bg-surface-1/50">
          <h3 className="text-heading-xs font-black flex items-center gap-3 text-ink uppercase tracking-tight">
            <TrendingUp className="w-5 h-5 text-ink-tertiary" />
            {t('transactionHistory')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-2">
                <th className="px-8 py-5 text-eyebrow font-black text-ink-tertiary uppercase tracking-widest border-b border-hairline">{t('date')}</th>
                <th className="px-8 py-5 text-eyebrow font-black text-ink-tertiary uppercase tracking-widest border-b border-hairline">{t('description')}</th>
                <th className="px-8 py-5 text-eyebrow font-black text-ink-tertiary uppercase tracking-widest border-b border-hairline">{t('category')}</th>
                <th className="px-8 py-5 text-eyebrow font-black text-ink-tertiary uppercase tracking-widest border-b border-hairline">{t('type')}</th>
                <th className="px-8 py-5 text-eyebrow font-black text-ink-tertiary uppercase tracking-widest border-b border-hairline text-right">{t('amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-ink-tertiary italic text-body-sm">
                    {t('noTransactions')}
                  </td>
                </tr>
              ) : (
                [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-2 transition-all group">
                    <td className="px-8 py-5 text-[11px] font-bold text-ink-tertiary whitespace-nowrap font-mono">
                      {new Date(tx.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-body-sm font-black text-ink group-hover:text-accent transition-colors">{tx.description}</div>
                      {tx.notes && <div className="text-[10px] text-ink-tertiary mt-1 font-medium">{tx.notes}</div>}
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-surface-2 border border-hairline text-ink-subtle">
                        {getCategoryName(tx.category)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                        tx.type === 'income' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-danger/10 border-danger/20 text-danger'
                      }`}>
                        {t(tx.type)}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-body-sm font-black text-right whitespace-nowrap font-mono ${
                      tx.type === 'income' ? 'text-accent' : 'text-danger'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'} Rp {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
