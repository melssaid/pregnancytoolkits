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
  type: 'appointment' | 'vitamin' | 'water' | 'general';
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
}

const DEFAULT_SETTINGS: NotificationSettings = {
  appointmentReminders: true,
  vitaminReminders: true,
  waterReminders: true,
};

const WATER_INTERVAL_HOURS = 4;

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
    });
    // Filter out legacy notification types
    const validTypes = ['appointment', 'vitamin', 'water', 'general'];
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
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    const now = Date.now();
    const cleaned = notifications.filter(n => {
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

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev].slice(0, 20));
        
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
    setNotifications(prev => [newNotification, ...prev].slice(0, 20));
    
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
