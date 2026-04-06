/**
 * Smart Cache Manager
 * Local-first caching for AI responses.
 * Avoids duplicate AI calls by caching by section + user context + time.
 * 
 * Cache key patterns:
 * - daily_insight_<section>_<date>
 * - section_insight_<section>_<contentHash>_<date>
 * - kick_analysis_<contentHash>_<date>
 * - bump_photo_summary_<contentHash>
 */

import type { CacheEntry, SmartSection } from "./types";

const CACHE_PREFIX = "smart_cache_";
const DEFAULT_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
const MAX_CACHE_ENTRIES = 50;

// TTL per section (some insights are more time-sensitive)
const SECTION_TTL: Partial<Record<SmartSection, number>> = {
  "kick-analysis": 2 * 60 * 60 * 1000,    // 2 hours — movement patterns change
  "symptoms": 2 * 60 * 60 * 1000,          // 2 hours
  "weight": 24 * 60 * 60 * 1000,           // 24 hours — weight doesn't change fast
  "bump-photos": 7 * 24 * 60 * 60 * 1000,   // 7 days — bump photo results are stable
  "medications": 24 * 60 * 60 * 1000,      // 24 hours
  "appointments": 12 * 60 * 60 * 1000,     // 12 hours
  "nutrition": 6 * 60 * 60 * 1000,         // 6 hours
};

/**
 * Generate a simple hash of content for cache key differentiation.
 */
export function contentHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Build a cache key from section, optional context, and date.
 */
export function buildCacheKey(
  section: SmartSection,
  contextFingerprint?: string,
  date?: string,
): string {
  const d = date || new Date().toISOString().split("T")[0];
  const ctx = contextFingerprint ? `_${contentHash(contextFingerprint)}` : "";
  return `${CACHE_PREFIX}${section}${ctx}_${d}`;
}

/**
 * Get a cached result if valid and not expired.
 */
export function getCached(key: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

/**
 * Store a result in cache.
 */
export function setCache(
  key: string,
  content: string,
  section: SmartSection,
  contextFingerprint?: string,
): void {
  const ttl = SECTION_TTL[section] || DEFAULT_TTL_MS;
  const entry: CacheEntry = {
    content,
    section,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttl,
    contentHash: contentHash(contextFingerprint || content),
  };
  try {
    localStorage.setItem(key, JSON.stringify(entry));
    cleanupOldEntries();
  } catch { /* quota exceeded */ }
}

/**
 * Invalidate cache for a specific section.
 */
export function invalidateSection(section: SmartSection): void {
  try {
    const prefix = `${CACHE_PREFIX}${section}`;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
    keys.forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

/**
 * Clear all smart cache entries.
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

/**
 * Evict oldest entries if over the max limit.
 */
function cleanupOldEntries(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    if (keys.length <= MAX_CACHE_ENTRIES) return;

    const entries = keys.map(k => {
      try {
        const raw = localStorage.getItem(k);
        const parsed = raw ? JSON.parse(raw) : null;
        return { key: k, timestamp: parsed?.timestamp || 0 };
      } catch {
        return { key: k, timestamp: 0 };
      }
    });

    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_ENTRIES);
    toRemove.forEach(e => localStorage.removeItem(e.key));
  } catch { /* ignore */ }
}
