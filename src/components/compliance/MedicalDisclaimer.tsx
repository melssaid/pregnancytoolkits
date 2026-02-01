import React, { forwardRef, useEffect } from 'react';

interface MedicalDisclaimerProps {
  toolName?: string;
  onAccept: () => void;
}

/**
 * MedicalDisclaimer - Auto-accept version
 * 
 * This component immediately triggers onAccept without showing any UI.
 * Medical disclaimers are now shown inline via MedicalInfoBar or AIResultDisclaimer
 * instead of blocking popups, per Google Play compliance guidelines.
 */
const MedicalDisclaimer = forwardRef<HTMLDivElement, MedicalDisclaimerProps>(
  ({ onAccept }, ref) => {
    // Auto-accept immediately on mount
    useEffect(() => {
      onAccept();
    }, [onAccept]);

    // Return null - no visible UI
    return <div ref={ref} style={{ display: 'none' }} />;
  }
);

MedicalDisclaimer.displayName = 'MedicalDisclaimer';

export default MedicalDisclaimer;
