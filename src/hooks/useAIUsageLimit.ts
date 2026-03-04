/**
 * Daily AI Usage Limiter — Hybrid (server-enforced + local cache)
 * 
 * Server: Edge Function checks ai_usage_logs and returns X-Daily-* headers
 * Client: localStorage cache for instant UI feedback between requests
 * 
 * The server is the source of truth. localStorage is optimistic UI only.
 */

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'ai_daily_usage';
const DAILY_LIMIT = 60;

interface UsageData {
  date: string; // YYYY-MM-DD
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getLocalUsage(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UsageData;
      if (parsed.date === getTodayKey()) return parsed;
    }
  } catch {}
  return { date: getTodayKey(), count: 0 };
}

function setLocalUsage(count: number): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), count }));
}

export function useAIUsageLimit() {
  const [serverCount, setServerCount] = useState<number | null>(null);

  // Use server count if available, otherwise fall back to local
  const used = serverCount ?? getLocalUsage().count;
  const remaining = Math.max(0, DAILY_LIMIT - used);
  const isLimitReached = used >= DAILY_LIMIT;

  /** Called after a successful AI request — optimistically increment local count */
  const incrementUsage = useCallback(() => {
    const current = serverCount ?? getLocalUsage().count;
    const newCount = current + 1;
    setServerCount(newCount);
    setLocalUsage(newCount);
  }, [serverCount]);

  /** Sync local cache with server-reported usage (from X-Daily-Used header) */
  const syncFromServer = useCallback((serverUsed: number) => {
    setServerCount(serverUsed);
    setLocalUsage(serverUsed);
  }, []);

  return {
    remaining,
    used,
    limit: DAILY_LIMIT,
    isLimitReached,
    incrementUsage,
    syncFromServer,
  };
}
