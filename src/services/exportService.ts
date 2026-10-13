/**
 * Data Analyst Grade Export Service for LifeFlow
 * Designed for Microsoft Excel, Google Sheets, and Business Intelligence tools.
 * 
 * Features:
 * - RFC 4180 compliant CSV formatting with quote escaping
 * - UTF-8 Byte Order Mark (\uFEFF) to prevent encoding corruption in Excel
 * - Pure unformatted numeric values for direct formula compatibility (=SUM, =AVERAGE, Pivot Tables)
 * - Standard ISO 8601 timestamps (YYYY-MM-DD)
 * - Executive KPI Summary blocks
 * - Modular (domain-specific) & Consolidated Master Ledger export modes
 * - Direct Copy-as-TSV for 1-click paste into Google Sheets
 */

export interface ExportFilterOptions {
  period: 'today' | 'last_7_days' | 'this_month' | 'last_month' | 'last_30_days' | 'all_time' | 'custom';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  userName?: string;
}

/**
 * Escapes and wraps a cell value according to RFC 4180 rules.
 */
export function escapeCSVCell(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }
  if (typeof val === 'number') {
    return isFinite(val) ? String(val) : '0';
  }
  if (typeof val === 'boolean') {
    return val ? 'TRUE' : 'FALSE';
  }
  const str = String(val);
  // If contains double quotes, commas, newlines, wrap in quotes and escape inner quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Triggers a download of CSV content with UTF-8 BOM.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Prepend UTF-8 BOM so Microsoft Excel & Google Sheets parse special characters & accents correctly
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Converts CSV content into Tab-Separated Values (TSV) and copies to clipboard.
 * Allows instant, clean pasting into Google Sheets or Excel cells.
 */
export async function copyToClipboardTSV(csvContent: string): Promise<boolean> {
  try {
    const lines = csvContent.split('\n');
    const tsvLines = lines.map(line => {
      // Split preserving quoted tokens
      const matches: string[] = [];
      let current = '';
      let insideQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          matches.push(current);
          current = '';
          continue;
        }
        current += char;
      }
      matches.push(current);

      return matches
        .map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'))
        .join('\t');
    });

    const tsvText = tsvLines.join('\n');
    await navigator.clipboard.writeText(tsvText);
    return true;
  } catch (err) {
    console.error('Failed to copy TSV to clipboard:', err);
    return false;
  }
}

/**
 * Filters an item array by a date property within the specified date range.
 */
export function filterByDateRange<T extends Record<string, any>>(
  items: T[],
  dateField: keyof T,
  options: ExportFilterOptions
): T[] {
  if (!items || !items.length) return [];
  if (options.period === 'all_time') return items;

  const now = new Date();
  let start = new Date(0);
  let end = new Date(8640000000000000);

  const getLocalDateString = (d: Date) => d.toISOString().split('T')[0];

  if (options.period === 'today') {
    const todayStr = getLocalDateString(now);
    return items.filter(item => String(item[dateField]).startsWith(todayStr));
  } else if (options.period === 'last_7_days') {
    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    end = now;
  } else if (options.period === 'last_30_days') {
    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    end = now;
  } else if (options.period === 'this_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = now;
  } else if (options.period === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  } else if (options.period === 'custom' && options.startDate && options.endDate) {
    start = new Date(options.startDate + 'T00:00:00');
    end = new Date(options.endDate + 'T23:59:59');
  }

  const startStr = getLocalDateString(start);
  const endStr = getLocalDateString(end);

  return items.filter(item => {
    const itemDate = String(item[dateField] || '').split('T')[0];
    return itemDate >= startStr && itemDate <= endStr;
  });
}

/**
 * Builds standard metadata banner for Data Analyst spreadsheets.
 */
