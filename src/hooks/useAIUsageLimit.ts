/**
 * Daily AI Usage Limiter
 * Tracks AI requests per day with a generous limit of 25/day
 * Stored in localStorage — resets at midnight local time
 */

const STORAGE_KEY = 'ai_daily_usage';
const DAILY_LIMIT = 25;

interface UsageData {
  date: string; // YYYY-MM-DD
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getUsage(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UsageData;
      if (parsed.date === getTodayKey()) return parsed;
    }
  } catch {}
  return { date: getTodayKey(), count: 0 };
}

function incrementUsage(): void {
  const usage = getUsage();
  usage.count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function useAIUsageLimit() {
  const usage = getUsage();
  const remaining = Math.max(0, DAILY_LIMIT - usage.count);
  const isLimitReached = usage.count >= DAILY_LIMIT;

  return {
    remaining,
    used: usage.count,
    limit: DAILY_LIMIT,
    isLimitReached,
    incrementUsage,
  };
}
