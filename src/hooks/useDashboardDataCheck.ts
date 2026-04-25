import { useEffect, useState } from "react";
import { safeParseLocalStorage } from "@/lib/safeStorage";
import { subscribeToData, STORAGE_KEYS } from "@/lib/dataBus";
import { getUserId } from "@/hooks/useSupabase";

/**
 * Comprehensive data presence check for dashboard cards.
 * Reactive — re-runs whenever a tracked storage key changes
 * (same-tab via dataBus, cross-tab via native storage event).
 */
export interface DashboardDataCheck {
  hasSymptomsData: boolean;
  hasMoodData: boolean;
  hasContractions: boolean;
  hasSavedResults: boolean;
  hasWeight: boolean;
  hasRecentActivity: boolean;
  hasHydration: boolean;
  hasVitamins: boolean;
  hasAppointments: boolean;
  hasKickSessions: boolean;
  hasMeals: boolean;
  hasFitness: boolean;
  hasBumpPhotos: boolean;
  hasAnyData: boolean;
}

function compute(): DashboardDataCheck {
  const userId = getUserId();
  const symptoms = safeParseLocalStorage<any[]>(STORAGE_KEYS.SYMPTOM_LOGS, []);
  const contractions = safeParseLocalStorage<any[]>(STORAGE_KEYS.CONTRACTIONS, []);
  const savedResults = safeParseLocalStorage<any[]>(STORAGE_KEYS.SAVED_RESULTS, []);
  const weightEntries = safeParseLocalStorage<any[]>(STORAGE_KEYS.WEIGHT_ENTRIES, []);
  const profile = safeParseLocalStorage<any>(STORAGE_KEYS.PROFILE, null);
  const waterLogs = safeParseLocalStorage<any[]>(STORAGE_KEYS.WATER_LOGS(userId), []);
  const vitaminLogsObj = safeParseLocalStorage<Record<string, any>>(STORAGE_KEYS.VITAMIN_LOGS, {});
  const appointments = safeParseLocalStorage<any[]>(STORAGE_KEYS.APPOINTMENTS, []);
  // Kick sessions: support legacy keys + canonical (some writers use suffixed keys)
  const kickCanonical = safeParseLocalStorage<any[]>(STORAGE_KEYS.KICK_SESSIONS, []);
  const kickPerUser = safeParseLocalStorage<any[]>(`kick_sessions_${userId}`, []);
  const kickLegacy = safeParseLocalStorage<any[]>("kick_sessions_data", []);
  const kickSessions = kickCanonical.length ? kickCanonical : kickPerUser.length ? kickPerUser : kickLegacy;
  const bumpPhotos = safeParseLocalStorage<any[]>(STORAGE_KEYS.BUMP_PHOTOS(userId), []);

  const hasMoodData = symptoms.some((l) => (l?.mood ?? 0) > 0);
  const hasSymptomsData = symptoms.some((l) => l?.symptoms?.length > 0);
  const hasContractions = contractions.length > 0;
  const hasSavedResults = savedResults.length > 0;
  const hasWeight = weightEntries.length > 0 || !!profile?.weight;
  const hasMeals = savedResults.some((r) => r?.toolId === "ai-meal-suggestion");
  const hasFitness = savedResults.some((r) => r?.toolId === "ai-fitness-coach");
  const hasRecentActivity = hasMeals || hasFitness;
  const hasHydration = waterLogs.length > 0;
  const hasVitamins = Object.keys(vitaminLogsObj || {}).length > 0;
  const hasAppointments = appointments.length > 0;
  const hasKickSessions = kickSessions.length > 0;
  const hasBumpPhotos = bumpPhotos.length > 0;

  const hasAnyData =
    hasMoodData || hasSymptomsData || hasContractions || hasSavedResults ||
    hasWeight || hasRecentActivity || hasHydration || hasVitamins ||
    hasAppointments || hasKickSessions || hasBumpPhotos;

  return {
    hasSymptomsData, hasMoodData, hasContractions, hasSavedResults,
    hasWeight, hasRecentActivity, hasHydration, hasVitamins,
    hasAppointments, hasKickSessions, hasMeals, hasFitness,
    hasBumpPhotos, hasAnyData,
  };
}

export function useDashboardDataCheck(): DashboardDataCheck {
  const [check, setCheck] = useState<DashboardDataCheck>(() => compute());

  useEffect(() => {
    const recompute = () => setCheck(compute());
    const unsub = subscribeToData(recompute);
    const onVisible = () => {
      if (document.visibilityState === "visible") recompute();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      unsub();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return check;
}
