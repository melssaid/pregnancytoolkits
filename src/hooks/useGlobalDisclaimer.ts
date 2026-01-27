import { useState, useEffect, useCallback } from 'react';

const DISCLAIMER_KEY = 'medical_disclaimer_accepted';
const DISCLAIMER_VERSION = '1.0'; // Increment when terms change

interface DisclaimerState {
  accepted: boolean;
  version: string;
  acceptedAt: string;
}

export function useGlobalDisclaimer() {
  const [hasAccepted, setHasAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DISCLAIMER_KEY);
      if (saved) {
        const state: DisclaimerState = JSON.parse(saved);
        // Check if current version matches
        if (state.version === DISCLAIMER_VERSION && state.accepted) {
          setHasAccepted(true);
          return;
        }
      }
      setHasAccepted(false);
    } catch {
      setHasAccepted(false);
    }
  }, []);

  const acceptDisclaimer = useCallback(() => {
    const state: DisclaimerState = {
      accepted: true,
      version: DISCLAIMER_VERSION,
      acceptedAt: new Date().toISOString(),
    };
    localStorage.setItem(DISCLAIMER_KEY, JSON.stringify(state));
    setHasAccepted(true);
  }, []);

  return {
    hasAccepted,
    isLoading: hasAccepted === null,
    acceptDisclaimer,
  };
}
