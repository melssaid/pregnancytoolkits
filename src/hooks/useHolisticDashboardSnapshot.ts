/**
 * useHolisticDashboardSnapshot
 *
 * Aggregates ALL meaningful tracked data across the dashboard into a single
 * structured snapshot the AI can consume. Reuses existing storage keys ONLY —
 * does NOT introduce new persistence layers.
 *
 * Returns:
 *  - snapshot: full structured data (for UI display)
 *  - derivedInsights: computed trends, averages, risk flags, positive signals
 *  - contextSummary: token-optimised Markdown brief sent TO the LLM (instead of raw JSON)
 *  - dataRichness 0–100, hasMinimumData, sourcesCount
 */
import { useMemo } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardDataCheck } from "@/hooks/useDashboardDataCheck";
import { safeParseLocalStorage } from "@/lib/safeStorage";
import { STORAGE_KEYS } from "@/lib/dataBus";
import { readKickSessions } from "@/lib/kickSessionsStore";
import { getUserId } from "@/hooks/useSupabase";

// Storage key used by BumpPhotoService — read directly to avoid async in useMemo.
const BUMP_PHOTOS_STORAGE_KEY = (uid: string) => `bump_photos_${uid}`;

export interface HolisticSnapshot {
  generatedAt: string;
  profile: {
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
  ultrasound: {
    count: number;
    latestWeek?: number;
    latestAnalysisExcerpt?: string;
    latestCapturedAt?: string;
    readingsWithAnalysisCount: number;
  };
  sleep: {
    sessionsLast7Days: number;
    avgMinutesPerDay?: number;
    napCount: number;
    nightCount: number;
  };
}

export type Trend = "rising" | "stable" | "falling" | "unknown";

export interface DerivedInsights {
  weekContext: {
    currentWeek?: number;
    trimester?: number;
    weeksToBirth?: number;
  };
  weight: {
    currentKg?: number;
    startKg?: number;
    totalGainKg?: number;
    weeklyAvgGainKg?: number;
    trend: Trend;
  };
  mood: {
    avgLevel?: number;
    trend: Trend;
    lowMoodDays: number;
  };
  symptoms: {
    topSymptoms: Array<{ name: string; count: number }>;
    frequencyPerWeek: number;
  };
  hydration: {
    avgMlPerDay?: number;
    targetAchievementPct?: number;
    trend: Trend;
  };
  vitamins: {
    last7DaysCount: number;
    adherencePct: number;
  };
  kicks: {
    sessionsLast7Days: number;
    lastSessionAgoHours?: number;
  };
  contractions: {
    count: number;
  };
  appointments: {
    nextDateISO?: string;
    daysUntilNext?: number;
  };
  ultrasound: {
    count: number;
    latestWeek?: number;
    hasRecentAnalysis: boolean;
    readingsWithAnalysisCount: number;
  };
  sleep: {
    sessionsLast7Days: number;
    avgMinutesPerDay?: number;
    quality: "low" | "moderate" | "good" | "unknown";
  };
  engagementScore: number; // 0–100 — based on active sources
  riskFlags: string[];
  positiveSignals: string[];
}

interface Result {
  snapshot: HolisticSnapshot;
  derivedInsights: DerivedInsights;
  contextSummary: string;
  dataRichness: number; // 0-100
  hasMinimumData: boolean;
  sourcesCount: number;
}

const MIN_SOURCES = 3;
const ALL_SOURCES = 14; // mood, moodScore, symptoms, sleep, weight, hydration, vitamins, kicks, contractions, appointments, meals, fitness, bumpPhotos, ultrasound
const HYDRATION_TARGET_ML = 2500;

// ── Helpers ─────────────────────────────────────────────────────────────
function avg(nums: number[]): number | undefined {
  const xs = nums.filter((n) => Number.isFinite(n));
  if (xs.length === 0) return undefined;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function trendOf(series: number[]): Trend {
  const xs = series.filter((n) => Number.isFinite(n));
  if (xs.length < 3) return "unknown";
  const half = Math.floor(xs.length / 2);
  const first = avg(xs.slice(0, half));
  const second = avg(xs.slice(half));
  if (first === undefined || second === undefined) return "unknown";
  const diff = second - first;
  const pct = first === 0 ? 0 : Math.abs(diff) / Math.abs(first);
  if (pct < 0.05) return "stable";
  return diff > 0 ? "rising" : "falling";
}

function trendArrow(t: Trend): string {
  switch (t) {
    case "rising": return "↗";
    case "falling": return "↘";
    case "stable": return "→";
    default: return "·";
  }
}

function fmt(n?: number, digits = 1): string {
  if (n === undefined || !Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

// ── Hook ────────────────────────────────────────────────────────────────
export function useHolisticDashboardSnapshot(): Result {
  const { profile } = useUserProfile();
  const { stats } = useDashboardData();
  const dataCheck = useDashboardDataCheck();

  return useMemo(() => {
    const userId = getUserId();

    const symptoms = safeParseLocalStorage<any[]>(STORAGE_KEYS.SYMPTOM_LOGS, []) || [];
    const weightEntriesRaw = safeParseLocalStorage<any[]>(STORAGE_KEYS.WEIGHT_ENTRIES, []) || [];
    const waterLogs = safeParseLocalStorage<any[]>(STORAGE_KEYS.WATER_LOGS(userId), []) || [];
    const vitaminLogsObj = safeParseLocalStorage<Record<string, any>>(STORAGE_KEYS.VITAMIN_LOGS, {}) || {};
    const appointments = safeParseLocalStorage<any[]>(STORAGE_KEYS.APPOINTMENTS, []) || [];
    const contractions = safeParseLocalStorage<any[]>(STORAGE_KEYS.CONTRACTIONS, []) || [];
    const kickSessions = readKickSessions();
    const savedResults = safeParseLocalStorage<any[]>(STORAGE_KEYS.SAVED_RESULTS, []) || [];
    const bumpPhotos =
      safeParseLocalStorage<any[]>(BUMP_PHOTOS_STORAGE_KEY(userId), []) || [];
    const sleepSessionsRaw =
      safeParseLocalStorage<any[]>(STORAGE_KEYS.BABY_SLEEP, []) || [];

    // ── Mood from symptom logs ──
    const moodLast7 = symptoms
      .filter((l) => (l?.mood ?? 0) > 0)
      .slice(-7)
      .map((l) => ({ date: l?.date || l?.timestamp || "", level: Number(l?.mood) || 0 }));

    // ── Symptoms ──
    const symptomLast7 = symptoms
      .filter((l) => Array.isArray(l?.symptoms) && l.symptoms.length > 0)
      .slice(-7)
      .map((l) => ({ date: l?.date || "", symptoms: (l.symptoms || []).slice(0, 6) }));

    // ── Weight ──
    const weightSeriesAll = weightEntriesRaw
      .map((e) => ({ date: e?.date || "", kg: Number(e?.weight ?? e?.kg) || 0 }))
      .filter((e) => e.kg > 0);
    const weightSeries = weightSeriesAll.slice(-7);

    // ── Hydration ──
    const hydration = waterLogs.slice(-7).map((e) => ({
      date: e?.date || "",
      ml: Number(e?.totalMl ?? e?.ml) || 0,
    }));

    // ── Vitamins ──
    const vitaminDays = Object.keys(vitaminLogsObj || {}).length;
    const last7Days: string[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const vitaminLast7 = last7Days.filter((d) => vitaminLogsObj?.[d]).length;

    // ── Kicks ──
    const lastKick = kickSessions[kickSessions.length - 1];
    const sevenDaysAgoMs = Date.now() - 7 * 86400_000;
    const kickSessionsLast7 = kickSessions.filter(
      (k: any) => new Date(k?.startTime || 0).getTime() >= sevenDaysAgoMs,
    ).length;
    const lastKickAgoHours = lastKick?.startTime
      ? Math.round((Date.now() - new Date(lastKick.startTime).getTime()) / 3600_000)
      : undefined;

    // ── Appointments ──
    const upcoming = appointments
      .filter((a) => {
        const d = new Date(a?.date || a?.scheduledAt || 0);
        return !isNaN(d.getTime()) && d.getTime() >= Date.now();
      })
      .sort((a, b) => new Date(a?.date || a?.scheduledAt || 0).getTime() - new Date(b?.date || b?.scheduledAt || 0).getTime())
      .slice(0, 5)
      .map((a) => ({ date: a?.date || a?.scheduledAt || "", title: a?.title || a?.name || "Appointment" }));

    const nextDateISO = upcoming[0]?.date;
    const daysUntilNext = nextDateISO
      ? Math.max(0, Math.ceil((new Date(nextDateISO).getTime() - Date.now()) / 86400_000))
      : undefined;

    // ── Meals & fitness from saved results ──
    const meals = savedResults.filter((r) => r?.toolId === "ai-meal-suggestion").slice(-5);
    const fitness = savedResults.filter((r) => r?.toolId === "ai-fitness-coach").slice(-5);

    // ── Ultrasound / bump photos (most recent first) ──
    const sortedPhotos = [...bumpPhotos].sort(
      (a, b) =>
        new Date(b?.created_at || 0).getTime() -
        new Date(a?.created_at || 0).getTime(),
    );
    const latestPhoto = sortedPhotos[0];
    const latestPhotoAnalysis = (latestPhoto?.ai_analysis || "").trim();
    const latestAnalysisExcerpt = latestPhotoAnalysis
      ? latestPhotoAnalysis.slice(0, 240).replace(/\s+/g, " ")
      : undefined;
    const readingsWithAnalysisCount = bumpPhotos.filter(
      (p) => typeof p?.ai_analysis === "string" && p.ai_analysis.trim().length > 20,
    ).length;

    // ── Sleep sessions (last 7 days, completed only) ──
    const sevenDaysAgoMsForSleep = Date.now() - 7 * 86400_000;
    const completedSleep = sleepSessionsRaw.filter((s) => !!s?.endTime && !!s?.startTime);
    const sleepLast7 = completedSleep.filter(
      (s) => new Date(s.startTime).getTime() >= sevenDaysAgoMsForSleep,
    );
    const sleepMinutesLast7 = sleepLast7.reduce((sum, s) => {
      const start = new Date(s.startTime).getTime();
      const end = new Date(s.endTime).getTime();
      const mins = Math.max(0, Math.round((end - start) / 60000));
      return sum + mins;
    }, 0);
    const sleepDistinctDays = new Set(
      sleepLast7.map((s) => new Date(s.startTime).toISOString().slice(0, 10)),
    ).size || 0;
    const avgSleepMinutesPerDay =
      sleepDistinctDays > 0 ? Math.round(sleepMinutesLast7 / sleepDistinctDays) : undefined;
    const napCount = sleepLast7.filter((s) => s.type === "nap").length;
    const nightCount = sleepLast7.filter((s) => s.type === "night").length;
    const sleepQuality: "low" | "moderate" | "good" | "unknown" =
      avgSleepMinutesPerDay === undefined
        ? "unknown"
        : avgSleepMinutesPerDay >= 480
          ? "good"
          : avgSleepMinutesPerDay >= 360
            ? "moderate"
            : "low";

    const week = profile?.pregnancyWeek;
    const trimester = week ? (week <= 13 ? 1 : week <= 27 ? 2 : 3) : undefined;
    const weeksToBirth = week ? Math.max(0, 40 - week) : undefined;

    const snapshot: HolisticSnapshot = {
      generatedAt: new Date().toISOString(),
      profile: {
        pregnancyWeek: week,
        trimester,
        journeyStage: profile?.journeyStage,
        weight: profile?.weight ?? undefined,
        height: profile?.height ?? undefined,
      },
      mood: { recent: moodLast7, count: moodLast7.length },
      symptoms: { recent: symptomLast7, count: symptomLast7.length },
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
      ultrasound: {
        count: bumpPhotos.length,
        latestWeek: latestPhoto?.week,
        latestAnalysisExcerpt,
        latestCapturedAt: latestPhoto?.created_at,
        readingsWithAnalysisCount,
      },
      sleep: {
        sessionsLast7Days: sleepLast7.length,
        avgMinutesPerDay: avgSleepMinutesPerDay,
        napCount,
        nightCount,
      },
    };

    // ── Derived insights ──────────────────────────────────────────────
    const weightLevels = weightSeries.map((w) => w.kg);
    const startKg = weightSeriesAll[0]?.kg;
    const currentKg = weightSeriesAll[weightSeriesAll.length - 1]?.kg;
    const totalGainKg = startKg !== undefined && currentKg !== undefined ? +(currentKg - startKg).toFixed(2) : undefined;
    const weeklyAvgGainKg =
      totalGainKg !== undefined && weightSeriesAll.length > 1
        ? +(totalGainKg / Math.max(1, weightSeriesAll.length - 1)).toFixed(2)
        : undefined;

    const moodLevels = moodLast7.map((m) => m.level);
    const moodAvg = avg(moodLevels);
    const lowMoodDays = moodLast7.filter((m) => m.level <= 2).length;

    const symptomCounter = new Map<string, number>();
    symptomLast7.forEach((entry) => {
      entry.symptoms.forEach((s: string) => {
        symptomCounter.set(s, (symptomCounter.get(s) || 0) + 1);
      });
    });
    const topSymptoms = Array.from(symptomCounter.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const hydrationLevels = hydration.map((h) => h.ml);
    const hydrationAvg = avg(hydrationLevels);
    const hydrationTargetPct = hydrationAvg !== undefined
      ? Math.round((hydrationAvg / HYDRATION_TARGET_ML) * 100)
      : undefined;

    const sourcesCount = [
      dataCheck.hasMoodData,
      dataCheck.hasMoodScore,
      dataCheck.hasSymptomsData,
      dataCheck.hasSleepData,
      dataCheck.hasWeight,
      dataCheck.hasHydration,
      dataCheck.hasVitamins,
      dataCheck.hasKickSessions,
      dataCheck.hasContractions,
      dataCheck.hasAppointments,
      dataCheck.hasMeals,
      dataCheck.hasFitness,
      dataCheck.hasBumpPhotos,
      dataCheck.hasUltrasoundReadings,
    ].filter(Boolean).length;

    const engagementScore = Math.round((sourcesCount / ALL_SOURCES) * 100);

    // ── Risk flags & positive signals ──
    const riskFlags: string[] = [];
    const positiveSignals: string[] = [];

    if (lowMoodDays >= 3) riskFlags.push("low_mood_3plus_days_last_week");
    if (moodAvg !== undefined && moodAvg <= 2.2) riskFlags.push("avg_mood_below_threshold");
    if (hydrationTargetPct !== undefined && hydrationTargetPct < 70) riskFlags.push("hydration_below_target");
    if (vitaminLast7 <= 2 && dataCheck.hasVitamins) riskFlags.push("vitamin_adherence_low");
    if (week && week >= 28 && kickSessionsLast7 < 3) riskFlags.push("low_kick_tracking_third_trimester");
    if (lastKickAgoHours !== undefined && lastKickAgoHours > 48 && week && week >= 28) {
      riskFlags.push("no_kick_session_48h_third_trimester");
    }
    if (topSymptoms.length > 0 && topSymptoms[0].count >= 4) riskFlags.push("recurring_symptom_pattern");

    if (vitaminLast7 >= 6) positiveSignals.push("strong_vitamin_streak");
    if (hydrationTargetPct !== undefined && hydrationTargetPct >= 90) positiveSignals.push("hydration_on_target");
    if (moodAvg !== undefined && moodAvg >= 3.5) positiveSignals.push("positive_mood_trend");
    if (kickSessionsLast7 >= 5) positiveSignals.push("consistent_kick_tracking");
    if (weeklyAvgGainKg !== undefined && weeklyAvgGainKg >= 0.2 && weeklyAvgGainKg <= 0.5) {
      positiveSignals.push("weight_gain_within_healthy_range");
    }
    if (upcoming.length > 0 && daysUntilNext !== undefined && daysUntilNext <= 14) {
      positiveSignals.push("upcoming_care_appointment_scheduled");
    }
    if (engagementScore >= 60) positiveSignals.push("high_tracking_engagement");

    // ── Ultrasound signals ──
    const hasRecentUltrasoundAnalysis = !!latestAnalysisExcerpt;
    if (bumpPhotos.length >= 3) positiveSignals.push("ultrasound_journal_consistent");
    if (hasRecentUltrasoundAnalysis) positiveSignals.push("recent_ultrasound_ai_reading_available");
    if (readingsWithAnalysisCount >= 2) positiveSignals.push("multiple_ultrasound_ai_readings");

    // ── Sleep signals ──
    if (sleepQuality === "good") positiveSignals.push("healthy_sleep_average");
    if (sleepQuality === "low" && sleepLast7.length >= 3) riskFlags.push("low_sleep_average_last_week");
    if (sleepLast7.length >= 5) positiveSignals.push("consistent_sleep_tracking");

    // ── Mood scoring depth signal ──
    if (dataCheck.hasMoodScore) positiveSignals.push("mood_scoring_depth_sufficient");

    const derivedInsights: DerivedInsights = {
      weekContext: { currentWeek: week, trimester, weeksToBirth },
      weight: {
        currentKg,
        startKg,
        totalGainKg,
        weeklyAvgGainKg,
        trend: trendOf(weightLevels),
      },
      mood: {
        avgLevel: moodAvg !== undefined ? +moodAvg.toFixed(2) : undefined,
        trend: trendOf(moodLevels),
        lowMoodDays,
      },
      symptoms: {
        topSymptoms,
        frequencyPerWeek: symptomLast7.length,
      },
      hydration: {
        avgMlPerDay: hydrationAvg !== undefined ? Math.round(hydrationAvg) : undefined,
        targetAchievementPct: hydrationTargetPct,
        trend: trendOf(hydrationLevels),
      },
      vitamins: {
        last7DaysCount: vitaminLast7,
        adherencePct: Math.round((vitaminLast7 / 7) * 100),
      },
      kicks: {
        sessionsLast7Days: kickSessionsLast7,
        lastSessionAgoHours: lastKickAgoHours,
      },
      contractions: { count: contractions.length },
      appointments: { nextDateISO, daysUntilNext },
      ultrasound: {
        count: bumpPhotos.length,
        latestWeek: latestPhoto?.week,
        hasRecentAnalysis: hasRecentUltrasoundAnalysis,
        readingsWithAnalysisCount,
      },
      sleep: {
        sessionsLast7Days: sleepLast7.length,
        avgMinutesPerDay: avgSleepMinutesPerDay,
        quality: sleepQuality,
      },
      engagementScore,
      riskFlags,
      positiveSignals,
    };

    // ── Build LLM-optimised Markdown summary (instead of raw JSON) ────
    const lines: string[] = [];
    lines.push(`## User Context`);
    if (week) {
      lines.push(`- Pregnancy Week: ${week} (Trimester ${trimester}) — ~${weeksToBirth} weeks until birth`);
    } else if (profile?.journeyStage) {
      lines.push(`- Journey Stage: ${profile.journeyStage}`);
    }
    if (profile?.weight) lines.push(`- Profile Weight: ${profile.weight} kg`);
    if (profile?.height) lines.push(`- Profile Height: ${profile.height} cm`);
    lines.push(`- Tracking Engagement: ${engagementScore}% (${sourcesCount}/${ALL_SOURCES} sources active)`);

    if (positiveSignals.length > 0) {
      lines.push(``, `## Positive Signals`);
      positiveSignals.forEach((s) => lines.push(`- ✅ ${s.replace(/_/g, " ")}`));
    }

    if (riskFlags.length > 0) {
      lines.push(``, `## Watch-Outs (gentle, non-diagnostic)`);
      riskFlags.forEach((s) => lines.push(`- ⚠️ ${s.replace(/_/g, " ")}`));
    }

    lines.push(``, `## Detailed Metrics`);

    if (currentKg !== undefined) {
      lines.push(
        `**Weight**: current ${fmt(currentKg)} kg${
          totalGainKg !== undefined ? ` (total ${totalGainKg >= 0 ? "+" : ""}${fmt(totalGainKg)} kg)` : ""
        }${
          weeklyAvgGainKg !== undefined ? `, ~${fmt(weeklyAvgGainKg, 2)} kg/wk` : ""
        } ${trendArrow(derivedInsights.weight.trend)}`,
      );
    }

    if (moodAvg !== undefined) {
      lines.push(
        `**Mood**: avg ${fmt(moodAvg, 2)}/5 over ${moodLast7.length} days, ` +
          `${lowMoodDays} low-mood day(s) ${trendArrow(derivedInsights.mood.trend)}`,
      );
    }

    if (topSymptoms.length > 0) {
      lines.push(
        `**Symptoms**: ${symptomLast7.length} logged days last week. Top: ${topSymptoms
          .map((s) => `${s.name} (×${s.count})`)
          .join(", ")}`,
      );
    }

    if (hydrationAvg !== undefined) {
      lines.push(
        `**Hydration**: avg ${Math.round(hydrationAvg)} ml/day (${hydrationTargetPct}% of ${HYDRATION_TARGET_ML} ml target) ${trendArrow(
          derivedInsights.hydration.trend,
        )}`,
      );
    }

    if (vitaminDays > 0) {
      lines.push(`**Vitamins**: taken ${vitaminLast7}/7 days last week (${derivedInsights.vitamins.adherencePct}% adherence)`);
    }

    if (kickSessions.length > 0) {
      lines.push(
        `**Kick Sessions**: ${kickSessionsLast7} last 7d, total ${kickSessions.length}` +
          (lastKickAgoHours !== undefined ? `, last session ${lastKickAgoHours}h ago` : ""),
      );
    }

    if (contractions.length > 0) {
      lines.push(`**Contractions**: ${contractions.length} total entries logged`);
    }

    if (upcoming.length > 0) {
      lines.push(
        `**Next Appointment**: "${upcoming[0].title}" in ${daysUntilNext} day(s) — ${upcoming.length} upcoming total`,
      );
    }

    if (meals.length > 0) {
      lines.push(`**Recent Meals (saved)**: ${meals.length} — e.g. ${(meals[0]?.title || meals[0]?.summary || "").slice(0, 60)}`);
    }
    if (fitness.length > 0) {
      lines.push(`**Recent Fitness (saved)**: ${fitness.length} sessions tracked`);
    }

    if (bumpPhotos.length > 0) {
      lines.push(
        `**Body / Ultrasound Photos**: ${bumpPhotos.length} photo(s), ${readingsWithAnalysisCount} with AI reading` +
          (latestPhoto?.week ? `, latest at week ${latestPhoto.week}` : "") +
          (latestAnalysisExcerpt
            ? `. Latest AI reading excerpt: "${latestAnalysisExcerpt}"`
            : ""),
      );
    }

    if (sleepLast7.length > 0) {
      const hours = avgSleepMinutesPerDay !== undefined ? (avgSleepMinutesPerDay / 60).toFixed(1) : "—";
      lines.push(
        `**Sleep**: ${sleepLast7.length} session(s) last 7d (${nightCount} night, ${napCount} nap), ` +
          `avg ${hours} h/day — quality: ${sleepQuality}`,
      );
    }

    if (dataCheck.hasMoodScore) {
      lines.push(`**Mood Scoring**: depth threshold met (≥3 logs in last 14 days) — trend analysis enabled`);
    }

    const contextSummary = lines.join("\n");

    return {
      snapshot,
      derivedInsights,
      contextSummary,
      dataRichness: engagementScore,
      hasMinimumData: sourcesCount >= MIN_SOURCES,
      sourcesCount,
    };
  }, [profile, stats, dataCheck]);
}
