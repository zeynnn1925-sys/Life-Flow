import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, TrendingUp, TrendingDown, Wallet, PieChart, 
  ShoppingBag, Coffee, Home, Car, Smartphone, Heart, Briefcase, 
  Music, Gamepad, Book, Plane, Utensils, Zap, DollarSign, Gift, Trophy,
  X, ChevronDown, Check, Settings2, Users, ShieldCheck, CreditCard, Landmark, Camera, Loader2
} from 'lucide-react';
import { Transaction, Category, RecurringTransaction } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { exportTransactions } from '../services/exportService';
import { scanReceipt } from '../services/aiService';
import { ConfirmationModal } from './ConfirmationModal';
import { matchCategoryByKeywords } from '../utils/categoryMatcher';
import ChatBotSimulator from './ChatBotSimulator';

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingBag, Coffee, Home, Car, Smartphone, Heart, Briefcase, 
  Music, Gamepad, Book, Plane, Utensils, Zap, DollarSign, Gift, Trophy,
  Users, ShieldCheck, CreditCard, Landmark
};

const DEFAULT_CATEGORIES: Category[] = [
  // Income
  { id: 'i1', name: 'Regular Income', icon: 'Briefcase', type: 'income', color: '#f77f00', group: 'Pendapatan Rutin' },
  { id: 'i2', name: 'Irregular Income', icon: 'Gift', type: 'income', color: '#f77f00', group: 'Pendapatan Tidak Rutin' },
  { id: 'i3', name: 'Passive/Investment', icon: 'Landmark', type: 'income', color: '#f77f00', group: 'Pendapatan Pasif' },
  
  // Expenses - Needs
  { id: 'e1', name: 'Housing', icon: 'Home', type: 'expense', color: '#d62828', group: 'Needs' },
  { id: 'e2', name: 'Utilities', icon: 'Zap', type: 'expense', color: '#d62828', group: 'Needs' },
  { id: 'e3', name: 'Food', icon: 'Utensils', type: 'expense', color: '#d62828', group: 'Needs' },
  { id: 'e4', name: 'Transport', icon: 'Car', type: 'expense', color: '#d62828', group: 'Needs' },
  { id: 'e5', name: 'Health', icon: 'Heart', type: 'expense', color: '#d62828', group: 'Needs' },
  
  // Expenses - Wants
  { id: 'e6', name: 'Entertainment', icon: 'Gamepad', type: 'expense', color: '#eae2b7', group: 'Wants' },
  { id: 'e7', name: 'Social', icon: 'Users', type: 'expense', color: '#eae2b7', group: 'Wants' },
  { id: 'e8', name: 'Personal Care', icon: 'ShoppingBag', type: 'expense', color: '#eae2b7', group: 'Wants' },
  
  // Expenses - Savings & Debt
  { id: 'e9', name: 'Emergency Fund', icon: 'ShieldCheck', type: 'expense', color: '#fcbf49', group: 'Savings & Debt' },
  { id: 'e10', name: 'Investment', icon: 'PieChart', type: 'expense', color: '#fcbf49', group: 'Savings & Debt' },
  { id: 'e11', name: 'Debt', icon: 'CreditCard', type: 'expense', color: '#fcbf49', group: 'Savings & Debt' },
];

