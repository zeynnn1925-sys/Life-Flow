import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Calendar, DollarSign, FileText, Tag, Plus } from 'lucide-react';
import { Transaction, Category } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { CATEGORY_ICON_MAP } from '../../utils/categoryIcons';

interface EditTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onOpenCategoryManager: (type: 'income' | 'expense') => void;
}

export default function EditTransactionModal({
  isOpen,
  transaction,
  onClose,
  onOpenCategoryManager
}: EditTransactionModalProps) {
  const { language, t } = useLanguage();
  const { categories, saveTransaction } = useData();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description || '');
      setAmount(transaction.amount?.toString() || '');
      setType(transaction.type || 'expense');
      setCategory(transaction.category || '');
      setDate(transaction.date ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setNotes(transaction.notes || '');
    }
  }, [transaction]);

  const filteredCategories = categories.filter(c => c.type === type);

  // If category is not in filtered list, auto select first
  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.some(c => c.id === category || c.name === category)) {
      setCategory(filteredCategories[0].id);
    }
  }, [type, filteredCategories, category]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !category) return;

    setIsSaving(true);
    try {
      const updatedTx: Transaction = {
        ...transaction,
        description: description.trim(),
        amount: parseFloat(amount),
        type,
        category,
        date,
        notes: notes.trim()
      };
      await saveTransaction(updatedTx);
      onClose();
    } catch (err) {
      console.error('Failed to update transaction:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getTranslatedCategoryName = (catName: string) => {
    const keyMap: Record<string, any> = {
      'Housing': 'housing',
      'Utilities': 'utilities',
      'Food': 'food',
      'Transport': 'transport',
      'Health': 'health',
      'Entertainment': 'entertainment',
      'Social': 'social',
      'Personal Care': 'personalCare',
      'Emergency Fund': 'emergencyFund',
      'Investment': 'investment',
      'Debt': 'debt',
      'Regular Income': 'regularIncome',
      'Irregular Income': 'irregularIncome',
      'Passive/Investment': 'passiveInvestment'
    };
    return keyMap[catName] ? t(keyMap[catName]) : catName;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-surface-1 border border-hairline-strong rounded-2xl shadow-modal overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-hairline flex items-center justify-between bg-surface-2/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-heading-sm font-bold text-ink">
                {t('editTransaction')}
              </h2>
              <p className="text-caption text-ink-subtle">
                {language === 'id' ? 'Ubah rincian & tetapkan kategori' : 'Update details & assign category'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-subtle hover:text-ink hover:bg-surface-3 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Type Toggle */}
          <div>
            <label className="block text-[11px] font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
              {language === 'id' ? 'Tipe Transaksi' : 'Transaction Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  type === 'expense'
                    ? 'bg-danger text-white border-danger shadow-sm'
                    : 'bg-surface-2 text-ink-subtle border-hairline hover:text-ink'
                }`}
              >
                {t('expense')}
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-surface-2 text-ink-subtle border-hairline hover:text-ink'
                }`}
              >
                {t('income')}
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
              {t('description')} *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('description')}
              required
              className="w-full h-11 px-3.5 bg-surface-2 border border-hairline rounded-xl text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
                {t('amount')} (Rp) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                required
                className="w-full h-11 px-3.5 bg-surface-2 border border-hairline rounded-xl text-sm text-ink outline-none focus:border-accent font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
                {t('date')} *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full h-11 px-3.5 bg-surface-2 border border-hairline rounded-xl text-sm text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Category Assignment Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-ink-subtle uppercase tracking-wider">
                {t('assignCategory')} *
              </label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCategoryManager(type);
                }}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'Kategori Baru' : 'New Category'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-surface-2/60 border border-hairline rounded-xl">
              {filteredCategories.length === 0 ? (
                <div className="col-span-full py-4 text-center text-xs text-ink-subtle italic">
                  {t('noCategories')}
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const IconComp = CATEGORY_ICON_MAP[cat.icon] || CATEGORY_ICON_MAP.ShoppingBag;
                  const isSelected = category === cat.id || category === cat.name;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-accent bg-accent/15 shadow-sm ring-1 ring-accent'
                          : 'border-hairline bg-surface-1 hover:border-hairline-strong'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                        style={{
                          backgroundColor: `${cat.color}25`,
                          color: cat.color
                        }}
                      >
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-ink truncate">
                          {getTranslatedCategoryName(cat.name)}
                        </div>
                        <div className="text-[10px] text-ink-tertiary truncate">
                          {cat.group || ''}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
              {language === 'id' ? 'Catatan (Opsional)' : 'Notes (Optional)'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'id' ? 'mis. Keperluan kantor, diskon 10%' : 'e.g. Office work, 10% discount'}
              className="w-full h-10 px-3 bg-surface-2 border border-hairline rounded-xl text-xs text-ink outline-none focus:border-accent"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 h-11 bg-surface-2 hover:bg-surface-3 text-ink font-semibold rounded-xl border border-hairline transition-colors text-xs"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-11 bg-accent text-white font-bold rounded-xl shadow-glow-accent hover:bg-accent-hover transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : t('updateTransaction')}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
