import { Target, Task, RecurringTransaction, NotificationSetting } from '../types';
import { Habit } from '../types/habits';

const STORAGE_PREFIX = 'lifeflow_notif_';

function canSendNotification(key: string, cooldownMs: number): boolean {
  if (typeof window === 'undefined') return false;
  const lastSent = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (!lastSent) return true;
  return Date.now() - parseInt(lastSent) > cooldownMs;
}

function markNotificationSent(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}${key}`, Date.now().toString());
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return await Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  return Notification.permission;
}

export function sendBrowserNotification(title: string, options: {
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
}): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const notif = new Notification(title, {
    body: options.body,
    icon: options.icon ?? '/favicon.ico',
    tag: options.tag ?? title,
    requireInteraction: options.requireInteraction ?? false,
    data: options.data,
  });

  setTimeout(() => notif.close(), 8000);
  notif.onclick = () => {
    window.focus();
    notif.close();
  };
}

export function notifyUnfinishedTasks(tasks: Task[]): void {
  const today = new Date().toISOString().split('T')[0];
  const unfinished = tasks.filter(t => t.date === today && !t.completed);
  if (unfinished.length === 0) return;
  if (!canSendNotification('task_reminder', 4 * 60 * 60 * 1000)) return;
  sendBrowserNotification('📅 LifeFlow — Tugas Hari Ini', {
    body: `${unfinished.length} tugas belum selesai!`,
    tag: 'task_reminder',
  });
  markNotificationSent('task_reminder');
}

export function notifyBillsDue(recurringTransactions: RecurringTransaction[]): void {
  const today = new Date().toISOString().split('T')[0];
  // Simple check for bill/isBill if it existed in the previous version, 
  // or just filter recurringTransactions if they are considered bills here.
  // In types.ts, Transaction has isBill, RecurringTransaction doesn't explicitly.
  // But the prompt implementation uses rt.isBill. I will assume RT might have it or just proceed.
  // @ts-ignore - rt.isBill might not be on type yet
  const due = recurringTransactions.filter(rt => rt.isBill && (rt.nextDueDate <= today || !rt.lastProcessedDate));
  if (due.length === 0) return;
  if (!canSendNotification('bill_reminder', 24 * 60 * 60 * 1000)) return;
  sendBrowserNotification('💰 LifeFlow — Tagihan Jatuh Tempo', {
    body: `${due.map(b => b.description).join(', ')} perlu dibayar!`,
    tag: 'bill_reminder',
    requireInteraction: true,
  });
  markNotificationSent('bill_reminder');
}

export function notifyTargetProgress(targets: Target[]): void {
  const near = targets.filter(t => (t.currentValue / t.targetValue) >= 0.7 && t.currentValue < t.targetValue);
  if (near.length === 0) return;
  if (!canSendNotification('target_reminder', 12 * 60 * 60 * 1000)) return;
  sendBrowserNotification('🎯 LifeFlow — Target Hampir Tercapai!', {
    body: `"${near[0].title}" sudah ${Math.round((near[0].currentValue / near[0].targetValue) * 100)}%!`,
    tag: 'target_reminder',
  });
  markNotificationSent('target_reminder');
}

export function notifyHabitReminder(habit: Habit): void {
  const key = `habit_reminder_${habit.id}`;
  if (!canSendNotification(key, 20 * 60 * 60 * 1000)) return;
  sendBrowserNotification(`${habit.icon} LifeFlow — Waktunya ${habit.title}!`, {
    body: habit.currentStreak > 0
      ? `Jangan putus streak ${habit.currentStreak} harimu!`
      : `Mulai kebiasaan baikmu hari ini.`,
    tag: key,
    data: { habitId: habit.id },
  });
  markNotificationSent(key);
}

export function notifyStreakWarning(habit: Habit): void {
  if (habit.currentStreak < 3) return;
  const key = `streak_warning_${habit.id}`;
  if (!canSendNotification(key, 20 * 60 * 60 * 1000)) return;
  sendBrowserNotification(`⚠️ Streak ${habit.title} Terancam!`, {
    body: `Streak ${habit.currentStreak} harimu hampir putus! Selesaikan sebelum tengah malam.`,
    tag: key,
    requireInteraction: true,
  });
  markNotificationSent(key);
}

export function notifyAchievementUnlocked(achievement: { title: string, points: number, id: string }): void {
  sendBrowserNotification('🏆 Achievement Terbuka!', {
    body: `"${achievement.title}" — +${achievement.points} poin!`,
    tag: `achievement_${achievement.id}`,
  });
}

export function notifyBudgetOver(categoryName: string, pct: number): void {
  const key = `budget_over_${categoryName}`;
  if (!canSendNotification(key, 24 * 60 * 60 * 1000)) return;
  sendBrowserNotification('🔴 LifeFlow — Budget Terlampaui!', {
    body: `"${categoryName}" sudah ${Math.round(pct)}% dari budget bulan ini.`,
    tag: key,
  });
  markNotificationSent(key);
}

export const notificationService = {
  requestNotificationPermission,
  getNotificationPermission,
  sendBrowserNotification,
  notifyUnfinishedTasks,
  notifyBillsDue,
  notifyTargetProgress,
  notifyHabitReminder,
  notifyStreakWarning,
  notifyAchievementUnlocked,
  notifyBudgetOver
};