function buildMetadataBanner(title: string, userName: string, periodLabel: string): string[] {
  const now = new Date();
  const exportTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);
  return [
    `# ==============================================================================`,
    `# ${title.toUpperCase()}`,
    `# User Account: ${userName} | Period: ${periodLabel} | Exported: ${exportTimestamp} UTC`,
    `# Standard: RFC 4180 CSV | Numbers: Raw Numeric (Formula-Compatible)`,
    `# ==============================================================================`,
    ``
  ];
}

/**
 * Generates Financial Ledger CSV dataset
 */
export function generateFinancialLedgerCSV(
  transactions: any[],
  categoriesMap: Record<string, string>,
  options: ExportFilterOptions
): string {
  const filtered = filterByDateRange(transactions, 'date', options);
  const userName = options.userName || 'User';
  const periodLabel = options.period.replace(/_/g, ' ').toUpperCase();

  const lines = buildMetadataBanner('LifeFlow Financial Ledger', userName, periodLabel);

  // Headers
  const headers = ['transaction_id', 'date', 'type', 'category', 'amount_idr', 'description', 'notes'];
  lines.push(headers.map(escapeCSVCell).join(','));

  let totalIncome = 0;
  let totalExpense = 0;

  filtered.forEach((tx, idx) => {
    const id = tx.id || `TX-${String(idx + 1).padStart(4, '0')}`;
    const date = tx.date ? String(tx.date).split('T')[0] : '';
    const type = String(tx.type || 'expense').toUpperCase();
    const catName = categoriesMap[tx.category] || tx.category || 'Uncategorized';
    const amount = Number(tx.amount) || 0;
    const desc = tx.description || '';
    const notes = tx.notes || '';

    if (type === 'INCOME') totalIncome += amount;
    else totalExpense += amount;

    lines.push([
      escapeCSVCell(id),
      escapeCSVCell(date),
      escapeCSVCell(type),
      escapeCSVCell(catName),
      escapeCSVCell(amount),
      escapeCSVCell(desc),
      escapeCSVCell(notes)
    ].join(','));
  });

  // Summary aggregation rows at the bottom
  lines.push('');
  lines.push([
    escapeCSVCell('AGGREGATE_TOTAL_INCOME'),
    escapeCSVCell(''),
    escapeCSVCell('INCOME'),
    escapeCSVCell('TOTAL_INCOME_SUM'),
    escapeCSVCell(totalIncome),
    escapeCSVCell(`Total ${filtered.filter(t => (t.type || '').toUpperCase() === 'INCOME').length} pemasukan`),
    escapeCSVCell('Formula: =SUMIF(C2:C' + (filtered.length + 1) + ',"INCOME",E2:E' + (filtered.length + 1) + ')')
  ].join(','));

  lines.push([
    escapeCSVCell('AGGREGATE_TOTAL_EXPENSE'),
    escapeCSVCell(''),
    escapeCSVCell('EXPENSE'),
    escapeCSVCell('TOTAL_EXPENSE_SUM'),
    escapeCSVCell(totalExpense),
    escapeCSVCell(`Total ${filtered.filter(t => (t.type || '').toUpperCase() === 'EXPENSE').length} pengeluaran`),
    escapeCSVCell('Formula: =SUMIF(C2:C' + (filtered.length + 1) + ',"EXPENSE",E2:E' + (filtered.length + 1) + ')')
  ].join(','));

  lines.push([
    escapeCSVCell('AGGREGATE_NET_CASHFLOW'),
    escapeCSVCell(''),
    escapeCSVCell('NET'),
    escapeCSVCell('NET_SURPLUS_DEFICIT'),
    escapeCSVCell(totalIncome - totalExpense),
    escapeCSVCell('Arus kas bersih periode ini'),
    escapeCSVCell('Formula: =E' + (filtered.length + 3) + '-E' + (filtered.length + 4))
  ].join(','));

  return lines.join('\n');
}

/**
 * Generates Habit Tracking & Consistency CSV dataset
 */
