/**
 * Centralized reset utilities with snapshot-based undo.
 * Supports per-tool reset (single key or set of keys) and full dashboard wipe.
 */
import { STORAGE_KEYS, emitDataChange } from "./dataBus";
import { getUserId } from "@/hooks/useSupabase";

export type ResetSnapshot = {
  entries: { key: string; value: string | null }[];
  takenAt: number;
};

/** Capture current values for a list of keys so we can restore them. */
export function snapshot(keys: string[]): ResetSnapshot {
  const entries = keys.map((key) => ({
    key,
    value: typeof localStorage !== "undefined" ? localStorage.getItem(key) : null,
  }));
  return { entries, takenAt: Date.now() };
}

/** Remove the listed keys and notify listeners. */
export function clearKeys(keys: string[]): ResetSnapshot {
  const snap = snapshot(keys);
  if (typeof localStorage === "undefined") return snap;
  for (const key of keys) {
    localStorage.removeItem(key);
    emitDataChange(key, "self");
  }
  return snap;
}

/** Restore a previously taken snapshot (undo a reset). */
export function restoreSnapshot(snap: ResetSnapshot): void {
  if (typeof localStorage === "undefined") return;
  for (const { key, value } of snap.entries) {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
    emitDataChange(key, "self");
  }
}

/** Per-tool key registry — used by ResetDataButton when given a toolId. */
export function getToolKeys(toolId: string): string[] {
  const userId = getUserId();
  switch (toolId) {
    case "smart-kick-counter":
      return [STORAGE_KEYS.KICK_SESSIONS, `kick_sessions_${userId}`, "kick_sessions_data"];
    case "contraction-timer":
      return [STORAGE_KEYS.CONTRACTIONS];
    case "vitamin-tracker":
      return [STORAGE_KEYS.VITAMIN_LOGS];
    case "smart-weight-gain":
      return [STORAGE_KEYS.WEIGHT_ENTRIES];
    case "diaper-tracker":
      return [STORAGE_KEYS.DIAPER_ENTRIES];
    case "baby-sleep-tracker":
      return [STORAGE_KEYS.BABY_SLEEP];
    case "baby-growth":
      return [STORAGE_KEYS.BABY_GROWTH];
    case "hydration":
      return [STORAGE_KEYS.WATER_LOGS(userId)];
    case "ai-bump-photos":
      return [STORAGE_KEYS.BUMP_PHOTOS(userId)];
    case "ai-birth-plan":
      return [STORAGE_KEYS.BIRTH_PLAN(userId)];
    case "ai-hospital-bag":
      return [STORAGE_KEYS.HOSPITAL_BAG(userId)];
    case "smart-grocery-list":
      return [STORAGE_KEYS.GROCERY_LIST(userId)];
    case "appointments":
      return [STORAGE_KEYS.APPOINTMENTS];
    case "symptoms":
      return [STORAGE_KEYS.SYMPTOM_LOGS];
    case "saved-results":
      return [STORAGE_KEYS.SAVED_RESULTS];
    default:
      return [];
  }
}

/** All tracker/result keys for a full dashboard wipe (preserves PROFILE + onboarding). */
export function getAllDashboardKeys(): string[] {
  const userId = getUserId();
  return [
    STORAGE_KEYS.KICK_SESSIONS,
    `kick_sessions_${userId}`,
    "kick_sessions_data",
    STORAGE_KEYS.CONTRACTIONS,
    STORAGE_KEYS.WEIGHT_ENTRIES,
    STORAGE_KEYS.SYMPTOM_LOGS,
    STORAGE_KEYS.VITAMIN_LOGS,
    STORAGE_KEYS.DIAPER_ENTRIES,
    STORAGE_KEYS.BABY_SLEEP,
    STORAGE_KEYS.BABY_GROWTH,
    STORAGE_KEYS.WATER_LOGS(userId),
    STORAGE_KEYS.BUMP_PHOTOS(userId),
    STORAGE_KEYS.BIRTH_PLAN(userId),
    STORAGE_KEYS.HOSPITAL_BAG(userId),
    STORAGE_KEYS.GROCERY_LIST(userId),
    STORAGE_KEYS.APPOINTMENTS,
    STORAGE_KEYS.SAVED_RESULTS,
    STORAGE_KEYS.HEALTH_CHECKIN,
  ];
}
