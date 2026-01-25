import { useState, useEffect, useCallback } from "react";

const INSTALLATION_KEY = "pregnancy_toolkit_install_date";
const SUBSCRIPTION_KEY = "pregnancy_toolkit_subscription";
const TRIAL_DAYS = 3;

interface SubscriptionState {
  isTrialActive: boolean;
  isSubscribed: boolean;
  installDate: Date | null;
  trialDaysLeft: number;
  subscriptionType: "none" | "trial" | "monthly" | "yearly";
}

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    isTrialActive: false,
    isSubscribed: false,
    installDate: null,
    trialDaysLeft: TRIAL_DAYS,
    subscriptionType: "none",
  });

  useEffect(() => {
    // Get or set installation date
    let installDate = localStorage.getItem(INSTALLATION_KEY);
    
    if (!installDate) {
      installDate = new Date().toISOString();
      localStorage.setItem(INSTALLATION_KEY, installDate);
    }

    const install = new Date(installDate);
    const now = new Date();
    const daysSinceInstall = Math.floor((now.getTime() - install.getTime()) / (1000 * 60 * 60 * 24));
    const trialDaysLeft = Math.max(0, TRIAL_DAYS - daysSinceInstall);
    const isTrialActive = trialDaysLeft > 0;
    
    // Check subscription status (will be set by Google Play billing)
    const subscription = localStorage.getItem(SUBSCRIPTION_KEY);
    const isSubscribed = subscription === "monthly" || subscription === "yearly";
    
    let subscriptionType: SubscriptionState["subscriptionType"] = "none";
    if (subscription === "monthly") subscriptionType = "monthly";
    else if (subscription === "yearly") subscriptionType = "yearly";
    else if (isTrialActive) subscriptionType = "trial";

    setState({
      isTrialActive,
      isSubscribed,
      installDate: install,
      trialDaysLeft,
      subscriptionType,
    });
  }, []);

  const hasAccess = useCallback((isPremium?: boolean): boolean => {
    if (!isPremium) return true; // Free tools always accessible
    return state.isSubscribed || state.isTrialActive;
  }, [state.isSubscribed, state.isTrialActive]);

  // Google Play In-App Billing triggers
  const subscribeMonthly = useCallback(() => {
    console.log("Trigger Google Play In-App Billing for $1.99/month subscription");
    // Google Play will call activateSubscription on success
  }, []);

  const subscribeYearly = useCallback(() => {
    console.log("Trigger Google Play In-App Billing for $14/year subscription");
    // Google Play will call activateSubscription on success
  }, []);

  // Called by Google Play In-App Billing on success
  const activateSubscription = useCallback((type: "monthly" | "yearly") => {
    localStorage.setItem(SUBSCRIPTION_KEY, type);
    setState(prev => ({ 
      ...prev, 
      isSubscribed: true,
      subscriptionType: type,
    }));
  }, []);

  const deactivateSubscription = useCallback(() => {
    localStorage.removeItem(SUBSCRIPTION_KEY);
    setState(prev => ({ 
      ...prev, 
      isSubscribed: false,
      subscriptionType: prev.isTrialActive ? "trial" : "none",
    }));
  }, []);

  return {
    ...state,
    hasAccess,
    subscribeMonthly,
    subscribeYearly,
    activateSubscription,
    deactivateSubscription,
  };
};

export default useSubscription;
