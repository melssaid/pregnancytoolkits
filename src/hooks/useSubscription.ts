import { useCallback } from "react";

// Simplified free version - all tools are accessible
// Google Play Billing will be added later via app update

export const useSubscription = () => {
  // All users have full access in free version
  const hasAccess = useCallback((_isPremium?: boolean): boolean => {
    return true; // All tools accessible
  }, []);

  return {
    isTrialActive: false,
    isSubscribed: true, // Treat all users as having access
    installDate: null,
    trialDaysLeft: 0,
    subscriptionType: "free" as const,
    hasAccess,
    // Placeholder functions for future Google Play Billing
    subscribeMonthly: () => console.log("Google Play Billing - coming soon"),
    subscribeYearly: () => console.log("Google Play Billing - coming soon"),
    activateSubscription: () => {},
    deactivateSubscription: () => {},
  };
};

export default useSubscription;
