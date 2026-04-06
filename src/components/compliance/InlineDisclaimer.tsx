import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

interface InlineDisclaimerProps {
  compact?: boolean;
}

export const InlineDisclaimer = ({ compact = false }: InlineDisclaimerProps) => {
  const { t } = useTranslation();

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-1 py-1">
        <ShieldCheck className="w-2.5 h-2.5 text-muted-foreground/40" />
        <p className="text-[8px] text-muted-foreground/50 font-medium tracking-wide">
          {t('compliance.disclaimerCompact')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/30">
      <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
      <p className="text-[9px] text-muted-foreground/60 font-medium leading-relaxed tracking-wide">
        {t('compliance.disclaimerFull')}
      </p>
    </div>
  );
};
