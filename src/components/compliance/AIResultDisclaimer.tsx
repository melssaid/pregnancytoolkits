import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

interface AIResultDisclaimerProps {
  className?: string;
}

/**
 * Elegant, strict disclaimer for AI-generated results.
 * Complies with Google Play wellness app policies.
 */
export const AIResultDisclaimer = ({ className = '' }: AIResultDisclaimerProps) => {
  const { t } = useTranslation();
  
  return (
    <div className={`mt-4 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted/30 border border-border/40 ${className}`}>
      <ShieldCheck className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
      <p className="text-[9px] font-semibold text-muted-foreground/70 tracking-wide leading-tight">
        {t('ai.resultDisclaimer')}
      </p>
    </div>
  );
};

export default AIResultDisclaimer;
