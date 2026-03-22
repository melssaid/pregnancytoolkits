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

export { SECTION_TOOL_MAP, INSIGHT_WEIGHTS, QUOTA_TIERS, TOOL_WEIGHTS } from "./types";

// Engine
export { executeSmartRequest, type StreamOptions } from "./smartEngine";

// Quota
export {
  getQuotaState,
  canAfford,
  consumeQuota,
  syncFromServer,
  setTier,
  resetQuota,
  clearAdminBypass,
} from "./quotaManager";

// Cache
export {
  buildCacheKey,
  getCached,
  setCache,
  invalidateSection,
  clearAllCache,
  contentHash,
} from "./cacheManager";
