/**
 * Builds today's reminder schedule and sends it to the Service Worker.
 * Water: once daily at 9 AM. Vitamin: once daily at 8 AM.
 */

import { scheduleRemindersInSW, getPermissionStatus } from '@/lib/pushNotifications';
import { safeParseLocalStorage } from '@/lib/safeStorage';
import i18n from 'i18next';

const tn = (key: string): string => String(i18n.t(`notificationsPanel.${key}`));

interface ScheduledReminder {
  title: string;
  body: string;
  tag: string;
  url: string;
  fireAt: number;
}

function todayAt(hour: number, minute = 0): number {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

export async function sendDailyScheduleToSW(): Promise<void> {
  if (getPermissionStatus() !== 'granted') return;

  const pushEnabled = localStorage.getItem('pushNotificationsEnabled') === 'true';
  if (!pushEnabled) return;

  const settings = safeParseLocalStorage<Record<string, boolean>>(
    'notificationSettings',
    { appointmentReminders: true, vitaminReminders: true, waterReminders: true },
    (v): v is Record<string, boolean> => typeof v === 'object' && v !== null
  );

  const now = Date.now();
  const reminders: ScheduledReminder[] = [];
  const todayStr = new Date().toDateString();

  // Vitamin reminder at 8:00 AM (once daily)
  if (settings.vitaminReminders) {
    const fireAt = todayAt(8);
    if (fireAt > now) {
      reminders.push({
        title: tn('vitaminReminderTitle'),
        body: tn('vitaminReminderMsg'),
        tag: 'vitamin-daily-' + todayStr,
        url: '/tools/vitamin-tracker',
        fireAt,
      });
    }
  }

  // Water reminder at 9:00 AM (once daily)
  if (settings.waterReminders) {
    const fireAt = todayAt(9);
    if (fireAt > now) {
      reminders.push({
        title: tn('waterReminderTitle'),
        body: tn('waterReminderMsg'),
        tag: 'water-daily-' + todayStr,
        url: '/',
        fireAt,
      });
    }
  }

  if (reminders.length > 0) {
    await scheduleRemindersInSW(reminders);
  }
}
