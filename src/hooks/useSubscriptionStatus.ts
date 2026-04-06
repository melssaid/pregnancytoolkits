/**
 * useSubscriptionStatus
 * 
 * Checks the user's subscription/trial status from the database.
 * Auto-creates a 3-day free trial on first app open.
 * 
 * Status logic:
 * - Active trial (trial_end > now) → most tools unlocked, premium-only tools locked
 * - Active paid subscription (status = 'active') → everything unlocked
 * - Trial expired & no paid sub → locked → redirect to paywall
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensureAuthenticated } from "@/lib/auth";

export type SubscriptionTier = "free" | "trial" | "premium";

interface SubscriptionStatus {
  tier: SubscriptionTier;
  isUnlocked: boolean;
  isLoading: boolean;
  trialDaysLeft: number;
  subscriptionType: string | null;
  refresh: () => Promise<void>;
}

/**
 * Premium-only tools — locked even during the free trial.
 * Only unlocked with a paid subscription.
 * Keep this list small to maximize trial value.
 */
const PREMIUM_ONLY_TOOL_IDS = new Set([
  "fetal-growth",            // Baby growth tracking
  "smart-pregnancy-plan",    // AI Smart Plan
  "ai-bump-photos",          // AI Bump Photo analysis
  "baby-cry-translator",     // AI Baby Cry Translator
  "ai-pregnancy-skincare",   // AI Skincare
  "ai-partner-guide",        // AI Partner Guide
  "ai-symptom-analyzer",     // AI Symptom Analyzer
  "ai-meal-suggestion",      // AI Meal Suggestion
  "ai-craving-alternatives", // AI Craving Alternatives
  "ai-birth-plan",           // AI Birth Plan Generator
  "ai-birth-position",       // AI Birth Position Guide
  "postpartum-mental-health",// Postpartum Mental Health Coach
]);

// Prevent multiple simultaneous trial creations
let trialCreationInProgress = false;

async function createTrialSubscription(userId: string): Promise<boolean> {
  if (trialCreationInProgress) return false;
  trialCreationInProgress = true;

  try {
    const { error } = await supabase.from("subscriptions").insert({
      user_id: userId,
      subscription_type: "trial",
      status: "active",
    });

    if (error) {
      // Unique constraint violation = trial already exists
      if (error.code === "23505") return false;
      console.error("Trial creation failed:", error.message);
      return false;
    }
    return true;
  } finally {
    trialCreationInProgress = false;
  }
}

export function useSubscriptionStatus(): SubscriptionStatus {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [isLoading, setIsLoading] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      // Ensure user is authenticated (anonymous auth)
      const user = await ensureAuthenticated();
      if (!user) {
        setTier("free");
        setIsLoading(false);
        return;
      }

      // Query existing subscription
      const { data: sub, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        setTier("free");
        setIsLoading(false);
        return;
      }

      // No subscription exists → auto-create 3-day trial
      if (!sub) {
        const created = await createTrialSubscription(user.id);
        if (created) {
          setTier("trial");
          setTrialDaysLeft(3);
          setSubscriptionType("trial");
          setIsLoading(false);
          return;
        }
        setTier("free");
        setIsLoading(false);
        return;
      }

      // Evaluate existing subscription
      const now = new Date();
      const trialEnd = new Date(sub.trial_end);
      const isTrialActive = sub.status === "active" && trialEnd > now && sub.subscription_type === "trial";

      if (isTrialActive) {
        const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setTrialDaysLeft(daysLeft);
        setTier("trial");
        setSubscriptionType("trial");
      } else if (sub.status === "active" && sub.subscription_type !== "trial") {
        // Verify subscription hasn't expired
        const subEnd = sub.subscription_end ? new Date(sub.subscription_end) : null;
        if (subEnd && subEnd < now) {
          // Subscription period ended despite status still "active"
          setTier("free");
          setSubscriptionType(null);
          setTrialDaysLeft(0);
        } else {
          setTier("premium");
          setSubscriptionType(sub.subscription_type);
          setTrialDaysLeft(0);
        }
      } else {
        // Trial expired, no paid subscription
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
 * Check if a specific tool requires premium access.
 * 
 * Logic:
 * - Premium-only tools → always locked unless paid subscription
 * - All other tools → free for everyone (trial + free + premium)
 * 
 * @param toolId - The tool identifier
 * @param tier - Current subscription tier (optional, for tier-aware gating)
 */
export function isToolPremium(toolId: string, tier?: SubscriptionTier): boolean {
  const isPremiumOnly = PREMIUM_ONLY_TOOL_IDS.has(toolId);
  
  // If tier is provided, use tier-aware logic
  if (tier !== undefined) {
    // Premium subscribers → everything unlocked
    if (tier === "premium") return false;
    // Trial users → only premium-only tools are locked
    if (tier === "trial") return isPremiumOnly;
    // Free users (expired trial) → premium-only tools locked
    return isPremiumOnly;
  }
  
  // Default: just check if it's in the premium set
  return isPremiumOnly;
}
