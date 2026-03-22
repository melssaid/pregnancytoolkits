/**
 * Unified Quota Manager
 * Tracks monthly AI usage with weighted costs.
 * Local-first with server sync capability.
 * 
 * FREE: 5 attempts/month | PREMIUM: 40 attempts/month
 * Weights: standard=1, ultrasound image=2
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
}

// ── Storage helpers ──
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
  const limit = bypass ? 999 : tierConfig.monthly;
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
export function syncFromServer(serverUsed: number, serverTier?: "free" | "premium"): void {
  if (isAdminBypass()) return;
  const stored = readQuota();
  stored.used = serverUsed;
  if (serverTier) stored.tier = serverTier;
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
 * Admin reset for testing.
 */
export function resetQuota(): void {
  localStorage.setItem(ADMIN_BYPASS_KEY, "true");
  writeQuota({ monthKey: getCurrentMonthKey(), used: 0, tier: "premium" });
}

/**
 * Clear admin bypass.
 */
export function clearAdminBypass(): void {
  localStorage.removeItem(ADMIN_BYPASS_KEY);
}
