import { useTranslation } from 'react-i18next';
import { useAIUsageLimit } from '@/hooks/useAIUsageLimit';
import { Zap, Crown, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function AIUsageWarning() {
  const { t } = useTranslation();
  const { remaining, used, limit, isNearLimit, isLimitReached, tier } = useAIUsageLimit();

  if (!isNearLimit && !isLimitReached) return null;

  const pct = Math.round((used / limit) * 100);
  const isFree = tier === 'free';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative rounded-2xl border px-4 py-3 mb-3 overflow-hidden ${
        isLimitReached
          ? 'bg-destructive/8 border-destructive/30'
          : 'bg-amber-50/90 border-amber-300/50 dark:bg-amber-950/20 dark:border-amber-700/30'
      }`}
    >
      {/* Animated background pulse */}
      <motion.div
        className={`absolute inset-0 rounded-2xl ${
          isLimitReached
            ? 'bg-destructive/5'
            : 'bg-amber-400/5'
        }`}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative flex items-center gap-3 mb-2">
        <motion.div
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isLimitReached
              ? 'bg-destructive/15'
              : 'bg-amber-200/70 dark:bg-amber-800/40'
          }`}
          animate={isLimitReached ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isLimitReached ? (
            <AlertTriangle className="w-4 h-4 text-destructive" />
          ) : (
            <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className={`text-[12px] font-bold leading-tight ${
            isLimitReached ? 'text-destructive' : 'text-amber-700 dark:text-amber-300'
          }`}>
            {isLimitReached
              ? t('aiUsage.limitReached', 'Daily limit reached')
              : t('aiUsage.nearLimit', 'Almost at daily limit')}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {t('aiUsage.usedOf', { used, limit, defaultValue: '{{used}} of {{limit}} used today' })}
          </p>
        </div>
      </div>

      {/* Enhanced progress bar */}
      <div className="relative h-2 w-full rounded-full bg-muted/30 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${
            isLimitReached
              ? 'bg-destructive'
              : 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Shimmer on progress bar */}
        {!isLimitReached && (
          <motion.div
            className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-2rem', '20rem'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      {isFree && (
        <motion.div
          className="flex items-center gap-2 mt-2.5 pt-2 border-t border-border/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Crown className="w-3.5 h-3.5 text-primary" />
          <p className="text-[10px] text-primary font-semibold">
            {t('aiUsage.upgradeHint', { limit: 30, defaultValue: 'Upgrade to Pro for {{limit}} daily requests' })}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AIUsageWarning;
