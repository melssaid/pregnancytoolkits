import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Brain, Crown } from 'lucide-react';
import { UpgradeCard } from './UpgradeCard';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useTranslation } from 'react-i18next';
import { useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { SaveResultButton } from './SaveResultButton';
import { AIFeedbackPrompt } from './AIFeedbackPrompt';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { resolveWeight, type AIToolType, type SmartSection } from '@/services/smartEngine/types';

interface AIResponseFrameProps {
  content: string;
  isLoading?: boolean;
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  accentColor?: string;
  expectedLength?: number;
  toolId?: string;
}

export const AIResponseFrame = ({
  content,
  isLoading = false,
  title,
  icon: Icon = Brain,
  subtitle,
  children,
  footer,
  expectedLength = 2000,
  toolId,
}: AIResponseFrameProps) => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { remaining, limit, tier, isLimitReached } = useAIUsage();

  const rawProgress = useMemo(() => {
    if (!isLoading && content.length > 0) return 100;
    if (content.length === 0) return 2;
    const ratio = content.length / expectedLength;
    return Math.min(95, Math.round(2 + 93 * (1 - Math.exp(-2.5 * ratio))));
  }, [content.length, isLoading, expectedLength]);

  const springProgress = useSpring(useMotionValue(0), { stiffness: 40, damping: 20 });

  useEffect(() => {
    springProgress.set(rawProgress);
  }, [rawProgress, springProgress]);

  const showProgress = isLoading || (rawProgress > 0 && rawProgress < 100);
  const isFree = tier === 'free';
  const pct = limit > 0 ? Math.round((remaining / limit) * 100) : 100;

  // Dynamic color for usage pill
  const usageColor = isLimitReached
    ? 'text-destructive'
    : pct <= 20
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden border border-primary/15 shadow-sm"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-muted/30 relative overflow-hidden">
        {showProgress ? (
          <motion.div
            className={`absolute inset-y-0 rounded-full ${isRTL ? 'end-0' : 'start-0'}`}
            style={{
              width: springProgress.get() + '%',
              background: isRTL
                ? 'linear-gradient(270deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))'
                : 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))',
            }}
            animate={{ width: rawProgress + '%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ) : (
          <div className="h-full w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }} />
        )}
        {isLoading && (
          <motion.div
            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: isRTL ? ['400px', '-80px'] : ['-80px', '400px'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-1">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(330 70% 55% / 0.1))' }}
          >
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            {title && <h3 className="text-sm font-bold text-foreground leading-tight">{title}</h3>}
            {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1.5 ms-auto">
            {toolId && !isLoading && content && (
              <SaveResultButton toolId={toolId} title={title || toolId} content={content} />
            )}
            {isLoading && (
              <>
                <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{rawProgress}%</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-4 pt-1">
        <div className="rounded-xl bg-gradient-to-b from-primary/[0.04] to-transparent p-3">
          {children || <MarkdownRenderer content={content} isLoading={isLoading} />}
        </div>

        {/* Feedback prompt after AI result */}
        {!isLoading && content && toolId && (
          <div className="mt-2">
            <AIFeedbackPrompt toolId={toolId} />
          </div>
        )}

        {footer}

        {/* Single unified usage + Pro footer */}
        <div className="mt-3 flex items-center justify-between gap-2 px-1">
          <span className={`text-[11px] font-semibold tabular-nums ${usageColor}`}>
            {remaining} <span className="text-foreground/50">/ {limit}</span>
          </span>

          {isFree && (
            <button
              onClick={() => navigate('/pricing-demo')}
              className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <Crown className="w-3 h-3" />
              <span>{t('aiUsage.subscribePro')}</span>
            </button>
          )}
        </div>

        {/* Post-analysis upgrade nudge for free users */}
        {isFree && !isLoading && content && (
          <div className="mt-3">
            <UpgradeCard />
          </div>
        )}

        <p className="mt-2 text-center text-[9px] font-semibold text-muted-foreground/70 tracking-wide">
          {t('ai.resultDisclaimer')}
        </p>
      </div>
    </motion.div>
  );
};

export default AIResponseFrame;
