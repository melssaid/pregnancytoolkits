import React, { useEffect } from 'react';
import { useGlobalDisclaimer } from '@/hooks/useGlobalDisclaimer';

interface GlobalMedicalDisclaimerProps {
  children: React.ReactNode;
}

/**
 * GlobalMedicalDisclaimer - Auto-accept version
 * 
 * This component automatically accepts the disclaimer without showing any popup.
 * Medical disclaimers are now shown inline via MedicalInfoBar or AIResultDisclaimer
 * instead of blocking popups, per Google Play compliance guidelines.
 */
const GlobalMedicalDisclaimer: React.FC<GlobalMedicalDisclaimerProps> = ({ children }) => {
  const { hasAccepted, acceptDisclaimer } = useGlobalDisclaimer();

  // Auto-accept on mount if not already accepted
  useEffect(() => {
    if (hasAccepted === false) {
      acceptDisclaimer();
    }
  }, [hasAccepted, acceptDisclaimer]);

  // Always render children - no blocking UI
  return <>{children}</>;
};

export default GlobalMedicalDisclaimer;
