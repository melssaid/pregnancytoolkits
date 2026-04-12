/**
 * Hook to check for active coupon and redeem coupons.
 * Checks server on mount; caches result in localStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import { getUserId } from '@/hooks/useSupabase';

const CACHE_KEY = 'active_coupon_v1';

interface ActiveCoupon {
  couponId: string;
  code: string;
  durationType: string;
  expiresAt: string;
  bonusPoints: number;
}

interface CouponState {
  activeCoupon: ActiveCoupon | null;
  loading: boolean;
  redeeming: boolean;
}

function getCached(): ActiveCoupon | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: ActiveCoupon = JSON.parse(raw);
    if (new Date(data.expiresAt) > new Date()) return data;
    localStorage.removeItem(CACHE_KEY);
  } catch { /* corrupted */ }
  return null;
}

function setCache(coupon: ActiveCoupon | null) {
  try {
    if (coupon) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch { /* full */ }
}

export function useActiveCoupon() {
  const [state, setState] = useState<CouponState>({
    activeCoupon: getCached(),
    loading: true,
    redeeming: false,
  });

  // Check server for active coupon on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fingerprint = await getDeviceFingerprint();
        const userId = getUserId();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-coupon`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ action: 'check', device_fingerprint: fingerprint, user_id: userId }),
          }
        );
        if (!res.ok) { setState(s => ({ ...s, loading: false })); return; }
        const data = await res.json();
        if (!cancelled) {
          const coupon = data.active_coupon || null;
          setCache(coupon);
          setState(s => ({ ...s, activeCoupon: coupon, loading: false }));
        }
      } catch {
        if (!cancelled) setState(s => ({ ...s, loading: false }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const redeemCoupon = useCallback(async (code: string): Promise<{ success: boolean; error?: string; coupon?: ActiveCoupon }> => {
    setState(s => ({ ...s, redeeming: true }));
    try {
      const fingerprint = await getDeviceFingerprint();
      const userId = getUserId();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-coupon`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: 'redeem', code: code.trim().toUpperCase(), device_fingerprint: fingerprint, user_id: userId }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setState(s => ({ ...s, redeeming: false }));
        return { success: false, error: data.error || 'Unknown error' };
      }
      const coupon: ActiveCoupon = {
        couponId: data.coupon_id,
        code: data.code,
        durationType: data.duration_type,
        expiresAt: data.expires_at,
        bonusPoints: data.bonus_points ?? 60,
      };
      setCache(coupon);
      setState(s => ({ ...s, activeCoupon: coupon, redeeming: false }));
      return { success: true, coupon };
    } catch {
      setState(s => ({ ...s, redeeming: false }));
      return { success: false, error: 'Network error' };
    }
  }, []);

  // Computed: is coupon still valid?
  const isActive = state.activeCoupon ? new Date(state.activeCoupon.expiresAt) > new Date() : false;
  const remainingTime = state.activeCoupon && isActive
    ? new Date(state.activeCoupon.expiresAt).getTime() - Date.now()
    : 0;

  return {
    activeCoupon: isActive ? state.activeCoupon : null,
    loading: state.loading,
    redeeming: state.redeeming,
    redeemCoupon,
    isActive,
    remainingTime,
  };
}
