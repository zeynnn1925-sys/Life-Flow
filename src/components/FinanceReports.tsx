import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Transaction, Category } from '../types';
import { Filter, TrendingUp, PieChart as PieChartIcon, Download, DollarSign, Calendar, ChevronDown, ChevronUp, Search, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import AIFinanceAdvisor from './AIFinanceAdvisor';
import { exportTransactions } from '../services/exportService';
import { exportFinanceToGoogleSheets } from '../services/googleSheetsService';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-1 p-4 rounded-md shadow-card border border-hairline">
        <p className="text-eyebrow text-ink-tertiary uppercase mb-3 text-[10px] font-black">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-8 mb-2 last:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-body-sm font-bold text-ink underline decoration-accent/20">{entry.name}</span>
            </div>
            <span className="text-body-sm font-black text-ink font-mono">Rp {entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function FinanceReports() {
  const { language, t } = useLanguage();
  const { transactions, categories } = useData();
  const { 
    user, 
    googleSheetsAccessToken, 
    isSheetsConnected, 
    connectGoogleSheets, 
    disconnectGoogleSheets 
  } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [hiddenData, setHiddenData] = useState<string[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);
  const [breakdownType, setBreakdownType] = useState<'expense' | 'income'>('expense');
  
  // New Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Google Sheets integration state
  const [isExportingToSheets, setIsExportingToSheets] = useState(false);
  const [exportedSheetsUrl, setExportedSheetsUrl] = useState<string | null>(null);
  const [sheetsExportError, setSheetsExportError] = useState<string | null>(null);

  const handleSheetsExport = async () => {
    setSheetsExportError(null);
    setExportedSheetsUrl(null);
    
    let token = googleSheetsAccessToken;
    if (!isSheetsConnected || !token) {
      try {
        const provider = new (await import('firebase/auth')).GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/spreadsheets');
        const result = await (await import('firebase/auth')).signInWithPopup(
          (await import('../firebase')).auth, 
          provider
        );
        const credential = (await import('firebase/auth')).GoogleAuthProvider.credentialFromResult(result);
        token = credential?.accessToken || null;
        if (token) {
          localStorage.setItem('google_sheets_token', token);
          window.location.reload(); // Refresh to set state properly and proceed safely
          return;
        } else {
          throw new Error('Could not retrieve access token');
        }
      } catch (err: any) {
        setSheetsExportError(err.message || 'Authentication failed');
        return;
      }
    }

    setIsExportingToSheets(true);
    try {
      const confirmed = window.confirm(
        language === 'id'
          ? `Ekspor ${filteredTransactions.length} transaksi saat ini ke Google Sheets?`
          : `Export ${filteredTransactions.length} current transactions to a new Google Spreadsheet?`
      );
      if (!confirmed) {
        setIsExportingToSheets(false);
        return;
      }

      const res = await exportFinanceToGoogleSheets(
        token!,
        filteredTransactions,
        categories,
        user?.email || 'User',
        language
      );
      setExportedSheetsUrl(res.spreadsheetUrl);
    } catch (err: any) {
      setSheetsExportError(err.message || 'Export failed');
    } finally {
      setIsExportingToSheets(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('sv').substring(0, 10);
  };

  const getWeekStartDate = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const firstDay = new Date(now.setDate(diff));
    return firstDay.toLocaleDateString('sv').substring(0, 10);
  };

  const getMonthStartDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const getYearStartDate = () => {
    return `${new Date().getFullYear()}-01-01`;
  };

  const handleQuickFilter = (preset: 'all' | 'week' | 'month' | 'year') => {
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'week') {
      setStartDate(getWeekStartDate());
      setEndDate(getTodayDate());
    } else if (preset === 'month') {
      setStartDate(getMonthStartDate());
      setEndDate(getTodayDate());
    } else if (preset === 'year') {
      setStartDate(getYearStartDate());
      setEndDate(getTodayDate());
    }
  };

  const getCategoryName = (idOrName: string) => {
    const cat = categories.find(c => c.id === idOrName || c.name === idOrName);
    return cat ? cat.name : idOrName;
  };

  const COLORS = ['var(--color-accent)', 'var(--color-danger)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-primary)', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de65'];

  // Apply Filters to Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const dateMatch = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);
      const catMatch = selectedCategories.length === 0 || selectedCategories.includes(t.category);
      return dateMatch && catMatch;
    });
  }, [transactions, startDate, endDate, selectedCategories]);

  const chartData = useMemo(() => {
    const data: Record<string, { name: string; income: number; expense: number }> = {};

    filteredTransactions.forEach(t => {
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
  }, [filteredTransactions, period, language]);

  const categoryData = useMemo(() => {
    const data: Record<string, { value: number, color: string }> = {};
    filteredTransactions.filter(t => t.type === breakdownType).forEach(t => {
      const cat = categories.find(c => c.id === t.category || c.name === t.category);
      const name = cat ? cat.name : t.category;
      const color = cat ? cat.color : (breakdownType === 'income' ? 'var(--color-success)' : 'var(--color-danger)');
      if (!data[name]) data[name] = { value: 0, color };
      data[name].value += t.amount;
    });
    return Object.entries(data)
      .map(([name, { value, color }]) => ({ name, value, color }))
      .filter(item => !hiddenCategories.includes(item.name));
  }, [filteredTransactions, hiddenCategories, categories, breakdownType]);

  // Net worth trend data
  const netTrendData = useMemo(() => {
    let runningBalance = 0;
    // Sort all transactions by date to calculate running balance correctly
    const sortedAll = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    
    const trend: { name: string; balance: number; date: string }[] = [];
    
    sortedAll.forEach(t => {
      if (t.type === 'income') runningBalance += t.amount;
      else runningBalance -= t.amount;
      
      const dateStr = t.date;
      const lastEntry = trend[trend.length - 1];
      
      if (lastEntry && lastEntry.date === dateStr) {
        lastEntry.balance = runningBalance;
      } else {
        trend.push({ 
          name: new Date(dateStr).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' }),
          balance: runningBalance,
          date: dateStr
        });
      }
    });

    // Apply current date range filters to the trend view as well, or just show last 30 entries
    if (startDate || endDate) {
      return trend.filter(item => (!startDate || item.date >= startDate) && (!endDate || item.date <= endDate));
    }

    return trend.slice(-15);
  }, [transactions, startDate, endDate, language]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    transactions.filter(t => t.type === 'expense').forEach(t => cats.add(getCategoryName(t.category)));
    return Array.from(cats);
  }, [transactions, categories]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

  const budgetAllocation = useMemo(() => {
    const allocation = {
      needs: 0,
      wants: 0,
      savings: 0,
    };

    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
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
  }, [filteredTransactions, categories, t]);

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
    exportTransactions(filteredTransactions, user?.displayName || 'User', getCategoryName, t);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCategories([]);
    setPeriod('monthly');
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-12"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-heading-md font-bold text-ink">{t('analytics')}</h2>
          <p className="text-body-sm text-ink-tertiary mt-1">{t('analyticsDesc')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 h-10 border rounded-md text-eyebrow font-bold transition-all shadow-sm uppercase tracking-widest ${
              showFilters ? 'bg-accent text-white border-accent shadow-glow-accent' : 'bg-surface-1 border-hairline text-ink-tertiary hover:text-ink'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>{t('filterByCategory').split(' ')[0]}</span>
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="flex items-center gap-2 px-6 h-10 bg-surface-1 border border-hairline rounded-md text-eyebrow font-bold text-ink-tertiary hover:text-ink hover:border-hairline-strong transition-all shadow-sm uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            <span>{t('exportCSV')}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isExportingToSheets}
            onClick={handleSheetsExport}
            className={`flex items-center gap-2 px-6 h-10 border rounded-md text-eyebrow font-bold transition-all shadow-sm uppercase tracking-widest ${
              isSheetsConnected
                ? 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/35'
                : 'bg-surface-1 border-hairline text-ink-tertiary hover:text-ink hover:border-hairline-strong'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>
              {isExportingToSheets
                ? (language === 'id' ? 'Mengekspor...' : 'Exporting...')
                : isSheetsConnected
                  ? (language === 'id' ? 'Ekspor ke Sheets' : 'Export to Sheets')
                  : (language === 'id' ? 'Hubungkan Sheets' : 'Connect Sheets')}
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Google Sheets Status Messages */}
      <AnimatePresence>
        {(exportedSheetsUrl || sheetsExportError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              exportedSheetsUrl
                ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-600/10 border-rose-500/20 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className={`w-5 h-5 shrink-0 ${exportedSheetsUrl ? 'text-emerald-500' : 'text-rose-500'}`} />
              <div className="text-body-sm">
                {exportedSheetsUrl ? (
                  <div className="font-semibold text-emerald-300">
                    {language === 'id' 
                      ? 'Laporan keuangan berhasil diekspor ke Google Sheets!' 
                      : 'Financial report successfully exported to Google Sheets!'}
                  </div>
                ) : (
                  <div className="font-semibold text-rose-300">
                    {language === 'id' ? 'Gagal ekspor ke Google Sheets:' : 'Failed to export to Google Sheets:'} {sheetsExportError}
                  </div>
                )}
              </div>
            </div>
            {exportedSheetsUrl && (
              <div className="flex items-center gap-2">
                <a
                  href={exportedSheetsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all whitespace-nowrap"
                >
                  {language === 'id' ? 'Buka Google Sheets' : 'Open Google Sheets'}
                </a>
                <button
                  onClick={() => setExportedSheetsUrl(null)}
                  className="text-xs text-emerald-500/80 hover:text-emerald-500 font-bold px-2 py-1.5"
                >
                  {language === 'id' ? 'Tutup' : 'Dismiss'}
                </button>
              </div>
            )}
            {sheetsExportError && (
              <button
                onClick={() => setSheetsExportError(null)}
                className="text-xs text-rose-500/80 hover:text-rose-500 font-bold px-2 py-1.5"
              >
                {language === 'id' ? 'Mengerti' : 'Dismiss'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface-2 p-6 rounded-lg border border-hairline shadow-sm space-y-6">
              <div>
                <label className="text-eyebrow text-ink-subtle uppercase tracking-widest block mb-2 font-black">
                  {language === 'id' ? 'Pilihan Cepat Periode' : 'Quick Period Preset'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: language === 'id' ? 'Semua Waktu' : 'All Time' },
                    { id: 'week', label: language === 'id' ? 'Minggu Ini' : 'This Week' },
                    { id: 'month', label: language === 'id' ? 'Bulan Ini' : 'This Month' },
                    { id: 'year', label: language === 'id' ? 'Tahun Ini' : 'This Year' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleQuickFilter(preset.id as any)}
                      className={`px-3.5 py-1.5 rounded-pill text-[10px] font-black uppercase tracking-widest transition-all border ${
                        (preset.id === 'all' && !startDate && !endDate) ||
                        (preset.id === 'week' && startDate === getWeekStartDate() && endDate === getTodayDate()) ||
                        (preset.id === 'month' && startDate === getMonthStartDate() && endDate === getTodayDate()) ||
                        (preset.id === 'year' && startDate === getYearStartDate() && endDate === getTodayDate())
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-surface-1 border-hairline text-ink-subtle hover:text-ink hover:border-hairline-strong'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-hairline/40">
                <div>
                  <label className="text-eyebrow text-ink-subtle uppercase tracking-widest block mb-2 font-black">{t('startDate')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-11 bg-surface-1 border border-hairline rounded-md pl-10 pr-4 text-body-sm text-ink font-bold focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-eyebrow text-ink-subtle uppercase tracking-widest block mb-2 font-black">{t('endDate')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-11 bg-surface-1 border border-hairline rounded-md pl-10 pr-4 text-body-sm text-ink font-bold focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <label className="text-eyebrow text-ink-subtle uppercase tracking-widest block mb-2 font-black">{t('filterByCategory')}</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategories(prev => 
                            prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-pill text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
                          selectedCategories.includes(cat.id)
                            ? 'bg-accent text-white border-accent shadow-sm'
                            : 'bg-surface-1 border-hairline text-ink-tertiary hover:text-ink'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCategories.includes(cat.id) ? 'white' : cat.color }} />
                        {cat.name}
                      </button>
                    ))}
                    {selectedCategories.length > 0 && (
                      <button 
                        onClick={() => setSelectedCategories([])}
                        className="text-[10px] font-black text-danger uppercase tracking-widest hover:underline px-2"
                      >
                        {t('reset')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-hairline">
                <div className="flex items-center gap-3 bg-surface-1 p-1 rounded-pill border border-hairline shadow-sm overflow-x-auto no-scrollbar max-w-full">
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
                <button 
                  onClick={resetFilters}
                  className="px-6 h-10 text-eyebrow font-bold text-danger hover:bg-danger/5 rounded-md transition-all uppercase tracking-widest"
                >
                  {t('reset')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="bg-surface-1 p-4 sm:p-8 rounded-lg border border-hairline shadow-card transition-shadow hover:shadow-glow-accent/10"
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
          <div className="h-[260px] sm:h-[300px] w-full">
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
                  <Bar 
                    dataKey="income" 
                    name={t('income').toUpperCase()} 
                    fill="url(#colorIncome)" 
                    radius={[2, 2, 0, 0]} 
                    barSize={24} 
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                )}
                {!hiddenData.includes('expense') && (
                  <Bar 
                    dataKey="expense" 
                    name={t('expense').toUpperCase()} 
                    fill="url(#colorExpenseBar)" 
                    radius={[2, 2, 0, 0]} 
                    barSize={24} 
                    animationDuration={1500}
                    animationEasing="ease-out"
                    animationBegin={200}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          className="bg-surface-1 p-4 sm:p-8 rounded-lg border border-hairline shadow-card transition-shadow hover:shadow-glow-accent/10"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-heading-xs font-black flex items-center gap-3 text-ink uppercase tracking-tight">
              <PieChartIcon className="w-5 h-5 text-ink-subtle" />
              {t('netBalance')} Trend
            </h3>
          </div>
          <div className="h-[260px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netTrendData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-ink-tertiary)', fontSize: 10, fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  name="BALANCE" 
                  stroke="var(--color-accent)" 
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: 'var(--color-accent)', strokeWidth: 2, stroke: 'white' }} 
                  activeDot={{ r: 6 }} 
                  animationDuration={2000}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-surface-1 p-4 sm:p-8 rounded-lg border border-hairline shadow-card transition-shadow hover:shadow-glow-accent/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h3 className="text-heading-xs font-black flex items-center gap-3 text-ink uppercase tracking-tight">
                <PieChartIcon className="w-5 h-5 text-ink-tertiary" />
                {breakdownType === 'expense' ? t('expenseBreakdown') : t('incomeBreakdown')}
              </h3>
              <div className="flex bg-surface-2 p-1 rounded-md border border-hairline shrink-0">
                <button
                  type="button"
                  onClick={() => setBreakdownType('expense')}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${
                    breakdownType === 'expense'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-ink-tertiary hover:text-ink'
                  }`}
                >
                  {t('expense')}
                </button>
                <button
                  type="button"
                  onClick={() => setBreakdownType('income')}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${
                    breakdownType === 'income'
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-ink-tertiary hover:text-ink'
                  }`}
                >
                  {t('income')}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
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
                      animationBegin={400}
                      animationDuration={1200}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="lg:col-span-2 flex flex-wrap gap-2.5 content-start">
                {categoryData.length === 0 ? (
                  <div className="text-body-sm text-ink-tertiary italic">{t('noTransactions')}</div>
                ) : (
                  categoryData.map((item, idx) => (
                    <motion.button
                      key={item.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleCategory(item.name)}
                      className="px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all border bg-surface-1 border-hairline text-ink hover:border-accent flex items-center gap-2.5"
                    >
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color || COLORS[idx % COLORS.length] }} />
                      <span className="flex-1">{item.name}</span>
                      <span className="font-mono text-ink-tertiary ml-2 font-black">Rp {item.value.toLocaleString()}</span>
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-surface-1 p-4 sm:p-8 rounded-lg border border-hairline shadow-card transition-shadow hover:shadow-glow-accent/10"
          >
            <div className="flex items-center justify-between mb-8 flex-wrap">
              <h3 className="text-heading-xs font-black flex items-center gap-3 text-ink uppercase tracking-tight">
                <PieChartIcon className="w-5 h-5 text-accent" />
                {t('mainCategories').toUpperCase()}
              </h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={600}
                      animationDuration={1500}
                    >
                      {budgetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {budgetAllocation.map((item) => (
                  <motion.div 
                    key={item.name} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + budgetAllocation.indexOf(item) * 0.1 }}
                    className="flex justify-between items-center bg-surface-2 p-3 rounded-md border border-hairline"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[11px] font-black uppercase text-ink">{item.name.split(' (')[0]}</span>
                    </div>
                    <span className="text-body-sm font-black text-ink font-mono">{item.percent}%</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

      <AIFinanceAdvisor transactions={filteredTransactions} categories={categories} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4 }}
          className="bg-surface-1 p-4 sm:p-8 rounded-lg border border-hairline shadow-card relative overflow-hidden group transition-shadow hover:shadow-glow-accent/10"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-500" />
          <div className="text-eyebrow text-accent font-black uppercase tracking-widest mb-2 flex items-center gap-2">
            <TrendingUp size={14} />
            {t('totalSavings')}
          </div>
          <div className="text-heading-md font-black text-ink font-mono tracking-tighter">Rp {(totalIncome - totalExpense).toLocaleString()}</div>
          <div className="mt-4 text-eyebrow text-ink-tertiary lowercase font-bold">{t('netBalanceDesc')}</div>
        </motion.div>
        
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4 }}
          className="bg-surface-1 p-4 sm:p-8 rounded-lg border border-hairline shadow-card relative overflow-hidden group transition-shadow hover:shadow-glow-accent/10"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-danger/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-500" />
          <div className="text-eyebrow text-danger font-black uppercase tracking-widest mb-2 flex items-center gap-2">
            <Download size={14} className="rotate-180" />
            {t('burnRate')}
          </div>
          <div className="text-heading-md font-black text-ink font-mono tracking-tighter">Rp {Math.round(totalExpense / (chartData.length || 1)).toLocaleString()}</div>
          <div className="mt-4 text-eyebrow text-ink-tertiary lowercase font-bold font-black uppercase tracking-widest opacity-40">{t('burnRateDesc').replace('{period}', t(period))}</div>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4 }}
          className="bg-ink p-4 sm:p-8 rounded-lg border border-hairline shadow-card relative overflow-hidden group transition-shadow hover:shadow-glow-accent/10"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-surface-1/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-500" />
          <div className="text-eyebrow text-accent font-black uppercase tracking-widest mb-2 flex items-center gap-2">
            <Filter size={14} />
            {t('savingsRate')}
          </div>
          <div className="text-heading-md font-black text-white font-mono tracking-tighter">
            {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
          </div>
          <div className="mt-4 text-eyebrow text-ink-tertiary lowercase font-bold font-mono opacity-60">{t('savingsRateDesc')}</div>
        </motion.div>
      </div>

      <motion.div 
        variants={itemVariants}
        className="bg-surface-1 rounded-lg border border-hairline shadow-card overflow-hidden"
      >
        <div className="p-8 border-b border-hairline flex items-center justify-between bg-surface-1/50">
          <h3 className="text-heading-xs font-black flex items-center gap-3 text-ink uppercase tracking-tight">
            <TrendingUp className="w-5 h-5 text-ink-tertiary" />
            {t('transactionHistory')}
          </h3>
          {selectedCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest bg-surface-2 px-2.5 py-1 rounded-md border border-hairline">
                {filteredTransactions.length} Transactions
              </span>
            </div>
          )}
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-ink-tertiary italic text-body-sm">
                    {t('noTransactions')}
                  </td>
                </tr>
              ) : (
                [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx) => (
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
