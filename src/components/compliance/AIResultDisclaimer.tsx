import { ShieldCheck } from 'lucide-react';
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
    <div className={`mt-3 flex items-center justify-center gap-1.5 opacity-50 ${className}`}>
      <ShieldCheck className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
      <span className="text-[9px] text-muted-foreground tracking-wide">
        {t('ai.resultDisclaimer', 'AI-generated • Consult your healthcare provider')}
      </span>
    </div>
  );
};

export default AIResultDisclaimer;
