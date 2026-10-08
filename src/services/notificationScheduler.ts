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
import { InAppNotification } from '../contexts/NotificationContext';

let schedulerInterval: ReturnType<typeof setInterval> | null = null;

function safeGetStorage(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function isTimeToNotify(settingTime: string, toleranceMinutes = 5): boolean {
  try {
    if (!settingTime) return false;
    const now = new Date();
    const [hour, minute] = settingTime.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) return false;
    const diff = Math.abs((now.getHours() * 60 + now.getMinutes()) - (hour * 60 + minute));
    return diff <= toleranceMinutes;
  } catch {
    return false;
  }
}

function isHabitDoneToday(habitId: string, habitLogs: HabitLog[] = []): boolean {
  try {
    const today = new Date().toISOString().split('T')[0];
    const log = habitLogs.find(l => l.habitId === habitId && l.date === today);
    return log ? log.completedCount >= 1 : false;
  } catch {
    return false;
  }
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
  addInAppNotification: (notif: { 
    title: string; 
    message: string; 
    type?: InAppNotification['type']; 
    link?: string;
  }) => Promise<void>
): void {
  if (schedulerInterval) return;

  schedulerInterval = setInterval(() => {
    try {
      const data = getData();
      if (!data) return;

      const tasks = data.tasks || [];
      const recurringTransactions = data.recurringTransactions || [];
      const targets = data.targets || [];
      const habits = data.habits || [];
      const habitLogs = data.habitLogs || [];
      const notificationSettings = data.notificationSettings || [];

      const isBrowserNotificationAllowed = getNotificationPermission() === 'granted';

      const now = new Date();
      const currentHour = now.getHours();
      const todayStr = now.toISOString().split('T')[0];

      // 1. Target Harian - Belum selesai menjelang malam (18:00 ke atas)
      if (currentHour >= 18) {
        const incompleteTargets = targets.filter(t => t.targetValue > 0 && t.currentValue < t.targetValue);
        const eveningKey = `notif_target_evening_${todayStr}`;
        if (incompleteTargets.length > 0 && !safeGetStorage(eveningKey)) {
          safeSetStorage(eveningKey, 'true');
          addInAppNotification({
            title: '🎯 Target Harian Menjelang Malam',
            message: `Hari segera berakhir! Kamu masih memiliki ${incompleteTargets.length} target harian yang belum tuntas.`,
            type: 'reminder',
            link: 'targets',
          });
        }
      }

      // 2. Target Harian - Mendekati deadline / hampir selesai (>= 80%)
      targets.forEach(target => {
        if (target.targetValue > 0 && target.currentValue < target.targetValue) {
          const progress = Math.round((target.currentValue / target.targetValue) * 100);
          if (progress >= 80) {
            const nearKey = `notif_target_near_${target.id}_${todayStr}`;
            if (!safeGetStorage(nearKey)) {
              safeSetStorage(nearKey, 'true');
              addInAppNotification({
                title: `🎯 Hampir Tercapai: ${target.title}`,
                message: `Target ini sudah mencapai ${progress}%! Sedikit dorongan lagi untuk menyelesaikannya hari ini.`,
                type: 'reminder',
                link: 'targets',
              });
            }
          }
        }
      });

      // 3. Unfinished Tasks Schedule Reminder
      const schedSetting = notificationSettings.find(s => s.type === 'schedule' && s.enabled);
      if (schedSetting && schedSetting.time && isTimeToNotify(schedSetting.time)) {
        if (isBrowserNotificationAllowed) notifyUnfinishedTasks(tasks);
        const unfinished = tasks.filter(t => !t.completed).length;
        if (unfinished > 0) {
          const schedKey = `notif_sched_${todayStr}_${schedSetting.time}`;
          if (!safeGetStorage(schedKey)) {
            safeSetStorage(schedKey, 'true');
            addInAppNotification({
              title: '⏰ Tugas Belum Selesai',
              message: `Kamu masih punya ${unfinished} tugas hari ini yang perlu dikerjakan.`,
              type: 'reminder',
              link: 'schedule',
            });
          }
        }
      }

      // 4. Bills Due
      const billSetting = notificationSettings.find(s => s.type === 'bill' && s.enabled);
      if (billSetting && billSetting.time && isTimeToNotify(billSetting.time)) {
        if (isBrowserNotificationAllowed) notifyBillsDue(recurringTransactions);
      }

      // 5. Target Setting
      const targetSetting = notificationSettings.find(s => s.type === 'target' && s.enabled);
      if (targetSetting && targetSetting.time && isTimeToNotify(targetSetting.time)) {
        if (isBrowserNotificationAllowed) notifyTargetProgress(targets);
      }

      // 6. Habit Reminders
      const habitReminderEnabled = notificationSettings.find(s => s.type === 'habit_reminder' && s.enabled);
      if (habitReminderEnabled) {
        habits.forEach(habit => {
          if (!habit.reminderTime) return;
          if (isHabitDoneToday(habit.id, habitLogs)) return;
          if (isTimeToNotify(habit.reminderTime)) {
            if (isBrowserNotificationAllowed) notifyHabitReminder(habit);
            const habitKey = `notif_habit_${habit.id}_${todayStr}_${habit.reminderTime}`;
            if (!safeGetStorage(habitKey)) {
              safeSetStorage(habitKey, 'true');
              addInAppNotification({
                title: `Pengingat: ${habit.title}`,
                message: `Waktunya melakukan kebiasaan ${habit.title}!`,
                type: 'reminder',
                link: 'habits',
              });
            }
          }
        });
      }

      // 7. Streak Warning
      const streakWarnEnabled = notificationSettings.find(s => s.type === 'streak_warning' && s.enabled);
      if (streakWarnEnabled) {
        const warnTime = notificationSettings.find(s => s.type === 'streak_warning')?.time || '20:00';
        if (isTimeToNotify(warnTime)) {
          habits.forEach(habit => {
            if (isHabitDoneToday(habit.id, habitLogs)) return;
            if (habit.currentStreak >= 3) {
              if (isBrowserNotificationAllowed) notifyStreakWarning(habit);
              const streakKey = `notif_streak_${habit.id}_${todayStr}`;
              if (!safeGetStorage(streakKey)) {
                safeSetStorage(streakKey, 'true');
                addInAppNotification({
                  title: `⚠️ Bahaya Streak: ${habit.title}`,
                  message: `Streak ${habit.currentStreak} harimu terancam putus malam ini! Segera lakukan check-in.`,
                  type: 'warning',
                  link: 'habits',
                });
              }
            }
          });
        }
      }

      // 8. Check for approaching tasks/events
      tasks.forEach(task => {
        if (task.completed || !task.startTime || !task.date) return;
        if (task.reminderMinutes === undefined) return;
        
        try {
          const [taskHour, taskMinute] = task.startTime.split(':').map(Number);
          const [taskY, taskM, taskD] = task.date.split('-').map(Number);
          const taskDateTime = new Date(taskY, taskM - 1, taskD, taskHour, taskMinute, 0, 0);
          
          const diffMs = taskDateTime.getTime() - now.getTime();
          const diffMinutes = Math.round(diffMs / (60 * 1000));
          
          if (diffMinutes === task.reminderMinutes) {
            if (isBrowserNotificationAllowed) notifyTaskApproaching(task, task.reminderMinutes);
            const taskKey = `notif_task_${task.id}_${task.reminderMinutes}`;
            if (!safeGetStorage(taskKey)) {
              safeSetStorage(taskKey, 'true');
              addInAppNotification({
                title: '⏰ Pengingat Jadwal',
                message: `"${task.title}" ${task.reminderMinutes === 0 ? 'dimulai sekarang!' : `akan dimulai dalam ${task.reminderMinutes} menit!`}`,
                type: 'reminder',
                link: 'schedule',
              });
            }
          }
        } catch (err) {
          console.warn('Error checking task reminder in scheduler:', err);
        }
      });
    } catch (schedulerErr) {
      console.warn('Error in notification scheduler loop:', schedulerErr);
    }
  }, 60 * 1000);
}

export function stopNotificationScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}
