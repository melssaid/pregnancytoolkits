import { useState, useEffect, useCallback, useRef } from 'react';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';

export interface Notification {
  id: string;
  type: 'appointment' | 'vitamin' | 'exercise' | 'water' | 'stretch' | 'general';
  title: string;
  message: string;
  time: string; // Store as ISO string for safer serialization
  read: boolean;
  actionUrl?: string;
}

interface NotificationSettings {
  appointmentReminders: boolean;
  vitaminReminders: boolean;
  exerciseReminders: boolean;
  waterReminders: boolean;
  stretchReminders: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  appointmentReminders: true,
  vitaminReminders: true,
  exerciseReminders: true,
  waterReminders: true,
  stretchReminders: true,
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
    setNotifications(savedNotifications);

    const savedSettings = safeParseLocalStorage<NotificationSettings>(
      'notificationSettings',
      DEFAULT_SETTINGS,
      isSettings
    );
    setSettings(savedSettings);
    
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

  // Generate smart reminders
  useEffect(() => {
    if (!isInitialized.current) return;

    const generateSmartReminders = () => {
      const now = new Date();
      const nowISO = now.toISOString();
      const hour = now.getHours();
      const newNotifications: Notification[] = [];

      // Morning vitamin reminder (8-9 AM)
      if (settings.vitaminReminders && hour === 8) {
        const lastVitaminReminder = notifications.find(
          n => n.type === 'vitamin' && 
          new Date(n.time).toDateString() === now.toDateString()
        );
        if (!lastVitaminReminder) {
          newNotifications.push({
            id: `vitamin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'vitamin',
            title: '💊 Vitamin Reminder',
            message: "Don't forget to take your prenatal vitamins!",
            time: nowISO,
            read: false,
            actionUrl: '/tools/vitamin-tracker',
          });
        }
      }

      // Mid-morning stretch (10-11 AM)
      if (settings.stretchReminders && hour === 10) {
        const lastStretchReminder = notifications.find(
          n => n.type === 'stretch' && 
          new Date(n.time).toDateString() === now.toDateString() &&
          new Date(n.time).getHours() >= 10
        );
        if (!lastStretchReminder) {
          newNotifications.push({
            id: `stretch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'stretch',
            title: '🧘 Time to Stretch',
            message: 'Take a quick stretch break to stay comfortable!',
            time: nowISO,
            read: false,
            actionUrl: '/tools/smart-stretch-reminder',
          });
        }
      }

      // Water reminders (every 2 hours during daytime)
      if (settings.waterReminders && hour >= 8 && hour <= 20 && hour % 2 === 0) {
        const recentWaterReminder = notifications.find(
          n => n.type === 'water' && 
          (now.getTime() - new Date(n.time).getTime()) < 2 * 60 * 60 * 1000
        );
        if (!recentWaterReminder) {
          newNotifications.push({
            id: `water-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'water',
            title: '💧 Stay Hydrated',
            message: 'Time for a glass of water!',
            time: nowISO,
            read: false,
            actionUrl: '/tools/water-intake',
          });
        }
      }

      // Afternoon exercise (3-4 PM)
      if (settings.exerciseReminders && hour === 15) {
        const lastExerciseReminder = notifications.find(
          n => n.type === 'exercise' && 
          new Date(n.time).toDateString() === now.toDateString()
        );
        if (!lastExerciseReminder) {
          newNotifications.push({
            id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'exercise',
            title: '🚶‍♀️ Walking Time',
            message: 'A short walk will boost your energy and mood!',
            time: nowISO,
            read: false,
            actionUrl: '/tools/smart-walking-coach',
          });
        }
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev].slice(0, 50));
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
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
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
