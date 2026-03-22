/**
 * Global AI Usage Context
 * Single source of truth — delegates to quotaManager for all storage.
 * No more dual localStorage keys; everything goes through smart_quota_v2.
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  getQuotaState,
  consumeQuota,
  syncFromServer as qmSyncFromServer,
  setTier as qmSetTier,
  resetQuota as qmResetQuota,
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
  resetUsage: () => void;
  /** Force re-read from quotaManager (e.g. after engine consumed quota) */
  refresh: () => void;
}

function readState(): QuotaState {
  return getQuotaState();
}

const AIUsageContext = createContext<AIUsageContextValue | null>(null);

export function AIUsageProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuotaState>(readState);

  // Refresh on mount and periodically when tab gains focus
  const refresh = useCallback(() => setState(readState()), []);

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

  const resetUsage = useCallback(() => {
    qmResetQuota();
    afterAction();
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
