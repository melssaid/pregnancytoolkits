import { useTranslation } from 'react-i18next';

interface AIResultDisclaimerProps {
  className?: string;
}

/**
 * Minimal, elegant disclaimer for AI-generated results.
 * Complies with Google Play medical app policies.
 */
export const AIResultDisclaimer = ({ className = '' }: AIResultDisclaimerProps) => {
  const { t } = useTranslation();
  
  return (
    <p className={`mt-3 text-center text-[9px] font-semibold text-muted-foreground/70 tracking-wide ${className}`}>
      {t('ai.resultDisclaimer')}
    </p>
  );
};

export default AIResultDisclaimer;