export function generateHabitsConsistencyCSV(
  habits: any[],
  habitLogs: any[],
  options: ExportFilterOptions
): string {
  const userName = options.userName || 'User';
  const periodLabel = options.period.replace(/_/g, ' ').toUpperCase();

  const lines = buildMetadataBanner('LifeFlow Habit Tracker & Consistency Ledger', userName, periodLabel);

  const headers = [
    'habit_id',
    'habit_title',
    'category',
    'frequency',
    'target_count',
    'current_streak',
    'total_completions',
    'period_logged_completions',
    'consistency_score_pct',
    'status'
  ];
  lines.push(headers.map(escapeCSVCell).join(','));

  const filteredLogs = filterByDateRange(habitLogs, 'date', options);

  (habits || []).forEach((habit, idx) => {
    const id = habit.id || `HB-${String(idx + 1).padStart(4, '0')}`;
    const title = habit.title || 'Untitled Habit';
    const category = habit.category || 'General';
    const frequency = habit.frequency || 'daily';
    const targetCount = Number(habit.targetCount) || 1;
    const currentStreak = Number(habit.currentStreak) || 0;
    const totalCompletions = Number(habit.totalCompletions) || 0;

    const periodLogs = filteredLogs.filter(l => l.habitId === habit.id && l.completed);
    const periodCompletions = periodLogs.length;

    // Approximate score based on streak & target
    const consistencyScore = Math.min(100, Math.round((currentStreak / 30) * 100));
    const status = currentStreak >= 7 ? 'HIGH_MOMENTUM' : currentStreak > 0 ? 'ACTIVE' : 'NEEDS_FOCUS';

    lines.push([
      escapeCSVCell(id),
      escapeCSVCell(title),
      escapeCSVCell(category),
      escapeCSVCell(frequency),
      escapeCSVCell(targetCount),
      escapeCSVCell(currentStreak),
      escapeCSVCell(totalCompletions),
      escapeCSVCell(periodCompletions),
      escapeCSVCell(consistencyScore),
      escapeCSVCell(status)
    ].join(','));
  });

  return lines.join('\n');
}

/**
 * Generates Daily Tasks & Productivity Schedule CSV dataset
 */
export function generateTasksScheduleCSV(
  tasks: any[],
  options: ExportFilterOptions
): string {
  const filtered = filterByDateRange(tasks, 'date', options);
  const userName = options.userName || 'User';
  const periodLabel = options.period.replace(/_/g, ' ').toUpperCase();

  const lines = buildMetadataBanner('LifeFlow Daily Tasks & Schedule Ledger', userName, periodLabel);

  const headers = [
    'task_id',
    'date',
    'start_time',
    'end_time',
    'duration_minutes',
    'activity_title',
    'field_category',
    'challenge_focus',
    'target_progress_pct',
    'status'
  ];
  lines.push(headers.map(escapeCSVCell).join(','));

  filtered.forEach((task, idx) => {
    const id = task.id || `TK-${String(idx + 1).padStart(4, '0')}`;
    const date = task.date ? String(task.date).split('T')[0] : '';
    const startTime = task.startTime || '00:00';
    const endTime = task.endTime || '00:00';

    // Calculate duration in minutes if possible
    let durationMinutes = 0;
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(eh)) {
        durationMinutes = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
        if (durationMinutes < 0) durationMinutes += 24 * 60; // Overnight
      }
    } catch {
      durationMinutes = 0;
    }

    const title = task.title || task.activity || 'Activity';
    const field = task.fieldToStudy || task.category || 'General';
    const challenge = task.challenge || '';
    const targetProgress = Number(task.targetPercentage || task.targetProgress) || (task.completed ? 100 : 0);
    const status = task.completed ? 'COMPLETED' : 'PENDING';

    lines.push([
      escapeCSVCell(id),
      escapeCSVCell(date),
      escapeCSVCell(startTime),
      escapeCSVCell(endTime),
      escapeCSVCell(durationMinutes),
      escapeCSVCell(title),
      escapeCSVCell(field),
      escapeCSVCell(challenge),
      escapeCSVCell(targetProgress),
      escapeCSVCell(status)
    ].join(','));
  });

  return lines.join('\n');
}

