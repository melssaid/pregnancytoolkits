/**
 * Daily AI Usage Limiter — re-exports from global AIUsageContext
 * Kept for backward compatibility across all tool components.
 */

import { useAIUsage } from '@/contexts/AIUsageContext';
export type { SubscriptionTier } from '@/contexts/AIUsageContext';

export function useAIUsageLimit() {
  return useAIUsage();
}
