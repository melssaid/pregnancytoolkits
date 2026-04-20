/**
 * Unified Quota Manager
 * Tracks monthly AI usage with weighted costs.
 * Local-first with server sync capability.
 * 
 * FREE: 5 attempts/month | PREMIUM: 60 attempts/month
 * Weights: standard=1, bump photo=2, lightweight=0.5
 */

import { QUOTA_TIERS, type InsightWeight, type QuotaState } from "./types";

const STORAGE_KEY = "smart_quota_v2";
const ADMIN_BYPASS_KEY = "smart_admin_bypass";

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

interface StoredQuota {
  monthKey: string;
  used: number;
  tier: "free" | "premium";
  bonusCredits?: number;      // coupon-based override limit
  promoBonusCredits?: number; // additive promo bonus (legacy)
  couponCreditsById?: Record<string, number>;
}

// ── Storage helpers ──
function normalizeCouponCredits(stored: StoredQuota): Record<string, number> {
  const entries = Object.entries(stored.couponCreditsById || {}).filter(([, value]) => Number.isFinite(value) && value > 0);
  if (entries.length > 0) return Object.fromEntries(entries);
  if ((stored.bonusCredits || 0) > 0) return { legacy: stored.bonusCredits || 0 };
  return {};
}

function calculateCouponBonus(stored: StoredQuota): number {
  return Object.values(normalizeCouponCredits(stored)).reduce((sum, value) => sum + value, 0);
}

function readQuota(): StoredQuota {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: StoredQuota = JSON.parse(raw);
      // Reset if month changed
      if (parsed.monthKey === getCurrentMonthKey()) return parsed;
    }
  } catch { /* corrupted */ }
  return { monthKey: getCurrentMonthKey(), used: 0, tier: "free" };
}

function writeQuota(data: StoredQuota): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

function isAdminBypass(): boolean {
  try {
    return localStorage.getItem(ADMIN_BYPASS_KEY) === "true";
  } catch {
    return false;
  }
}

// ── Public API ──

export function getQuotaState(): QuotaState {
  const stored = readQuota();
  const bypass = isAdminBypass();
  const tierConfig = QUOTA_TIERS[stored.tier] || QUOTA_TIERS.free;
  const couponPoints = calculateCouponBonus(stored);
  const promoBonus = stored.promoBonusCredits || 0;
  // ✅ نقاط القسيمة + الترويج تُضاف فوق حد الباقة الافتراضية (تراكمية)
  const limit = bypass ? 999 : tierConfig.monthly + couponPoints + promoBonus;
  const remaining = Math.max(0, limit - stored.used);

  return {
    used: stored.used,
    limit,
    remaining,
    tier: stored.tier,
    monthKey: stored.monthKey,
    isExhausted: stored.used >= limit && !bypass,
    isNearLimit: remaining <= 2 && remaining > 0 && !bypass,
    adminBypass: bypass,
  };
}


/**
 * Check if user can afford a request with the given weight.
 */
export function canAfford(weight: InsightWeight = 1): boolean {
  const state = getQuotaState();
  if (state.adminBypass) return true;
  return state.remaining >= weight;
}

/**
 * Consume quota after a successful AI call.
 */
export function consumeQuota(weight: InsightWeight = 1): QuotaState {
  const stored = readQuota();
  stored.used += weight;
  stored.monthKey = getCurrentMonthKey(); // ensure current month
  writeQuota(stored);
  return getQuotaState();
}

/**
 * Sync usage from server response headers.
 */
export function syncFromServer(serverUsed: number, serverTier?: "free" | "premium", serverLimit?: number): void {
  if (isAdminBypass()) return;
  const stored = readQuota();
  if (serverTier) stored.tier = serverTier;
  stored.used = serverUsed;
  if (typeof serverLimit === "number" && Number.isFinite(serverLimit)) {
    const tierConfig = QUOTA_TIERS[stored.tier] || QUOTA_TIERS.free;
    const promoBonus = stored.promoBonusCredits || 0;
    const reconciledCouponBonus = Math.max(0, serverLimit - tierConfig.monthly - promoBonus);
    stored.bonusCredits = reconciledCouponBonus;
    stored.couponCreditsById = reconciledCouponBonus > 0 ? { server_sync: reconciledCouponBonus } : {};
  }
  stored.monthKey = getCurrentMonthKey();
  writeQuota(stored);
}


/**
 * Update subscription tier.
 */
