import { useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationContext';

export function useHabitCheckIn() {
  const { habits, logHabit, skipHabit } = useData();
  const { addNotification } = useNotifications();

  const handleCheckIn = useCallback(async (habitId: string, habitTitle: string, count: number = 1) => {
    try {
      await logHabit(habitId, count);
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        const nextStreak = (habit.currentStreak || 0) + 1;
        const milestones = [7, 30, 100, 365];
        if (milestones.includes(nextStreak)) {
          addNotification({
            title: `🏆 Milestone Streak: ${habitTitle}!`,
            message: `Luar biasa! Kamu berhasil mempertahankan streak ${nextStreak} hari untuk kebiasaan "${habitTitle}".`,
            type: 'achievement',
            link: 'habits',
          });
        }
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  }, [habits, logHabit, addNotification]);

  const handleSkip = useCallback(async (habitId: string, note?: string) => {
    try {
      await skipHabit(habitId, note);
    } catch (error) {
      console.error('Skip failed:', error);
    }
  }, [skipHabit]);

  return {
    handleCheckIn,
    handleSkip
  };
}
