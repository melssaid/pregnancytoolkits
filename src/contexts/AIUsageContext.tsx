/**
 * Global AI Usage Context
 * Single source of truth — delegates to quotaManager for all storage.
 * Syncs from server on mount to prevent localStorage-clearing exploit.
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  getQuotaState,
  consumeQuota,
  syncFromServer as qmSyncFromServer,
  setTier as qmSetTier,
  applyCouponTier,
  type QuotaState,
} from '@/services/smartEngine';

export type SubscriptionTier = 'free' | 'premium';

interface AIUsageContextValue {
  remaining: number;
  used: number;
  limit: number;
  tier: SubscriptionTier;
  isLimitReached: boolean;
  isNearLimit: boolean;
  /** @deprecated Quota is now consumed automatically by the smart engine. Only use for legacy edge cases. */
  incrementUsage: () => void;
  syncFromServer: (serverUsed: number) => void;
  syncLimit: (newLimit: number, newTier?: SubscriptionTier) => void;
  /** @deprecated Dev-only. No-op in production. */
  resetUsage: () => void;
  /** Force re-read from quotaManager (e.g. after engine consumed quota) */
  refresh: () => void;
}

function readState(): QuotaState {
  return getQuotaState();
}

/** Fetch real usage from server to prevent localStorage clearing exploit */
async function fetchServerQuota(): Promise<{ used: number; limit: number; tier: 'free' | 'premium' } | null> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pregnancy-ai-perplexity`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const AIUsageContext = createContext<AIUsageContextValue | null>(null);

export function AIUsageProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuotaState>(readState);
  const hasSynced = useRef(false);

  // Refresh on mount and periodically when tab gains focus
  const refresh = useCallback(() => setState(readState()), []);

  // Sync from server on first mount to prevent localStorage clearing exploit
  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;

    // Check active coupon from localStorage cache
    try {
      const raw = localStorage.getItem('active_coupon_v1');
      if (raw) {
        const coupon = JSON.parse(raw);
        if (coupon?.expiresAt && new Date(coupon.expiresAt) > new Date()) {
          applyCouponTier(coupon.expiresAt, coupon.bonusPoints);
          refresh();
        }
      }
    } catch { /* ignore */ }

    fetchServerQuota().then((server) => {
      if (!server) return;
      const local = getQuotaState();
      if (server.used > local.used) {
        qmSyncFromServer(server.used, server.tier);
      }
      if (server.tier === 'premium' && local.tier !== 'premium') {
        qmSetTier('premium');
      }
      refresh();
    });
  }, [refresh]);

  useEffect(() => {
    // Listen for storage changes from other tabs or from smartEngine writes
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes('smart_quota') || e.key?.includes('smart_admin')) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  // Poll after any action to keep UI in sync
  const afterAction = useCallback(() => {
    // Use setTimeout to let localStorage settle
    setTimeout(() => setState(readState()), 0);
  }, []);

  const incrementUsage = useCallback(() => {
    consumeQuota(1);
    afterAction();
  }, [afterAction]);

  const syncFromServer = useCallback((serverUsed: number) => {
    qmSyncFromServer(serverUsed);
    afterAction();
  }, [afterAction]);

  const syncLimit = useCallback((newLimit: number, newTier?: SubscriptionTier) => {
    if (newTier) qmSetTier(newTier);
    afterAction();
  }, [afterAction]);

  // THIS MUST NEVER BE EXPOSED IN PRODUCTION
  const resetUsage = useCallback(() => {
    if (import.meta.env.PROD) {
      console.warn('[AIUsageContext] resetUsage blocked in production');
      return;
    }
    // Dev-only: import directly from quotaManager (not public API)
    import('@/services/smartEngine/quotaManager').then(m => {
      m.resetQuota();
      afterAction();
    });
  }, [afterAction]);

  return (
    <AIUsageContext.Provider value={{
      remaining: state.remaining,
      used: state.used,
      limit: state.limit,
      tier: state.tier,
      isLimitReached: state.isExhausted,
      isNearLimit: state.isNearLimit,
      incrementUsage,
      syncFromServer,
      syncLimit,
      resetUsage,
      refresh,
    }}>
      {children}
    </AIUsageContext.Provider>
  );
}

export function useAIUsage(): AIUsageContextValue {
  const ctx = useContext(AIUsageContext);
  if (!ctx) {
    // Fallback for usage outside provider
    const s = readState();
    return {
      remaining: s.remaining,
      used: s.used,
      limit: s.limit,
      tier: s.tier,
      isLimitReached: s.isExhausted,
      isNearLimit: s.isNearLimit,
      incrementUsage: () => {},
      syncFromServer: () => {},
      syncLimit: () => {},
      resetUsage: () => {},
      refresh: () => {},
    };
  }
  return ctx;
}
