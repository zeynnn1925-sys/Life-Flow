import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ---------- Shared helpers ----------

const BRAND = {
  name: 'LifeFlow',
  accent: [212, 165, 116] as [number, number, number], // amber color
  ink: [30, 30, 30] as [number, number, number],
  gray: [140, 140, 140] as [number, number, number],
};

function formatCurrency(n: number): string {
  return 'Rp' + n.toLocaleString('id-ID');
}

function formatDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

function drawHeader(doc: jsPDF, title: string, subtitle: string, periodLabel: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Brand name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...BRAND.ink);
  doc.text(BRAND.name, 20, 22);

  // Accent underline
  doc.setDrawColor(...BRAND.accent);
  doc.setLineWidth(1.2);
  doc.line(20, 26, 55, 26);

  // Report title (top right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...BRAND.ink);
  doc.text(title.toUpperCase(), pageWidth - 20, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.gray);
  doc.text(subtitle, pageWidth - 20, 27, { align: 'right' });
  doc.text(periodLabel, pageWidth - 20, 33, { align: 'right' });

  // Divider line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.4);
  doc.line(20, 40, pageWidth - 20, 40);
}

function drawFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.gray);
    doc.text(
      `Dibuat otomatis oleh ${BRAND.name} · ${formatDate(new Date())}`,
      20,
      pageHeight - 10
    );
    doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  }
}

// ---------- FINANCE REPORT ----------

interface FinanceReportTransaction {
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
}

interface FinanceReportOptions {
  transactions: FinanceReportTransaction[];
  periodLabel: string;
}

export function generateFinanceReport({ transactions, periodLabel }: FinanceReportOptions) {
  const doc = new jsPDF();

  drawHeader(doc, 'Laporan Keuangan', 'Ringkasan pemasukan & pengeluaran', periodLabel);

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpense;

  // Summary cards
  const cardY = 48;
  const cardWidth = 56;
  const cardGap = 6;
  const summaries = [
    { label: 'Pemasukan', value: totalIncome, color: [16, 185, 129] as [number, number, number] },
    { label: 'Pengeluaran', value: totalExpense, color: [239, 68, 68] as [number, number, number] },
    { label: 'Saldo Bersih', value: net, color: BRAND.ink },
  ];

  summaries.forEach((s, i) => {
    const x = 20 + i * (cardWidth + cardGap);
    doc.setDrawColor(235, 235, 235);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(x, cardY, cardWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.gray);
    doc.text(s.label.toUpperCase(), x + 4, cardY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...s.color);
    doc.text(formatCurrency(s.value), x + 4, cardY + 16);
  });

  // Table
  autoTable(doc, {
    startY: cardY + 32,
    head: [['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah']],
    body: transactions.map((t) => [
      formatDate(t.date),
      t.description,
      t.category,
      t.type === 'income' ? 'Masuk' : 'Keluar',
      (t.type === 'income' ? '+' : '-') + formatCurrency(t.amount),
    ]),
    headStyles: {
      fillColor: BRAND.ink,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: BRAND.ink },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 20, right: 20 },
  });

  // Breakdown per category
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  const categoryTotals: Record<string, number> = {};
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  if (Object.keys(categoryTotals).length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.ink);
    doc.text('Breakdown Pengeluaran per Kategori', 20, finalY);

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Kategori', 'Total', '% dari Pengeluaran']],
      body: Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, val]) => [
          cat,
          formatCurrency(val),
          totalExpense > 0 ? `${Math.round((val / totalExpense) * 100)}%` : '0%',
        ]),
      headStyles: { fillColor: [245, 245, 245], textColor: BRAND.ink, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: BRAND.ink },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      margin: { left: 20, right: 20 },
    });
  }

  drawFooter(doc);
  return doc;
}

// ---------- PRODUCTIVITY REPORT ----------

interface ProductivityReportHabit {
  title: string;
  category: string;
  currentStreak: number;
  totalCompletions: number;
}

interface ProductivityReportTarget {
  title: string;
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  streak?: number;
}

interface ProductivityReportOptions {
  habits: ProductivityReportHabit[];
  targets: ProductivityReportTarget[];
  periodLabel: string;
}

export function generateProductivityReport({ habits, targets, periodLabel }: ProductivityReportOptions) {
  const doc = new jsPDF();

  drawHeader(doc, 'Laporan Produktivitas', 'Ringkasan habit & target', periodLabel);

  const totalHabits = habits.length;
  const avgStreak = totalHabits > 0
    ? Math.round(habits.reduce((s, h) => s + h.currentStreak, 0) / totalHabits)
    : 0;
  const targetsCompleted = targets.filter((t) => t.currentValue >= t.targetValue).length;

  const cardY = 48;
  const cardWidth = 56;
  const cardGap = 6;
  const summaries = [
    { label: 'Total Habit Aktif', value: `${totalHabits}`, color: BRAND.ink },
    { label: 'Rata-rata Streak', value: `${avgStreak} hari`, color: [212, 165, 116] as [number, number, number] },
    { label: 'Target Kelar', value: `${targetsCompleted}/${targets.length}`, color: [16, 185, 129] as [number, number, number] },
  ];

  summaries.forEach((s, i) => {
    const x = 20 + i * (cardWidth + cardGap);
    doc.setDrawColor(235, 235, 235);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(x, cardY, cardWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.gray);
    doc.text(s.label.toUpperCase(), x + 4, cardY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...s.color);
    doc.text(s.value, x + 4, cardY + 16);
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.ink);
  doc.text('Ringkasan Habit', 20, cardY + 32);

  autoTable(doc, {
    startY: cardY + 36,
    head: [['Habit', 'Kategori', 'Streak Saat Ini', 'Total Selesai']],
    body: habits.map((h) => [h.title, h.category, `${h.currentStreak} hari`, `${h.totalCompletions}x`]),
    headStyles: { fillColor: BRAND.ink, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: BRAND.ink },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
    margin: { left: 20, right: 20 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND.ink);
  doc.text('Ringkasan Target', 20, finalY);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Target', 'Kategori', 'Progress', 'Status']],
    body: targets.map((t) => [
      t.title,
      t.category,
      `${t.currentValue}/${t.targetValue} ${t.unit}`,
      t.currentValue >= t.targetValue ? 'Selesai' : 'Berjalan',
    ]),
    headStyles: { fillColor: [245, 245, 245], textColor: BRAND.ink, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: BRAND.ink },
    columnStyles: { 2: { halign: 'right' } },
    margin: { left: 20, right: 20 },
  });

  drawFooter(doc);
  return doc;
}

// ---------- Export helper ----------

export function downloadReport(doc: jsPDF, filename: string) {
  doc.save(filename);
}
