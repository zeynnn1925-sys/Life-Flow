import {
  getNotificationPermission,
  notifyUnfinishedTasks,
  notifyBillsDue,
  notifyTargetProgress,
  notifyHabitReminder,
  notifyStreakWarning,
  notifyTaskApproaching,
} from './notificationService';
import { Task, RecurringTransaction, Target, NotificationSetting } from '../types';
import { Habit, HabitLog } from '../types/habits';

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

function isTimeToNotify(settingTime: string, toleranceMinutes = 5): boolean {
  const now = new Date();
  const [hour, minute] = settingTime.split(':').map(Number);
  const diff = Math.abs((now.getHours() * 60 + now.getMinutes()) - (hour * 60 + minute));
  return diff <= toleranceMinutes;
}

function isHabitDoneToday(habitId: string, habitLogs: HabitLog[]): boolean {
  const today = new Date().toISOString().split('T')[0];
  const log = habitLogs.find(l => l.habitId === habitId && l.date === today);
  return log ? log.completedCount >= 1 : false;
}

interface SchedulerData {
  tasks: Task[];
  recurringTransactions: RecurringTransaction[];
  targets: Target[];
  habits: Habit[];
  habitLogs: HabitLog[];
  notificationSettings: NotificationSetting[];
}

export function startNotificationScheduler(
  getData: () => SchedulerData, 
  addInAppNotification: (notif: { title: string; message: string; type: 'info' | 'warning' | 'success' | 'achievement' }) => Promise<void>
): void {
  if (schedulerInterval) return;

  schedulerInterval = setInterval(() => {
    if (getNotificationPermission() !== 'granted') return;

    const { tasks, recurringTransactions, targets, habits, habitLogs, notificationSettings } = getData();

    const schedSetting = notificationSettings.find(s => s.type === 'schedule' && s.enabled);
    if (schedSetting && schedSetting.time && isTimeToNotify(schedSetting.time)) {
      notifyUnfinishedTasks(tasks);
      const unfinished = tasks.filter(t => !t.completed).length;
      if (unfinished > 0) {
        addInAppNotification({
          title: 'Tugas Belum Selesai',
          message: `Kamu masih punya ${unfinished} tugas hari ini!`,
          type: 'info'
        });
      }
    }

    const billSetting = notificationSettings.find(s => s.type === 'bill' && s.enabled);
    if (billSetting && billSetting.time && isTimeToNotify(billSetting.time)) {
      notifyBillsDue(recurringTransactions);
    }

    const targetSetting = notificationSettings.find(s => s.type === 'target' && s.enabled);
    if (targetSetting && targetSetting.time && isTimeToNotify(targetSetting.time)) {
      notifyTargetProgress(targets);
    }

    const habitReminderEnabled = notificationSettings.find(s => s.type === 'habit_reminder' && s.enabled);
    if (habitReminderEnabled) {
      habits.forEach(habit => {
        if (!habit.reminderTime) return;
        if (isHabitDoneToday(habit.id, habitLogs)) return;
        if (isTimeToNotify(habit.reminderTime)) {
          notifyHabitReminder(habit);
          addInAppNotification({
            title: `Pengingat: ${habit.title}`,
            message: `Waktunya melakukan kebiasaan ${habit.title}!`,
            type: 'info'
          });
        }
      });
    }

    const streakWarnEnabled = notificationSettings.find(s => s.type === 'streak_warning' && s.enabled);
    if (streakWarnEnabled) {
      const warnTime = notificationSettings.find(s => s.type === 'streak_warning')?.time || '20:00';
      if (isTimeToNotify(warnTime)) {
        habits.forEach(habit => {
          if (isHabitDoneToday(habit.id, habitLogs)) return;
          if (habit.currentStreak >= 3) {
            notifyStreakWarning(habit);
            addInAppNotification({
              title: `Bahaya Streak: ${habit.title}`,
              message: `Streak ${habit.currentStreak} harimu terancam putus!`,
              type: 'warning'
            });
          }
        });
      }
    }

    // Check for approaching tasks/events
    tasks.forEach(task => {
      if (task.completed || !task.startTime || !task.date) return;
      if (task.reminderMinutes === undefined) return;
      
      try {
        const now = new Date();
        const [taskHour, taskMinute] = task.startTime.split(':').map(Number);
        const [taskY, taskM, taskD] = task.date.split('-').map(Number);
        const taskDateTime = new Date(taskY, taskM - 1, taskD, taskHour, taskMinute, 0, 0);
        
        const diffMs = taskDateTime.getTime() - now.getTime();
        const diffMinutes = Math.round(diffMs / (60 * 1000));
        
        if (diffMinutes === task.reminderMinutes) {
          notifyTaskApproaching(task, task.reminderMinutes);
          addInAppNotification({
            title: '⏰ Pengingat Jadwal',
            message: `"${task.title}" ${task.reminderMinutes === 0 ? 'dimulai sekarang!' : `akan dimulai dalam ${task.reminderMinutes} menit!`}`,
            type: 'info'
          });
        }
      } catch (err) {
        console.error('Error checking task reminder in scheduler:', err);
      }
    });

  }, 60 * 1000);
}

export function stopNotificationScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}
