/**
 * Storage Limits — Pregnancy-scoped caps for localStorage data
 * Based on 9-month (42-week) pregnancy duration to prevent unbounded growth.
 * 
 * Philosophy: Keep enough data for the entire pregnancy + small buffer,
 * auto-trim oldest entries when limits are exceeded.
 */

/** Max entries per storage key */
export const STORAGE_LIMITS = {
  // One entry per week max
  WEIGHT_ENTRIES: 45,         // 42 weeks + buffer
  WEEKLY_SUMMARIES: 42,       // one AI summary per week
  BUMP_PHOTOS: 42,            // one photo per week
  WELLNESS_DIARY: 90,         // ~2-3 entries/week for 9 months
  
  // Daily tracking (keep ~1 month rolling window)
  QUICK_SYMPTOM_LOGS: 30,     // 30 days
  WATER_LOGS: 30,             // 30 days of water tracking
  VITAMIN_LOGS: 200,          // 5 vitamins × ~40 days
  
  // Session-based
  KICK_SESSIONS: 100,         // ~2 sessions/day for 50 days
  CONTRACTION_SESSIONS: 50,   // labor is short, keep recent
  
  // AI & results
  SAVED_AI_RESULTS: 20,       // curated saves
  TOOL_INSIGHT_CACHE: 20,     // cached AI insights
  
  // Baby tracking (postpartum)
  BABY_SLEEP_LOGS: 90,        // 3 months postpartum
  DIAPER_LOGS: 90,            // 3 months postpartum
  BABY_GROWTH: 24,            // monthly for 2 years
  
  // Appointments
  APPOINTMENTS: 50,           // reasonable appointment count
} as const;

/**
 * Trim an array to the specified limit, keeping the most recent entries.
 * Assumes entries are ordered newest-first OR have a date/timestamp field.
 */
export function trimToLimit<T>(arr: T[], limit: number): T[] {
  if (arr.length <= limit) return arr;
  return arr.slice(0, limit);
}

/**
 * Trim array keeping newest based on a date field, then cap at limit.
 */
export function trimByDateField<T extends Record<string, any>>(
  arr: T[], 
  limit: number, 
  dateField: string = 'createdAt'
): T[] {
  if (arr.length <= limit) return arr;
  const sorted = [...arr].sort((a, b) => {
    const da = new Date(a[dateField] || 0).getTime();
    const db = new Date(b[dateField] || 0).getTime();
    return db - da; // newest first
  });
  return sorted.slice(0, limit);
}
