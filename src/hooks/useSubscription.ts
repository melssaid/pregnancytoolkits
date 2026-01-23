import { useState, useEffect, useCallback } from "react";

const INSTALLATION_KEY = "pregnancy_toolkit_install_date";
const SUBSCRIPTION_KEY = "pregnancy_toolkit_subscription";

interface SubscriptionState {
  isTrialActive: boolean;
  isSubscribed: boolean;
  installDate: Date | null;
}

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    isTrialActive: false,
    isSubscribed: false,
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
    
    // Check subscription status (will be set by Google Play billing)
    const subscription = localStorage.getItem(SUBSCRIPTION_KEY);
    const isSubscribed = subscription === "active";

    setState({
      isTrialActive: false, // No trial - direct premium model
      isSubscribed,
      installDate: install,
    });
  }, []);

  const hasAccess = useCallback((isPremium?: boolean): boolean => {
    if (!isPremium) return true; // Free tools always accessible
    return state.isSubscribed;
  }, [state.isSubscribed]);

  // This will be called by Google Play In-App Billing
  const activateSubscription = useCallback(() => {
    localStorage.setItem(SUBSCRIPTION_KEY, "active");
    setState(prev => ({ ...prev, isSubscribed: true }));
  }, []);

  const deactivateSubscription = useCallback(() => {
    localStorage.removeItem(SUBSCRIPTION_KEY);
    setState(prev => ({ ...prev, isSubscribed: false }));
  }, []);

  return {
    ...state,
    hasAccess,
    activateSubscription,
    deactivateSubscription,
  };
};

export default useSubscription;
