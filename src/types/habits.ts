import { Timestamp } from 'firebase/firestore';

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type HabitCategory = 'health' | 'mind' | 'fitness' | 'finance' | 'social' | 'creativity' | 'learning' | 'custom';
export type HabitDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type HabitTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type HabitStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  customDays?: number[]; // 0 for Sunday, 1 for Monday, etc.
  timeOfDay: HabitTimeOfDay;
  difficulty: HabitDifficulty;
  targetCount: number;
  unit?: string;
  reminderTime?: string;
  isArchived: boolean;
  createdAt: Timestamp;
  order: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  linkedGoalId?: string;
}

export interface HabitLog {
  id: string;           // composite: habitId_YYYY-MM-DD
  habitId: string;
  date: string;
  completedCount: number;
  completedAt: Timestamp[];
  note?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  skipped: boolean;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  totalDays: number;
  perfectWeeks: number;
}
