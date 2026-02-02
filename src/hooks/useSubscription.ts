import { useState, useEffect, useCallback } from "react";
import { billingService, SubscriptionType } from "@/services/billingService";

interface SubscriptionState {
  isTrialActive: boolean;
  isSubscribed: boolean;
  trialDaysLeft: number;
  subscriptionType: SubscriptionType;
  isNativeApp: boolean;
}

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    isTrialActive: false,
    isSubscribed: false,
    trialDaysLeft: 3,
    subscriptionType: "none",
    isNativeApp: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize and sync subscription state
  useEffect(() => {
    const initBilling = async () => {
      await billingService.initialize();
      syncState();
    };

    const syncState = () => {
      const subscriptionType = billingService.getCurrentSubscription();
      const isTrialActive = billingService.isTrialActive();
      const trialDaysLeft = billingService.getTrialDaysLeft();
      const isSubscribed = subscriptionType === "monthly" || subscriptionType === "yearly";

      setState({
        isTrialActive,
        isSubscribed,
        trialDaysLeft,
        subscriptionType,
        isNativeApp: billingService.isNativeEnvironment(),
      });
    };

    // Listen for subscription changes
    const unsubscribe = billingService.addListener((type) => {
      setState((prev) => ({
        ...prev,
        subscriptionType: type,
        isSubscribed: type === "monthly" || type === "yearly",
        isTrialActive: type === "trial",
      }));
    });

    // Also listen for the custom event
    const handleChange = () => syncState();
    window.addEventListener("subscription-changed", handleChange);

    initBilling();

    return () => {
      unsubscribe();
      window.removeEventListener("subscription-changed", handleChange);
    };
  }, []);

  /**
   * Check if user has access to a tool
   * @param isPremium - Whether the tool requires premium access
   */
  const hasAccess = useCallback(
    (isPremium?: boolean): boolean => {
      // Free tools are always accessible
      if (!isPremium) return true;
      
      // Premium access through subscription or trial
      return state.isSubscribed || state.isTrialActive;
    },
    [state.isSubscribed, state.isTrialActive]
  );

  /**
   * Subscribe to monthly plan via Google Play
   */
  const subscribeMonthly = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await billingService.purchaseMonthly();
      return success;
    } catch (error) {
      console.error("Monthly subscription error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Subscribe to yearly plan via Google Play
   */
  const subscribeYearly = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await billingService.purchaseYearly();
      return success;
    } catch (error) {
      console.error("Yearly subscription error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Start free trial
   */
  const startFreeTrial = useCallback((): boolean => {
    return billingService.startTrial();
  }, []);

  /**
   * Restore previous purchases
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await billingService.restorePurchases();
      return success;
    } catch (error) {
      console.error("Restore purchases error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Manually activate subscription (for testing/admin)
   */
  const activateSubscription = useCallback((type: "monthly" | "yearly") => {
    billingService.activateSubscription(type);
  }, []);

  /**
   * Deactivate subscription
   */
  const deactivateSubscription = useCallback(() => {
    billingService.deactivateSubscription();
  }, []);

  return {
    // State
    ...state,
    isLoading,
    
    // Access check
    hasAccess,
    
    // Actions
    subscribeMonthly,
    subscribeYearly,
    startFreeTrial,
    restorePurchases,
    activateSubscription,
    deactivateSubscription,
  };
};

export default useSubscription;
