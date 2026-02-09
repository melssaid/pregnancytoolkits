import { useState, useEffect, useCallback } from "react";

const INSTALLATION_KEY = "pregnancy_toolkit_install_date";
const SUBSCRIPTION_KEY = "pregnancy_toolkit_subscription";
const TRIAL_DAYS = 7;

interface SubscriptionState {
  isTrialActive: boolean;
  isSubscribed: boolean;
  installDate: Date | null;
  trialDaysLeft: number;
  subscriptionType: "none" | "trial" | "monthly" | "yearly";
}

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    isTrialActive: true,
    isSubscribed: false,
    installDate: null,
    trialDaysLeft: TRIAL_DAYS,
    subscriptionType: "trial",
  });

  useEffect(() => {
    // Calculate trial period
    let installDate = localStorage.getItem(INSTALLATION_KEY);

    if (!installDate) {
      installDate = new Date().toISOString();
      localStorage.setItem(INSTALLATION_KEY, installDate);
    }

    const install = new Date(installDate);
    const now = new Date();
    const daysSinceInstall = Math.floor(
      (now.getTime() - install.getTime()) / (1000 * 60 * 60 * 24)
    );
    const trialDaysLeft = Math.max(0, TRIAL_DAYS - daysSinceInstall);
    const isTrialActive = trialDaysLeft > 0;

    const subscription = localStorage.getItem(SUBSCRIPTION_KEY);
    const isSubscribed =
      subscription === "monthly" || subscription === "yearly";

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

    // Listen for Google Play Billing activation events
    const handleActivation = (event: CustomEvent) => {
      const type = event.detail as "monthly" | "yearly";
      localStorage.setItem(SUBSCRIPTION_KEY, type);
      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        subscriptionType: type,
      }));
    };

    window.addEventListener(
      "subscription-activated",
      handleActivation as EventListener
    );
    return () => {
      window.removeEventListener(
        "subscription-activated",
        handleActivation as EventListener
      );
    };
  }, []);

  const hasAccess = useCallback(
    (isPremium?: boolean): boolean => {
      if (!isPremium) return true;
      return state.isSubscribed || state.isTrialActive;
    },
    [state.isSubscribed, state.isTrialActive]
  );

  // These will trigger Google Play Billing when running as native APK
  const subscribeMonthly = useCallback(() => {
    // In web preview: simulate. In APK: billing.ts handles real purchase
    window.dispatchEvent(
      new CustomEvent("purchase-request", { detail: "monthly_premium" })
    );
  }, []);

  const subscribeYearly = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("purchase-request", { detail: "yearly_premium" })
    );
  }, []);

  const restorePurchases = useCallback(() => {
    window.dispatchEvent(new CustomEvent("restore-purchases"));
  }, []);

  const activateSubscription = useCallback((type: "monthly" | "yearly") => {
    localStorage.setItem(SUBSCRIPTION_KEY, type);
    setState((prev) => ({
      ...prev,
      isSubscribed: true,
      subscriptionType: type,
    }));
  }, []);

  const deactivateSubscription = useCallback(() => {
    localStorage.removeItem(SUBSCRIPTION_KEY);
    setState((prev) => ({
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
    restorePurchases,
    activateSubscription,
    deactivateSubscription,
  };
};

export default useSubscription;
