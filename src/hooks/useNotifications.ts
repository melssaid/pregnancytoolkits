import { useState, useEffect, useCallback, useRef } from 'react';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { playNotificationSound } from '@/lib/notificationSound';

export interface Notification {
  id: string;
  type: 'appointment' | 'vitamin' | 'exercise' | 'water' | 'stretch' | 'backup' | 'general' | 'welcome' | 'disclaimer';
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
}

const DEFAULT_SETTINGS: NotificationSettings = {
  appointmentReminders: true,
  vitaminReminders: true,
  exerciseReminders: true,
  waterReminders: true,
  stretchReminders: true,
  backupReminders: true,
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
    // backupReminders is optional for backward compatibility
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

  // Generate smart reminders
  useEffect(() => {
    if (!isInitialized.current) return;

    const generateSmartReminders = () => {
      const now = new Date();
      const nowISO = now.toISOString();
      const hour = now.getHours();
      const newNotifications: Notification[] = [];

      // Morning vitamin reminder (8 AM only - once daily)
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

      // Stretch reminder (once daily at 10 AM)
      if (settings.stretchReminders && hour === 10) {
        const lastStretchReminder = notifications.find(
          n => n.type === 'stretch' && 
          new Date(n.time).toDateString() === now.toDateString()
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

      // Water reminders (every 6 hours - 8 AM, 2 PM, 8 PM)
      if (settings.waterReminders && (hour === 8 || hour === 14 || hour === 20)) {
        const recentWaterReminder = notifications.find(
          n => n.type === 'water' && 
          (now.getTime() - new Date(n.time).getTime()) < 6 * 60 * 60 * 1000
        );
        if (!recentWaterReminder) {
          newNotifications.push({
            id: `water-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'water',
            title: '💧 Stay Hydrated',
            message: 'Time for a glass of water!',
            time: nowISO,
            read: false,
            actionUrl: '/tools/vitamin-tracker',
          });
        }
      }

      // Exercise reminder (once daily at 4 PM)
      if (settings.exerciseReminders && hour === 16) {
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

      // Backup reminder (check once daily at 9 AM if backup is older than BACKUP_REMINDER_DAYS)
      if (settings.backupReminders && hour === 9) {
        const lastBackupDate = localStorage.getItem('last_backup_date');
        const daysSinceBackup = lastBackupDate 
          ? Math.floor((now.getTime() - new Date(lastBackupDate).getTime()) / (1000 * 60 * 60 * 24))
          : 999; // No backup ever = always remind
        
        // Only remind if no backup in the last BACKUP_REMINDER_DAYS days
        if (daysSinceBackup >= BACKUP_REMINDER_DAYS) {
          const lastBackupReminder = notifications.find(
            n => n.type === 'backup' && 
            new Date(n.time).toDateString() === now.toDateString()
          );
          if (!lastBackupReminder) {
            const daysText = lastBackupDate 
              ? `It's been ${daysSinceBackup} days since your last backup.`
              : "You haven't backed up your data yet.";
            
            newNotifications.push({
              id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'backup',
              title: '💾 Backup Reminder',
              message: `${daysText} Protect your pregnancy journey!`,
              time: nowISO,
              read: false,
              actionUrl: '/settings',
            });
          }
        }
      }

      // Appointment reminders (check for appointments tomorrow - runs at 8 AM and 8 PM)
      if (settings.appointmentReminders && (hour === 8 || hour === 20)) {
        const appointments = getAppointmentsFromStorage();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        
        // Find appointments scheduled for tomorrow
        const tomorrowAppointments = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= tomorrow && aptDate < dayAfterTomorrow;
        });
        
        for (const apt of tomorrowAppointments) {
          // Check if we already sent a reminder for this appointment today
          const existingReminder = notifications.find(
            n => n.type === 'appointment' && 
            n.id.includes(apt.id) &&
            new Date(n.time).toDateString() === now.toDateString()
          );
          
          if (!existingReminder) {
            const aptDate = new Date(apt.appointment_date);
            const timeStr = aptDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            });
            
            newNotifications.push({
              id: `appointment-${apt.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'appointment',
              title: '📅 Appointment Tomorrow',
              message: `${apt.title}${apt.doctor_name ? ` with ${apt.doctor_name}` : ''} at ${timeStr}${apt.location ? ` - ${apt.location}` : ''}`,
              time: nowISO,
              read: false,
              actionUrl: '/tools/smart-appointment-reminder',
            });
          }
        }
        
        // Also check for today's appointments (same day reminder at 8 AM only)
        if (hour === 8) {
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
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              });
              
              newNotifications.push({
                id: `appointment-today-${apt.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'appointment',
                title: '🔔 Appointment Today!',
                message: `${apt.title}${apt.doctor_name ? ` with ${apt.doctor_name}` : ''} at ${timeStr}${apt.location ? ` - ${apt.location}` : ''}`,
                time: nowISO,
                read: false,
                actionUrl: '/tools/smart-appointment-reminder',
              });
            }
          }
        }
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev].slice(0, 50));
        
        // Play sound for appointment reminders
        const hasAppointmentReminder = newNotifications.some(n => n.type === 'appointment');
        if (hasAppointmentReminder) {
          playNotificationSound('reminder');
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
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    
    // Play notification sound based on type
    const soundType = notification.type === 'appointment' ? 'reminder' : 'gentle';
    playNotificationSound(soundType);
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
