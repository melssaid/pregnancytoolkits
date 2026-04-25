import { useState, useEffect, useCallback, useRef } from 'react';
import { differenceInDays, addDays, format } from 'date-fns';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { showPushNotification, getPermissionStatus } from '@/lib/pushNotifications';
import i18n from 'i18next';

const tn = (key: string, options?: Record<string, any>): string => String(i18n.t(`notificationsPanel.${key}`, options));

const formatAppointmentMsg = (apt: any, timeStr: string): string => {
  if (apt.doctor_name && apt.location) {
    return tn('appointmentMsgDoctorLocation', { title: apt.title, doctor: apt.doctor_name, time: timeStr, location: apt.location });
  }
  if (apt.doctor_name) {
    return tn('appointmentMsgDoctor', { title: apt.title, doctor: apt.doctor_name, time: timeStr });
  }
  if (apt.location) {
    return tn('appointmentMsgLocation', { title: apt.title, time: timeStr, location: apt.location });
  }
  return tn('appointmentMsg', { title: apt.title, time: timeStr });
};

/** Returns the appropriate message key and params for an appointment notification */
const getAppointmentMsgKeyAndParams = (apt: any, timeStr: string): { messageKey: string; messageParams: Record<string, string> } => {
  if (apt.doctor_name && apt.location) {
    return { messageKey: 'notificationsPanel.appointmentMsgDoctorLocation', messageParams: { title: apt.title, doctor: apt.doctor_name, time: timeStr, location: apt.location } };
  }
  if (apt.doctor_name) {
    return { messageKey: 'notificationsPanel.appointmentMsgDoctor', messageParams: { title: apt.title, doctor: apt.doctor_name, time: timeStr } };
  }
  if (apt.location) {
    return { messageKey: 'notificationsPanel.appointmentMsgLocation', messageParams: { title: apt.title, time: timeStr, location: apt.location } };
  }
  return { messageKey: 'notificationsPanel.appointmentMsg', messageParams: { title: apt.title, time: timeStr } };
};

export interface Notification {
  id: string;
  type: 'appointment' | 'vitamin' | 'water' | 'cycle' | 'general' | 'weeklyTip' | 'kickReminder' | 'milestone' | 'diaper';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  /** i18n key for title — resolved at render time for live language switching */
  titleKey?: string;
  /** i18n key for message — resolved at render time */
  messageKey?: string;
  /** Interpolation params for messageKey */
  messageParams?: Record<string, string>;
}

export interface NotificationSettings {
  masterEnabled: boolean;
  appointmentReminders: boolean;
  vitaminReminders: boolean;
  waterReminders: boolean;
  cycleReminders: boolean;
  weeklyTipReminders: boolean;
  kickReminders: boolean;
  milestoneReminders: boolean;
  diaperReminders: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  masterEnabled: false,
  appointmentReminders: false,
  vitaminReminders: false,
  waterReminders: false,
  cycleReminders: false,
  weeklyTipReminders: false,
  kickReminders: false,
  milestoneReminders: false,
  diaperReminders: false,
};

/* ── Dismissed tracker ──
 * Tracks which notification keys were dismissed TODAY.
 * Prevents regeneration after user clears a notification.
 */
const DISMISSED_KEY = 'notificationsDismissedToday';

function getTodayStr(): string {
  return new Date().toDateString();
}

function getDismissedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (parsed.date !== getTodayStr()) {
      // New day — reset
      localStorage.removeItem(DISMISSED_KEY);
      return new Set();
    }
    return new Set(parsed.keys || []);
  } catch {
    return new Set();
  }
}

function addDismissedKey(key: string): void {
  const dismissed = getDismissedSet();
  dismissed.add(key);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify({
    date: getTodayStr(),
    keys: Array.from(dismissed),
  }));
}

function isDismissedToday(key: string): boolean {
  return getDismissedSet().has(key);
}

/* ── Data existence checks ──
 * Notifications only fire when the user has actually used the related tool.
 * Exported so the panel can show which notifications are available.
 */
