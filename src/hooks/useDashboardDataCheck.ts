import { useMemo } from "react";
import { safeParseLocalStorage } from "@/lib/safeStorage";

/** Returns booleans indicating which dashboard cards have real data */
export function useDashboardDataCheck() {
  return useMemo(() => {
    const symptoms = safeParseLocalStorage<any[]>("quick_symptom_logs", []);
    const contractions = safeParseLocalStorage<any[]>("contraction_timer_data", []);
    const savedResults = safeParseLocalStorage<any[]>("ai-saved-results", []);
    const weightEntries = safeParseLocalStorage<any[]>("weight_gain_entries", []);
    const profile = safeParseLocalStorage<any>("user_central_profile_v1", null);

    const hasMoodData = symptoms.some(l => l.mood > 0);
    const hasSymptomsData = symptoms.length > 0 && symptoms.some(l => l.symptoms?.length > 0);
    const hasContractions = contractions.length > 0;
    const hasSavedResults = savedResults.length > 0;
    const hasWeight = weightEntries.length > 0 || !!profile?.weight;
    const hasMeals = savedResults.some(r => r.toolId === "ai-meal-suggestion");
    const hasFitness = savedResults.some(r => r.toolId === "ai-fitness-coach");
    const hasRecentActivity = hasMeals || hasFitness;

    return {
      hasSymptomsData,
      hasMoodData,
      hasContractions,
      hasSavedResults,
      hasWeight,
      hasRecentActivity,
    };
  }, []);
}
