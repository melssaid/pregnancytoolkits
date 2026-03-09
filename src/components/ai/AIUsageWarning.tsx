import { useTranslation } from 'react-i18next';
import { useAIUsageLimit } from '@/hooks/useAIUsageLimit';
import { Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIUsageWarning() {
  const { t } = useTranslation();
  const { remaining, used, limit, isNearLimit, isLimitReached, tier } = useAIUsageLimit();

  if (!isNearLimit && !isLimitReached) return null;

  const pct = Math.round((used / limit) * 100);
  const isFree = tier === 'free';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border px-4 py-3 mb-3 ${
        isLimitReached 
          ? 'bg-destructive/5 border-destructive/20' 
          : 'bg-amber-50/80 border-amber-200/40 dark:bg-amber-950/15 dark:border-amber-800/25'
      }`}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isLimitReached ? 'bg-destructive/10' : 'bg-amber-100 dark:bg-amber-900/30'
        }`}>
          <Zap className={`w-3.5 h-3.5 ${isLimitReached ? 'text-destructive' : 'text-amber-500'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-foreground leading-tight">
            {isLimitReached
              ? t('aiUsage.limitReached', 'Daily limit reached')
              : t('aiUsage.nearLimit', 'Almost at daily limit')}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">
            {t('aiUsage.usedOf', { used, limit, defaultValue: '{{used}} of {{limit}} used today' })}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isLimitReached
              ? 'bg-destructive'
              : 'bg-gradient-to-r from-amber-400 to-amber-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {isFree && (
        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-border/20">
          <Crown className="w-3.5 h-3.5 text-primary" />
          <p className="text-[10px] text-primary font-semibold">
            {t('aiUsage.upgradeHint', { limit: 30, defaultValue: 'Upgrade to Pro for {{limit}} daily requests' })}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default AIUsageWarning;
