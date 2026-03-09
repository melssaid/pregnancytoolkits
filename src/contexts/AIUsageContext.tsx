/**
 * Global AI Usage Context
 * Single source of truth for daily AI usage across all components.
 * Server headers are the authority; localStorage is optimistic cache.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

const STORAGE_KEY = 'ai_daily_usage';
const DEFAULT_LIMIT = 60;

export type SubscriptionTier = 'free' | 'premium';

interface UsageData {
  date: string;
  count: number;
  limit: number;
  tier: SubscriptionTier;
}

interface AIUsageContextValue {
  remaining: number;
  used: number;
  limit: number;
  tier: SubscriptionTier;
  isLimitReached: boolean;
  isNearLimit: boolean;
  incrementUsage: () => void;
  syncFromServer: (serverUsed: number) => void;
  syncLimit: (newLimit: number, newTier?: SubscriptionTier) => void;
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

const AIUsageContext = createContext<AIUsageContextValue | null>(null);

export function AIUsageProvider({ children }: { children: ReactNode }) {
  const local = getLocalUsage();
  const [count, setCount] = useState(local.count);
  const [limit, setLimit] = useState(local.limit || DEFAULT_LIMIT);
  const [tier, setTier] = useState<SubscriptionTier>(local.tier || 'free');

  // Reset at midnight
  useEffect(() => {
    const stored = getLocalUsage();
    setCount(stored.count);
    setLimit(stored.limit || DEFAULT_LIMIT);
    setTier(stored.tier || 'free');
  }, []);

  const remaining = Math.max(0, limit - count);
  const isLimitReached = count >= limit;
  const isNearLimit = remaining <= 10 && remaining > 0;

  const incrementUsage = useCallback(() => {
    setCount(prev => {
      const newCount = prev + 1;
      setLocalUsage({ count: newCount });
      return newCount;
    });
  }, []);

  const syncFromServer = useCallback((serverUsed: number) => {
    setCount(serverUsed);
    setLocalUsage({ count: serverUsed });
  }, []);

  const syncLimit = useCallback((newLimit: number, newTier?: SubscriptionTier) => {
    setLimit(newLimit);
    if (newTier) setTier(newTier);
    setLocalUsage({ limit: newLimit, tier: newTier || 'free' });
  }, []);

  return (
    <AIUsageContext.Provider value={{
      remaining,
      used: count,
      limit,
      tier,
      isLimitReached,
      isNearLimit,
      incrementUsage,
      syncFromServer,
      syncLimit,
    }}>
      {children}
    </AIUsageContext.Provider>
  );
}

export function useAIUsage(): AIUsageContextValue {
  const ctx = useContext(AIUsageContext);
  if (!ctx) {
    // Fallback for components rendered outside provider
    const local = getLocalUsage();
    const remaining = Math.max(0, (local.limit || DEFAULT_LIMIT) - local.count);
    return {
      remaining,
      used: local.count,
      limit: local.limit || DEFAULT_LIMIT,
      tier: local.tier || 'free',
      isLimitReached: local.count >= (local.limit || DEFAULT_LIMIT),
      isNearLimit: remaining <= 10 && remaining > 0,
      incrementUsage: () => {},
      syncFromServer: () => {},
      syncLimit: () => {},
    };
  }
  return ctx;
}
