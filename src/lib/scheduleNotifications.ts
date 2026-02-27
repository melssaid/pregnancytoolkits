/**
 * Builds today's reminder schedule and sends it to the Service Worker.
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

  const existingNotifications: Array<{ type: string; time: string; id: string }> =
    safeParseLocalStorage('pregnancyNotifications', [], (v): v is any[] => Array.isArray(v));

  const now = Date.now();
  const todayStr = new Date().toDateString();

  const hasTodayReminder = (type: string) =>
    existingNotifications.some(
      (n) => n.type === type && new Date(n.time).toDateString() === todayStr
    );

  const reminders: ScheduledReminder[] = [];

  // Vitamin reminder at 8:00 AM
  if (settings.vitaminReminders && !hasTodayReminder('vitamin')) {
    const fireAt = todayAt(8);
    if (fireAt > now) {
      reminders.push({
        title: tn('vitaminReminderTitle'),
        body: tn('vitaminReminderMsg'),
        tag: 'vitamin-scheduled-' + todayStr,
        url: '/tools/vitamin-tracker',
        fireAt,
      });
    }
  }

  // Water reminders every 4 hours from 8 AM to 10 PM
  if (settings.waterReminders) {
    for (let hour = 8; hour <= 22; hour += 4) {
      const fireAt = todayAt(hour);
      if (fireAt > now) {
        reminders.push({
          title: tn('waterReminderTitle'),
          body: tn('waterReminderMsg'),
          tag: `water-scheduled-${hour}-${todayStr}`,
          url: '/',
          fireAt,
        });
      }
    }
  }

  if (reminders.length > 0) {
    await scheduleRemindersInSW(reminders);
  }
}