export const hasAppointmentData = (): boolean => {
  try {
    const data = localStorage.getItem('appointments');
    return data ? JSON.parse(data).length > 0 : false;
  } catch { return false; }
};

export const hasVitaminData = (): boolean => {
  try {
    const userId = localStorage.getItem('pregnancy_user_id') || 'default';
    const data = localStorage.getItem(`vitamin_logs_${userId}`);
    return data ? JSON.parse(data).length > 0 : false;
  } catch { return false; }
};

export const hasCycleData = (): boolean => {
  try {
    const raw = localStorage.getItem('cycle-tracker-v2');
    if (!raw) return false;
    const data = JSON.parse(raw);
    const dayLogs = data.dayLogs || {};
    return Object.keys(dayLogs).some(d => dayLogs[d]?.flow) || !!data.setup?.lastPeriodDate;
  } catch { return false; }
};

export const hasKickData = (): boolean => {
  try {
    return readKickSessions().length > 0;
  } catch { return false; }
};

export const hasDiaperData = (): boolean => {
  try {
    const data = localStorage.getItem('diaperEntries');
    return data ? JSON.parse(data).length > 0 : false;
  } catch { return false; }
};

const getLastDiaperChangeTime = (): Date | null => {
  try {
    const data = localStorage.getItem('diaperEntries');
    if (!data) return null;
    const entries = JSON.parse(data);
    if (entries.length === 0) return null;
    return new Date(entries[0].time);
  } catch { return null; }
};

