/**
 * Optimistic subscription cache.
 * Stores premium status in localStorage for instant access on app restart.
 */

const CACHE_KEY = "subscription_cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CachedStatus {
  tier: "premium" | "trial" | "free";
  subscriptionType: string | null;
  timestamp: number;
}

export function cacheSubscriptionStatus(tier: "premium" | "trial" | "free", subscriptionType: string | null): void {
  try {
    const data: CachedStatus = { tier, subscriptionType, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

export function getCachedSubscriptionStatus(): CachedStatus | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: CachedStatus = JSON.parse(raw);
    // Expire after TTL
    if (Date.now() - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearSubscriptionCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {}
}
