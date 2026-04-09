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

  // Return reminder — if user hasn't opened app in 48h (checked via localStorage)
  const lastVisit = localStorage.getItem('pt_last_visit_ts');
  const now48h = now - 48 * 3600000;
  if (lastVisit && parseInt(lastVisit, 10) < now48h) {
    const fireAt = todayAt(10);
    if (fireAt > now) {
      reminders.push({
        title: tn('returnReminderTitle'),
        body: tn('returnReminderMsg'),
        tag: 'return-reminder-' + todayStr,
        url: '/',
        fireAt,
      });
    }
  }
  // Always update last visit
  localStorage.setItem('pt_last_visit_ts', String(now));

  // Milestone notifications (week-based)
  try {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const week = profile.pregnancyWeek || 0;
    const milestones = [12, 20, 28, 37];
    const lastMilestone = parseInt(localStorage.getItem('pt_milestone_notified') || '0', 10);
    for (const m of milestones) {
      if (week >= m && m > lastMilestone) {
        const fireAt = todayAt(11);
        if (fireAt > now) {
          reminders.push({
            title: tn('milestoneTitle'),
            body: tn('milestoneMsg'),
            tag: 'milestone-' + m,
            url: '/dashboard',
            fireAt,
          });
          localStorage.setItem('pt_milestone_notified', String(m));
        }
        break;
      }
    }
  } catch {}

  if (reminders.length > 0) {
    await scheduleRemindersInSW(reminders);
  }
}