/**
 * Builds Consolidated Master Report CSV combining KPI summary, finances, habits, and tasks.
 */
export function buildConsolidatedMasterCSV(params: {
  transactions: any[];
  categoriesMap: Record<string, string>;
  habits: any[];
  habitLogs: any[];
  tasks: any[];
  targets: any[];
  options: ExportFilterOptions;
}): string {
  const { transactions, categoriesMap, habits, habitLogs, tasks, targets, options } = params;
  const userName = options.userName || 'User';
  const periodLabel = options.period.replace(/_/g, ' ').toUpperCase();

  const filteredTx = filterByDateRange(transactions, 'date', options);
  const filteredTasks = filterByDateRange(tasks, 'date', options);
  const filteredLogs = filterByDateRange(habitLogs, 'date', options);

  let totalIncome = 0;
  let totalExpense = 0;
  filteredTx.forEach(tx => {
    const amt = Number(tx.amount) || 0;
    if (String(tx.type || '').toUpperCase() === 'INCOME') totalIncome += amt;
    else totalExpense += amt;
  });

  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Number(((netCashflow / totalIncome) * 100).toFixed(1)) : 0;
  const completedTasks = filteredTasks.filter(t => t.completed).length;
  const taskCompletionRate = filteredTasks.length > 0
    ? Number(((completedTasks / filteredTasks.length) * 100).toFixed(1))
    : 0;

  const totalStreakSum = habits.reduce((acc, h) => acc + (Number(h.currentStreak) || 0), 0);
  const avgHabitStreak = habits.length > 0 ? Number((totalStreakSum / habits.length).toFixed(1)) : 0;

  const lines = buildMetadataBanner('LifeFlow Executive Master Data Ledger', userName, periodLabel);

  // SECTION 1: KPI SUMMARY
  lines.push(`[SECTION: EXECUTIVE_KPI_SUMMARY]`);
  lines.push(['metric_code', 'metric_name', 'metric_value', 'unit', 'notes'].map(escapeCSVCell).join(','));
  lines.push([escapeCSVCell('KPI_INCOME'), escapeCSVCell('Total Pemasukan'), escapeCSVCell(totalIncome), escapeCSVCell('IDR'), escapeCSVCell('Total pendapatan periode')].join(','));
  lines.push([escapeCSVCell('KPI_EXPENSE'), escapeCSVCell('Total Pengeluaran'), escapeCSVCell(totalExpense), escapeCSVCell('IDR'), escapeCSVCell('Total biaya operasional')].join(','));
  lines.push([escapeCSVCell('KPI_NET_CASHFLOW'), escapeCSVCell('Arus Kas Bersih'), escapeCSVCell(netCashflow), escapeCSVCell('IDR'), escapeCSVCell('Surplus / Defisit')].join(','));
  lines.push([escapeCSVCell('KPI_SAVINGS_RATE'), escapeCSVCell('Rasio Tabungan'), escapeCSVCell(savingsRate), escapeCSVCell('PERCENT'), escapeCSVCell('Persentase sisa tabungan')].join(','));
  lines.push([escapeCSVCell('KPI_HABIT_STREAK_AVG'), escapeCSVCell('Rata-rata Streak Kebiasaan'), escapeCSVCell(avgHabitStreak), escapeCSVCell('DAYS'), escapeCSVCell('Konsistensi kebiasaan')].join(','));
  lines.push([escapeCSVCell('KPI_TASK_COMPLETION'), escapeCSVCell('Tingkat Penyelesaian Tugas'), escapeCSVCell(taskCompletionRate), escapeCSVCell('PERCENT'), escapeCSVCell(`${completedTasks} dari ${filteredTasks.length} tugas`)].join(','));
  lines.push('');

  // SECTION 2: FINANCIAL TRANSACTIONS
  lines.push(`[SECTION: FINANCIAL_TRANSACTIONS]`);
  lines.push(['transaction_id', 'date', 'type', 'category', 'amount_idr', 'description', 'notes'].map(escapeCSVCell).join(','));
  filteredTx.forEach((tx, idx) => {
    lines.push([
      escapeCSVCell(tx.id || `TX-${idx + 1}`),
      escapeCSVCell(tx.date ? String(tx.date).split('T')[0] : ''),
      escapeCSVCell(String(tx.type || 'expense').toUpperCase()),
      escapeCSVCell(categoriesMap[tx.category] || tx.category || 'Uncategorized'),
      escapeCSVCell(Number(tx.amount) || 0),
      escapeCSVCell(tx.description || ''),
      escapeCSVCell(tx.notes || '')
    ].join(','));
  });
  lines.push('');

  // SECTION 3: HABITS
  lines.push(`[SECTION: HABIT_TRACKER_LOGS]`);
  lines.push(['habit_id', 'habit_title', 'frequency', 'current_streak', 'total_completions', 'status'].map(escapeCSVCell).join(','));
  habits.forEach((habit, idx) => {
    lines.push([
      escapeCSVCell(habit.id || `HB-${idx + 1}`),
      escapeCSVCell(habit.title || ''),
      escapeCSVCell(habit.frequency || 'daily'),
      escapeCSVCell(Number(habit.currentStreak) || 0),
      escapeCSVCell(Number(habit.totalCompletions) || 0),
      escapeCSVCell(habit.currentStreak >= 7 ? 'CONSISTENT' : 'IN_PROGRESS')
    ].join(','));
  });
  lines.push('');

  // SECTION 4: TASKS
  lines.push(`[SECTION: DAILY_TASKS_SCHEDULE]`);
  lines.push(['task_id', 'date', 'start_time', 'end_time', 'title', 'field_category', 'status'].map(escapeCSVCell).join(','));
  filteredTasks.forEach((task, idx) => {
    lines.push([
      escapeCSVCell(task.id || `TK-${idx + 1}`),
      escapeCSVCell(task.date ? String(task.date).split('T')[0] : ''),
      escapeCSVCell(task.startTime || ''),
      escapeCSVCell(task.endTime || ''),
      escapeCSVCell(task.title || task.activity || ''),
      escapeCSVCell(task.fieldToStudy || task.category || 'General'),
      escapeCSVCell(task.completed ? 'COMPLETED' : 'PENDING')
    ].join(','));
  });

  return lines.join('\n');
}

