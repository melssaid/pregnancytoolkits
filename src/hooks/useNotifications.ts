import { useState, useEffect, useCallback, useRef } from 'react';
import { differenceInDays, addDays, format } from 'date-fns';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { playNotificationSound } from '@/lib/notificationSound';
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

export interface Notification {
  id: string;
  type: 'appointment' | 'vitamin' | 'water' | 'cycle' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationSettings {
  appointmentReminders: boolean;
  vitaminReminders: boolean;
  waterReminders: boolean;
  cycleReminders: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  appointmentReminders: true,
  vitaminReminders: true,
  waterReminders: true,
  cycleReminders: true,
};

const WATER_INTERVAL_HOURS = 6;

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

    // date-fns imported at top level

    // Detect cycles from dayLogs
    const dayLogs = data.dayLogs || {};
    const dates = Object.keys(dayLogs).filter(d => dayLogs[d]?.flow).sort();
    
    let lastPeriodStart: Date | null = null;
    let avgCycle = data.setup?.cycleLength || 28;

    if (dates.length > 0) {
      // Find period groups
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

      // Calculate average cycle from detected periods
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
    // Migrate old settings — drop removed keys
    setSettings({ 
      appointmentReminders: savedSettings.appointmentReminders ?? true,
      vitaminReminders: savedSettings.vitaminReminders ?? true,
      waterReminders: savedSettings.waterReminders ?? true,
      cycleReminders: (savedSettings as any).cycleReminders ?? true,
    });
    // Filter out legacy notification types
    const validTypes = ['appointment', 'vitamin', 'water', 'cycle', 'general'];
    setNotifications(savedNotifications.filter(n => validTypes.includes(n.type)));
    
    isInitialized.current = true;
  }, []);

  // Save notifications
  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage('pregnancyNotifications', notifications);
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Save settings
  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage('notificationSettings', settings);
  }, [settings]);

  // Auto-clean old read notifications (older than 12 hours)
  useEffect(() => {
    if (!isInitialized.current) return;
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    const now = Date.now();
    const cleaned = notifications.filter(n => {
      if (!n.read) return true;
      return (now - new Date(n.time).getTime()) < SIX_HOURS;
    });
    if (cleaned.length !== notifications.length) {
      setNotifications(cleaned);
    }
  }, [notifications]);

  // Generate smart reminders
  useEffect(() => {
    if (!isInitialized.current) return;

    const generateSmartReminders = () => {
      const now = new Date();
      const nowISO = now.toISOString();
      const hour = now.getHours();
      const newNotifications: Notification[] = [];

      const hasTodayReminder = (type: string, subKey?: string) => {
        return notifications.some(
          n => n.type === type && 
          (!subKey || n.id.includes(subKey)) &&
          new Date(n.time).toDateString() === now.toDateString()
        );
      };

      // Morning vitamin reminder (8 AM+ — once daily)
      if (settings.vitaminReminders && hour >= 8 && !hasTodayReminder('vitamin')) {
        newNotifications.push({
          id: `vitamin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'vitamin',
          title: tn('vitaminReminderTitle'),
          message: tn('vitaminReminderMsg'),
          time: nowISO,
          read: false,
          actionUrl: '/tools/vitamin-tracker',
        });
      }

      // Water reminder (every 4 hours)
      if (settings.waterReminders) {
        const recentWater = notifications.find(
          n => n.type === 'water' && 
          (now.getTime() - new Date(n.time).getTime()) < WATER_INTERVAL_HOURS * 60 * 60 * 1000
        );
        if (!recentWater) {
          newNotifications.push({
            id: `water-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'water',
            title: tn('waterReminderTitle'),
            message: tn('waterReminderMsg'),
            time: nowISO,
            read: false,
          });
        }
      }

      // Appointment reminders — tomorrow (8 AM+ window, once daily)
      if (settings.appointmentReminders && hour >= 8) {
        const appointments = getAppointmentsFromStorage();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        
        const tomorrowAppointments = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= tomorrow && aptDate < dayAfterTomorrow;
        });
        
        for (const apt of tomorrowAppointments) {
          const existingReminder = notifications.find(
            n => n.type === 'appointment' && 
            n.id.includes(apt.id) &&
            !n.id.includes('today-') &&
            !n.id.includes('2h-') &&
            new Date(n.time).toDateString() === now.toDateString()
          );
          
          if (!existingReminder) {
            const aptDate = new Date(apt.appointment_date);
            const timeStr = aptDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', minute: '2-digit', hour12: true 
            });
            
            newNotifications.push({
              id: `appointment-${apt.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'appointment',
              title: tn('appointmentTomorrowTitle'),
              message: formatAppointmentMsg(apt, timeStr),
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
          const existingReminder = notifications.find(
            n => n.type === 'appointment' && 
            n.id.includes(`today-${apt.id}`) &&
            new Date(n.time).toDateString() === now.toDateString()
          );
          
          if (!existingReminder) {
            const aptDate = new Date(apt.appointment_date);
            const timeStr = aptDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', minute: '2-digit', hour12: true 
            });
            
            newNotifications.push({
              id: `appointment-today-${apt.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'appointment',
              title: tn('appointmentTodayTitle'),
              message: formatAppointmentMsg(apt, timeStr),
              time: nowISO,
              read: false,
              actionUrl: '/tools/smart-appointment-reminder',
            });
          }
        }
      }

      // 2-hour before appointment reminder
      if (settings.appointmentReminders) {
        const appointments = getAppointmentsFromStorage();
        const allUpcoming = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.appointment_date);
          const diffMs = aptDate.getTime() - now.getTime();
          const diffMinutes = diffMs / (1000 * 60);
          return diffMinutes > 0 && diffMinutes <= 125;
        });

        for (const apt of allUpcoming) {
          const existingReminder = notifications.find(
            n => n.type === 'appointment' && n.id.includes(`2h-${apt.id}`)
          );
          
          if (!existingReminder) {
            const aptDate = new Date(apt.appointment_date);
            const timeStr = aptDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', minute: '2-digit', hour12: true 
            });
            
            newNotifications.push({
              id: `appointment-2h-${apt.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'appointment',
              title: tn('appointment2hTitle'),
              message: formatAppointmentMsg(apt, timeStr),
              time: nowISO,
              read: false,
              actionUrl: '/tools/smart-appointment-reminder',
            });
          }
        }
      }
      // Cycle reminders — 1-2 days before period & ovulation
      if (settings.cycleReminders && hour >= 8) {
        const cycleStats = getCycleStatsFromStorage();
        const todayStr = format(now, 'yyyy-MM-dd');
        
        if (cycleStats.nextPeriod) {
          const daysUntilPeriod = differenceInDays(new Date(cycleStats.nextPeriod), new Date(todayStr));
          
          // 2 days before period
          if (daysUntilPeriod === 2 && !hasTodayReminder('cycle', 'period-2d')) {
            newNotifications.push({
              id: `cycle-period-2d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'cycle',
              title: tn('cyclePeriod2dTitle'),
              message: tn('cyclePeriod2dMsg'),
              time: nowISO,
              read: false,
              actionUrl: '/tools/cycle-tracker',
            });
          }
          
          // 1 day before period
          if (daysUntilPeriod === 1 && !hasTodayReminder('cycle', 'period-1d')) {
            newNotifications.push({
              id: `cycle-period-1d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'cycle',
              title: tn('cyclePeriod1dTitle'),
              message: tn('cyclePeriod1dMsg'),
              time: nowISO,
              read: false,
              actionUrl: '/tools/cycle-tracker',
            });
          }
        }
        
        if (cycleStats.ovulationDay) {
          const daysUntilOv = differenceInDays(new Date(cycleStats.ovulationDay), new Date(todayStr));
          
          // 2 days before ovulation
          if (daysUntilOv === 2 && !hasTodayReminder('cycle', 'ov-2d')) {
            newNotifications.push({
              id: `cycle-ov-2d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'cycle',
              title: tn('cycleOv2dTitle'),
              message: tn('cycleOv2dMsg'),
              time: nowISO,
              read: false,
              actionUrl: '/tools/cycle-tracker',
            });
          }
          
          // 1 day before ovulation
          if (daysUntilOv === 1 && !hasTodayReminder('cycle', 'ov-1d')) {
            newNotifications.push({
              id: `cycle-ov-1d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'cycle',
              title: tn('cycleOv1dTitle'),
              message: tn('cycleOv1dMsg'),
              time: nowISO,
              read: false,
              actionUrl: '/tools/cycle-tracker',
            });
          }
        }
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev].slice(0, 10));
        
        const hasAppointment = newNotifications.some(n => n.type === 'appointment');
        if (hasAppointment) {
          playNotificationSound('reminder');
        }

        // Push notifications
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

    generateSmartReminders();
    const interval = setInterval(generateSmartReminders, 60000);
    return () => clearInterval(interval);
  }, [settings, notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${notification.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      time: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 10));
    
    const soundType = notification.type === 'appointment' ? 'reminder' : 'gentle';
    playNotificationSound(soundType);

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

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

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
