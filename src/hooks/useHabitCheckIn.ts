import { useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationContext';

export function useHabitCheckIn() {
  const { logHabit, skipHabit } = useData();
  const { addNotification } = useNotifications();

  const handleCheckIn = useCallback(async (habitId: string, habitTitle: string, count: number = 1) => {
    try {
      await logHabit(habitId, count);
      // Optional: Sound/Haptic feedback here
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  }, [logHabit, addNotification]);

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
