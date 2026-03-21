/**
 * Global AI Usage Context
 * Single source of truth for daily AI usage across all components.
 * Server headers are the authority; localStorage is optimistic cache.
 * Admin reset sets a session bypass that prevents server re-sync.
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';

const STORAGE_KEY = 'ai_daily_usage';
const FREE_LIMIT = 10;
const PREMIUM_LIMIT = 30;
const ADMIN_BYPASS_LIMIT = 999;

export type SubscriptionTier = 'free' | 'premium';

interface UsageData {
  date: string;
  count: number;
  limit: number;
  tier: SubscriptionTier;
  adminBypass?: boolean;
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
  resetUsage: () => void;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getLocalUsage(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UsageData;
      if (parsed.date === getTodayKey()) {
        if (parsed.limit !== FREE_LIMIT && parsed.limit !== PREMIUM_LIMIT && parsed.limit !== ADMIN_BYPASS_LIMIT) {
          parsed.limit = parsed.tier === 'premium' ? PREMIUM_LIMIT : FREE_LIMIT;
        }
        return parsed;
      }
    }
  } catch {}
  return { date: getTodayKey(), count: 0, limit: FREE_LIMIT, tier: 'free', adminBypass: false };
}

function setLocalUsage(data: Partial<UsageData>): void {
  const current = getLocalUsage();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...data, date: getTodayKey() }));
}

const AIUsageContext = createContext<AIUsageContextValue | null>(null);

export function AIUsageProvider({ children }: { children: ReactNode }) {
  const local = getLocalUsage();
  const [count, setCount] = useState(local.count);
  const [limit, setLimit] = useState(local.adminBypass ? ADMIN_BYPASS_LIMIT : (local.limit || FREE_LIMIT));
  const [tier, setTier] = useState<SubscriptionTier>(local.tier || 'free');
  const adminBypassRef = useRef(local.adminBypass || false);

  useEffect(() => {
    const stored = getLocalUsage();
    setCount(stored.count);
    adminBypassRef.current = stored.adminBypass || false;
    setLimit(stored.adminBypass ? ADMIN_BYPASS_LIMIT : (stored.limit || FREE_LIMIT));
    setTier(stored.tier || 'free');
  }, []);

  const remaining = Math.max(0, limit - count);
  const isLimitReached = count >= limit;
  const isNearLimit = remaining <= 2 && remaining > 0;

  const incrementUsage = useCallback(() => {
    setCount(prev => {
      const newCount = prev + 1;
      setLocalUsage({ count: newCount });
      return newCount;
    });
  }, []);

  const syncFromServer = useCallback((serverUsed: number) => {
    // Skip server sync if admin bypass is active
    if (adminBypassRef.current) return;
    setCount(serverUsed);
    setLocalUsage({ count: serverUsed });
  }, []);

  const syncLimit = useCallback((newLimit: number, newTier?: SubscriptionTier) => {
    // Skip server sync if admin bypass is active
    if (adminBypassRef.current) return;
    setLimit(newLimit);
    if (newTier) setTier(newTier);
    setLocalUsage({ limit: newLimit, tier: newTier || 'free' });
  }, []);

  const resetUsage = useCallback(() => {
    adminBypassRef.current = true;
    setCount(0);
    setLimit(ADMIN_BYPASS_LIMIT);
    setTier('premium');
    setLocalUsage({ count: 0, limit: ADMIN_BYPASS_LIMIT, tier: 'premium', adminBypass: true });
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
      resetUsage,
    }}>
      {children}
    </AIUsageContext.Provider>
  );
}

export function useAIUsage(): AIUsageContextValue {
  const ctx = useContext(AIUsageContext);
  if (!ctx) {
    const local = getLocalUsage();
    const lim = local.adminBypass ? ADMIN_BYPASS_LIMIT : (local.limit || FREE_LIMIT);
    const remaining = Math.max(0, lim - local.count);
    return {
      remaining,
      used: local.count,
      limit: lim,
      tier: local.tier || 'free',
      isLimitReached: local.count >= lim,
      isNearLimit: remaining <= 2 && remaining > 0,
      incrementUsage: () => {},
      syncFromServer: () => {},
      syncLimit: () => {},
      resetUsage: () => {},
    };
  }
  return ctx;
}
