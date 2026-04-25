/**
 * useHolisticDashboardSnapshot
 *
 * Aggregates ALL meaningful tracked data across the dashboard into a single
 * structured snapshot the AI can consume. Reuses existing storage keys ONLY —
 * does NOT introduce new persistence layers.
 *
 * Returns the snapshot, a "data richness" 0-100% score, a minimum-data flag,
 * and a sources count for the UI.
 */
import { useMemo } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardDataCheck } from "@/hooks/useDashboardDataCheck";
import { safeParseLocalStorage } from "@/lib/safeStorage";
import { STORAGE_KEYS } from "@/lib/dataBus";
import { readKickSessions } from "@/lib/kickSessionsStore";
import { getUserId } from "@/hooks/useSupabase";

export interface HolisticSnapshot {
  generatedAt: string;
  profile: {
    name?: string;
    pregnancyWeek?: number;
    trimester?: number;
    journeyStage?: string;
    weight?: number;
    height?: number;
  };
  mood: { recent: Array<{ date: string; level: number }>; count: number };
  symptoms: { recent: Array<{ date: string; symptoms: string[] }>; count: number };
  weight: { entries: Array<{ date: string; kg: number }>; count: number };
  hydration: { entries: Array<{ date: string; ml: number }>; count: number };
  vitamins: { takenDays: number };
  kicks: { sessions: number; lastSessionDate?: string };
  contractions: { count: number };
  appointments: { upcoming: Array<{ date: string; title: string }>; count: number };
  meals: { recentTitles: string[]; count: number };
  fitness: { recentTitles: string[]; count: number };
}

interface Result {
  snapshot: HolisticSnapshot;
  dataRichness: number; // 0-100
  hasMinimumData: boolean;
  sourcesCount: number;
}

const MIN_SOURCES = 3;
const ALL_SOURCES = 10; // mood, symptoms, weight, hydration, vitamins, kicks, contractions, appointments, meals, fitness

export function useHolisticDashboardSnapshot(): Result {
  const { profile } = useUserProfile();
  const { stats } = useDashboardData();
  const dataCheck = useDashboardDataCheck();

  return useMemo(() => {
    const userId = getUserId();

    const symptoms = safeParseLocalStorage<any[]>(STORAGE_KEYS.SYMPTOM_LOGS, []) || [];
    const weightEntries = safeParseLocalStorage<any[]>(STORAGE_KEYS.WEIGHT_ENTRIES, []) || [];
    const waterLogs = safeParseLocalStorage<any[]>(STORAGE_KEYS.WATER_LOGS(userId), []) || [];
    const vitaminLogsObj = safeParseLocalStorage<Record<string, any>>(STORAGE_KEYS.VITAMIN_LOGS, {}) || {};
    const appointments = safeParseLocalStorage<any[]>(STORAGE_KEYS.APPOINTMENTS, []) || [];
    const contractions = safeParseLocalStorage<any[]>(STORAGE_KEYS.CONTRACTIONS, []) || [];
    const kickSessions = readKickSessions();
    const savedResults = safeParseLocalStorage<any[]>(STORAGE_KEYS.SAVED_RESULTS, []) || [];

    // ── Mood from symptom logs ──
    const moodEntries = symptoms
      .filter((l) => (l?.mood ?? 0) > 0)
      .slice(-7)
      .map((l) => ({ date: l?.date || l?.timestamp || "", level: Number(l?.mood) || 0 }));

    // ── Symptoms ──
    const symptomEntries = symptoms
      .filter((l) => Array.isArray(l?.symptoms) && l.symptoms.length > 0)
      .slice(-7)
      .map((l) => ({ date: l?.date || "", symptoms: (l.symptoms || []).slice(0, 6) }));

    // ── Weight ──
    const weightSeries = weightEntries
      .slice(-7)
      .map((e) => ({ date: e?.date || "", kg: Number(e?.weight ?? e?.kg) || 0 }))
      .filter((e) => e.kg > 0);

    // ── Hydration ──
    const hydration = waterLogs.slice(-7).map((e) => ({
      date: e?.date || "",
      ml: Number(e?.totalMl ?? e?.ml) || 0,
    }));

    // ── Vitamins ──
    const vitaminDays = Object.keys(vitaminLogsObj || {}).length;

    // ── Kicks ──
    const lastKick = kickSessions[kickSessions.length - 1];

    // ── Appointments ──
    const upcoming = appointments
      .filter((a) => {
        const d = new Date(a?.date || a?.scheduledAt || 0);
        return !isNaN(d.getTime()) && d.getTime() >= Date.now();
      })
      .slice(0, 5)
      .map((a) => ({ date: a?.date || a?.scheduledAt || "", title: a?.title || a?.name || "Appointment" }));

    // ── Meals & fitness from saved results ──
    const meals = savedResults.filter((r) => r?.toolId === "ai-meal-suggestion").slice(-5);
    const fitness = savedResults.filter((r) => r?.toolId === "ai-fitness-coach").slice(-5);

    const snapshot: HolisticSnapshot = {
      generatedAt: new Date().toISOString(),
      profile: {
        pregnancyWeek: profile?.pregnancyWeek,
        trimester: profile?.pregnancyWeek
          ? profile.pregnancyWeek <= 13 ? 1 : profile.pregnancyWeek <= 27 ? 2 : 3
          : undefined,
        journeyStage: profile?.journeyStage,
        weight: profile?.weight ?? undefined,
        height: profile?.height ?? undefined,
      },
      mood: { recent: moodEntries, count: moodEntries.length },
      symptoms: { recent: symptomEntries, count: symptomEntries.length },
      weight: { entries: weightSeries, count: weightSeries.length },
      hydration: { entries: hydration, count: hydration.length },
      vitamins: { takenDays: vitaminDays },
      kicks: {
        sessions: kickSessions.length,
        lastSessionDate: lastKick?.startTime
          ? new Date(lastKick.startTime).toISOString()
          : undefined,
      },
      contractions: { count: contractions.length },
      appointments: { upcoming, count: upcoming.length },
      meals: { recentTitles: meals.map((m) => m?.title || m?.summary || "").filter(Boolean), count: meals.length },
      fitness: { recentTitles: fitness.map((f) => f?.title || f?.summary || "").filter(Boolean), count: fitness.length },
    };

    // ── Sources count for richness ──
    const sourcesCount = [
      dataCheck.hasMoodData,
      dataCheck.hasSymptomsData,
      dataCheck.hasWeight,
      dataCheck.hasHydration,
      dataCheck.hasVitamins,
      dataCheck.hasKickSessions,
      dataCheck.hasContractions,
      dataCheck.hasAppointments,
      dataCheck.hasMeals,
      dataCheck.hasFitness,
    ].filter(Boolean).length;

    const dataRichness = Math.round((sourcesCount / ALL_SOURCES) * 100);

    return {
      snapshot,
      dataRichness,
      hasMinimumData: sourcesCount >= MIN_SOURCES,
      sourcesCount,
    };
  }, [profile, stats, dataCheck]);
}