/**
 * Backward-compatible utilities
 */
export const exportToCSV = (data: any[], filename: string, headers: string[], metadata?: string[]) => {
  if (!data || !data.length) return;

  const csvRows: string[] = [];
  if (metadata && metadata.length > 0) {
    metadata.forEach(meta => {
      csvRows.push(escapeCSVCell(meta));
    });
    csvRows.push('');
  }

  csvRows.push(headers.map(escapeCSVCell).join(','));

  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header.toLowerCase()];
      if (val === undefined || val === null) {
        val = row[header];
      }
      return escapeCSVCell(val ?? '');
    });
    csvRows.push(values.join(','));
  }

  downloadCSV(csvRows.join('\n'), filename);
};

export const exportTransactions = (
  transactions: any[],
  userName: string = 'User',
  getCategoryName: (id: string) => string = id => id,
  t: any = (k: string) => k
) => {
  const catMap: Record<string, string> = {};
  transactions.forEach(tx => {
    if (tx.category) catMap[tx.category] = getCategoryName(tx.category);
  });
  const csv = generateFinancialLedgerCSV(transactions, catMap, {
    period: 'all_time',
    userName
  });
  const today = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `lifeflow_financial_ledger_${today}`);
};

export const exportTasks = (
  tasks: any[],
  userName: string = 'User',
  t: any = (k: string) => k
) => {
  const csv = generateTasksScheduleCSV(tasks, {
    period: 'all_time',
    userName
  });
  const today = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `lifeflow_tasks_schedule_${today}`);
};
