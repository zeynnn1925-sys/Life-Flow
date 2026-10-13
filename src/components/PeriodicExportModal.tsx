import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  X,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle2,
  Table
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ExportFilterOptions,
  downloadCSV,
  copyToClipboardTSV,
  generateFinancialLedgerCSV,
  generateHabitsConsistencyCSV,
  generateTasksScheduleCSV,
  buildConsolidatedMasterCSV,
  filterByDateRange
} from '../services/exportService';

interface PeriodicExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModule?: 'master' | 'finance' | 'habits' | 'tasks';
}

export function PeriodicExportModal({ isOpen, onClose, defaultModule = 'master' }: PeriodicExportModalProps) {
  const { transactions, categories, habits, habitLogs, tasks, targets } = useData();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [period, setPeriod] = useState<ExportFilterOptions['period']>('this_month');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedModule, setSelectedModule] = useState<'master' | 'finance' | 'habits' | 'tasks'>(defaultModule);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Map of category ID to category name
  const categoriesMap = useMemo(() => {
    const map: Record<string, string> = {};
    (categories || []).forEach(c => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const filterOptions: ExportFilterOptions = useMemo(() => ({
    period,
    startDate,
    endDate,
    userName: user?.displayName || user?.email || 'LifeFlow User'
  }), [period, startDate, endDate, user]);

  // Filtered counts and metrics for live preview
  const filteredTransactions = useMemo(() => {
    return filterByDateRange(transactions || [], 'date', filterOptions);
  }, [transactions, filterOptions]);

  const filteredTasks = useMemo(() => {
    return filterByDateRange(tasks || [], 'date', filterOptions);
  }, [tasks, filterOptions]);

  const financialSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (String(t.type || '').toUpperCase() === 'INCOME') income += amt;
      else expense += amt;
    });
    return {
      income,
      expense,
      net: income - expense
    };
  }, [filteredTransactions]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    let csvData = '';
    let filename = '';

    if (selectedModule === 'finance') {
      csvData = generateFinancialLedgerCSV(transactions, categoriesMap, filterOptions);
      filename = `lifeflow_financial_ledger_${period}_${timestamp}.csv`;
    } else if (selectedModule === 'habits') {
      csvData = generateHabitsConsistencyCSV(habits, habitLogs, filterOptions);
      filename = `lifeflow_habits_consistency_${period}_${timestamp}.csv`;
    } else if (selectedModule === 'tasks') {
      csvData = generateTasksScheduleCSV(tasks, filterOptions);
      filename = `lifeflow_tasks_schedule_${period}_${timestamp}.csv`;
    } else {
      csvData = buildConsolidatedMasterCSV({
        transactions,
        categoriesMap,
        habits,
        habitLogs,
        tasks,
        targets,
        options: filterOptions
      });
      filename = `lifeflow_master_report_${period}_${timestamp}.csv`;
    }

    downloadCSV(csvData, filename);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleCopyTSV = async () => {
    let csvData = '';
    if (selectedModule === 'finance') {
      csvData = generateFinancialLedgerCSV(transactions, categoriesMap, filterOptions);
    } else if (selectedModule === 'habits') {
      csvData = generateHabitsConsistencyCSV(habits, habitLogs, filterOptions);
    } else if (selectedModule === 'tasks') {
      csvData = generateTasksScheduleCSV(tasks, filterOptions);
    } else {
      csvData = buildConsolidatedMasterCSV({
        transactions,
        categoriesMap,
        habits,
        habitLogs,
        tasks,
        targets,
        options: filterOptions
      });
    }

    const ok = await copyToClipboardTSV(csvData);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                {language === 'id' ? 'Ekspor Spreadsheet Berkala' : 'Periodic Spreadsheet Export'}
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Data-Analyst Ready
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {language === 'id' 
                  ? 'Format tabel presisi, formula-ready (=SUM), dan bersih untuk Excel & Google Sheets'
                  : 'Precision table format, formula-ready (=SUM), and clean for Excel & Google Sheets'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-left">
          {/* 1. Periode Filter */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              {language === 'id' ? '1. Pilih Rentang Periode' : '1. Select Period Range'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'this_month', labelId: 'Bulan Ini', labelEn: 'This Month' },
                { id: 'last_30_days', labelId: '30 Hari Terakhir', labelEn: 'Last 30 Days' },
                { id: 'last_month', labelId: 'Bulan Lalu', labelEn: 'Last Month' },
                { id: 'last_7_days', labelId: '7 Hari Terakhir', labelEn: 'Last 7 Days' },
                { id: 'all_time', labelId: 'Semua Waktu', labelEn: 'All Time' },
                { id: 'custom', labelId: 'Rentang Kustom', labelEn: 'Custom Range' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPeriod(opt.id as any)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-left flex items-center justify-between ${
                    period === opt.id
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                      : 'bg-white/[0.02] border-white/5 text-neutral-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{language === 'id' ? opt.labelId : opt.labelEn}</span>
                  {period === opt.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>

            {/* Custom Date Picker inputs */}
            {period === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    {language === 'id' ? 'Tanggal Mulai' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    {language === 'id' ? 'Tanggal Selesai' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Dataset Selection */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-neutral-400" />
              {language === 'id' ? '2. Pilih Format Dataset' : '2. Select Dataset Module'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'master',
                  titleId: 'Master Ledger Konsolidasi',
                  titleEn: 'Consolidated Master Ledger',
                  descId: 'Lengkap: KPI Eksekutif + Finansial + Kebiasaan + Tugas',
                  descEn: 'Full: Executive KPI + Financial + Habits + Tasks',
                  icon: Sparkles
                },
                {
                  id: 'finance',
                  titleId: 'Buku Kas Finansial Saja',
                  titleEn: 'Financial Ledger Only',
                  descId: 'Semua transaksi, kategori, dan baris total aggregat',
                  descEn: 'All transactions, categories, and total aggregate rows',
                  icon: TrendingUp
                },
                {
                  id: 'habits',
                  titleId: 'Pelacak & Log Kebiasaan',
                  titleEn: 'Habit Tracker & Logs',
                  descId: 'Streak harian, target frekuensi, dan skor konsistensi %',
                  descEn: 'Daily streaks, frequency goals, and consistency scores',
                  icon: Activity
                },
                {
                  id: 'tasks',
                  titleId: 'Jadwal & Tugas Harian',
                  titleEn: 'Daily Tasks & Schedule',
                  descId: 'Waktu mulai/selesai, durasi menit murni, dan status',
                  descEn: 'Start/end times, pure minute durations, and status',
                  icon: CheckCircle2
                }
              ].map(mod => {
                const Icon = mod.icon;
                const isSelected = selectedModule === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setSelectedModule(mod.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-white/[0.02] border-white/5 text-neutral-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-neutral-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold flex items-center justify-between">
                          <span>{language === 'id' ? mod.titleId : mod.titleEn}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                          {language === 'id' ? mod.descId : mod.descEn}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Live Data Preview & Data Quality Block */}
          <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'id' ? 'Pratinjau Integritas Data' : 'Live Data Health Preview'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                UTF-8 BOM · RFC 4180 Escaped
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[11px] text-neutral-400">{language === 'id' ? 'Transaksi' : 'Transactions'}</div>
                <div className="text-base font-semibold font-mono tabular-nums text-white mt-0.5">
                  {filteredTransactions.length}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[11px] text-neutral-400">{language === 'id' ? 'Kebiasaan' : 'Habits'}</div>
                <div className="text-base font-semibold font-mono tabular-nums text-white mt-0.5">
                  {(habits || []).length}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <div className="text-[11px] text-neutral-400">{language === 'id' ? 'Tugas Terjadwal' : 'Tasks'}</div>
                <div className="text-base font-semibold font-mono tabular-nums text-white mt-0.5">
                  {filteredTasks.length}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">
                {language === 'id' ? 'Arus Kas Periode:' : 'Period Net Cashflow:'}
              </span>
              <span className={`font-semibold tabular-nums ${financialSummary.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Rp {financialSummary.net.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/5 bg-[#181818] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 self-start sm:self-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              {language === 'id' 
                ? 'Kolom angka murni siap formula (=SUM, =AVERAGE)' 
                : 'Pure numeric columns ready for Excel formulas'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyTSV}
              className="py-2.5 px-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-2 transition-all active:scale-95"
              title="Salin data dalam format TSV untuk paste langsung ke Google Sheets"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-400" />}
              <span>{copied ? (language === 'id' ? 'Tersalin ke Clipboard!' : 'Copied to Clipboard!') : (language === 'id' ? 'Salin TSV (Google Sheets)' : 'Copy TSV')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              style={{ backgroundColor: '#ff0051' }}
              className="py-2.5 px-4 rounded-xl text-white text-xs font-semibold flex items-center gap-2 transition-all hover:brightness-110 active:scale-95 shadow-lg shadow-[#ff0051]/20"
            >
              {downloadSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{downloadSuccess ? (language === 'id' ? 'Berhasil Diunduh!' : 'Downloaded!') : (language === 'id' ? 'Unduh Spreadsheet (.CSV)' : 'Download CSV')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default PeriodicExportModal;
