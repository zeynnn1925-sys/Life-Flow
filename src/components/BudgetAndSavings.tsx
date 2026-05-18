import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Wallet, Trash2, TrendingUp, AlertCircle, Check, X } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-display-md font-black text-ink tracking-tight uppercase">
            {t('budgets') || 'Budgets'} & {t('savingsGoals') || 'Savings Goals'}
          </h1>
          <p className="text-body-sm text-ink-tertiary mt-2 lowercase font-medium">
            Plan your spending and save for the future.
          </p>
        </div>
        <div className="flex bg-surface-2 p-1 rounded-pill border border-hairline shadow-sm w-full md:w-auto">
          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex-1 md:flex-none px-8 py-2 rounded-pill text-eyebrow font-black uppercase tracking-widest transition-all ${
              activeTab === 'budgets'
                ? 'bg-accent text-white shadow-glow-accent'
                : 'text-ink-tertiary hover:text-ink'
            }`}
          >
            {t('budgets') || 'Budgets'}
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`flex-1 md:flex-none px-8 py-2 rounded-pill text-eyebrow font-black uppercase tracking-widest transition-all ${
              activeTab === 'savings'
                ? 'bg-accent text-white shadow-glow-accent'
                : 'text-ink-tertiary hover:text-ink'
            }`}
          >
            {t('savingsGoals') || 'Savings Goals'}
          </button>
        </div>
      </div>

      {activeTab === 'budgets' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-heading-sm font-black text-ink uppercase tracking-tight">{t('monthlyBudgets')}</h2>
            <button
              onClick={() => setShowBudgetForm(!showBudgetForm)}
              className="flex items-center gap-2 px-6 h-11 bg-accent text-white rounded-pill text-eyebrow font-black uppercase tracking-widest hover:bg-accent-hover transition-all shadow-glow-accent"
            >
              <Plus className="w-4 h-4" />
              {t('setBudget') || 'Set Budget'}
            </button>
          </div>

          {showBudgetForm && (
            <motion.form
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddBudget}
              className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div>
                <label className="block text-eyebrow text-ink-tertiary uppercase mb-2">{t('category')}</label>
                <select
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full h-12 px-4 rounded-md border border-hairline bg-surface-1 text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">{t('selectCategory')}</option>
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-eyebrow text-ink-tertiary uppercase mb-2">{t('budgetLimit') || 'Budget Limit'}</label>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full h-12 px-4 rounded-md border border-hairline bg-surface-1 text-ink font-mono focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  placeholder="0"
                  required
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full h-12 bg-accent text-white rounded-pill font-black text-eyebrow uppercase tracking-widest hover:bg-accent-hover transition-all shadow-glow-accent">
                  Save Budget
                </button>
              </div>
            </motion.form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {budgets.map(budget => {
              const category = categories.find(c => c.id === budget.categoryId);
              const spent = monthlySpending[budget.categoryId] || 0;
              const percentage = Math.min(100, (spent / budget.amount) * 100);
              const isOver = spent > budget.amount;

              return (
                <div key={budget.id} className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline group hover:border-hairline-strong transition-all">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-md flex items-center justify-center border border-hairline-strong shadow-sm" style={{ backgroundColor: `${category?.color || '#333'}20`, color: category?.color || '#333' }}>
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-body-sm font-black text-ink uppercase tracking-tight">{category?.name || 'Unknown'}</h3>
                        <p className="text-eyebrow text-ink-tertiary mt-0.5 lowercase font-medium">{t('monthlyBudget')}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteBudget(budget.id)} 
                      className="p-2 text-ink-tertiary hover:text-danger hover:bg-danger/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className={`text-heading-sm font-black font-mono transition-colors ${isOver ? 'text-danger' : 'text-ink'}`}>
                          Rp {spent.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider">Spent</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-body-sm font-bold font-mono text-ink-tertiary">
                          Rp {budget.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider">Limit</span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="h-3 bg-surface-2 rounded-pill overflow-hidden border border-hairline p-[2px]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className={`h-full rounded-pill transition-all relative ${
                            isOver 
                              ? 'bg-danger shadow-[0_0_12px_rgba(226,59,74,0.4)]' 
                              : percentage > 80 
                                ? 'bg-warning shadow-[0_0_12px_rgba(242,153,74,0.4)]' 
                                : 'bg-accent shadow-glow-accent'
                          }`}
                        />
                      </div>
                      <div className="absolute top-1/2 left-0 w-full flex justify-between px-2 -translate-y-1/2 pointer-events-none">
                        {[25, 50, 75].map(mark => (
                          <div key={mark} className="w-px h-1 bg-white/20" />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={`text-[11px] font-black uppercase tracking-widest ${isOver ? 'text-danger' : 'text-accent'}`}>
                        {Math.round(percentage)}% used
                      </span>
                      {!isOver && (
                        <span className="text-[11px] text-ink-tertiary font-bold lowercase">
                          Rp {(budget.amount - spent).toLocaleString()} remaining
                        </span>
                      )}
                    </div>

                    {isOver && (
                      <div className="flex items-center gap-2 p-3 bg-danger/10 rounded-md border border-danger/20">
                        <AlertCircle className="w-4 h-4 text-danger" />
                        <p className="text-eyebrow text-danger font-black italic">
                          Over by Rp {(spent - budget.amount).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {budgets.length === 0 && !showBudgetForm && (
              <div className="col-span-full py-16 bg-surface-1 rounded-lg border border-hairline border-dashed text-center">
                <Wallet className="w-12 h-12 text-ink-tertiary mx-auto mb-4 opacity-20" />
                <p className="text-ink-tertiary italic text-body-sm lowercase">{t('noBudgetsSet')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'savings' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-heading-sm font-black text-ink uppercase tracking-tight">{t('savingsGoals')}</h2>
            <button
              onClick={() => setShowSavingsForm(!showSavingsForm)}
              className="flex items-center gap-2 px-6 h-11 bg-accent text-white rounded-pill text-eyebrow font-black uppercase tracking-widest hover:bg-accent-hover transition-all shadow-glow-accent"
            >
              <Plus className="w-4 h-4" />
              {t('addSavingsGoal') || 'Add Goal'}
            </button>
          </div>

          {showSavingsForm && (
            <motion.form
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddSavingsGoal}
              className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <div>
                <label className="block text-eyebrow text-ink-tertiary uppercase mb-2">{t('goalName')}</label>
                <input
                  type="text"
                  value={savingsTitle}
                  onChange={(e) => setSavingsTitle(e.target.value)}
                  className="w-full h-12 px-4 rounded-md border border-hairline bg-surface-1 text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  placeholder="e.g. New Laptop"
                  required
                />
              </div>
              <div>
                <label className="block text-eyebrow text-ink-tertiary uppercase mb-2">{t('targetAmount') || 'Target Amount'}</label>
                <input
                  type="number"
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(e.target.value)}
                  className="w-full h-12 px-4 rounded-md border border-hairline bg-surface-1 text-ink font-mono focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-eyebrow text-ink-tertiary uppercase mb-2">{t('deadline') || 'Deadline'} (Optional)</label>
                <input
                  type="date"
                  value={savingsDeadline}
                  onChange={(e) => setSavingsDeadline(e.target.value)}
                  className="w-full h-12 px-4 rounded-md border border-hairline bg-surface-1 text-ink focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all cursor-pointer"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full h-12 bg-accent text-white rounded-pill font-black text-eyebrow uppercase tracking-widest hover:bg-accent-hover transition-all shadow-glow-accent">
                  Save Goal
                </button>
              </div>
            </motion.form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savingsGoals.map(goal => {
              const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
              const isComplete = goal.currentAmount >= goal.targetAmount;

              return (
                <div key={goal.id} className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline group hover:border-hairline-strong transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-md flex items-center justify-center border shadow-sm transition-all ${isComplete ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-surface-2 border-hairline text-ink-tertiary'}`}>
                        {isComplete ? <Check className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-body-sm font-black text-ink uppercase tracking-tight">{goal.title}</h3>
                        {goal.deadline && <p className="text-eyebrow text-ink-tertiary mt-0.5 lowercase font-medium">{t('by')} {new Date(goal.deadline).toLocaleDateString()}</p>}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteSavingsGoal(goal.id)} 
                      className="p-2 text-ink-tertiary hover:text-danger hover:bg-danger/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-heading-sm font-black font-mono text-ink">
                          Rp {goal.currentAmount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider">Saved</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-body-sm font-bold font-mono text-ink-tertiary">
                          Rp {goal.targetAmount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-ink-tertiary font-bold uppercase tracking-wider">Target</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="h-3 bg-surface-2 rounded-pill overflow-hidden border border-hairline p-[2px]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className={`h-full rounded-pill transition-all ${
                            isComplete 
                              ? 'bg-accent shadow-glow-accent' 
                              : 'bg-accent/40 shadow-sm'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-black">
                      <span className="text-accent uppercase tracking-widest">
                        {Math.round(percentage)}% complete
                      </span>
                      {!isComplete && (
                        <span className="text-ink-tertiary lowercase">
                          Rp {(goal.targetAmount - goal.currentAmount).toLocaleString()} left to save
                        </span>
                      )}
                    </div>
                  </div>

                  {addingFundsTo === goal.id ? (
                    <div className="flex gap-2 mt-4">
                      <input
                        type="number"
                        value={fundsAmount}
                        onChange={(e) => setFundsAmount(e.target.value)}
                        placeholder="Amount"
                        className="flex-1 h-10 px-4 rounded-md border border-hairline bg-surface-1 text-ink font-mono focus:border-accent outline-none text-xs"
                      />
                      <button 
                        onClick={() => handleAddFunds(goal)}
                        className="px-4 bg-accent text-white text-xs font-black uppercase tracking-widest rounded-md hover:bg-accent-hover shadow-sm"
                      >
                        Add
                      </button>
                      <button 
                        onClick={() => { setAddingFundsTo(null); setFundsAmount(''); }}
                        className="px-3 bg-surface-2 text-ink-tertiary text-xs font-bold rounded-md hover:bg-surface-3 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingFundsTo(goal.id)}
                      disabled={isComplete}
                      className="w-full h-11 flex items-center justify-center gap-2 text-eyebrow font-black uppercase tracking-widest text-accent bg-accent/5 border border-accent/10 hover:bg-accent/10 hover:border-accent/20 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <TrendingUp className="w-4 h-4" />
                      {isComplete ? 'Goal Reached!' : (t('addFunds') || 'Add Funds')}
                    </button>
                  )}
                </div>
              );
            })}
            {savingsGoals.length === 0 && !showSavingsForm && (
              <div className="col-span-full py-16 bg-surface-1 rounded-lg border border-hairline border-dashed text-center">
                <Target className="w-12 h-12 text-ink-tertiary mx-auto mb-4 opacity-20" />
                <p className="text-ink-tertiary italic text-body-sm lowercase">{t('noSavingsGoals')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
