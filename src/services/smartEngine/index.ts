/**
 * Smart Engine — Public API
 * Single import point for the unified AI system.
 */

// Types
export type {
  SmartSection,
  AIToolType,
  SmartRequest,
  SmartMessage,
  SmartContentPart,
  SmartContext,
  SmartResponse,
  SmartError,
  SmartErrorType,
  InsightWeight,
  QuotaState,
  CacheEntry,
} from "./types";

export { SECTION_TOOL_MAP, QUOTA_TIERS, TOOL_WEIGHT_REGISTRY, resolveWeight } from "./types";

// Engine
export { executeSmartRequest, classifyError, type StreamOptions } from "./smartEngine";

// Quota
export {
  getQuotaState,
  canAfford,
  consumeQuota,
  syncFromServer,
  setTier,
  applyCouponTier,
  syncCouponBonuses,
  recordServerSnapshot,
  getDriftLog,
  canClaimBonus,
  claimBonus,
  isPromoActive,
} from "./quotaManager";

// THIS MUST NEVER BE EXPOSED IN PRODUCTION
// resetQuota and clearAdminBypass are intentionally NOT exported.
// They remain in quotaManager.ts for direct test imports only.

// Cache
export {
  buildCacheKey,
  getCached,
  setCache,
  invalidateSection,
  clearAllCache,
  contentHash,
} from "./cacheManager";
