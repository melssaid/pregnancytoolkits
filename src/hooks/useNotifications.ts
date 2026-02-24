import { useState, useEffect, useCallback, useRef } from 'react';
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
  type: 'appointment' | 'vitamin' | 'exercise' | 'water' | 'stretch' | 'backup' | 'kegel' | 'general' | 'welcome' | 'disclaimer';
  title: string;
  message: string;
  time: string; // Store as ISO string for safer serialization
  read: boolean;
  actionUrl?: string;
  isPinned?: boolean; // Pinned notifications cannot be cleared
}

interface NotificationSettings {
  appointmentReminders: boolean;
  vitaminReminders: boolean;
  exerciseReminders: boolean;
  waterReminders: boolean;
  stretchReminders: boolean;
  backupReminders: boolean;
  kegelReminders: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  appointmentReminders: true,
  vitaminReminders: true,
  exerciseReminders: false,
  waterReminders: true,
  stretchReminders: false,
  backupReminders: false,
  kegelReminders: true,
};

// Backup reminder interval in days
const BACKUP_REMINDER_DAYS = 7;

// Helper to get appointments from localStorage
const getAppointmentsFromStorage = (): any[] => {
  try {
    const data = localStorage.getItem('appointments');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Validators for type-safe parsing
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
    typeof s.exerciseReminders === 'boolean' &&
    typeof s.waterReminders === 'boolean' &&
    typeof s.stretchReminders === 'boolean'
    // backupReminders & kegelReminders optional for backward compat
  );
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [unreadCount, setUnreadCount] = useState(0);
  const isInitialized = useRef(false);

  // Load from localStorage with safe parsing
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
    setSettings(savedSettings);
    setNotifications(savedNotifications);
    
    isInitialized.current = true;
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage('pregnancyNotifications', notifications);
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Save settings to localStorage
  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage('notificationSettings', settings);
  }, [settings]);

  // Auto-clean old read notifications (older than 12 hours)
  useEffect(() => {
    if (!isInitialized.current) return;
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    const now = Date.now();
    const cleaned = notifications.filter(n => {
      if (n.isPinned) return true;
      if (!n.read) return true;
      return (now - new Date(n.time).getTime()) < TWELVE_HOURS;
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

      // Helper: check if a reminder was already sent today for a given type
      const hasTodayReminder = (type: string, subKey?: string) => {
        return notifications.some(
          n => n.type === type && 
          (!subKey || n.id.includes(subKey)) &&
          new Date(n.time).toDateString() === now.toDateString()
        );
      };

      // Morning vitamin reminder (8 AM+ window - once daily)
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

      // Stretch reminder (10 AM+ window - once daily)
      if (settings.stretchReminders && hour >= 10 && !hasTodayReminder('stretch')) {
        newNotifications.push({
          id: `stretch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'stretch',
          title: tn('stretchReminderTitle'),
          message: tn('stretchReminderMsg'),
          time: nowISO,
          read: false,
          actionUrl: '/tools/ai-fitness-coach',
        });
      }




      if (settings.waterReminders) {
        const recentWaterReminder = notifications.find(
          n => n.type === 'water' && 
          (now.getTime() - new Date(n.time).getTime()) < 6 * 60 * 60 * 1000
        );
        if (!recentWaterReminder) {
          newNotifications.push({
            id: `water-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'water',
            title: tn('waterReminderTitle'),
            message: tn('waterReminderMsg'),
            time: nowISO,
            read: false,
            actionUrl: '/tools/vitamin-tracker',
          });
        }
      }

      // Exercise reminder (4 PM+ window - once daily)
      if (settings.exerciseReminders && hour >= 16 && !hasTodayReminder('exercise')) {
        newNotifications.push({
          id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'exercise',
          title: tn('exerciseReminderTitle'),
          message: tn('exerciseReminderMsg'),
          time: nowISO,
          read: false,
          actionUrl: '/tools/ai-fitness-coach',
        });
      }

      // Backup reminder (9 AM+ window - once daily if backup is old)
      if (settings.backupReminders && hour >= 9 && !hasTodayReminder('backup')) {
        const lastBackupDate = localStorage.getItem('last_backup_date');
        const daysSinceBackup = lastBackupDate 
          ? Math.floor((now.getTime() - new Date(lastBackupDate).getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        
        if (daysSinceBackup >= BACKUP_REMINDER_DAYS) {
          const message = lastBackupDate 
            ? tn('backupReminderMsgDays', { days: daysSinceBackup })
            : tn('backupReminderMsgNever');
          
          newNotifications.push({
            id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'backup',
            title: tn('backupReminderTitle'),
            message,
            time: nowISO,
            read: false,
            actionUrl: '/settings',
          });
        }
      }

      // Appointment reminders - tomorrow (8 AM+ window, once daily)
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
        
        // Today's appointments (once daily)
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

      // 2-hour before appointment reminder (runs EVERY check, not gated by hour)
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
            n => n.type === 'appointment' && 
            n.id.includes(`2h-${apt.id}`)
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

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev].slice(0, 25));
        
        // Play sound for appointment reminders
        const hasAppointmentReminder = newNotifications.some(n => n.type === 'appointment');
        if (hasAppointmentReminder) {
          playNotificationSound('reminder');
        }

        // Send push notifications if enabled
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

    // Check for reminders every minute
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
    setNotifications(prev => [newNotification, ...prev].slice(0, 25));
    
    // Play notification sound based on type
    const soundType = notification.type === 'appointment' ? 'reminder' : 'gentle';
    playNotificationSound(soundType);

    // Send push notification if enabled
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
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    // Don't allow clearing pinned notifications
    setNotifications(prev => prev.filter(n => n.id === id ? !n.isPinned : true));
  }, []);

  const clearAll = useCallback(() => {
    // Keep pinned notifications
    setNotifications(prev => prev.filter(n => n.isPinned));
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
