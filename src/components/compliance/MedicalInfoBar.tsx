import React from 'react';
import { useTranslation } from 'react-i18next';

interface MedicalInfoBarProps {
  compact?: boolean;
}

const MedicalInfoBar: React.FC<MedicalInfoBarProps> = ({ compact = false }) => {
  const { t } = useTranslation();

  if (compact) {
    return (
      <div className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border/30">
        <span className="text-[8px] text-muted-foreground/50 leading-tight">
          {t('compliance.disclaimerCompact')}
        </span>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 rounded-lg bg-muted/20 border border-border/30">
      <span className="text-[9px] text-muted-foreground/50 leading-relaxed">
        {t('compliance.disclaimerFull')}
      </span>
    </div>
  );
};

export default MedicalInfoBar;
