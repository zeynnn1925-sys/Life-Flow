import React, { useMemo } from 'react';
import { ChevronRight, ArrowUpRight, ShoppingBag, PieChart } from 'lucide-react';
import { Transaction, Category, View } from '../../types';
import { CATEGORY_ICON_MAP } from '../../utils/categoryIcons';

interface TopSpendingCategoriesProps {
  transactions: Transaction[];
  categories: Category[];
  currentMonthStr: string;
  language: string;
  formatCurrency: (val: number) => string;
  setActiveView: (view: View) => void;
  maxItems?: number;
}

export interface SpendingCategorySummary {
  id: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
  count: number;
  percentage: number;
}

export const TopSpendingCategories: React.FC<TopSpendingCategoriesProps> = ({
  transactions,
  categories,
  currentMonthStr,
  language,
  formatCurrency,
  setActiveView,
  maxItems = 4
}) => {
  const isId = language === 'id';

  // Format month name for display (e.g., "Oktober 2026")
  const monthName = useMemo(() => {
    try {
      const [year, month] = currentMonthStr.split('-');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return date.toLocaleDateString(isId ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });
    } catch {
      return currentMonthStr;
    }
  }, [currentMonthStr, isId]);

  // Aggregate expenses for current month by category
  const { topCategories, totalExpense, otherCategoriesAmount, otherCategoriesCount } = useMemo(() => {
    const monthExpenses = (transactions || []).filter(
      (t) => t && t.type === 'expense' && typeof t.date === 'string' && t.date.slice(0, 7) === currentMonthStr
    );

    const total = monthExpenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const categoryAggMap = new Map<string, {
      id: string;
      name: string;
      icon: string;
      color: string;
      amount: number;
      count: number;
    }>();

    monthExpenses.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (amt <= 0) return;

      const rawCat = t.category || '';
      const matchedCat = categories.find(
        (c) => c && (c.id === rawCat || c.name.toLowerCase() === rawCat.toLowerCase())
      );

      const catKey = matchedCat ? matchedCat.id : (rawCat || 'uncategorized');
      const catName = matchedCat ? matchedCat.name : (rawCat || (isId ? 'Lainnya' : 'Other'));
      const catIcon = matchedCat ? matchedCat.icon : 'ShoppingBag';
      const catColor = matchedCat?.color || '#f97316';

      if (!categoryAggMap.has(catKey)) {
        categoryAggMap.set(catKey, {
          id: catKey,
          name: catName,
          icon: catIcon,
          color: catColor,
          amount: amt,
          count: 1
        });
      } else {
        const existing = categoryAggMap.get(catKey)!;
        existing.amount += amt;
        existing.count += 1;
      }
    });

    const sortedList: SpendingCategorySummary[] = Array.from(categoryAggMap.values())
      .sort((a, b) => b.amount - a.amount)
      .map((item) => ({
        ...item,
        percentage: total > 0 ? Math.round((item.amount / total) * 100) : 0
      }));

    const top = sortedList.slice(0, maxItems);
    const rest = sortedList.slice(maxItems);
    const restAmount = rest.reduce((sum, item) => sum + item.amount, 0);
    const restCount = rest.length;

    return {
      topCategories: top,
      totalExpense: total,
      otherCategoriesAmount: restAmount,
      otherCategoriesCount: restCount
    };
  }, [transactions, categories, currentMonthStr, isId, maxItems]);

  // Financial awareness insight message
  const awarenessInsight = useMemo(() => {
    if (topCategories.length === 0 || totalExpense === 0) {
      return null;
    }

    const primary = topCategories[0];
    if (primary.percentage >= 50) {
      return isId
        ? `⚠️ Lebih dari separuh (${primary.percentage}%) pengeluaran bulan ini dialokasikan untuk ${primary.name}.`
        : `⚠️ Over half (${primary.percentage}%) of this month's spending went to ${primary.name}.`;
    }

    if (primary.percentage >= 35) {
      return isId
        ? `💡 Pengeluaran terbesar bulan ini terpusat pada ${primary.name} (${primary.percentage}% dari total pengeluaran).`
        : `💡 Your top spending category is ${primary.name} at ${primary.percentage}% of all expenses.`;
    }

    if (topCategories.length >= 2) {
      const secondary = topCategories[1];
      const combined = primary.percentage + secondary.percentage;
      return isId
        ? `💡 ${primary.name} dan ${secondary.name} mencakup ${combined}% dari total pengeluaran ${monthName}.`
        : `💡 ${primary.name} & ${secondary.name} make up ${combined}% of all spending for ${monthName}.`;
    }

    return isId
      ? `💡 Total ${topCategories.length} kategori pengeluaran aktif bulan ${monthName}.`
      : `💡 Total ${topCategories.length} active spending category for ${monthName}.`;
  }, [topCategories, totalExpense, isId, monthName]);

  // Empty state when no expenses in current month
  if (topCategories.length === 0 || totalExpense === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-white/[0.02] border border-white/5 text-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
          <PieChart size={16} />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-zinc-300">
            {isId ? `Belum ada pengeluaran di ${monthName}` : `No expenses recorded for ${monthName}`}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            {isId ? 'Catat pengeluaran untuk melihat ringkasan kategori.' : 'Log expenses to see category breakdown.'}
          </p>
        </div>
        <button
          onClick={() => setActiveView('finance')}
          className="mt-1 text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>{isId ? '+ Tambah Transaksi' : '+ Add Transaction'}</span>
          <ArrowUpRight size={11} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Category Proportional Distribution Bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
          <span className="uppercase font-semibold tracking-wider">
            {isId ? 'Distribusi Pengeluaran' : 'Spending Distribution'}
          </span>
          <span className="text-zinc-500">
            {topCategories.length} {isId ? 'kategori' : 'categories'}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-white/5 gap-0.5">
          {topCategories.map((cat) => {
            const widthPct = Math.max(cat.percentage, 3);
            return (
              <div
                key={cat.id}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: cat.color || '#f97316'
                }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                title={`${cat.name}: ${formatCurrency(cat.amount)} (${cat.percentage}%)`}
              />
            );
          })}
          {otherCategoriesAmount > 0 && (
            <div
              style={{
                width: `${Math.max(Math.round((otherCategoriesAmount / totalExpense) * 100), 3)}%`,
                backgroundColor: '#71717a'
              }}
              className="h-full last:rounded-r-full"
              title={`${isId ? 'Lainnya' : 'Other'}: ${formatCurrency(otherCategoriesAmount)}`}
            />
          )}
        </div>
      </div>

      {/* Top Categories List */}
      <div className="flex flex-col gap-1.5">
        {topCategories.map((cat, idx) => {
          const IconComponent = CATEGORY_ICON_MAP[cat.icon] || ShoppingBag;
          return (
            <div
              key={cat.id}
              onClick={() => setActiveView('finance')}
              className="group flex flex-col gap-1 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${cat.color || '#f97316'}20`,
                      color: cat.color || '#f97316'
                    }}
                  >
                    <IconComponent size={11} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono leading-none">
                      {cat.count} {isId ? 'transaksi' : 'txns'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="text-[11px] font-mono font-bold text-zinc-100">
                    {formatCurrency(cat.amount)}
                  </span>
                  <span
                    className="text-[9px] font-mono font-bold"
                    style={{ color: cat.color || '#f97316' }}
                  >
                    {cat.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar per category */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(cat.percentage, 100)}%`,
                    backgroundColor: cat.color || '#f97316'
                  }}
                />
              </div>
            </div>
          );
        })}

        {otherCategoriesAmount > 0 && (
          <div className="flex items-center justify-between px-2 py-1 text-[10px] text-zinc-400 font-medium">
            <span className="text-zinc-500">
              +{otherCategoriesCount} {isId ? 'kategori lainnya' : 'other categories'}
            </span>
            <span className="font-mono text-zinc-400">
              {formatCurrency(otherCategoriesAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Financial Awareness Insight Callout */}
      {awarenessInsight && (
        <div className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-200/90 leading-relaxed">
          {awarenessInsight}
        </div>
      )}
    </div>
  );
};
