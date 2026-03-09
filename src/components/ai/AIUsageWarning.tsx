import { useTranslation } from 'react-i18next';
import { useAIUsageLimit } from '@/hooks/useAIUsageLimit';
import { Zap, Crown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function AIUsageWarning() {
  const { t } = useTranslation();
  const { remaining, used, limit, isNearLimit, isLimitReached, tier } = useAIUsageLimit();

  // Only show when near limit or limit reached
  if (!isNearLimit && !isLimitReached) return null;

  const pct = Math.round((used / limit) * 100);
  const isFree = tier === 'free';

  return (
    <div className={`rounded-xl border px-3 py-2.5 mb-3 ${
      isLimitReached 
        ? 'bg-destructive/5 border-destructive/20' 
        : 'bg-amber-50 border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-800/30'
    }`}>
      <div className="flex items-center gap-2 mb-1.5">
        <Zap className={`w-3.5 h-3.5 ${isLimitReached ? 'text-destructive' : 'text-amber-500'}`} />
        <span className="text-[11px] font-semibold text-foreground">
          {isLimitReached
            ? t('aiUsage.limitReached', 'Daily limit reached')
            : t('aiUsage.nearLimit', 'Approaching daily limit')}
        </span>
      </div>
      
      <Progress value={pct} className="h-1.5 mb-1.5" />
      
      <p className="text-[10px] text-muted-foreground">
        {t('aiUsage.remaining', { remaining, limit, defaultValue: '{{remaining}} of {{limit}} requests remaining today' })}
      </p>

      {isFree && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/30">
          <Crown className="w-3 h-3 text-primary" />
          <p className="text-[10px] text-primary font-medium">
            {t('aiUsage.upgradeHint', { limit: PREMIUM_LIMIT_DISPLAY, defaultValue: 'Subscribe to Pro for {{limit}} daily requests' })}
          </p>
        </div>
      )}
    </div>
  );
}

const PREMIUM_LIMIT_DISPLAY = 200;

export default AIUsageWarning;
