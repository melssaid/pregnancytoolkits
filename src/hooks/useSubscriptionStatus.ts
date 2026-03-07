/**
 * useSubscriptionStatus
 * 
 * Checks the user's subscription/trial status from the database.
 * Returns whether the user has active access (trial or paid subscription).
 * 
 * Status logic:
 * - Active trial (trial_end > now) → unlocked
 * - Active subscription (status = 'active') → unlocked
 * - Otherwise → locked
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "free" | "trial" | "premium";

interface SubscriptionStatus {
  /** Current tier */
  tier: SubscriptionTier;
  /** Whether premium features are unlocked */
  isUnlocked: boolean;
  /** Whether we're still loading */
  isLoading: boolean;
  /** Days remaining in trial (0 if not on trial) */
  trialDaysLeft: number;
  /** Subscription type if active */
  subscriptionType: string | null;
  /** Re-check subscription status */
  refresh: () => Promise<void>;
}

// Free tools that are always available (no premium gate)
const FREE_TOOL_IDS = new Set([
  "cycle-tracker",
  "due-date-calculator",
  "baby-growth",
  "diaper-tracker",
  "preconception-checkup",
  "fertility-academy",
  "nutrition-supplements",
  "maternal-health-awareness",
]);

export function useSubscriptionStatus(): SubscriptionStatus {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [isLoading, setIsLoading] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTier("free");
        setIsLoading(false);
        return;
      }

      const { data: sub, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !sub) {
        setTier("free");
        setIsLoading(false);
        return;
      }

      const now = new Date();
      const trialEnd = new Date(sub.trial_end);
      const isTrialActive = sub.status === "active" && trialEnd > now && sub.subscription_type === "trial";

      if (isTrialActive) {
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setTrialDaysLeft(daysLeft);
        setTier("trial");
        setSubscriptionType("trial");
      } else if (sub.status === "active" && sub.subscription_type !== "trial") {
        setTier("premium");
        setSubscriptionType(sub.subscription_type);
        setTrialDaysLeft(0);
      } else {
        setTier("free");
        setSubscriptionType(null);
        setTrialDaysLeft(0);
      }
    } catch {
      setTier("free");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkStatus();
    });

    return () => subscription.unsubscribe();
  }, [checkStatus]);

  return {
    tier,
    isUnlocked: tier === "trial" || tier === "premium",
    isLoading,
    trialDaysLeft,
    subscriptionType,
    refresh: checkStatus,
  };
}

/**
 * Check if a specific tool requires premium access
 */
export function isToolPremium(toolId: string): boolean {
  return !FREE_TOOL_IDS.has(toolId);
}
