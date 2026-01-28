import { useState, useEffect, useCallback } from 'react';

const DISCLAIMER_KEY = 'pregnancy_tools_disclaimer_accepted';
const DISCLAIMER_VERSION = 'v1'; // Increment to reset acceptance

export const useDisclaimerAccepted = () => {
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISCLAIMER_KEY);
      if (stored === DISCLAIMER_VERSION) {
        setIsAccepted(true);
      } else {
        setIsAccepted(false);
      }
    } catch {
      setIsAccepted(false);
    }
    setIsLoading(false);
  }, []);

  const accept = useCallback(() => {
    try {
      localStorage.setItem(DISCLAIMER_KEY, DISCLAIMER_VERSION);
      setIsAccepted(true);
    } catch {
      // Fallback if localStorage fails
      setIsAccepted(true);
    }
  }, []);

  return { isAccepted, isLoading, accept };
};
