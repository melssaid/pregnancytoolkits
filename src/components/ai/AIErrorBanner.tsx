import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Clock, CreditCard, AlertCircle, RefreshCw, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { SmartErrorType } from '@/services/smartEngine';
import { triggerUpgradeBanner } from '@/components/TrialExpiryBanner';
type AIErrorType = 'quota_exhausted' | 'rate_limit' | 'payment' | 'network' | 'auth' | 'unknown';

interface AIErrorBannerProps {
  errorType: AIErrorType | SmartErrorType | null;
  message: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  quota_exhausted: Crown,
  rate_limit: Clock,
  payment: CreditCard,
  network: WifiOff,
  auth: WifiOff,
  unknown: AlertCircle,
};

const colorMap: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  quota_exhausted: {
    bg: 'bg-primary/5',
    border: 'border-primary/20',
    icon: 'text-primary',
    badge: 'bg-primary/10 text-primary',
  },
  rate_limit: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200/60 dark:border-amber-800/40',
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  },
  payment: {
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    border: 'border-rose-200/60 dark:border-rose-800/40',
    icon: 'text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  },
  network: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200/60 dark:border-blue-800/40',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  },
  auth: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200/60 dark:border-blue-800/40',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  },
  unknown: {
    bg: 'bg-muted/40',
    border: 'border-border/60',
    icon: 'text-muted-foreground',
    badge: 'bg-muted text-muted-foreground',
  },
};

const titleKeyMap: Record<string, string> = {
  quota_exhausted: 'aiErrors.monthlyLimitTitle',
  rate_limit: 'aiErrors.rateLimitTitle',
  payment: 'aiErrors.paymentTitle',
  network: 'aiErrors.networkTitle',
  auth: 'aiErrors.networkTitle',
  unknown: 'aiErrors.unknownTitle',
};

export const AIErrorBanner: React.FC<AIErrorBannerProps> = ({
  errorType,
  message,
  onRetry,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const visible = !!(errorType && message);
  const isQuotaExhausted = errorType === 'quota_exhausted';

  // Contextual trigger: hitting the quota is a high-intent upgrade moment
  useEffect(() => {
    if (isQuotaExhausted) triggerUpgradeBanner("quota_reached");
  }, [isQuotaExhausted]);

  // Fallback to 'unknown' if errorType isn't in our maps
  const safeType = errorType && colorMap[errorType] ? errorType : 'unknown';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className={`rounded-2xl border p-3.5 ${colorMap[safeType].bg} ${colorMap[safeType].border}`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-1.5 rounded-lg ${colorMap[safeType].badge} shrink-0`}>
              {React.createElement(iconMap[safeType] || AlertCircle, { className: `w-4 h-4 ${colorMap[safeType].icon}` })}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold mb-0.5 ${colorMap[safeType].icon}`}>
                {t(titleKeyMap[safeType] || 'aiErrors.unknownTitle')}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>

              <div className="flex gap-2 mt-2.5">
                {isQuotaExhausted ? (
                  <Button
                    size="sm"
                    onClick={() => navigate('/pricing-demo')}
                    className="h-7 text-[11px] gap-1.5 bg-gradient-to-r from-primary to-primary/80 text-white hover:opacity-90"
                  >
                    <Crown className="w-3 h-3" />
                    {t('quotaExhausted.upgradeCTA', 'Upgrade to Premium')}
                  </Button>
                ) : (
                  <>
                    {onRetry && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onRetry}
                        className={`h-7 text-[11px] gap-1.5 border ${colorMap[safeType].border} ${colorMap[safeType].icon} hover:opacity-80`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        {t('aiErrors.retry')}
                      </Button>
                    )}
                  </>
                )}
                {onDismiss && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onDismiss}
                    className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {t('aiErrors.dismiss')}
                  </Button>
                )}
              </div>
            </div>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIErrorBanner;
