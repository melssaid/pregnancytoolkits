import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AIResultDisclaimerProps {
  className?: string;
}

/**
 * Light footer disclaimer for AI-generated results only.
 * Complies with Google Play medical app policies without requiring user consent.
 */
export const AIResultDisclaimer = ({ className = '' }: AIResultDisclaimerProps) => {
  const { t } = useTranslation();
  
  return (
    <p className={`text-[10px] text-muted-foreground/70 text-center mt-3 ${className}`}>
      <Info className="w-3 h-3 inline-block mr-1 rtl:mr-0 rtl:ml-1 -mt-0.5" />
      {t('app.medicalDisclaimer', 'For informational purposes only. Always consult your doctor.')}
    </p>
  );
};

export default AIResultDisclaimer;