const getAppointmentsFromStorage = (): any[] => {
  try {
    const data = localStorage.getItem('appointments');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const isNotification = (data: unknown): data is Notification => {
  if (typeof data !== 'object' || data === null) return false;
  const n = data as Record<string, unknown>;
  return (
    typeof n.id === 'string' &&
    typeof n.type === 'string' &&
    typeof n.title === 'string' &&
    typeof n.message === 'string' &&
    typeof n.time === 'string' &&
    typeof n.read === 'boolean'
  );
};

const isNotificationArray = (data: unknown): data is Notification[] => {
  return Array.isArray(data) && data.every(isNotification);
};

const isSettings = (data: unknown): data is NotificationSettings => {
  if (typeof data !== 'object' || data === null) return false;
  const s = data as Record<string, unknown>;
  return (
    typeof s.appointmentReminders === 'boolean' &&
    typeof s.vitaminReminders === 'boolean' &&
    typeof s.waterReminders === 'boolean'
  );
};

/* ── Cycle data reader ── */
const getCycleStatsFromStorage = (): { nextPeriod: string | null; ovulationDay: string | null } => {
  try {
    const raw = localStorage.getItem('cycle-tracker-v2');
    if (!raw) return { nextPeriod: null, ovulationDay: null };
    const data = JSON.parse(raw);
    if (!data.setup && Object.keys(data.dayLogs || {}).length === 0) return { nextPeriod: null, ovulationDay: null };

    const dayLogs = data.dayLogs || {};
    const dates = Object.keys(dayLogs).filter(d => dayLogs[d]?.flow).sort();
    
    let lastPeriodStart: Date | null = null;
    let avgCycle = data.setup?.cycleLength || 28;

    if (dates.length > 0) {
      const periods: string[] = [];
      let curStart = dates[0];
      let curEnd = dates[0];
      for (let i = 1; i < dates.length; i++) {
        const gap = differenceInDays(new Date(dates[i]), new Date(curEnd));
        if (gap <= 2) {
          curEnd = dates[i];
        } else {
          periods.push(curStart);
          curStart = dates[i];
          curEnd = dates[i];
        }
      }
      periods.push(curStart);

      lastPeriodStart = new Date(periods[periods.length - 1]);

      if (periods.length >= 2) {
        const cycleLengths: number[] = [];
        for (let i = 0; i < periods.length - 1; i++) {
          const len = differenceInDays(new Date(periods[i + 1]), new Date(periods[i]));
          if (len > 0 && len < 60) cycleLengths.push(len);
        }
        if (cycleLengths.length > 0) {
          avgCycle = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
        }
      }
    } else if (data.setup?.lastPeriodDate) {
      lastPeriodStart = new Date(data.setup.lastPeriodDate);
    }

    if (!lastPeriodStart) return { nextPeriod: null, ovulationDay: null };

    const nextPeriod = addDays(lastPeriodStart, avgCycle);
    const ovulationDay = addDays(lastPeriodStart, avgCycle - 14);

    return {
      nextPeriod: format(nextPeriod, 'yyyy-MM-dd'),
      ovulationDay: format(ovulationDay, 'yyyy-MM-dd'),
    };
  } catch {
    return { nextPeriod: null, ovulationDay: null };
  }
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [unreadCount, setUnreadCount] = useState(0);
  const isInitialized = useRef(false);
  const notificationsRef = useRef<Notification[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedNotifications = safeParseLocalStorage<Notification[]>(
      'pregnancyNotifications',
      [],
      isNotificationArray
    );

    const savedSettings = safeParseLocalStorage<NotificationSettings>(
      'notificationSettings',
      DEFAULT_SETTINGS,
      isSettings
    );

    // Auto-enable notifications ONLY for categories where user has confirmed data
    // and ONLY if user has never manually configured settings
    const hasManuallyConfigured = localStorage.getItem('notificationSettings') !== null;
    
    let resolvedSettings: NotificationSettings;
    if (hasManuallyConfigured) {
      resolvedSettings = {
        masterEnabled: (savedSettings as any).masterEnabled ?? true,
        appointmentReminders: savedSettings.appointmentReminders ?? false,
        vitaminReminders: savedSettings.vitaminReminders ?? false,
        waterReminders: savedSettings.waterReminders ?? false,
        cycleReminders: (savedSettings as any).cycleReminders ?? false,
        weeklyTipReminders: (savedSettings as any).weeklyTipReminders ?? false,
        kickReminders: (savedSettings as any).kickReminders ?? false,
        milestoneReminders: (savedSettings as any).milestoneReminders ?? false,
        diaperReminders: (savedSettings as any).diaperReminders ?? false,
      };
    } else {
      // Smart defaults: only enable if user has actual data
      const hasAnyData = hasAppointmentData() || hasVitaminData() || hasCycleData();
      resolvedSettings = {
        masterEnabled: hasAnyData,
        appointmentReminders: hasAppointmentData(),
        vitaminReminders: hasVitaminData(),
        waterReminders: false, // always manual opt-in
        cycleReminders: hasCycleData(),
        weeklyTipReminders: false,
        kickReminders: false,
        milestoneReminders: false,
        diaperReminders: false, // always manual opt-in
      };
    }

    setSettings(resolvedSettings);

    const validTypes = ['appointment', 'vitamin', 'water', 'cycle', 'general', 'weeklyTip', 'kickReminder', 'milestone', 'diaper'];
    const validNotifications = savedNotifications.filter(n => validTypes.includes(n.type));
    
    // CRITICAL: Set ref BEFORE setting state to prevent race condition
    notificationsRef.current = validNotifications;
    setNotifications(validNotifications);
    
    isInitialized.current = true;
  }, []);

  // Save notifications & sync ref
  useEffect(() => {
    if (!isInitialized.current) return;
    notificationsRef.current = notifications;
    safeSaveToLocalStorage('pregnancyNotifications', notifications);
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Save settings
  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage('notificationSettings', settings);
  }, [settings]);

  // Auto-clean old read notifications (older than 6 hours) — runs once on init
  useEffect(() => {
    if (!isInitialized.current) return;
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const now = Date.now();
    setNotifications(prev => {
      const cleaned = prev.filter(n => {
        if (!n.read) return true;
        return (now - new Date(n.time).getTime()) < SIX_HOURS;
      });
      return cleaned.length !== prev.length ? cleaned : prev;
    });
   
  }, []); // Run once on mount only

  // Generate smart reminders
  useEffect(() => {
    if (!isInitialized.current) return;

    const generateSmartReminders = () => {
      // Master toggle check — skip all generation if disabled
      if (!settings.masterEnabled) return;
      const now = new Date();
      const nowISO = now.toISOString();
      const hour = now.getHours();
      const todayDate = now.toDateString();
      const newNotifications: Notification[] = [];

      // Check if a notification key already exists today (either in list or dismissed)
      const currentNotifications = notificationsRef.current;
      const hasToday = (key: string) => {
        if (isDismissedToday(key)) return true;
        return currentNotifications.some(
          n => n.id.startsWith(key) && new Date(n.time).toDateString() === todayDate
        );
      };

      // ── Water reminder: ONCE daily at 9 AM ──
      if (settings.waterReminders && hour >= 9) {
        const waterKey = `water-daily-${todayDate}`;
        if (!hasToday(waterKey)) {
          newNotifications.push({
            id: waterKey,
            type: 'water',
            title: tn('waterReminderTitle'),
            message: tn('waterReminderMsg'),
            titleKey: 'notificationsPanel.waterReminderTitle',
            messageKey: 'notificationsPanel.waterReminderMsg',
            time: nowISO,
            read: false,
          });
        }
      }

      // ── Vitamin reminder: once daily at 8 AM (only if user has vitamin data) ──
      if (settings.vitaminReminders && hour >= 8 && hasVitaminData()) {
        const vitaminKey = `vitamin-daily-${todayDate}`;
        if (!hasToday(vitaminKey)) {
          newNotifications.push({
            id: vitaminKey,
            type: 'vitamin',
            title: tn('vitaminReminderTitle'),
            message: tn('vitaminReminderMsg'),
            titleKey: 'notificationsPanel.vitaminReminderTitle',
            messageKey: 'notificationsPanel.vitaminReminderMsg',
            time: nowISO,
            read: false,
            actionUrl: '/tools/vitamin-tracker',
          });
        }
      }

      // ── Appointment reminders ──
      if (settings.appointmentReminders && hour >= 8) {
        const appointments = getAppointmentsFromStorage();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        
        // Tomorrow's appointments
        const tomorrowAppointments = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= tomorrow && aptDate < dayAfterTomorrow;
        });
        
        for (const apt of tomorrowAppointments) {
          const aptKey = `apt-tmrw-${apt.id}-${todayDate}`;
          if (!hasToday(aptKey)) {
            const aptDate = new Date(apt.appointment_date);
            const timeStr = aptDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', minute: '2-digit', hour12: true 
            });
            const { messageKey, messageParams } = getAppointmentMsgKeyAndParams(apt, timeStr);
            newNotifications.push({
              id: aptKey,
              type: 'appointment',
              title: tn('appointmentTomorrowTitle'),
              message: formatAppointmentMsg(apt, timeStr),
              titleKey: 'notificationsPanel.appointmentTomorrowTitle',
              messageKey,
              messageParams,
              time: nowISO,
              read: false,
              actionUrl: '/tools/smart-appointment-reminder',
            });
          }
        }
        
        // Today's appointments
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        
        const todayAppointments = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= todayStart && aptDate < tomorrow;
        });
        
        for (const apt of todayAppointments) {
          const aptKey = `apt-today-${apt.id}-${todayDate}`;
          if (!hasToday(aptKey)) {
            const aptDate = new Date(apt.appointment_date);
            const timeStr = aptDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', minute: '2-digit', hour12: true 
            });
            const { messageKey, messageParams } = getAppointmentMsgKeyAndParams(apt, timeStr);
            newNotifications.push({
              id: aptKey,
              type: 'appointment',
              title: tn('appointmentTodayTitle'),
              message: formatAppointmentMsg(apt, timeStr),
              titleKey: 'notificationsPanel.appointmentTodayTitle',
              messageKey,
              messageParams,
              time: nowISO,
              read: false,
              actionUrl: '/tools/smart-appointment-reminder',
            });
          }
        }
      }

      // ── 2-hour before appointment ──
      if (settings.appointmentReminders) {
        const appointments = getAppointmentsFromStorage();
        const allUpcoming = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.appointment_date);
          const diffMs = aptDate.getTime() - now.getTime();
          const diffMinutes = diffMs / (1000 * 60);
          return diffMinutes > 0 && diffMinutes <= 125;
        });

        for (const apt of allUpcoming) {
          const aptKey = `apt-2h-${apt.id}-${todayDate}`;
          if (!hasToday(aptKey)) {
            const aptDate = new Date(apt.appointment_date);
            const timeStr = aptDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', minute: '2-digit', hour12: true 
            });
            const { messageKey, messageParams } = getAppointmentMsgKeyAndParams(apt, timeStr);
            newNotifications.push({
              id: aptKey,
              type: 'appointment',
              title: tn('appointment2hTitle'),
              message: formatAppointmentMsg(apt, timeStr),
              titleKey: 'notificationsPanel.appointment2hTitle',
              messageKey,
              messageParams,
              time: nowISO,
              read: false,
              actionUrl: '/tools/smart-appointment-reminder',
            });
          }
        }
      }

      // ── Cycle reminders ──
      if (settings.cycleReminders && hour >= 8) {
        const cycleStats = getCycleStatsFromStorage();
        const todayStr = format(now, 'yyyy-MM-dd');
        
        if (cycleStats.nextPeriod) {
          const daysUntilPeriod = differenceInDays(new Date(cycleStats.nextPeriod), new Date(todayStr));
          
          if (daysUntilPeriod === 2) {
            const key = `cycle-period-2d-${todayDate}`;
            if (!hasToday(key)) {
              newNotifications.push({
                id: key, type: 'cycle',
                title: tn('cyclePeriod2dTitle'), message: tn('cyclePeriod2dMsg'),
                titleKey: 'notificationsPanel.cyclePeriod2dTitle', messageKey: 'notificationsPanel.cyclePeriod2dMsg',
                time: nowISO, read: false, actionUrl: '/tools/cycle-tracker',
              });
            }
          }
          
          if (daysUntilPeriod === 1) {
            const key = `cycle-period-1d-${todayDate}`;
            if (!hasToday(key)) {
              newNotifications.push({
                id: key, type: 'cycle',
                title: tn('cyclePeriod1dTitle'), message: tn('cyclePeriod1dMsg'),
                titleKey: 'notificationsPanel.cyclePeriod1dTitle', messageKey: 'notificationsPanel.cyclePeriod1dMsg',
                time: nowISO, read: false, actionUrl: '/tools/cycle-tracker',
              });
            }
          }
        }
        
        if (cycleStats.ovulationDay) {
          const daysUntilOv = differenceInDays(new Date(cycleStats.ovulationDay), new Date(todayStr));
          
          if (daysUntilOv === 2) {
            const key = `cycle-ov-2d-${todayDate}`;
            if (!hasToday(key)) {
              newNotifications.push({
                id: key, type: 'cycle',
                title: tn('cycleOv2dTitle'), message: tn('cycleOv2dMsg'),
                titleKey: 'notificationsPanel.cycleOv2dTitle', messageKey: 'notificationsPanel.cycleOv2dMsg',
                time: nowISO, read: false, actionUrl: '/tools/cycle-tracker',
              });
            }
          }
          
          if (daysUntilOv === 1) {
            const key = `cycle-ov-1d-${todayDate}`;
            if (!hasToday(key)) {
              newNotifications.push({
                id: key, type: 'cycle',
                title: tn('cycleOv1dTitle'), message: tn('cycleOv1dMsg'),
                titleKey: 'notificationsPanel.cycleOv1dTitle', messageKey: 'notificationsPanel.cycleOv1dMsg',
                time: nowISO, read: false, actionUrl: '/tools/cycle-tracker',
              });
            }
          }
        }
      }

      // ── Kick counter reminder (week 28+) at 10 AM — only if user has kick data ──
      if (settings.kickReminders && hour >= 10 && hasKickData()) {
        try {
          const profileRaw = localStorage.getItem('user_central_profile_v1');
          if (profileRaw) {
            const prof = JSON.parse(profileRaw);
            if (prof.isPregnant && prof.pregnancyWeek >= 28) {
              const kickKey = `kick-reminder-${todayDate}`;
              if (!hasToday(kickKey)) {
                newNotifications.push({
                  id: kickKey,
                  type: 'kickReminder',
                  title: tn('kickReminderTitle'),
                  message: tn('kickReminderMsg'),
                  titleKey: 'notificationsPanel.kickReminderTitle',
                  messageKey: 'notificationsPanel.kickReminderMsg',
                  time: nowISO,
                  read: false,
                  actionUrl: '/tools/smart-kick-counter',
                });
              }
            }
          }
        } catch {}
      }

      // ── Monthly milestone celebrations ──
      if (settings.milestoneReminders && hour >= 8) {
        try {
          const profileRaw = localStorage.getItem('user_central_profile_v1');
          if (profileRaw) {
            const prof = JSON.parse(profileRaw);
            if (prof.isPregnant && prof.pregnancyWeek && prof.pregnancyWeek > 0 && prof.lastPeriodDate) {
              const week = prof.pregnancyWeek;
              // Month boundaries: month2=8w, month3=12w, month4=16w, month5=20w, month6=24w, month7=28w, month8=32w, month9=36w
              const milestoneWeeks: Record<number, string> = {
                8: 'month2', 12: 'month3', 16: 'month4', 20: 'month5',
                24: 'month6', 28: 'month7', 32: 'month8', 36: 'month9',
              };
              const milestone = milestoneWeeks[week];
              if (milestone) {
                const msKey = `milestone-${milestone}-${todayDate}`;
                if (!hasToday(msKey)) {
                  newNotifications.push({
                    id: msKey,
                    type: 'milestone',
                    title: tn('milestoneTitle'),
                    message: tn(`milestoneMsg_${milestone}`),
                    titleKey: 'notificationsPanel.milestoneTitle',
                    messageKey: `notificationsPanel.milestoneMsg_${milestone}`,
                    time: nowISO,
                    read: false,
                    actionUrl: '/tools/baby-growth',
                  });
                }
              }
            }
          }
        } catch {}
      }

      // ── Diaper change reminder: fires when 5+ hours since last change ──
      if (settings.diaperReminders && hasDiaperData()) {
        const lastChange = getLastDiaperChangeTime();
        if (lastChange) {
          const hoursSinceChange = (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60);
          if (hoursSinceChange >= 5) {
            const diaperKey = `diaper-5h-${todayDate}-${Math.floor(hoursSinceChange / 5)}`;
            if (!hasToday(diaperKey)) {
              newNotifications.push({
                id: diaperKey,
                type: 'diaper',
                title: tn('diaperReminderTitle'),
                message: tn('diaperReminderMsg'),
                titleKey: 'notificationsPanel.diaperReminderTitle',
                messageKey: 'notificationsPanel.diaperReminderMsg',
                time: nowISO,
                read: false,
                actionUrl: '/tools/diaper-tracker',
              });
            }
          }
        }
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev].slice(0, 15));
        

        // Push notifications (silent — no in-app sounds)
        const pushEnabled = localStorage.getItem('pushNotificationsEnabled') === 'true';
        if (pushEnabled && getPermissionStatus() === 'granted') {
          for (const n of newNotifications) {
            showPushNotification({
              title: n.title,
              body: n.message,
              tag: n.id,
              url: n.actionUrl || '/',
            });
          }
        }
      }
    };

    // Small delay to ensure ref is populated from init effect
    const timeout = setTimeout(generateSmartReminders, 500);
    // Check once every 6 hours (not on every settings change)
    const interval = setInterval(generateSmartReminders, 6 * 60 * 60 * 1000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
   
  }, [settings]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${notification.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      time: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 15));

    const pushEnabled = localStorage.getItem('pushNotificationsEnabled') === 'true';
    if (pushEnabled && getPermissionStatus() === 'granted') {
      showPushNotification({
        title: newNotification.title,
        body: newNotification.message,
        tag: newNotification.id,
        url: newNotification.actionUrl || '/',
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // When user clears a notification, record it as dismissed so it won't regenerate
  const clearNotification = useCallback((id: string) => {
    addDismissedKey(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all — dismiss all current notification keys
  const clearAll = useCallback(() => {
    notifications.forEach(n => addDismissedKey(n.id));
    setNotifications([]);
  }, [notifications]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    updateSettings,
  };
}
