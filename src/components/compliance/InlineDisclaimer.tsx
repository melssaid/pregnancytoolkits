import { useTranslation } from 'react-i18next';

interface InlineDisclaimerProps {
  compact?: boolean;
}

export const InlineDisclaimer = ({ compact = false }: InlineDisclaimerProps) => {
  const { t } = useTranslation();

  if (compact) {
    return (
      <p className="text-[8px] text-muted-foreground/40 text-center">
        {t('compliance.disclaimerCompact')}
      </p>
    );
  }

  return (
    <div className="px-2.5 py-1.5 rounded-lg bg-muted/20 border border-border/30">
      <p className="text-[8px] text-muted-foreground/50 leading-relaxed">
        {t('compliance.disclaimerFull')}
      </p>
    </div>
  );
};
