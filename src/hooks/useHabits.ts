import { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { HabitStatus } from '../types/habits';

export function useHabits() {
  const { habits, habitLogs, saveHabit, deleteHabit, logHabit, skipHabit } = useData();

  const activeHabits = useMemo(() => 
    habits.filter(h => !h.isArchived).sort((a, b) => a.order - b.order),
    [habits]
  );

  const getHabitLogToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return habitLogs.find(l => l.habitId === habitId && l.date === today);
  };

  const getHabitStatus = (habitId: string) => {
    const log = getHabitLogToday(habitId);
    if (!log) return 'pending';
    if (log.skipped) return 'skipped';
    
    const habit = habits.find(h => h.id === habitId);
    if (habit && log.completedCount >= habit.targetCount) return 'completed';
    return 'in_progress';
  };

  return {
    habits,
    activeHabits,
    getHabitLogToday,
    getHabitStatus,
    saveHabit,
    deleteHabit,
    logHabit,
    skipHabit
  };
}
