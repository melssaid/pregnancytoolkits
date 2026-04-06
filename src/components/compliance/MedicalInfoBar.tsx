import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

interface MedicalInfoBarProps {
  compact?: boolean;
}

const MedicalInfoBar: React.FC<MedicalInfoBarProps> = ({ compact = false }) => {
  const { t } = useTranslation();

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/30">
        <ShieldCheck className="w-2.5 h-2.5 text-muted-foreground/50" />
        <span className="text-[8px] text-muted-foreground/50 font-medium tracking-wide leading-tight">
          {t('compliance.disclaimerCompact')}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/30">
      <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
      <span className="text-[9px] text-muted-foreground/60 font-medium leading-relaxed tracking-wide">
        {t('compliance.disclaimerFull')}
      </span>
    </div>
  );
};

export default MedicalInfoBar;
