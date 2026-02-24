/**
 * Builds today's reminder schedule and sends it to the Service Worker.
 * Should be called once after the app initializes and push is granted.
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
  fireAt: number; // ms timestamp
}

/**
 * Calculate the ms timestamp for a given hour today (local time).
 */
function todayAt(hour: number, minute = 0): number {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

/**
 * Build and send the daily reminder schedule to the SW.
 * Only schedules future reminders that haven't already been sent today.
 */
export async function sendDailyScheduleToSW(): Promise<void> {
  if (getPermissionStatus() !== 'granted') return;

  const pushEnabled = localStorage.getItem('pushNotificationsEnabled') === 'true';
  if (!pushEnabled) return;

  // Read notification settings
  const settings = safeParseLocalStorage<Record<string, boolean>>(
    'notificationSettings',
    {
      appointmentReminders: true,
      vitaminReminders: true,
      waterReminders: true,
      exerciseReminders: false,
      stretchReminders: false,
      backupReminders: false,
    },
    (v): v is Record<string, boolean> => typeof v === 'object' && v !== null
  );

  // Read existing notifications to avoid duplicates
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

  // Stretch reminder at 10:00 AM
  if (settings.stretchReminders && !hasTodayReminder('stretch')) {
    const fireAt = todayAt(10);
    if (fireAt > now) {
      reminders.push({
        title: tn('stretchReminderTitle'),
        body: tn('stretchReminderMsg'),
        tag: 'stretch-scheduled-' + todayStr,
        url: '/tools/ai-fitness-coach',
        fireAt,
      });
    }
  }


  // Water reminders every 2 hours from 8 AM to 10 PM
  if (settings.waterReminders) {
    for (let hour = 8; hour <= 22; hour += 2) {
      const fireAt = todayAt(hour);
      if (fireAt > now) {
        reminders.push({
          title: tn('waterReminderTitle'),
          body: tn('waterReminderMsg'),
          tag: `water-scheduled-${hour}-${todayStr}`,
          url: '/tools/vitamin-tracker',
          fireAt,
        });
      }
    }
  }

  // Exercise reminder at 4:00 PM
  if (settings.exerciseReminders && !hasTodayReminder('exercise')) {
    const fireAt = todayAt(16);
    if (fireAt > now) {
      reminders.push({
        title: tn('exerciseReminderTitle'),
        body: tn('exerciseReminderMsg'),
        tag: 'exercise-scheduled-' + todayStr,
        url: '/tools/ai-fitness-coach',
        fireAt,
      });
    }
  }

  // Backup reminder at 9:00 AM
  if (settings.backupReminders && !hasTodayReminder('backup')) {
    const lastBackupDate = localStorage.getItem('last_backup_date');
    const daysSinceBackup = lastBackupDate
      ? Math.floor((now - new Date(lastBackupDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (daysSinceBackup >= 7) {
      const fireAt = todayAt(9);
      if (fireAt > now) {
        reminders.push({
          title: tn('backupReminderTitle'),
          body: tn('backupReminderMsgNever'),
          tag: 'backup-scheduled-' + todayStr,
          url: '/settings',
          fireAt,
        });
      }
    }
  }

  if (reminders.length > 0) {
    await scheduleRemindersInSW(reminders);
    // Reminders scheduled
  }
}
