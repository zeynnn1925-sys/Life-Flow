export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
  group?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string; // This will store the category ID or name
  date: string;
  isBill?: boolean;
  notes?: string;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  lastProcessedDate: string;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string;
  endTime: string;
  completed: boolean;
  reminderTime?: string;
  googleEventId?: string;
  outlookEventId?: string;
}

export interface Target {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'health' | 'work' | 'personal' | 'finance';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  points: number;
  requirement: {
    type: 'target_complete' | 'finance_balance' | 'task_streak';
    value: number;
  };
}

export interface NotificationSetting {
  id: string;
  type: 'schedule' | 'bill' | 'target' | 'habit_reminder' | 'streak_warning';
  enabled: boolean;
  time?: string;
  frequency: 'daily' | 'weekly' | 'once';
}

export interface DailyQuote {
  id: string;
  text: string;
  author: string;
  field: string;
  date: string;
}

export interface AIPlanItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  challenge: string;
  fieldToStudy: string;
  toolsNeeded: string[];
  targetPercentage: number;
  completed: boolean;
}

export interface AIProductivityPlan {
  date: string;
  items: AIPlanItem[];
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly';
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon?: string;
  color?: string;
}

export type View = 'dashboard' | 'finance' | 'reports' | 'schedule' | 'targets' | 'achievements' | 'settings' | 'ai_planner' | 'budgets' | 'savings' | 'visualization' | 'habits' | 'finance-hub' | 'productivity-hub' | 'system-hub' | 'account';
