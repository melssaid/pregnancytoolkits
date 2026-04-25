import { useMemo } from "react";
import { safeParseLocalStorage } from "@/lib/safeStorage";

/**
 * Comprehensive data presence check for dashboard cards.
 * Returns booleans indicating which cards have real user data,
 * so empty cards can be hidden professionally (Flo / Apple Health style).
 */
export function useDashboardDataCheck() {
  return useMemo(() => {
    // Symptoms & mood
    const symptoms = safeParseLocalStorage<any[]>("quick_symptom_logs", []);
    // Tracking
    const contractions = safeParseLocalStorage<any[]>("contraction_timer_data", []);
    const savedResults = safeParseLocalStorage<any[]>("ai-saved-results", []);
    const weightEntries = safeParseLocalStorage<any[]>("weight_gain_entries", []);
    const profile = safeParseLocalStorage<any>("user_central_profile_v1", null);
    // Hydration & vitamins
    const hydration = safeParseLocalStorage<any>("hydration_data", { glasses: 0 });
    const vitamins = safeParseLocalStorage<any[]>("vitamin_logs", []);
    // Appointments
    const appointments = safeParseLocalStorage<any[]>("appointments", []);
    // Kicks (sessions)
    const kickSessions = safeParseLocalStorage<any[]>("kick_sessions_data", []);

    const hasMoodData = symptoms.some(l => l.mood > 0);
    const hasSymptomsData = symptoms.length > 0 && symptoms.some(l => l.symptoms?.length > 0);
    const hasContractions = contractions.length > 0;
    const hasSavedResults = savedResults.length > 0;
    const hasWeight = weightEntries.length > 0 || !!profile?.weight;
    const hasMeals = savedResults.some(r => r.toolId === "ai-meal-suggestion");
    const hasFitness = savedResults.some(r => r.toolId === "ai-fitness-coach");
    const hasRecentActivity = hasMeals || hasFitness;
    const hasHydration = (hydration?.glasses || 0) > 0;
    const hasVitamins = vitamins.length > 0;
    const hasAppointments = appointments.length > 0;
    const hasKickSessions = kickSessions.length > 0;

    const hasAnyData =
      hasMoodData || hasSymptomsData || hasContractions || hasSavedResults ||
      hasWeight || hasRecentActivity || hasHydration || hasVitamins ||
      hasAppointments || hasKickSessions;

    return {
      hasSymptomsData,
      hasMoodData,
      hasContractions,
      hasSavedResults,
      hasWeight,
      hasRecentActivity,
      hasHydration,
      hasVitamins,
      hasAppointments,
      hasKickSessions,
      hasAnyData,
    };
  }, []);
}
