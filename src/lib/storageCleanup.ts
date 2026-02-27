/**
 * Periodic localStorage cleanup utility
 * Automatically removes stale, corrupt, or oversized data to keep the app healthy.
 * Runs once per session (max once per 6 hours).
 */

const CLEANUP_TIMESTAMP_KEY = '__last_cleanup';
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

// System keys that should never be touched
const PROTECTED_KEYS = new Set([
  'cookie_consent',
  'theme',
  'i18nextLng',
  'user_selected_language',
  'onboarding_completed',
  'disclaimer_accepted',
  'first_visit_done',
  '__last_cleanup',
  'encryption_enabled',
  'encryption_key',
]);

// Keys with known max-age (in days) — data older than this is stale
const KEY_MAX_AGE_DAYS: Record<string, number> = {
  'ai_results_cache': 7,
  'motivational_quote': 1,
  'daily_tip': 1,
  'fertDailyTip': 1,
};

// Max size per key in bytes (500KB)
const MAX_KEY_SIZE = 500 * 1024;

// Max total localStorage usage in bytes (4MB — leave 1MB headroom)
const MAX_TOTAL_SIZE = 4 * 1024 * 1024;

interface CleanupReport {
  corruptKeysRemoved: number;
  staleKeysRemoved: number;
  oversizedKeysTrimmed: number;
  totalFreedBytes: number;
}

function isCorruptJSON(value: string): boolean {
  // Empty or whitespace-only
  if (!value || !value.trim()) return true;
  // Try parsing
  try {
    JSON.parse(value);
    return false;
  } catch {
    // If it looks like it was meant to be JSON but is corrupt
    if (value.startsWith('{') || value.startsWith('[') || value.startsWith('"')) {
      return true;
    }
    // Plain strings are fine
    return false;
  }
}

function getTimestampFromKey(key: string): number | null {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    const parsed = JSON.parse(value);

    // Check common timestamp patterns
    if (parsed?.timestamp) return new Date(parsed.timestamp).getTime();
    if (parsed?.date) return new Date(parsed.date).getTime();
    if (parsed?.savedAt) return new Date(parsed.savedAt).getTime();
    if (parsed?.created_at) return new Date(parsed.created_at).getTime();

    // For arrays with dated items, check the last item
    if (Array.isArray(parsed) && parsed.length > 0) {
      const last = parsed[parsed.length - 1];
      if (last?.date) return new Date(last.date).getTime();
      if (last?.timestamp) return new Date(last.timestamp).getTime();
    }

    return null;
  } catch {
    return null;
  }
}

export function runStorageCleanup(): CleanupReport {
  const report: CleanupReport = {
    corruptKeysRemoved: 0,
    staleKeysRemoved: 0,
    oversizedKeysTrimmed: 0,
    totalFreedBytes: 0,
  };

  const keysToRemove: string[] = [];
  const now = Date.now();

  // Pass 1: Remove corrupt & stale data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || PROTECTED_KEYS.has(key)) continue;

    const value = localStorage.getItem(key);
    if (!value) continue;

    // Remove corrupt JSON
    if (isCorruptJSON(value)) {
      keysToRemove.push(key);
      report.corruptKeysRemoved++;
      report.totalFreedBytes += value.length;
      continue;
    }

    // Remove stale keys with known expiry
    const maxAgeDays = KEY_MAX_AGE_DAYS[key];
    if (maxAgeDays) {
      const ts = getTimestampFromKey(key);
      if (ts && (now - ts) > maxAgeDays * 24 * 60 * 60 * 1000) {
        keysToRemove.push(key);
        report.staleKeysRemoved++;
        report.totalFreedBytes += value.length;
        continue;
      }
    }

    // Remove individual keys that are too large
    if (value.length > MAX_KEY_SIZE) {
      keysToRemove.push(key);
      report.oversizedKeysTrimmed++;
      report.totalFreedBytes += value.length;
    }
  }

  // Execute removals
  keysToRemove.forEach(key => {
    try { localStorage.removeItem(key); } catch {}
  });

  // Pass 2: If total size still exceeds limit, remove oldest non-protected keys
  let totalSize = 0;
  const sizedKeys: { key: string; size: number; ts: number }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || PROTECTED_KEYS.has(key)) continue;
    const value = localStorage.getItem(key);
    if (!value) continue;
    totalSize += value.length + key.length;
    sizedKeys.push({ key, size: value.length, ts: getTimestampFromKey(key) || now });
  }

  if (totalSize > MAX_TOTAL_SIZE) {
    // Sort by timestamp ascending (oldest first)
    sizedKeys.sort((a, b) => a.ts - b.ts);

    for (const item of sizedKeys) {
      if (totalSize <= MAX_TOTAL_SIZE) break;
      try {
        localStorage.removeItem(item.key);
        totalSize -= item.size;
        report.totalFreedBytes += item.size;
        report.staleKeysRemoved++;
      } catch {}
    }
  }

  return report;
}

/**
 * Run cleanup if enough time has passed since last run.
 * Safe to call on every app load — will skip if not needed.
 */
export function maybeRunCleanup(): void {
  try {
    const lastRun = localStorage.getItem(CLEANUP_TIMESTAMP_KEY);
    const lastRunTime = lastRun ? parseInt(lastRun, 10) : 0;

    if (Date.now() - lastRunTime < CLEANUP_INTERVAL_MS) return;

    // Run in next idle callback to avoid blocking render
    const run = () => {
      const report = runStorageCleanup();
      localStorage.setItem(CLEANUP_TIMESTAMP_KEY, String(Date.now()));

      const totalActions = report.corruptKeysRemoved + report.staleKeysRemoved + report.oversizedKeysTrimmed;
      if (totalActions > 0) {
        console.info(
          `[StorageCleanup] Cleaned ${totalActions} items, freed ~${(report.totalFreedBytes / 1024).toFixed(1)}KB`,
          report
        );
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(run, { timeout: 5000 });
    } else {
      setTimeout(run, 2000);
    }
  } catch (e) {
    // Cleanup should never crash the app
    console.warn('[StorageCleanup] Error:', e);
  }
}
