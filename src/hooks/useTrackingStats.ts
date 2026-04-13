import { useState, useEffect, useCallback } from 'react';
import { getUserId } from '@/hooks/useSupabase';

interface CategoryStats {
  dailyTracking: {
    todayKicks: number;
    lastWeight: string;
    vitaminsTaken: number;
    waterGlasses: number;
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

// Per-tool result summaries for dashboard display
export interface ToolResultSummaries {
  [toolId: string]: string;
}

export const useTrackingStats = () => {
  const [stats, setStats] = useState<CategoryStats>({
    dailyTracking: { todayKicks: 0, lastWeight: '', vitaminsTaken: 0, waterGlasses: 0 },
    planning: { upcomingAppointments: 0, birthPlanProgress: 0, bagItemsChecked: 0 },
    growth: { photosCount: 0, lastMeasurement: '' },
    postpartum: { sleepHoursToday: 0, diapersToday: 0, groceryItems: 0 },
  });
  const [toolSummaries, setToolSummaries] = useState<ToolResultSummaries>({});
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(() => {
    try {
      const userId = getUserId();
      const today = new Date().toISOString().split('T')[0];

      // Daily Tracking Stats
      const kickSessions = JSON.parse(localStorage.getItem(`kick_sessions_${userId}`) || '[]');
      const todaySessions = kickSessions.filter((s: any) => s.started_at?.startsWith(today));
      const todayKicks = todaySessions.reduce((sum: number, s: any) => sum + (s.total_kicks || 0), 0);

      // Weight: read from weight_gain_entries (what the analyzer saves) + profile fallback
      const weightEntries = JSON.parse(localStorage.getItem('weight_gain_entries') || '[]');
      const profile = JSON.parse(localStorage.getItem('user_central_profile_v1') || '{}');
      let lastWeight = '';
      if (weightEntries.length > 0) {
        const sorted = [...weightEntries].sort((a: any, b: any) => (a.week || 0) - (b.week || 0));
        lastWeight = sorted[sorted.length - 1]?.weight + ' kg';
      } else if (profile?.weight) {
        lastWeight = profile.weight + ' kg';
      }

      // Vitamins: read from vitamin-tracker-logs (object keyed by date)
      const vitaminLogsRaw = localStorage.getItem('vitamin-tracker-logs');
      let vitaminsTaken = 0;
      let vitaminLogCount = 0;
      if (vitaminLogsRaw) {
        try {
          const vitaminObj = JSON.parse(vitaminLogsRaw);
          const todayVitaminLog = vitaminObj[today] || {};
          vitaminsTaken = Object.keys(todayVitaminLog).length;
          vitaminLogCount = Object.keys(vitaminObj).length;
        } catch { /* ignore */ }
      }

      // Water intake (glasses today)
      const waterLogs = JSON.parse(localStorage.getItem(`water_logs_${userId}`) || '[]');
      const todayWater = waterLogs.filter((l: any) => l.date?.startsWith(today));
      const waterGlasses = todayWater.reduce((sum: number, l: any) => sum + (l.glasses || 1), 0);

      // Planning Stats
      // AppointmentService stores in 'appointments' key, filtered by user_id, with 'appointment_date' field
      const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const userAppointments = allAppointments.filter((a: any) => a.user_id === userId);
      const upcomingAppointments = userAppointments.filter((a: any) => new Date(a.appointment_date || a.date) >= new Date()).length;

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
      const sleepLogs = JSON.parse(localStorage.getItem('baby-sleep-tracker-data') || '[]');
      const todaySleep = sleepLogs.filter((l: any) => l.date?.startsWith(today));
      const sleepHoursToday = todaySleep.reduce((sum: number, l: any) => sum + (l.duration || 0), 0) / 60;

      const diaperLogs = JSON.parse(localStorage.getItem('diaperEntries') || '[]');
      const todayDiapers = diaperLogs.filter((l: any) => l.timestamp?.startsWith(today));
      const diapersToday = todayDiapers.length;

      const groceryList = JSON.parse(localStorage.getItem(`grocery_list_${userId}`) || '[]');
      const groceryItems = groceryList.length;

      setStats({
        dailyTracking: { todayKicks, lastWeight, vitaminsTaken, waterGlasses },
        planning: { upcomingAppointments, birthPlanProgress, bagItemsChecked },
        growth: { photosCount, lastMeasurement },
        postpartum: { sleepHoursToday: Math.round(sleepHoursToday * 10) / 10, diapersToday, groceryItems },
      });

      // === Per-tool result summaries ===
      const summaries: ToolResultSummaries = {};

      // Kick counter
      if (todayKicks > 0) summaries['kick-counter'] = `${todayKicks}`;
      else if (kickSessions.length > 0) summaries['kick-counter'] = `${kickSessions.length}`;

      // Weight
      if (lastWeight) summaries['weight-gain'] = lastWeight;

      // Vitamins
      if (vitaminsTaken > 0) summaries['vitamin-tracker'] = `${vitaminsTaken}`;
      else if (vitaminLogCount > 0) summaries['vitamin-tracker'] = `${vitaminLogCount}`;

      // Appointments
      if (upcomingAppointments > 0) summaries['smart-appointment'] = `${upcomingAppointments}`;

      // Birth plan
      const birthPlans = JSON.parse(localStorage.getItem('birthPlans') || '[]');
      if (birthPlans.length > 0) summaries['birth-plan'] = `${birthPlans.length}`;
      else if (birthPlanProgress > 0) summaries['birth-plan'] = `${birthPlanProgress}%`;

      // Hospital bag
      const bagItems = JSON.parse(localStorage.getItem('hospital-bag-items') || '[]');
      if (bagItems.length > 0) {
        const packed = bagItems.filter((i: any) => i.packed).length;
        summaries['hospital-bag'] = `${packed}/${bagItems.length}`;
      }

      // Fetal growth
      if (lastMeasurement) summaries['fetal-growth'] = lastMeasurement;

      // Baby growth
      const babyGrowth = JSON.parse(localStorage.getItem('baby-growth-entries') || '[]');
      if (babyGrowth.length > 0) summaries['baby-growth'] = `${babyGrowth.length}`;

      // Bump photos
      if (photosCount > 0) summaries['bump-photos'] = `${photosCount}`;

      // Baby sleep
      if (sleepHoursToday > 0) summaries['baby-sleep'] = `${Math.round(sleepHoursToday * 10) / 10}h`;
      else if (sleepLogs.length > 0) summaries['baby-sleep'] = `${sleepLogs.length}`;

      // Diaper tracker
      if (diapersToday > 0) summaries['diaper-tracker'] = `${diapersToday}`;
      else {
        const diaperAll = JSON.parse(localStorage.getItem('diaperEntries') || '[]');
        if (diaperAll.length > 0) summaries['diaper-tracker'] = `${diaperAll.length}`;
      }

      // Grocery list
      if (groceryItems > 0) summaries['grocery-list'] = `${groceryItems}`;

      setToolSummaries(summaries);
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

    // Refresh when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadStats();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadStats]);

  return { stats, toolSummaries, loading, refresh: loadStats };
};
