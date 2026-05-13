import { useMemo } from 'react';
import { Habit, HabitLog } from '../types/habits';

export function useHabitStreak(habit: Habit, habitLogs: HabitLog[]) {
  const stats = useMemo(() => {
    const habitLogsSorted = habitLogs
      .filter(l => l.habitId === habit.id && !l.skipped)
      .sort((a, b) => b.date.localeCompare(a.date));

    // Simple current streak calculation
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // logic simplified for brevity, in production we'd check frequency
    // ...
    
    return {
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions: habit.totalCompletions,
      completionRate: habit.totalCompletions > 0 ? (habit.totalCompletions / (habitLogs.filter(l => l.habitId === habit.id).length || 1)) * 100 : 0
    };
  }, [habit, habitLogs]);

  return stats;
}
