import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Edit2, Trash2, RotateCcw, Search, Check, AlertTriangle, Layers, Tag
} from 'lucide-react';
import { Category, Transaction } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useData } from '../../contexts/DataContext';
import { CATEGORY_ICON_MAP, POPULAR_CATEGORY_COLORS } from '../../utils/categoryIcons';
import { ConfirmationModal } from '../ConfirmationModal';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'income' | 'expense';
  initialEditCategoryId?: string | null;
}

export default function CategoryManagerModal({
  isOpen,
  onClose,
  initialType = 'expense',
  initialEditCategoryId = null
}: CategoryManagerModalProps) {
  const { language, t } = useLanguage();
  const { categories, transactions, saveCategory, deleteCategory, resetCategories } = useData();

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Category Form State
  const [editingId, setEditingId] = useState<string | null>(initialEditCategoryId);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [group, setGroup] = useState('');
  const [customGroup, setCustomGroup] = useState('');
  const [isCustomGroup, setIsCustomGroup] = useState(false);
  const [icon, setIcon] = useState('ShoppingBag');
  const [color, setColor] = useState('#d62828');
  const [iconSearch, setIconSearch] = useState('');

  // Confirmation modals
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Initialize or prefill edit category if initialEditCategoryId changes
  React.useEffect(() => {
    if (initialEditCategoryId) {
      const cat = categories.find(c => c.id === initialEditCategoryId);
      if (cat) {
        startEditing(cat);
      }
    }
  }, [initialEditCategoryId, categories]);

  // Set default group when type changes if not custom
  React.useEffect(() => {
    if (!editingId && !isCustomGroup) {
      if (type === 'income') {
        setGroup('Pendapatan Rutin');
        setColor('#f77f00');
        setIcon('Briefcase');
      } else {
        setGroup('Needs');
        setColor('#d62828');
        setIcon('ShoppingBag');
      }
    }
  }, [type, editingId, isCustomGroup]);

  const startEditing = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon);
    setColor(cat.color);

    const standardGroups = ['Needs', 'Wants', 'Savings & Debt', 'Pendapatan Rutin', 'Pendapatan Tidak Rutin', 'Pendapatan Pasif'];
    if (cat.group && !standardGroups.includes(cat.group)) {
      setIsCustomGroup(true);
      setCustomGroup(cat.group);
      setGroup('custom');
    } else {
      setIsCustomGroup(false);
      setGroup(cat.group || (cat.type === 'income' ? 'Pendapatan Rutin' : 'Needs'));
      setCustomGroup('');
    }

    const modalContent = document.getElementById('category-modal-scroll');
    if (modalContent) {
      modalContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setName('');
    setIsCustomGroup(false);
    setCustomGroup('');
    setType(activeTab === 'income' ? 'income' : 'expense');
    setGroup(activeTab === 'income' ? 'Pendapatan Rutin' : 'Needs');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const finalGroup = isCustomGroup 
      ? (customGroup.trim() || (type === 'income' ? 'Pendapatan Rutin' : 'Needs'))
      : group;

    const categoryData: Category = {
      id: editingId || crypto.randomUUID(),
      name: trimmedName,
      type,
      group: finalGroup,
      icon,
      color
    };

    await saveCategory(categoryData);
    cancelEditing();
  };

  const handleDeleteClick = (cat: Category) => {
    setDeletingCategory(cat);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    await deleteCategory(deletingCategory.id);
    if (editingId === deletingCategory.id) {
      cancelEditing();
    }
    setDeletingCategory(null);
  };

  // Transaction count per category
  const transactionCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of transactions) {
      map[t.category] = (map[t.category] || 0) + 1;
    }
    return map;
  }, [transactions]);

  // Filtered categories for list
  const filteredCategories = useMemo(() => {
    return categories
      .filter(cat => {
        if (activeTab === 'income' && cat.type !== 'income') return false;
        if (activeTab === 'expense' && cat.type !== 'expense') return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return cat.name.toLowerCase().includes(q) || (cat.group && cat.group.toLowerCase().includes(q));
        }
        return true;
      })
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'income' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [categories, activeTab, searchQuery]);

  // Filtered icons for selector
  const iconList = useMemo(() => {
    const keys = Object.keys(CATEGORY_ICON_MAP);
    if (!iconSearch.trim()) return keys;
    return keys.filter(k => k.toLowerCase().includes(iconSearch.toLowerCase()));
  }, [iconSearch]);

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

  const getTranslatedGroupName = (grpName?: string) => {
    if (!grpName) return '';
    const keyMap: Record<string, any> = {
      'Needs': 'needs',
      'Wants': 'wants',
      'Savings & Debt': 'savingsDebt',
      'Pendapatan Rutin': 'regularIncome',
      'Pendapatan Tidak Rutin': 'irregularIncome',
      'Pendapatan Pasif': 'passiveInvestment'
    };
    return keyMap[grpName] ? t(keyMap[grpName]) : grpName;
  };

  if (!isOpen) return null;

  const SelectedIconComponent = CATEGORY_ICON_MAP[icon] || CATEGORY_ICON_MAP.ShoppingBag;

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

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface-1 border border-hairline-strong rounded-2xl shadow-modal overflow-hidden z-10"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-hairline flex items-center justify-between bg-surface-2/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-heading-sm font-bold text-ink">
                {language === 'id' ? 'Kelola Kategori Keuangan' : 'Manage Finance Categories'}
              </h2>
              <p className="text-caption text-ink-subtle">
                {language === 'id' 
                  ? `${categories.length} kategori aktif (pemasukan & pengeluaran)` 
                  : `${categories.length} active categories (income & expense)`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-subtle hover:text-danger bg-surface-1 hover:bg-danger/10 rounded-pill border border-hairline transition-all"
              title={t('resetCategories')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('resetCategories')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-ink-subtle hover:text-ink hover:bg-surface-3 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div id="category-modal-scroll" className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Add / Edit Form Card */}
          <div className="bg-surface-2/70 border border-hairline rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-hairline/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  {editingId ? (
                    <span className="text-accent">{t('editCategory')}: {name || '...'}</span>
                  ) : (
                    language === 'id' ? 'Tambah Kategori Baru' : 'Create New Category'
                  )}
                </h3>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="text-xs font-semibold text-ink-subtle hover:text-danger underline transition-colors"
                >
                  {t('cancel')}
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-[11px] font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
                  {language === 'id' ? 'Tipe Kategori' : 'Category Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                      type === 'expense'
                        ? 'bg-danger text-white border-danger shadow-sm'
                        : 'bg-surface-1 text-ink-subtle border-hairline hover:border-hairline-strong'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-danger" />
                    <span>{t('expense')} (Pengeluaran)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                      type === 'income'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-surface-1 text-ink-subtle border-hairline hover:border-hairline-strong'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{t('income')} (Pemasukan)</span>
                  </button>
                </div>
              </div>

              {/* Name and Group inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
                    {t('categoryName')} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'id' ? 'mis. Makanan, Gaji, Langganan' : 'e.g. Groceries, Salary, Subscriptions'}
                    required
                    className="w-full h-11 px-3.5 bg-surface-1 border border-hairline rounded-xl text-sm text-ink placeholder:text-ink-subtle/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
                    {t('groupName')}
                  </label>
                  {!isCustomGroup ? (
                    <select
                      value={group}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomGroup(true);
                          setCustomGroup('');
                        } else {
                          setGroup(e.target.value);
                        }
                      }}
                      className="w-full h-11 px-3.5 bg-surface-1 border border-hairline rounded-xl text-sm text-ink outline-none focus:border-accent transition-all cursor-pointer"
                    >
                      {type === 'expense' ? (
                        <>
                          <option value="Needs">{t('needs')} (Kebutuhan Pokok - 50%)</option>
                          <option value="Wants">{t('wants')} (Gaya Hidup - 30%)</option>
                          <option value="Savings & Debt">{t('savingsDebt')} (Tabungan/Cicilan - 20%)</option>
                          <option value="custom">{language === 'id' ? '+ Tambah Grup Kustom...' : '+ Custom Group...'}</option>
                        </>
                      ) : (
                        <>
                          <option value="Pendapatan Rutin">{t('regularIncome')} (Gaji/Bulanan)</option>
                          <option value="Pendapatan Tidak Rutin">{t('irregularIncome')} (Bonus/Freelance)</option>
                          <option value="Pendapatan Pasif">{t('passiveInvestment')} (Bagi Hasil/Dividen)</option>
                          <option value="custom">{language === 'id' ? '+ Tambah Grup Kustom...' : '+ Custom Group...'}</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customGroup}
                        onChange={(e) => setCustomGroup(e.target.value)}
                        placeholder={language === 'id' ? 'Nama grup kustom' : 'Custom group name'}
                        className="w-full h-11 px-3.5 bg-surface-1 border border-hairline rounded-xl text-sm text-ink placeholder:text-ink-subtle/60 focus:border-accent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomGroup(false);
                          setGroup(type === 'income' ? 'Pendapatan Rutin' : 'Needs');
                        }}
                        className="px-2.5 h-11 text-xs text-ink-subtle hover:text-ink bg-surface-1 border border-hairline rounded-xl shrink-0"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-ink-subtle uppercase tracking-wider">
                    {t('selectIcon')}
                  </label>
                  <div className="relative w-36 sm:w-44">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
                    <input
                      type="text"
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      placeholder={language === 'id' ? 'Cari ikon...' : 'Filter icons...'}
                      className="w-full h-7 pl-8 pr-2 text-xs bg-surface-1 border border-hairline rounded-lg text-ink placeholder:text-ink-subtle outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 max-h-36 overflow-y-auto p-2 bg-surface-1/80 border border-hairline rounded-xl">
                  {iconList.map((iconKey) => {
                    const IconComp = CATEGORY_ICON_MAP[iconKey] || CATEGORY_ICON_MAP.ShoppingBag;
                    const isSelected = icon === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setIcon(iconKey)}
                        className={`h-10 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-accent text-white shadow-glow-accent scale-105'
                            : 'text-ink-subtle hover:text-ink hover:bg-surface-3 bg-surface-2/50 border border-hairline/60'
                        }`}
                        title={iconKey}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selection & Live Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-ink-subtle uppercase tracking-wider mb-2">
                    {t('categoryColor')}
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {POPULAR_CATEGORY_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          color.toLowerCase() === c.toLowerCase() ? 'border-white scale-125 shadow-md ring-2 ring-accent' : 'border-transparent hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-hairline hover:border-accent transition-all cursor-pointer">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                        title="Custom Color"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="p-3 bg-surface-1 rounded-xl border border-hairline flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                      border: `1.5px solid ${color}40`
                    }}
                  >
                    <SelectedIconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
                      {language === 'id' ? 'Preview Tampilan' : 'Live Preview'}
                    </span>
                    <div className="text-sm font-bold text-ink truncate">
                      {name || (language === 'id' ? 'Nama Kategori' : 'Category Name')}
                    </div>
                    <div className="text-[11px] text-ink-tertiary truncate">
                      {isCustomGroup ? customGroup || 'Grup Kustom' : getTranslatedGroupName(group)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-11 bg-accent text-white font-bold rounded-xl shadow-glow-accent hover:bg-accent-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingId ? t('updateCategory') : t('createCategory')}</span>
              </button>
            </form>
          </div>

          {/* Categories List Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-surface-2 rounded-xl border border-hairline self-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'all' ? 'bg-surface-1 text-ink shadow-sm' : 'text-ink-subtle hover:text-ink'
                  }`}
                >
                  {t('allCategories')} ({categories.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('expense')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'expense' ? 'bg-danger/20 text-danger border border-danger/30' : 'text-ink-subtle hover:text-ink'
                  }`}
                >
                  {t('expense')} ({categories.filter(c => c.type === 'expense').length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('income')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-ink-subtle hover:text-ink'
                  }`}
                >
                  {t('income')} ({categories.filter(c => c.type === 'income').length})
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchCategories')}
                  className="w-full h-9 pl-9 pr-3 text-xs bg-surface-2 border border-hairline rounded-xl text-ink placeholder:text-ink-subtle outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-hairline bg-surface-2/50 rounded-xl border border-hairline overflow-hidden">
              {filteredCategories.length === 0 ? (
                <div className="p-8 text-center text-ink-subtle text-xs italic">
                  {t('noCategories')}
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const IconComponent = CATEGORY_ICON_MAP[cat.icon] || CATEGORY_ICON_MAP.ShoppingBag;
                  const count = transactionCounts[cat.id] || transactionCounts[cat.name] || 0;
                  const isEditingThis = editingId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                        isEditingThis ? 'bg-accent/10 border-l-4 border-accent' : 'hover:bg-surface-2'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                          style={{
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                            border: `1.5px solid ${cat.color}35`
                          }}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-ink truncate">
                              {getTranslatedCategoryName(cat.name)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-pill uppercase tracking-wider shrink-0 ${
                                cat.type === 'income'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-danger/15 text-danger border border-danger/30'
                              }`}
                            >
                              {cat.type === 'income' ? t('income') : t('expense')}
                            </span>
                          </div>
                          <div className="text-xs text-ink-subtle flex items-center gap-2">
                            <span>{getTranslatedGroupName(cat.group) || (language === 'id' ? 'Umum' : 'General')}</span>
                            <span className="w-1 h-1 rounded-full bg-hairline-strong" />
                            <span className="text-ink-tertiary">
                              {count} {language === 'id' ? 'transaksi' : 'transactions'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditing(cat)}
                          className={`p-2 rounded-lg transition-all ${
                            isEditingThis
                              ? 'bg-accent text-white'
                              : 'text-ink-subtle hover:text-accent hover:bg-surface-1 border border-transparent hover:border-hairline'
                          }`}
                          title={t('editCategory')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(cat)}
                          className="p-2 text-ink-subtle hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-lg transition-all"
                          title={language === 'id' ? 'Hapus Kategori' : 'Delete Category'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-hairline bg-surface-2/40 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="sm:hidden text-xs text-ink-subtle hover:text-danger flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('resetCategories')}</span>
          </button>
          <div className="hidden sm:block text-xs text-ink-tertiary">
            {language === 'id' 
              ? 'Perubahan kategori tersimpan secara otomatis dan tersinkronisasi ke cloud.'
              : 'Category changes are automatically saved and synced to the cloud.'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-ink bg-surface-3 hover:bg-surface-2 border border-hairline rounded-xl transition-colors ml-auto"
          >
            {language === 'id' ? 'Selesai' : 'Close'}
          </button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <ConfirmationModal
          isOpen={true}
          title={language === 'id' ? 'Hapus Kategori' : 'Delete Category'}
          message={
            (transactionCounts[deletingCategory.id] || transactionCounts[deletingCategory.name] || 0) > 0
              ? (language === 'id'
                  ? `Kategori "${deletingCategory.name}" saat ini terhubung ke ${transactionCounts[deletingCategory.id] || transactionCounts[deletingCategory.name]} transaksi. Jika dihapus, transaksi-transaksi tersebut akan tetap ada namun diberi label tidak berkategori.`
                  : `Category "${deletingCategory.name}" is linked to ${transactionCounts[deletingCategory.id] || transactionCounts[deletingCategory.name]} transactions. If deleted, those transactions will remain but become uncategorized.`)
              : (language === 'id'
                  ? `Apakah Anda yakin ingin menghapus kategori "${deletingCategory.name}"?`
                  : `Are you sure you want to delete category "${deletingCategory.name}"?`)
          }
          confirmText={language === 'id' ? 'Ya, Hapus' : 'Yes, Delete'}
          cancelText={t('cancel')}
          type="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingCategory(null)}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <ConfirmationModal
          isOpen={true}
          title={t('resetCategories')}
          message={
            language === 'id'
              ? 'Kembalikan semua kategori ke susunan default awal? Kategori kustom buatan Anda akan dihapus.'
              : 'Reset all categories to default setup? Custom categories will be removed.'
          }
          confirmText={language === 'id' ? 'Reset Sekarang' : 'Reset Now'}
          cancelText={t('cancel')}
          type="danger"
          onConfirm={async () => {
            await resetCategories();
            cancelEditing();
            setShowResetConfirm(false);
          }}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}
