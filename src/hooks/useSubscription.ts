import { useState, useEffect, useCallback } from "react";

const INSTALLATION_KEY = "wellmama_install_date";
const SUBSCRIPTION_KEY = "wellmama_subscription";
const TRIAL_DAYS = 3;

interface SubscriptionState {
  isTrialActive: boolean;
  isSubscribed: boolean;
  trialDaysLeft: number;
  installDate: Date | null;
}

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    isTrialActive: true,
    isSubscribed: false,
    trialDaysLeft: TRIAL_DAYS,
    installDate: null,
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
    
    // Check subscription status (will be set by Google Play billing)
    const subscription = localStorage.getItem(SUBSCRIPTION_KEY);
    const isSubscribed = subscription === "active";

    setState({
      isTrialActive: trialDaysLeft > 0,
      isSubscribed,
      trialDaysLeft,
      installDate: install,
    });
  }, []);

  const hasAccess = useCallback((isPremium?: boolean): boolean => {
    if (!isPremium) return true; // Free tools always accessible
    return state.isTrialActive || state.isSubscribed;
  }, [state.isTrialActive, state.isSubscribed]);

  // This will be called by Google Play In-App Billing
  const activateSubscription = useCallback(() => {
    localStorage.setItem(SUBSCRIPTION_KEY, "active");
    setState(prev => ({ ...prev, isSubscribed: true }));
  }, []);

  const deactivateSubscription = useCallback(() => {
    localStorage.removeItem(SUBSCRIPTION_KEY);
    setState(prev => ({ ...prev, isSubscribed: false }));
  }, []);

  // For testing - reset trial
  const resetTrial = useCallback(() => {
    localStorage.removeItem(INSTALLATION_KEY);
    localStorage.removeItem(SUBSCRIPTION_KEY);
    window.location.reload();
  }, []);

  return {
    ...state,
    hasAccess,
    activateSubscription,
    deactivateSubscription,
    resetTrial,
  };
};

export default useSubscription;