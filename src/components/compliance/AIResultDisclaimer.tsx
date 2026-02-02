import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AIResultDisclaimerProps {
  className?: string;
}

/**
 * Creative framed disclaimer for AI-generated results.
 * Complies with Google Play medical app policies.
 * Shows in English by default, Arabic only when Arabic language is selected.
 */
export const AIResultDisclaimer = ({ className = '' }: AIResultDisclaimerProps) => {
  const { t } = useTranslation();
  
  return (
    <div className={`mt-4 ${className}`}>
      <div className="relative inline-flex items-center justify-center w-full">
        {/* Decorative line left */}
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-muted-foreground/30" />
        
        {/* Disclaimer badge */}
        <div className="mx-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
            {t('ai.resultDisclaimer', 'AI-generated • Consult your healthcare provider')}
          </span>
        </div>
        
        {/* Decorative line right */}
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-muted-foreground/20 to-muted-foreground/30" />
      </div>
    </div>
  );
};

export default AIResultDisclaimer;
