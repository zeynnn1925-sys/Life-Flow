import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Target, Wallet, Trash2, TrendingUp, AlertCircle, Check } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Budget, SavingsGoal } from '../types';

export function BudgetAndSavings() {
  const { t } = useLanguage();
  const { budgets, savingsGoals, categories, transactions, saveBudget, deleteBudget, saveSavingsGoal, deleteSavingsGoal } = useData();
  const [activeTab, setActiveTab] = useState<'budgets' | 'savings'>('budgets');

  // Budget form state
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  // Savings form state
  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [savingsTitle, setSavingsTitle] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');
  const [savingsDeadline, setSavingsDeadline] = useState('');

  // Add funds state
  const [addingFundsTo, setAddingFundsTo] = useState<string | null>(null);
  const [fundsAmount, setFundsAmount] = useState('');

  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Calculate current spending for budgets
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthlySpending = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetCategory || !budgetAmount) return;

    const newBudget: Budget = {
      id: crypto.randomUUID(),
      categoryId: budgetCategory,
      amount: parseFloat(budgetAmount),
      period: 'monthly'
    };

    saveBudget(newBudget);
    setShowBudgetForm(false);
    setBudgetCategory('');
    setBudgetAmount('');
  };

  const handleAddSavingsGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savingsTitle || !savingsTarget) return;

    const newGoal: SavingsGoal = {
      id: crypto.randomUUID(),
      title: savingsTitle,
      targetAmount: parseFloat(savingsTarget),
      currentAmount: 0,
      deadline: savingsDeadline || undefined
    };

    saveSavingsGoal(newGoal);
    setShowSavingsForm(false);
    setSavingsTitle('');
    setSavingsTarget('');
    setSavingsDeadline('');
  };

  const handleAddFunds = (goal: SavingsGoal) => {
    if (!fundsAmount) return;
    const amount = parseFloat(fundsAmount);
    if (isNaN(amount) || amount <= 0) return;

    saveSavingsGoal({
      ...goal,
      currentAmount: goal.currentAmount + amount
    });
    setAddingFundsTo(null);
    setFundsAmount('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {t('budgets') || 'Budgets'} & {t('savingsGoals') || 'Savings Goals'}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Plan your spending and save for the future.
          </p>
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'budgets'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {t('budgets') || 'Budgets'}
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'savings'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {t('savingsGoals') || 'Savings Goals'}
          </button>
        </div>
      </div>

      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('monthlyBudgets')}</h2>
            <button
              onClick={() => setShowBudgetForm(!showBudgetForm)}
              className="flex items-center gap-2 px-4 py-2 bg-deep-space-blue text-white rounded-xl font-medium hover:bg-deep-space-blue/90 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t('setBudget') || 'Set Budget'}
            </button>
          </div>

          {showBudgetForm && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddBudget}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('category')}</label>
                <select
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-deep-space-blue outline-none"
                  required
                >
                  <option value="">{t('selectCategory')}</option>
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('budgetLimit') || 'Budget Limit'}</label>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-deep-space-blue outline-none"
                  placeholder="0"
                  required
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full px-4 py-2 bg-deep-space-blue text-white rounded-xl font-medium hover:bg-deep-space-blue/90 transition-all">
                  Save Budget
                </button>
              </div>
            </motion.form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map(budget => {
              const category = categories.find(c => c.id === budget.categoryId);
              const spent = monthlySpending[budget.categoryId] || 0;
              const percentage = Math.min(100, (spent / budget.amount) * 100);
              const isOver = spent > budget.amount;

              return (
                <div key={budget.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category?.color || '#ccc'}20`, color: category?.color || '#ccc' }}>
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-white">{category?.name || 'Unknown'}</h3>
                        <p className="text-sm text-zinc-500">{t('monthlyBudget')}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteBudget(budget.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className={isOver ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'}>
                        Rp {spent.toLocaleString()}
                      </span>
                      <span className="text-zinc-500">
                        Rp {budget.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {isOver && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-2">
                        <AlertCircle className="w-3 h-3" /> Over budget by Rp {(spent - budget.amount).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {budgets.length === 0 && !showBudgetForm && (
              <div className="col-span-full text-center py-12 bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <Wallet className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 dark:text-zinc-400">{t('noBudgetsSet')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'savings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{t('savingsGoals')}</h2>
            <button
              onClick={() => setShowSavingsForm(!showSavingsForm)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t('addSavingsGoal') || 'Add Goal'}
            </button>
          </div>

          {showSavingsForm && (
            <motion.form
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddSavingsGoal}
              className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('goalName')}</label>
                <input
                  type="text"
                  value={savingsTitle}
                  onChange={(e) => setSavingsTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. New Laptop"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('targetAmount') || 'Target Amount'}</label>
                <input
                  type="number"
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{t('deadline') || 'Deadline'} (Optional)</label>
                <input
                  type="date"
                  value={savingsDeadline}
                  onChange={(e) => setSavingsDeadline(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all">
                  Save Goal
                </button>
              </div>
            </motion.form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savingsGoals.map(goal => {
              const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
              const isComplete = goal.currentAmount >= goal.targetAmount;

              return (
                <div key={goal.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {isComplete ? <Check className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-white">{goal.title}</h3>
                        {goal.deadline && <p className="text-xs text-zinc-500">{t('by')} {new Date(goal.deadline).toLocaleDateString()}</p>}
                      </div>
                    </div>
                    <button onClick={() => deleteSavingsGoal(goal.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-zinc-700 dark:text-zinc-300">
                        Rp {goal.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-zinc-500">
                        Rp {goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {addingFundsTo === goal.id ? (
                    <div className="flex gap-2 mt-4">
                      <input
                        type="number"
                        value={fundsAmount}
                        onChange={(e) => setFundsAmount(e.target.value)}
                        placeholder="Amount"
                        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button 
                        onClick={() => handleAddFunds(goal)}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
                      >
                        Add
                      </button>
                      <button 
                        onClick={() => { setAddingFundsTo(null); setFundsAmount(''); }}
                        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingFundsTo(goal.id)}
                      disabled={isComplete}
                      className="w-full py-2 mt-2 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrendingUp className="w-4 h-4" />
                      {isComplete ? 'Goal Reached!' : (t('addFunds') || 'Add Funds')}
                    </button>
                  )}
                </div>
              );
            })}
            {savingsGoals.length === 0 && !showSavingsForm && (
              <div className="col-span-full text-center py-12 bg-zinc-50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <Target className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 dark:text-zinc-400">{t('noSavingsGoals')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
