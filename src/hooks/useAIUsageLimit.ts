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
const DEFAULT_LIMIT = 60; // Free tier default until server syncs

export type SubscriptionTier = 'free' | 'premium';

interface UsageData {
  date: string; // YYYY-MM-DD
  count: number;
  limit: number;
  tier: SubscriptionTier;
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
  return { date: getTodayKey(), count: 0, limit: DEFAULT_LIMIT, tier: 'free' };
}

function setLocalUsage(data: Partial<UsageData>): void {
  const current = getLocalUsage();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data, date: getTodayKey() }));
}

export function useAIUsageLimit() {
  const [serverCount, setServerCount] = useState<number | null>(null);
  const [serverLimit, setServerLimit] = useState<number | null>(null);
  const [serverTier, setServerTier] = useState<SubscriptionTier | null>(null);

  const local = getLocalUsage();
  const used = serverCount ?? local.count;
  const limit = serverLimit ?? local.limit ?? DEFAULT_LIMIT;
  const tier: SubscriptionTier = serverTier ?? local.tier ?? 'free';
  const remaining = Math.max(0, limit - used);
  const isLimitReached = used >= limit;
  const isNearLimit = remaining <= 10 && remaining > 0;

  /** Called after a successful AI request — optimistically increment local count */
  const incrementUsage = useCallback(() => {
    const current = serverCount ?? getLocalUsage().count;
    const newCount = current + 1;
    setServerCount(newCount);
    setLocalUsage({ count: newCount });
  }, [serverCount]);

  /** Sync local cache with server-reported usage (from X-Daily-Used header) */
  const syncFromServer = useCallback((serverUsed: number) => {
    setServerCount(serverUsed);
    setLocalUsage({ count: serverUsed });
  }, []);

  /** Sync limit and tier from server headers */
  const syncLimit = useCallback((newLimit: number, newTier?: SubscriptionTier) => {
    setServerLimit(newLimit);
    if (newTier) setServerTier(newTier);
    setLocalUsage({ limit: newLimit, tier: newTier || 'free' });
  }, []);

  return {
    remaining,
    used,
    limit,
    tier,
    isLimitReached,
    isNearLimit,
    incrementUsage,
    syncFromServer,
    syncLimit,
  };
}
