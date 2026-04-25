/**
 * dataBus — single source of truth for cross-component reactivity.
 *
 * The native `storage` event only fires across DIFFERENT tabs. To keep the
 * dashboard live within the SAME tab when a tool saves data, we wrap
 * localStorage writes here and emit a custom `app:data-changed` event with
 * the key that was touched. Components can subscribe via `subscribeToData`.
 *
 * Also re-emits the cross-tab `storage` event for unified handling.
 */

import { safeSaveToLocalStorage, safeRemoveFromLocalStorage } from "./safeStorage";

export const DATA_EVENT = "app:data-changed";

export interface DataChangePayload {
  key: string;
  source: "self" | "other-tab";
}

/** Write to localStorage and notify all listeners (same-tab + cross-tab). */
export function publishDataChange<T>(key: string, value: T): boolean {
  const ok = safeSaveToLocalStorage(key, value);
  if (ok) emitDataChange(key, "self");
  return ok;
}

/** Remove from localStorage and notify listeners. */
export function publishDataRemove(key: string): void {
  safeRemoveFromLocalStorage(key);
  emitDataChange(key, "self");
}

/** Manually announce a change after a direct localStorage.setItem call. */
export function emitDataChange(key: string, source: "self" | "other-tab" = "self"): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<DataChangePayload>(DATA_EVENT, { detail: { key, source } })
  );
}

/**
 * Subscribe to data changes. Returns an unsubscribe function.
 * Pass an array of keys to filter, or omit to listen to all changes.
 */
export function subscribeToData(
  handler: (payload: DataChangePayload) => void,
  keys?: string[]
): () => void {
  if (typeof window === "undefined") return () => {};

  const filter = keys && keys.length > 0 ? new Set(keys) : null;

  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<DataChangePayload>).detail;
    if (!detail) return;
    if (filter && !filter.has(detail.key)) return;
    handler(detail);
  };

  const onStorage = (e: StorageEvent) => {
    if (!e.key) return;
    if (filter && !filter.has(e.key)) return;
    handler({ key: e.key, source: "other-tab" });
  };

  window.addEventListener(DATA_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(DATA_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Canonical storage keys used across tools and the dashboard.
 * Use these constants instead of string literals to avoid drift.
 */
export const STORAGE_KEYS = {
  // Tracking
  KICK_SESSIONS: "kick_sessions",
  CONTRACTIONS: "contraction_timer_data",
  WEIGHT_ENTRIES: "weight_gain_entries",
  SYMPTOM_LOGS: "quick_symptom_logs",
  VITAMIN_LOGS: "vitamin-tracker-logs",
  DIAPER_ENTRIES: "diaperEntries",
  BABY_SLEEP: "baby-sleep-tracker-data",
  BABY_GROWTH: "baby-growth-entries",
  // Per-user (suffix with userId)
  WATER_LOGS: (userId: string) => `water_logs_${userId}`,
  BUMP_PHOTOS: (userId: string) => `bump_photos_${userId}`,
  BIRTH_PLAN: (userId: string) => `birth_plan_${userId}`,
  HOSPITAL_BAG: (userId: string) => `hospital_bag_${userId}`,
  GROCERY_LIST: (userId: string) => `grocery_list_${userId}`,
  // Shared
  APPOINTMENTS: "appointments",
  SAVED_RESULTS: "ai-saved-results",
  PROFILE: "user_central_profile_v1",
  HEALTH_CHECKIN: "dashboard_health_checkin_v1",
} as const;
