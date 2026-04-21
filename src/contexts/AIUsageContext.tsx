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
  syncCouponBonuses,
  recordServerSnapshot,
  type QuotaState,
} from '@/services/smartEngine';
import { getCouponRequestHeaders } from '@/lib/couponRequestHeaders';
import { getBackendFunctionUrl, getBackendPublishableKey } from '@/lib/backendConfig';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';

const FINGERPRINT_STORAGE_KEY = 'ai_client_id_v2';

/** Get a stable client ID derived from device fingerprint (survives data clearing) */
async function getStableClientId(): Promise<{ clientId: string; fingerprint: string }> {
  const fingerprint = await getDeviceFingerprint();
  // Use the fingerprint itself as the client_id for deterministic server lookups
  try {
    localStorage.setItem(FINGERPRINT_STORAGE_KEY, fingerprint);
  } catch { /* ignore */ }
  return { clientId: fingerprint, fingerprint };
}

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

/** Fetch real usage from server using device fingerprint (survives data clearing) */
async function fetchServerQuota(currentTier: 'free' | 'premium' = 'free'): Promise<{
  used: number;
  limit: number;
  tier: 'free' | 'premium';
  activeCoupons: Array<{ couponId: string; code: string; durationType: string; expiresAt: string; bonusPoints: number }>;
  baseLimit: number;
  couponBonus: number;
  periodStart: string;
} | null> {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || getBackendPublishableKey();
    const { clientId, fingerprint } = await getStableClientId();
    const couponHeaders = await getCouponRequestHeaders();

    const res = await fetch(
      getBackendFunctionUrl('check-quota'),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...couponHeaders,
        },
        body: JSON.stringify({
          device_fingerprint: fingerprint,
          client_id: clientId,
          tier: currentTier,
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      used: data.used ?? 0,
      limit: data.limit ?? 10,
      tier: data.tier ?? currentTier,
      activeCoupons: Array.isArray(data.active_coupons) ? data.active_coupons : [],
      baseLimit: data.base_limit ?? 10,
      couponBonus: data.coupon_bonus ?? 0,
      periodStart: data.period_start ?? new Date().toISOString(),
    };
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
          applyCouponTier(coupon.expiresAt, coupon.bonusPoints, coupon.couponId);
          refresh();
        }
      }
    } catch { /* ignore */ }

    // Fetch server quota AND check DB subscription in parallel
    const syncAll = async () => {
      // 1. Server quota sync (usage count + tier-aware limit) — uses device fingerprint
      const currentTier = readState().tier;
      const serverPromise = fetchServerQuota(currentTier);

      // 2. DB subscription check (direct subscription status)
      const dbPromise = (async () => {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data: { user } } = await supabase.auth.getUser();
          if (!user?.id) return null;
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('status, subscription_type, subscription_end')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (sub && sub.subscription_type !== 'trial') {
            const subEnd = sub.subscription_end ? new Date(sub.subscription_end) : null;
            if (!subEnd || subEnd > new Date()) return 'premium' as const;
          }
          return null;
        } catch { return null; }
      })();

      const [server, dbTier] = await Promise.all([serverPromise, dbPromise]);

      // Apply DB subscription tier first (most authoritative for paid users)
      if (dbTier === 'premium') {
        qmSetTier('premium');
      }

      // Then apply server quota (usage count + coupon bonuses)
      if (server) {
        // Sync server-known active coupons into local quota + active_coupon cache
        if (server.activeCoupons.length > 0) {
          // Idempotent: pair coupon set with server response version (period_start)
          syncCouponBonuses(server.activeCoupons, server.periodStart);
          // Cache the longest-lasting coupon for useActiveCoupon hook
          const sorted = [...server.activeCoupons].sort(
            (a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()
          );
          try {
            localStorage.setItem('active_coupon_v1', JSON.stringify(sorted[0]));
          } catch { /* ignore */ }
        }
        // If DB says premium, ensure server tier doesn't downgrade it
        const effectiveTier = dbTier === 'premium' ? 'premium' : server.tier;
        const effectiveLimit = dbTier === 'premium' ? Math.max(server.limit, 60) : server.limit;
        qmSyncFromServer(server.used, effectiveTier, effectiveLimit);

        // ✅ Authoritative snapshot: getQuotaState now reads from this until TTL expires.
        // Drift between local computation and server is auto-logged via console + localStorage.
        recordServerSnapshot({
          used: server.used,
          limit: effectiveLimit,
          tier: effectiveTier,
          baseLimit: server.baseLimit,
          couponBonus: server.couponBonus,
          periodStart: server.periodStart,
        });
      }

      refresh();
    };

    syncAll();
  }, [refresh]);

  useEffect(() => {
    // Listen for storage changes from other tabs or from smartEngine writes
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes('smart_quota') || e.key?.includes('smart_admin')) refresh();
    };
    // Listen for subscription-activated event to immediately sync premium tier
    const onSubscriptionActivated = () => {
      qmSetTier('premium');
      refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    window.addEventListener('subscription-activated', onSubscriptionActivated);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('subscription-activated', onSubscriptionActivated);
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