export default function FinanceTracker() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { 
    transactions, 
    recurringTransactions, 
    categories, 
    saveTransaction, 
    deleteTransaction: deleteTransactionFromDb,
    saveRecurringTransaction,
    deleteRecurringTransaction: deleteRecurringTransactionFromDb,
    saveCategory,
    deleteCategory: deleteCategoryFromDb
  } = useData();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Set default category when categories load
  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      const defaultCat = categories.find(c => c.type === type) || categories[0];
      setSelectedCategoryId(defaultCat.id);
    }
  }, [categories, selectedCategoryId, type]);

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState<'recent' | 'recurring'>('recent');
  
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('ShoppingBag');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatGroup, setNewCatGroup] = useState('');
  const [newCatColor, setNewCatColor] = useState(() => {
    try {
      return localStorage.getItem('lifeflow_new_cat_color') || '#d62828';
    } catch (e) {
      return '#d62828';
    }
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'transaction' | 'recurring' | 'category' } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const result = await scanReceipt(
            base64Data, 
            file.type || 'image/jpeg',
            categories.map(c => ({ id: c.id, name: c.name, type: c.type, group: c.group }))
          );
          
          if (result.description) setDescription(result.description);
          if (result.amount) setAmount(result.amount.toString());
          if (result.notes) setNotes(result.notes);
          
          // Try to auto-match category returned from Gemini, fallback to our optimized keyword matcher
          if (result.categoryId) {
            const matchedCat = categories.find(c => c.id === result.categoryId);
            if (matchedCat) {
              setSelectedCategoryId(matchedCat.id);
              if (matchedCat.type) setType(matchedCat.type as 'income' | 'expense');
            }
          } else if (result.description) {
            const matchResult = matchCategoryByKeywords(result.description, categories);
            setSelectedCategoryId(matchResult.categoryId);
            setType(matchResult.type);
          }
        } catch (err) {
          console.error(err);
          // Set error message instead of alert
          const errorMsg = t('scanError') || 'Failed to scan receipt. Please try again.';
          setNotes(errorMsg);
        } finally {
          setIsScanning(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsScanning(false);
    }
  };

  const getTranslatedCategoryName = (name: string) => {
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
    return keyMap[name] ? t(keyMap[name]) : name;
  };

  const getTranslatedGroupName = (group: string) => {
    const keyMap: Record<string, any> = {
      'Needs': 'needs',
      'Wants': 'wants',
      'Savings & Debt': 'savingsDebt',
      'Pendapatan Rutin': 'regularIncome',
      'Pendapatan Tidak Rutin': 'irregularIncome',
      'Pendapatan Pasif': 'passiveInvestment'
    };
    return keyMap[group] ? t(keyMap[group]) : group;
  };

  useEffect(() => {
    localStorage.setItem('lifeflow_new_cat_color', newCatColor);
  }, [newCatColor]);

  // Process recurring transactions
  useEffect(() => {
    const processRecurring = async () => {
      if (recurringTransactions.length === 0) return;

      const now = new Date();
      let hasChanges = false;

      for (const rt of recurringTransactions) {
        let lastProcessed = new Date(rt.lastProcessedDate);
        if (isNaN(lastProcessed.getTime())) {
          lastProcessed = new Date(rt.startDate || now.toISOString());
        }
        let nextDueDate = new Date(lastProcessed);
        const freq = (rt.frequency || '').toLowerCase().trim();

        if (freq === 'daily') nextDueDate.setDate(nextDueDate.getDate() + 1);
        else if (freq === 'weekly') nextDueDate.setDate(nextDueDate.getDate() + 7);
        else if (freq === 'monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        else if (freq === 'yearly') nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        else {
          // If frequency is unknown, advance by 1 month as fallback to avoid getting stuck
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        let currentRt = { ...rt };
        let localHasChanges = false;

        // Limit iterations to prevent massive execution if nextDueDate is very old
        let iterations = 0;
        const maxIterations = 100;

        while (nextDueDate <= now && iterations < maxIterations) {
          iterations++;
          const prevTime = nextDueDate.getTime();
          
          localHasChanges = true;
          hasChanges = true;
          await saveTransaction({
            id: crypto.randomUUID(),
            description: rt.description,
            amount: rt.amount,
            type: rt.type,
            category: rt.category,
            date: nextDueDate.toISOString(),
            isBill: true
          });
          
          currentRt.lastProcessedDate = nextDueDate.toISOString();
          lastProcessed = new Date(currentRt.lastProcessedDate);
          nextDueDate = new Date(lastProcessed);

          if (freq === 'daily') nextDueDate.setDate(nextDueDate.getDate() + 1);
          else if (freq === 'weekly') nextDueDate.setDate(nextDueDate.getDate() + 7);
          else if (freq === 'monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          else if (freq === 'yearly') nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          else {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          }

          // Safety: Check if date actually advanced. If not, break to prevent infinite freeze.
          if (isNaN(nextDueDate.getTime()) || nextDueDate.getTime() <= prevTime) {
            console.warn('Recurring transaction nextDueDate did not advance. Breaking loop to prevent freeze.');
            break;
          }
        }

        if (localHasChanges) {
          await saveRecurringTransaction(currentRt);
        }
      }
    };

    processRecurring();
  }, [recurringTransactions, saveTransaction, saveRecurringTransaction]);

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !selectedCategoryId) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const now = new Date().toISOString();

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount: parsedAmount,
      type,
      category: selectedCategoryId,
      date: now,
      isBill: isRecurring,
      notes: notes
    };

    if (isRecurring) {
      const newRecurring: RecurringTransaction = {
        id: crypto.randomUUID(),
        description,
        amount: parsedAmount,
        type,
        category: selectedCategoryId,
        frequency: recurringFrequency,
        startDate: now,
        lastProcessedDate: now,
        notes: notes
      };
      saveRecurringTransaction(newRecurring);
    }

    saveTransaction(newTransaction);
    setDescription('');
    setAmount('');
    setNotes('');
    setIsRecurring(false);
  };

  const addCategory = () => {
    if (!newCatName) return;

    if (editingCategoryId) {
      const categoryToUpdate = categories.find(c => c.id === editingCategoryId);
      if (categoryToUpdate) {
        saveCategory({
          ...categoryToUpdate,
          name: newCatName,
          icon: newCatIcon,
          type: newCatType,
          group: newCatGroup || (newCatType === 'income' ? 'Pendapatan Rutin' : 'Needs'),
          color: newCatColor
        });
      }
      setEditingCategoryId(null);
    } else {
      const newCat: Category = {
        id: crypto.randomUUID(),
        name: newCatName,
        icon: newCatIcon,
        type: newCatType,
        group: newCatGroup || (newCatType === 'income' ? 'Pendapatan Rutin' : 'Needs'),
        color: newCatColor,
      };
      saveCategory(newCat);
    }

    setNewCatName('');
    setNewCatGroup('');
  };

  const editCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setNewCatName(cat.name);
    setNewCatIcon(cat.icon);
    setNewCatType(cat.type);
    setNewCatGroup(cat.group || '');
    setNewCatColor(cat.color);
    // Scroll to top of modal content
    const modalContent = document.getElementById('category-modal-content');
    if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setNewCatName('');
    setNewCatGroup('');
    // Optionally reset color to default or keep it
  };

  const deleteCategory = (id: string) => {
    setDeleteTarget({ id, type: 'category' });
  };

  const deleteTransaction = (id: string) => {
    setDeleteTarget({ id, type: 'transaction' });
  };

  const deleteRecurringTransaction = (id: string) => {
    setDeleteTarget({ id, type: 'recurring' });
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const filteredCategories = categories.filter(c => c.type === type);

  const getCategory = (id: string) => categories.find(c => c.id === id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 relative overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5e6ad2]/3 via-transparent to-emerald-500/3" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#5e6ad2]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/3 blur-[120px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="finance-card-primary"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-eyebrow text-white/60 uppercase">{t('totalBalance')}</span>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-display-md text-white">
            Rp {balance.toLocaleString()}
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="finance-card-income"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-eyebrow text-white/60 uppercase">{t('income')}</span>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-display-md text-white">
            Rp {totalIncome.toLocaleString()}
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="finance-card-expense"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-eyebrow text-white/60 uppercase">{t('expense')}</span>
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-display-md text-white">
            Rp {totalExpense.toLocaleString()}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">
          <form onSubmit={addTransaction} className="relative bg-surface-1 p-6 rounded-lg shadow-card border border-hairline space-y-4 overflow-hidden">
            <AnimatePresence>
              {isScanning && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-surface-1/90 backdrop-blur-xs rounded-lg flex flex-col items-center justify-center z-10 space-y-3 p-6 text-center"
                >
                  <div className="relative w-16 h-16 flex items-center justify-center bg-accent/10 rounded-full border border-accent/20">
                    <Loader2 className="w-10 h-10 text-accent animate-spin" />
                    <Camera className="w-5 h-5 text-accent absolute" />
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-accent shadow-glow-accent"
                      animate={{ top: ['10%', '90%', '10%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="text-body-sm font-bold text-ink animate-pulse">
                    {t('scanning') || 'Scanning Receipt...'}
                  </div>
                  <div className="text-caption text-ink-subtle">
                    Gemini AI is analyzing receipt & matching category...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading-sm font-bold text-ink">{t('addTransaction')}</h3>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleScanReceipt}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="flex items-center gap-2 px-4 py-2 text-button font-bold text-white bg-accent hover:bg-accent-hover rounded-pill transition-all disabled:opacity-50 shadow-glow-accent hover:scale-[1.03] active:scale-[0.97] duration-200 border border-accent/20"
                  title={t('scanReceipt') || 'Scan Receipt'}
                >
                  {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isScanning ? (t('scanning') || 'Scanning...') : (t('scanReceipt') || 'Scan Receipt')}</span>
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setNewCatType(type);
                    setIsManagingCategories(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-button font-medium text-ink-subtle bg-surface-2 hover:bg-surface-3 rounded-pill transition-all border border-hairline"
                  title={t('manageCategories')}
                >
                  <Settings2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('manageCategories')}</span>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('description')}</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm placeholder:text-ink-subtle transition-all"
                placeholder="e.g. Salary, Coffee, Rent"
              />
            </div>
            
            <div>
              <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('amount')}</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-12 px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm font-mono placeholder:text-ink-subtle transition-all"
                placeholder="0"
              />
            </div>
 
            <div>
              <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('notes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 bg-surface-1 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none text-ink text-body-sm placeholder:text-ink-subtle transition-all resize-none"
                placeholder={t('notes')}
                rows={2}
              />
            </div>
 
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setSelectedCategoryId(categories.find(c => c.type === 'income')?.id || '');
                }}
                className={`py-2 rounded-pill text-button font-medium transition-all ${
                  type === 'income' ? 'bg-primary text-white' : 'bg-surface-2 text-ink-muted border border-hairline hover:border-hairline-strong'
                }`}
              >
                {t('income')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setSelectedCategoryId(categories.find(c => c.type === 'expense')?.id || '');
                }}
                className={`py-2 rounded-pill text-button font-medium transition-all ${
                  type === 'expense' ? 'bg-danger text-white' : 'bg-surface-2 text-ink-muted border border-hairline hover:border-hairline-strong'
                }`}
              >
                {t('expense')}
              </button>
            </div>
 
            <div>
              <label className="block text-eyebrow text-ink-tertiary uppercase mb-1.5">{t('category')}</label>
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {Object.entries(
                  filteredCategories.reduce((acc, cat) => {
                    const group = cat.group || 'Other';
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(cat);
                    return acc;
                  }, {} as Record<string, Category[]>)
                ).map(([group, cats]) => (
                  <div key={group} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest">{getTranslatedGroupName(group)}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(cats as Category[]).map(cat => {
                        const Icon = ICON_MAP[cat.icon] || ShoppingBag;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all text-body-sm ${
                              selectedCategoryId === cat.id
                                ? 'border-accent bg-accent/20 text-ink'
                                : 'border-hairline text-ink-subtle hover:border-hairline-strong bg-surface-1'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="truncate">{getTranslatedCategoryName(cat.name)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
 
            <div className="flex items-center justify-between p-3 bg-surface-2 rounded-md border border-hairline">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded border-hairline text-accent focus:ring-accent"
                />
                <span className="text-body-sm font-medium text-ink-muted">{t('recurring')}</span>
              </label>
              
              {isRecurring && (
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value as any)}
                  className="px-3 py-1.5 bg-surface-1 border border-hairline rounded-md focus:border-accent outline-none transition-all text-caption text-ink shadow-sm cursor-pointer"
                >
                  <option value="daily">{t('daily')}</option>
                  <option value="weekly">{t('weekly')}</option>
                  <option value="monthly">{t('monthly')}</option>
                  <option value="yearly">{t('yearly')}</option>
                </select>
              )}
            </div>
 
            <button
              type="submit"
              className="w-full bg-accent text-white py-3 rounded-pill font-bold shadow-glow-accent hover:bg-accent-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('addTransaction')}
            </button>
          </form>

          {/* Quick Chat Bot Simulator */}
          <div className="space-y-2 mt-6">
            <div className="flex items-center gap-1.5 px-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                {language === 'id' ? 'Pencatatan Cepat via AI Chat Bot' : 'Fast Log via AI Chat Bot Bot'}
              </h4>
            </div>
            <ChatBotSimulator />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-surface-1 rounded-lg shadow-card border border-hairline overflow-hidden">
            <div className="p-6 border-b border-hairline flex items-center justify-between bg-surface-1/50">
              <div className="flex items-center gap-6">
                <button
                  id="tab-recent"
                  onClick={() => setActiveTab('recent')}
                  className={`text-heading-sm font-bold transition-all relative ${activeTab === 'recent' ? 'text-ink' : 'text-ink-tertiary hover:text-ink-subtle'}`}
                >
                  {t('recentTransactions')}
                  {activeTab === 'recent' && <motion.div layoutId="tab-underline" className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-accent" />}
                </button>
                <button
                  id="tab-recurring"
                  onClick={() => setActiveTab('recurring')}
                  className={`text-heading-sm font-bold transition-all relative ${activeTab === 'recurring' ? 'text-ink' : 'text-ink-tertiary hover:text-ink-subtle'}`}
                >
                  {t('recurring')}
                  {activeTab === 'recurring' && <motion.div layoutId="tab-underline" className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-accent" />}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    const getCategoryName = (idOrName: string) => {
                      const cat = categories.find(c => c.id === idOrName || c.name === idOrName);
                      return cat ? cat.name : idOrName;
                    };
                    exportTransactions(transactions, user?.displayName || 'User', getCategoryName, t);
                  }}
                  className="p-2 text-ink-tertiary hover:text-accent hover:bg-surface-2 rounded-md transition-all"
                  title={t('exportCSV')}
                >
                  <DollarSign className="w-5 h-5" />
                </button>
                <PieChart className="w-5 h-5 text-ink-tertiary" />
              </div>
            </div>
            <div className="divide-y divide-hairline max-h-[600px] overflow-y-auto">
              <AnimatePresence initial={false} mode="wait">
                {activeTab === 'recent' ? (
                  transactions.length === 0 ? (
                    <div className="p-16 text-center text-ink-tertiary text-body-sm italic">
                      {t('noTransactions')}
                    </div>
                  ) : (
                    <div key="recent">
                      {transactions.map((t) => {
                        const cat = getCategory(t.category);
                        const Icon = cat ? (ICON_MAP[cat.icon] || ShoppingBag) : (t.type === 'income' ? TrendingUp : TrendingDown);
                        return (
                          <motion.div
                            key={t.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-2 transition-colors border-l-2 border-transparent hover:border-accent"
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 shadow-sm"
                                style={{ backgroundColor: `${cat?.color || (t.type === 'income' ? '#00a87e' : '#e61e49')}15`, color: cat?.color || (t.type === 'income' ? '#00a87e' : '#e61e49'), border: `1px solid ${cat?.color || (t.type === 'income' ? '#00a87e' : '#e61e49')}30` }}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-ink text-body-sm truncate">{t.description}</div>
                                {t.notes && <div className="text-[10px] text-ink-subtle italic truncate max-w-[200px]">{t.notes}</div>}
                                <div className="text-caption text-ink-tertiary flex items-center gap-2">
                                  <span>{new Date(t.date).toLocaleDateString()}</span>
                                  <span className="w-1 h-1 bg-hairline-strong rounded-full" />
                                  <span className="truncate">{getTranslatedCategoryName(cat?.name || 'Uncategorized')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                              <div className={`font-bold text-body-md font-mono ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString()}
                              </div>
                              <button
                                onClick={() => deleteTransaction(t.id)}
                                className="p-2 text-ink-tertiary hover:text-danger rounded-md hover:bg-danger/10 transition-all opacity-40"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  recurringTransactions.length === 0 ? (
                    <div className="p-16 text-center text-ink-tertiary text-body-sm italic">
                      {t('noRecurringTransactions')}
                    </div>
                  ) : (
                    <div key="recurring">
                      {recurringTransactions.map((rt) => {
                        const cat = getCategory(rt.category);
                        const Icon = cat ? (ICON_MAP[cat.icon] || ShoppingBag) : (rt.type === 'income' ? TrendingUp : TrendingDown);
                        return (
                          <motion.div
                            key={rt.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-2 transition-colors border-l-2 border-transparent hover:border-accent"
                          >
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 shadow-sm"
                                style={{ backgroundColor: `${cat?.color || (rt.type === 'income' ? '#00a87e' : '#e61e49')}15`, color: cat?.color || (rt.type === 'income' ? '#00a87e' : '#e61e49'), border: `1px solid ${cat?.color || (rt.type === 'income' ? '#00a87e' : '#e61e49')}30` }}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-ink text-body-sm truncate">{rt.description}</div>
                                {rt.notes && <div className="text-[10px] text-ink-subtle italic truncate max-w-[200px]">{rt.notes}</div>}
                                <div className="text-caption text-ink-tertiary flex items-center gap-2">
                                  <span className="capitalize">{t(rt.frequency)}</span>
                                  <span className="w-1 h-1 bg-hairline-strong rounded-full" />
                                  <span className="truncate">{getTranslatedCategoryName(cat?.name || 'Uncategorized')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                              <div className={`font-bold text-body-md font-mono ${rt.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                {rt.type === 'income' ? '+' : '-'} Rp {rt.amount.toLocaleString()}
                              </div>
                              <button
                                onClick={() => deleteRecurringTransaction(rt.id)}
                                className="p-2 text-ink-tertiary hover:text-danger rounded-md hover:bg-danger/10 transition-all opacity-40"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Category Management Modal */}
      <AnimatePresence>
        {isManagingCategories && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManagingCategories(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface-3 rounded-xxl shadow-modal border border-hairline-strong overflow-hidden backdrop-blur-xl"
            >
              <div className="p-6 border-b border-hairline flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-heading-sm font-bold text-ink">{t('manageCategories')}</h3>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="text-eyebrow text-ink-tertiary uppercase hover:text-danger transition-colors"
                  >
                    {t('resetCategories')}
                  </button>
                </div>
                <button 
                  onClick={() => {
                    setIsManagingCategories(false);
                    setEditingCategoryId(null);
                    setNewCatName('');
                    setNewCatGroup('');
                  }}
                  className="p-2 hover:bg-surface-2 rounded-md transition-all"
                >
                  <X className="w-5 h-5 text-ink-subtle" />
                </button>
              </div>

              <div id="category-modal-content" className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Add/Edit Category */}
                <div className="space-y-4 p-5 bg-surface-2 rounded-xl border border-hairline">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-eyebrow text-ink uppercase">
                      {editingCategoryId ? t('editCategory') : t('newCategory')}
                    </h4>
                    {editingCategoryId && (
                      <button 
                        onClick={cancelEdit}
                        className="text-[10px] font-bold text-ink-subtle hover:text-ink uppercase tracking-widest"
                      >
                        {t('cancel')}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder={t('categoryName')}
                      className="w-full h-11 px-4 py-2 bg-surface-3 border border-hairline rounded-md focus:border-accent outline-none transition-all text-ink text-body-sm"
                    />
                    <select
                      value={newCatGroup}
                      onChange={(e) => setNewCatGroup(e.target.value)}
                      className="w-full h-11 px-4 py-2 bg-surface-3 border border-hairline rounded-md focus:border-accent outline-none transition-all text-ink text-body-sm cursor-pointer"
                    >
                      <option value="">{t('selectGroup')}</option>
                      {newCatType === 'income' ? (
                        <>
                          <option value="Pendapatan Rutin">{t('regularIncome')}</option>
                          <option value="Pendapatan Tidak Rutin">{t('irregularIncome')}</option>
                          <option value="Pendapatan Pasif">{t('passiveInvestment')}</option>
                        </>
                      ) : (
                        <>
                          <option value="Needs">{t('needs')} (Wajib)</option>
                          <option value="Wants">{t('wants')} (Gaya Hidup)</option>
                          <option value="Savings & Debt">{t('savingsDebt')}</option>
                        </>
                      )}
                    </select>
                    <div className="flex gap-2 md:col-span-2">
                      <button
                        onClick={() => {
                          setNewCatType('income');
                          setNewCatGroup('Pendapatan Rutin');
                        }}
                        className={`flex-1 py-1.5 rounded-pill text-[11px] font-bold uppercase tracking-wider transition-all ${
                          newCatType === 'income' ? 'bg-primary text-white' : 'bg-surface-3 text-ink-tertiary border border-hairline'
                        }`}
                      >
                        {t('income')}
                      </button>
                      <button
                        onClick={() => {
                          setNewCatType('expense');
                          setNewCatGroup('Needs');
                        }}
                        className={`flex-1 py-1.5 rounded-pill text-[11px] font-bold uppercase tracking-wider transition-all ${
                          newCatType === 'expense' ? 'bg-danger text-white' : 'bg-surface-3 text-ink-tertiary border border-hairline'
                        }`}
                      >
                        {t('expense')}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-ink-tertiary uppercase tracking-widest mb-3">{t('selectIcon')}</label>
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                      {Object.keys(ICON_MAP).map(iconName => {
                        const Icon = ICON_MAP[iconName];
                        return (
                          <button
                            key={iconName}
                            onClick={() => setNewCatIcon(iconName)}
                            className={`p-2.5 rounded-md transition-all ${
                              newCatIcon === iconName 
                                ? 'bg-accent text-white' 
                                : 'bg-surface-3 text-ink-subtle border border-hairline hover:border-hairline-strong'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
 
                  <div>
                    <label className="block text-[10px] font-bold text-ink-tertiary uppercase tracking-widest mb-3">{t('categoryColor')}</label>
                    <div className="flex flex-wrap gap-2.5 items-center">
                      {[
                        '#494fdf', '#5e6ad2', '#00a87e', '#e61e49', '#ec7e00',
                        '#007bc2', '#428619', '#d44df0', '#6a4cf5', '#ff7a3d'
                      ].map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCatColor(color)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            newCatColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-110'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <div className="relative w-7 h-7 rounded-full overflow-hidden border border-hairline hover:border-hairline-strong transition-all">
                        <input
                          type="color"
                          value={newCatColor}
                          onChange={(e) => setNewCatColor(e.target.value)}
                          className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
 
                  <button
                    onClick={addCategory}
                    className="w-full bg-accent text-white py-3 rounded-pill font-bold text-button shadow-glow-accent hover:bg-accent-hover transition-all mt-2"
                  >
                    {editingCategoryId ? t('updateCategory') : t('createCategory')}
                  </button>
                </div>
 
                {/* Categories List */}
                <div className="space-y-6">
                  {(['income', 'expense'] as const).map((catType) => (
                    <div key={catType} className="space-y-3">
                      <h4 className={`text-eyebrow uppercase flex items-center gap-2 ${
                        catType === 'income' ? 'text-success' : 'text-danger'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${catType === 'income' ? 'bg-success' : 'bg-danger'}`} />
                        {catType === 'income' ? t('incomeCategories') : t('expenseCategories')}
                      </h4>
                      <div className="divide-y divide-hairline bg-surface-2 rounded-xl border border-hairline px-4">
                        {categories.filter(c => c.type === catType).length === 0 ? (
                          <div className="py-6 text-caption text-ink-tertiary text-center italic">{t('noCategories')}</div>
                        ) : (
                          categories.filter(c => c.type === catType).map(cat => {
                            const Icon = ICON_MAP[cat.icon] || ShoppingBag;
                            return (
                              <div key={cat.id} className="py-3.5 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-9 h-9 rounded-md flex items-center justify-center shadow-sm"
                                    style={{ backgroundColor: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}30` }}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="text-body-sm font-bold text-ink">{getTranslatedCategoryName(cat.name)}</div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => editCategory(cat)}
                                    className="p-2 text-ink-subtle hover:text-accent rounded-md hover:bg-accent/10 transition-colors"
                                  >
                                    <Settings2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteCategory(cat.id)}
                                    className="p-2 text-ink-subtle hover:text-danger rounded-md hover:bg-danger/10 transition-colors"
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
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showResetConfirm}
        title={t('resetCategories')}
        message="Reset all categories to defaults? This will not delete your transactions but may affect their category labels."
        confirmText={t('reset')}
        cancelText={t('cancel')}
        type="danger"
        onConfirm={async () => {
          // Delete all current categories
          for (const cat of categories) {
            await deleteCategoryFromDb(cat.id);
          }
          // Add default categories
          for (const cat of DEFAULT_CATEGORIES) {
            await saveCategory(cat);
          }
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title={
          deleteTarget?.type === 'transaction' 
            ? (language === 'id' ? 'Hapus Transaksi' : 'Delete Transaction')
            : deleteTarget?.type === 'recurring'
              ? (language === 'id' ? 'Hapus Transaksi Berulang' : 'Delete Recurring Transaction')
              : (language === 'id' ? 'Hapus Kategori' : 'Delete Category')
        }
        message={
          deleteTarget?.type === 'transaction'
            ? (language === 'id' ? 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this transaction? This action cannot be undone.')
            : deleteTarget?.type === 'recurring'
              ? (language === 'id' ? 'Apakah Anda yakin ingin menghapus transaksi berulang ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this recurring transaction? This action cannot be undone.')
              : (language === 'id' ? 'Apakah Anda yakin ingin menghapus kategori ini? Kategori pada transaksi terkait mungkin terpengaruh.' : 'Are you sure you want to delete this category? Transactions with this category may lose their label.')
        }
        confirmText={language === 'id' ? 'Hapus' : 'Delete'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
        type="danger"
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === 'transaction') {
            deleteTransactionFromDb(deleteTarget.id);
          } else if (deleteTarget.type === 'recurring') {
            deleteRecurringTransactionFromDb(deleteTarget.id);
          } else if (deleteTarget.type === 'category') {
            deleteCategoryFromDb(deleteTarget.id);
            if (selectedCategoryId === deleteTarget.id) {
              setSelectedCategoryId(categories.find(c => c.id !== deleteTarget.id && c.type === type)?.id || '');
            }
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
}
