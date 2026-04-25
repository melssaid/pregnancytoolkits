/**
 * Unified Kick Sessions store.
 *
 * Single source of truth for kick-counter data across the entire app.
 * Canonical key: `kick_sessions` (matches STORAGE_KEYS.KICK_SESSIONS).
 *
 * Historically the app wrote to three different keys:
 *   1. `kick_sessions`              ← canonical (used by services + archive)
 *   2. `kick_sessions_${userId}`    ← per-user (used by tool + several cards)
 *   3. `kick_sessions_data`         ← legacy
 *
 * This module hides that fragmentation: every read/write goes through here,
 * and a one-time migration merges the three buckets into the canonical key
 * the first time the helper is touched in a session.
 */
import { STORAGE_KEYS, emitDataChange } from "@/lib/dataBus";

const CANONICAL_KEY = STORAGE_KEYS.KICK_SESSIONS; // "kick_sessions"
const LEGACY_KEY = "kick_sessions_data";
const MIGRATION_FLAG = "kick_sessions_migrated_v1";

type AnySession = Record<string, any>;

const safeParse = (raw: string | null): AnySession[] => {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

const sessionId = (s: AnySession): string =>
  String(s?.id ?? `${s?.started_at ?? s?.startedAt ?? ""}_${s?.total_kicks ?? s?.kicks ?? 0}`);

const dedupe = (sessions: AnySession[]): AnySession[] => {
  const map = new Map<string, AnySession>();
  for (const s of sessions) {
    if (!s) continue;
    const id = sessionId(s);
    // Prefer the most recently-ended record when duplicates collide.
    const prev = map.get(id);
    if (!prev) {
      map.set(id, s);
      continue;
    }
    const prevEnd = new Date(prev.ended_at ?? prev.endedAt ?? 0).getTime();
    const curEnd = new Date(s.ended_at ?? s.endedAt ?? 0).getTime();
    if (curEnd >= prevEnd) map.set(id, s);
  }
  return [...map.values()];
};

/** Find every legacy per-user key (`kick_sessions_*`) currently in localStorage. */
const collectLegacyPerUserKeys = (): string[] => {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith("kick_sessions_") && k !== LEGACY_KEY && k !== MIGRATION_FLAG && k !== CANONICAL_KEY) {
        keys.push(k);
      }
    }
  } catch {
    /* storage unavailable */
  }
  return keys;
};

/**
 * One-shot migration. Reads all 3 historical buckets, merges + dedupes,
 * writes the result to the canonical key, then deletes the legacy buckets.
 * Idempotent — guarded by `MIGRATION_FLAG`.
 */
export const migrateKickSessions = (): void => {
  try {
    if (localStorage.getItem(MIGRATION_FLAG) === "1") return;

    const canonical = safeParse(localStorage.getItem(CANONICAL_KEY));
    const legacy = safeParse(localStorage.getItem(LEGACY_KEY));
    const perUserKeys = collectLegacyPerUserKeys();
    const perUser = perUserKeys.flatMap((k) => safeParse(localStorage.getItem(k)));

    const merged = dedupe([...canonical, ...legacy, ...perUser]);

    // Only write if we actually combined something new — keeps storage clean.
    if (merged.length !== canonical.length) {
      localStorage.setItem(CANONICAL_KEY, JSON.stringify(merged));
    }

    // Clean up the legacy buckets so future reads can't drift.
    if (legacy.length) localStorage.removeItem(LEGACY_KEY);
    for (const k of perUserKeys) localStorage.removeItem(k);

    localStorage.setItem(MIGRATION_FLAG, "1");

    if (merged.length !== canonical.length) emitDataChange(CANONICAL_KEY);
  } catch {
    /* fail silently — migration is best-effort */
  }
};

/** Read all kick sessions from the unified store (auto-migrating on first call). */
export const readKickSessions = (): AnySession[] => {
  migrateKickSessions();
  return safeParse(localStorage.getItem(CANONICAL_KEY));
};

/** Replace the entire kick sessions list. Emits a data-change event. */
export const writeKickSessions = (sessions: AnySession[]): void => {
  try {
    localStorage.setItem(CANONICAL_KEY, JSON.stringify(sessions));
    emitDataChange(CANONICAL_KEY);
  } catch {
    /* quota / unavailable — swallow */
  }
};

export const KICK_SESSIONS_KEY = CANONICAL_KEY;