export function setTier(tier: "free" | "premium"): void {
  if (isAdminBypass()) return;
  const stored = readQuota();
  stored.tier = tier;
  writeQuota(stored);
}

/**
 * Temporarily set tier to premium for an active coupon.
 * ✅ bonusPoints يُضاف تراكمياً فوق الحد الأساسي ويتراكم مع قسائم أخرى.
 */
export function applyCouponTier(expiresAt: string, bonusPoints?: number, couponKey?: string): void {
  if (new Date(expiresAt) <= new Date()) return;
  const stored = readQuota();
  stored.tier = "premium";
  if (bonusPoints && bonusPoints > 0) {
    const key = couponKey || `${expiresAt}:${bonusPoints}`;
    const couponCredits = normalizeCouponCredits(stored);
    couponCredits[key] = bonusPoints;
    stored.couponCreditsById = couponCredits;
    stored.bonusCredits = Object.values(couponCredits).reduce((sum, value) => sum + value, 0);
  }
  writeQuota(stored);
}

export function syncCouponBonuses(coupons: Array<{ couponId?: string; expiresAt: string; bonusPoints: number }>): void {
  const stored = readQuota();
  const activeCoupons = coupons.filter((coupon) => coupon?.bonusPoints > 0 && new Date(coupon.expiresAt) > new Date());
  const couponCreditsById = Object.fromEntries(
    activeCoupons.map((coupon) => [coupon.couponId || `${coupon.expiresAt}:${coupon.bonusPoints}`, coupon.bonusPoints])
  );

  stored.couponCreditsById = couponCreditsById;
  stored.bonusCredits = Object.values(couponCreditsById).reduce((sum, value) => sum + value, 0);
  if (stored.bonusCredits > 0) stored.tier = "premium";
  writeQuota(stored);
}


/**
 * Admin reset for testing. ONLY available in development.
 */
export function resetQuota(): void {
  if (typeof import.meta !== 'undefined' && import.meta.env?.PROD) {
    console.warn('[quotaManager] resetQuota blocked in production');
    return;
  }
  localStorage.setItem(ADMIN_BYPASS_KEY, "true");
  writeQuota({ monthKey: getCurrentMonthKey(), used: 0, tier: "premium" });
}

/**
 * Clear admin bypass.
 * THIS MUST NEVER BE EXPOSED IN PRODUCTION — only reachable via direct import in tests.
 */
export function clearAdminBypass(): void {
  if (typeof import.meta !== 'undefined' && import.meta.env?.PROD) {
    console.warn('[quotaManager] clearAdminBypass blocked in production');
    return;
  }
  localStorage.removeItem(ADMIN_BYPASS_KEY);
}

// ── Temporary Bonus Points (promo until Google Play billing connected) ──
const BONUS_KEY = "smart_bonus_claimed_v1";
// Promo expires after 6 days from first deploy — set a fixed end date
const PROMO_END_DATE = new Date("2026-04-04T23:59:59Z");
const BONUS_AMOUNT = 5;

interface BonusClaim {
  monthKey: string;
  claimed: boolean;
}

function readBonusClaim(): BonusClaim | null {
  try {
    const raw = localStorage.getItem(BONUS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return null;
}

/**
 * Check if the bonus promo is still active and hasn't been claimed this month.
 */
export function canClaimBonus(): boolean {
  if (new Date() > PROMO_END_DATE) return false;
  const claim = readBonusClaim();
  if (!claim) return true;
  // Already claimed this month
  if (claim.monthKey === getCurrentMonthKey() && claim.claimed) return false;
  // New month — can claim again
  return true;
}

/**
 * Check if promo period is still active.
 */
export function isPromoActive(): boolean {
  return new Date() <= PROMO_END_DATE;
}

/**
 * Claim 5 bonus points. Reduces used count (grants free credits).
 * Can only be claimed once per month during promo period.
 */
export function claimBonus(): { success: boolean; newState: QuotaState } {
  if (!canClaimBonus()) {
    return { success: false, newState: getQuotaState() };
  }
  const stored = readQuota();
  stored.promoBonusCredits = (stored.promoBonusCredits || 0) + BONUS_AMOUNT;
  stored.monthKey = getCurrentMonthKey();
  writeQuota(stored);
  // Mark as claimed
  try {
    localStorage.setItem(BONUS_KEY, JSON.stringify({
      monthKey: getCurrentMonthKey(),
      claimed: true,
    }));
  } catch { /* storage full */ }
  return { success: true, newState: getQuotaState() };
}
