import { useState, useEffect, useCallback } from 'react';
import { getUserId } from '@/hooks/useSupabase';

interface CategoryStats {
  dailyTracking: {
    todayKicks: number;
    lastWeight: string;
    vitaminsTaken: number;
  };
  planning: {
    upcomingAppointments: number;
    birthPlanProgress: number;
    bagItemsChecked: number;
  };
  growth: {
    photosCount: number;
    lastMeasurement: string;
  };
  postpartum: {
    sleepHoursToday: number;
    diapersToday: number;
    groceryItems: number;
  };
}

export const useTrackingStats = () => {
  const [stats, setStats] = useState<CategoryStats>({
    dailyTracking: { todayKicks: 0, lastWeight: '', vitaminsTaken: 0 },
    planning: { upcomingAppointments: 0, birthPlanProgress: 0, bagItemsChecked: 0 },
    growth: { photosCount: 0, lastMeasurement: '' },
    postpartum: { sleepHoursToday: 0, diapersToday: 0, groceryItems: 0 },
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(() => {
    try {
      const userId = getUserId();
      const today = new Date().toISOString().split('T')[0];

      // Daily Tracking Stats
      const kickSessions = JSON.parse(localStorage.getItem(`kick_sessions_${userId}`) || '[]');
      const todaySessions = kickSessions.filter((s: any) => s.started_at?.startsWith(today));
      const todayKicks = todaySessions.reduce((sum: number, s: any) => sum + (s.total_kicks || 0), 0);

      const weightLogs = JSON.parse(localStorage.getItem(`weight_logs_${userId}`) || '[]');
      const lastWeight = weightLogs.length > 0 
        ? weightLogs[weightLogs.length - 1]?.weight + ' kg' 
        : '';

      const vitaminLogs = JSON.parse(localStorage.getItem(`vitamin_logs_${userId}`) || '[]');
      const todayVitamins = vitaminLogs.filter((l: any) => l.taken_at?.startsWith(today));
      const vitaminsTaken = todayVitamins.length;

      // Planning Stats
      const appointments = JSON.parse(localStorage.getItem(`appointments_${userId}`) || '[]');
      const upcomingAppointments = appointments.filter((a: any) => new Date(a.date) >= new Date()).length;

      const birthPlan = JSON.parse(localStorage.getItem(`birth_plan_${userId}`) || '{}');
      const birthPlanProgress = birthPlan.sections 
        ? Math.round((Object.values(birthPlan.sections).filter(Boolean).length / 10) * 100)
        : 0;

      const hospitalBag = JSON.parse(localStorage.getItem(`hospital_bag_${userId}`) || '[]');
      const bagItemsChecked = hospitalBag.filter((i: any) => i.checked).length;

      // Growth Stats
      const bumpPhotos = JSON.parse(localStorage.getItem(`bump_photos_${userId}`) || '[]');
      const photosCount = bumpPhotos.length;

      const fetalMeasurements = JSON.parse(localStorage.getItem(`fetal_measurements_${userId}`) || '[]');
      const lastMeasurement = fetalMeasurements.length > 0 
        ? `Week ${fetalMeasurements[fetalMeasurements.length - 1]?.week}`
        : '';

      // Postpartum Stats
      const sleepLogs = JSON.parse(localStorage.getItem(`baby_sleep_${userId}`) || '[]');
      const todaySleep = sleepLogs.filter((l: any) => l.date?.startsWith(today));
      const sleepHoursToday = todaySleep.reduce((sum: number, l: any) => sum + (l.duration || 0), 0) / 60;

      const diaperLogs = JSON.parse(localStorage.getItem(`diaper_logs_${userId}`) || '[]');
      const todayDiapers = diaperLogs.filter((l: any) => l.timestamp?.startsWith(today));
      const diapersToday = todayDiapers.length;

      const groceryList = JSON.parse(localStorage.getItem(`grocery_list_${userId}`) || '[]');
      const groceryItems = groceryList.length;

      setStats({
        dailyTracking: { todayKicks, lastWeight, vitaminsTaken },
        planning: { upcomingAppointments, birthPlanProgress, bagItemsChecked },
        growth: { photosCount, lastMeasurement },
        postpartum: { sleepHoursToday: Math.round(sleepHoursToday * 10) / 10, diapersToday, groceryItems },
      });
    } catch (error) {
      console.error('Error loading tracking stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    
    // Listen for storage changes
    const handleStorage = () => loadStats();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadStats]);

  return { stats, loading, refresh: loadStats };
};
