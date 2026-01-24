import { useState, useEffect, useCallback, useMemo } from "react";

const INSTALLATION_KEY = "pregnancy_toolkit_install_date";
const SUBSCRIPTION_KEY = "pregnancy_toolkit_subscription";

const TRIAL_DAYS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

interface SubscriptionState {
  isTrialActive: boolean;
  isSubscribed: boolean;
  installDate: Date | null;
}

const computeState = () => {
  // Get or set installation date
  let installDate = localStorage.getItem(INSTALLATION_KEY);

  if (!installDate) {
    installDate = new Date().toISOString();
    localStorage.setItem(INSTALLATION_KEY, installDate);
  }

  const install = new Date(installDate);

  // Check subscription status (will be set by Google Play Billing)
  const subscription = localStorage.getItem(SUBSCRIPTION_KEY);
  const isSubscribed = subscription === "active";

  const elapsedMs = Date.now() - install.getTime();
  const isTrialActive = !isSubscribed && elapsedMs < TRIAL_DAYS * MS_PER_DAY;

  return { install, isSubscribed, isTrialActive };
};

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    isTrialActive: false,
    isSubscribed: false,
    installDate: null,
  });

  useEffect(() => {
    const refresh = () => {
      const next = computeState();
      setState({
        isTrialActive: next.isTrialActive,
        isSubscribed: next.isSubscribed,
        installDate: next.install,
      });
    };

    refresh();

    // Keep trial/subscription state accurate without requiring a reload
    const interval = window.setInterval(refresh, 60_000);
    window.addEventListener("storage", refresh);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const trialDaysLeft = useMemo(() => {
    if (!state.installDate) return 0;
    if (state.isSubscribed) return 0;

    const elapsedMs = Date.now() - state.installDate.getTime();
    const remainingMs = TRIAL_DAYS * MS_PER_DAY - elapsedMs;
    return Math.max(0, Math.ceil(remainingMs / MS_PER_DAY));
  }, [state.installDate, state.isSubscribed]);

  const hasAccess = useCallback(
    (isPremium?: boolean): boolean => {
      // Requirement: all tools are free during the 3-day trial
      if (state.isTrialActive) return true;

      if (!isPremium) return true; // Free tools always accessible
      return state.isSubscribed;
    },
    [state.isSubscribed, state.isTrialActive]
  );

  // This will be called by Google Play In-App Billing (native layer)
  const startGooglePlayBilling = useCallback((sku: string = "pregnancy_toolkit_premium_monthly") => {
    // Prepared integration point: native layer can listen to this event and trigger BillingClient
    window.dispatchEvent(
      new CustomEvent("googleplay:purchase", {
        detail: { sku },
      })
    );

    console.log("Google Play Billing requested", { sku });
  }, []);

  const activateSubscription = useCallback(() => {
    localStorage.setItem(SUBSCRIPTION_KEY, "active");
    setState((prev) => ({ ...prev, isSubscribed: true, isTrialActive: false }));
  }, []);

  const deactivateSubscription = useCallback(() => {
    localStorage.removeItem(SUBSCRIPTION_KEY);

    setState((prev) => {
      if (!prev.installDate) return { ...prev, isSubscribed: false, isTrialActive: false };

      const elapsedMs = Date.now() - prev.installDate.getTime();
      const isTrialActive = elapsedMs < TRIAL_DAYS * MS_PER_DAY;

      return { ...prev, isSubscribed: false, isTrialActive };
    });
  }, []);

  return {
    ...state,
    trialDaysLeft,
    hasAccess,
    startGooglePlayBilling,
    activateSubscription,
    deactivateSubscription,
  };
};

export default useSubscription;
