import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, ChevronUp, RefreshCw, Brain, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSmartInsight } from '@/hooks/useSmartInsight';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AIErrorBanner } from '@/components/ai/AIErrorBanner';
import { useNavigate } from 'react-router-dom';
import { PrintableReport } from '@/components/PrintableReport';
import { MiniUsageBar } from '@/components/ai/MiniUsageBar';
import { UsagePulseFooter } from '@/components/ai/UsagePulseFooter';


interface AIInsightCardProps {
  title?: string;
  prompt: string;
  context?: { week?: number; trimester?: number; [key: string]: unknown };
  buttonText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact' | 'banner';
  autoExpand?: boolean;
  /** @deprecated Use `section` instead. Kept for backward compatibility. */
  aiType?: string;
  /** Smart Engine section context — maps to unified quota + cache */
  section?: SmartSection;
  /** Override the default tool type for this section */
  toolType?: AIToolType;
  showPrintButton?: boolean;
  showDisclaimer?: boolean;
  printTitle?: string;
}

import { type AIToolType, type SmartSection } from '@/services/smartEngine/types';
/** Upgrade CTA shown when quota is exhausted — replaces dead buttons */
const QuotaExhaustedCTA: React.FC<{ icon?: React.ReactNode; toolType?: AIToolType; section?: SmartSection }> = ({ icon, toolType, section }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { limit } = useAIUsage();

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.06] to-primary/[0.02] overflow-hidden">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shrink-0">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground leading-snug">
              {t('aiErrors.monthlyLimitTitle')}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              {t('quotaExhausted.upgradeHint')}
            </p>
          </div>
        </div>
        <motion.button
          onClick={() => navigate('/pricing-demo')}
          whileTap={{ scale: 0.97 }}
          className="w-full mt-3 relative overflow-hidden rounded-xl"
        >
          <div
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white text-[13px] rounded-xl"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(340 55% 50%), hsl(280 45% 45%))',
              boxShadow: '0 4px 16px -4px hsl(var(--primary) / 0.3)',
            }}
          >
            <Crown className="w-4 h-4 shrink-0" />
            <span>{t('quotaExhausted.upgradeCTA')}</span>
          </div>
          <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
        </motion.button>
        <MiniUsageBar toolType={toolType} section={section} />
      </CardContent>
    </Card>
  );
};

// Map legacy aiType to SmartSection
const AITYPE_TO_SECTION: Record<string, SmartSection> = {
  'symptom-analysis': 'symptoms',
  'meal-suggestion': 'nutrition',
  'pregnancy-assistant': 'pregnancy-plan',
  'weekly-summary': 'pregnancy-plan',
  'kick-analysis': 'kick-analysis',
  'weight-analysis': 'weight',
  'contraction-analysis': 'safety',
  'sleep-analysis': 'sleep',
  'vitamin-advice': 'medications',
  'postpartum-recovery': 'postpartum',
  'mental-health': 'mental-wellbeing',
  'back-pain-relief': 'movement',
  'appointment-prep': 'appointments',
  'bump-photos': 'bump-photos',
  'baby-cry-analysis': 'postpartum',
  'birth-plan': 'pregnancy-plan',
  'baby-growth-analysis': 'pregnancy-plan',
};

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title, prompt, context, buttonText, icon, variant = 'default', autoExpand = false,
  aiType, section, toolType,
  showPrintButton = false, showDisclaimer = false, printTitle,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLanguage = i18n.language?.split('-')[0] || 'en';

  // Resolve section from prop or legacy aiType
  const resolvedSection: SmartSection = section || AITYPE_TO_SECTION[aiType || ''] || 'pregnancy-plan';
  const resolvedToolType: AIToolType | undefined = toolType || (aiType as AIToolType) || undefined;

  const { generate, isLoading, content: insight, error, errorType, clearError } = useSmartInsight({
    section: resolvedSection,
    toolType: resolvedToolType,
  });

  const { isLimitReached, remaining, limit, tier } = useAIUsage();
  const isFree = tier === 'free';
  const usagePct = limit > 0 ? Math.round((remaining / limit) * 100) : 100;
  const usageColor = isLimitReached
    ? 'text-destructive'
    : usagePct <= 20
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-muted-foreground';

  // Track first-render-of-result to play consumption pulse exactly once
  const [pulseKey, setPulseKey] = useState(0);
  const prevInsightRef = useRef<string | null>(null);

  const UsageFooter = () => (
    hasGenerated && !isLoading && insight ? (
      <UsagePulseFooter
        toolType={resolvedToolType}
        section={resolvedSection}
        justConsumed={pulseKey > 0}
      />
    ) : null
  );
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [hasGenerated, setHasGenerated] = useState(false);
  const prevLangRef = useRef(currentLanguage);

  useEffect(() => {
    if (prevLangRef.current !== currentLanguage) {
      prevLangRef.current = currentLanguage;
      if (hasGenerated) {
        setHasGenerated(false);
        setIsExpanded(false);
        clearError();
      }
    }
  }, [currentLanguage, hasGenerated, clearError]);

  const displayTitle = title || t('toolsInternal.aiInsights.title');
  const displayButtonText = buttonText || t('toolsInternal.aiInsights.getInsights');

  // If quota exhausted and no prior result, show upgrade CTA
  if (isLimitReached && !hasGenerated) {
    return <QuotaExhaustedCTA icon={icon} toolType={resolvedToolType} section={resolvedSection} />;
  }

  const generateInsight = async () => {
    if (isLoading || isLimitReached) return;
    clearError();
    setIsExpanded(true);
    setHasGenerated(true);
    await generate({
      prompt,
      context: { ...context, language: currentLanguage },
      skipCache: hasGenerated,
    });
  };

  const effectiveDisabled = isLoading;

  /* ── COMPACT ── */
  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {!hasGenerated && (
          <div>
            <motion.button
              onClick={generateInsight}
              disabled={effectiveDisabled}
              whileTap={{ scale: 0.92 }}
              className="w-full relative overflow-hidden rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-full flex items-center justify-center gap-2.5 px-5 py-3 font-semibold text-white text-[13px] rounded-2xl" style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))',
                boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.5)',
              }}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : (icon || <Brain className="h-4 w-4 shrink-0" />)}
                <span className="truncate">{displayButtonText}</span>
              </div>
              <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
            </motion.button>
            <MiniUsageBar toolType={resolvedToolType} section={resolvedSection} />
          </div>
        )}

        <AIErrorBanner errorType={errorType} message={error} onRetry={generateInsight} onDismiss={clearError} />

        <AnimatePresence>
          {(insight || isLoading) && !error && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.97 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                <CardContent className="pt-4 pb-4">
                  {isLoading && !insight && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span className="text-sm">{t('toolsInternal.aiInsights.analyzing')}</span>
                    </motion.div>
                  )}
                  {insight && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                      <MarkdownRenderer content={insight} />
                    </motion.div>
                  )}
                  <UsageFooter />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ── BANNER ── */
  if (variant === 'banner') {
    return (
      <div className="space-y-3">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-sm shadow-primary/20 shrink-0">
                  {icon || <Brain className="w-5 h-5 text-primary-foreground" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-foreground leading-snug">{displayTitle}</h3>
                  <p className="text-xs text-muted-foreground">{t('toolsInternal.aiInsights.personalizedRec')}</p>
                </div>
              </div>
              <motion.button
                onClick={generateInsight}
                disabled={effectiveDisabled}
                whileTap={{ scale: 0.92 }}
                className="relative shrink-0 overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-1.5 px-3.5 py-2 font-semibold text-white text-[13px] rounded-xl" style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))',
                  boxShadow: '0 4px 16px -4px hsl(var(--primary) / 0.45)',
                }}>
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> : <Brain className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{t('toolsInternal.aiInsights.analyze')}</span>
                </div>
                <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
              </motion.button>
            </div>

            <MiniUsageBar toolType={resolvedToolType} section={resolvedSection} />

            <AnimatePresence>
              {insight && !error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="mt-4 pt-4 border-t border-primary/15"
                >
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.25 }}>
                    <MarkdownRenderer content={insight} />
                  </motion.div>
                </motion.div>
              )}
              <UsageFooter />
            </AnimatePresence>
          </CardContent>
        </Card>

        <AIErrorBanner errorType={errorType} message={error} onRetry={generateInsight} onDismiss={clearError} />
      </div>
    );
  }

  /* ── DEFAULT ── */
  const cardContent = (
    <Card className="border-primary/20 bg-primary/5" data-printable-card>
      <CardContent className="pt-4 pb-4">
        <div
          className="flex items-center justify-between gap-3 cursor-pointer"
          onClick={() => hasGenerated && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm shadow-primary/20 shrink-0">
              {icon || <Brain className="w-4 h-4 text-primary-foreground" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground leading-snug">{displayTitle}</h3>
              {hasGenerated && !error && (
                <p className="text-[11px] text-muted-foreground">
                  {isExpanded ? t('toolsInternal.aiInsights.clickToCollapse') : t('toolsInternal.aiInsights.clickToExpand')}
                </p>
              )}
            </div>
          </div>

          {!hasGenerated ? (
            <motion.button
              onClick={(e) => { e.stopPropagation(); generateInsight(); }}
              disabled={effectiveDisabled}
              whileTap={{ scale: 0.92 }}
              className="relative shrink-0 overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-1.5 px-3.5 py-2 font-semibold text-white text-[13px] rounded-xl" style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))',
                boxShadow: '0 4px 16px -4px hsl(var(--primary) / 0.45)',
              }}>
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> : <Brain className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate">{t('toolsInternal.aiInsights.analyze')}</span>
              </div>
              <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
            </motion.button>
          ) : (
            <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0 rounded-lg">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Mini usage bar */}
        <MiniUsageBar toolType={resolvedToolType} section={resolvedSection} />

        {/* Error banner */}
        {error && (
          <div className="mt-3">
            <AIErrorBanner errorType={errorType} message={error} onRetry={() => { setHasGenerated(false); generateInsight(); }} onDismiss={clearError} />
          </div>
        )}

        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (insight || isLoading) && !error && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.97 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-4 pt-4 border-t border-primary/15 overflow-hidden"
            >
              {isLoading && !insight && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span className="text-sm">{t('toolsInternal.aiInsights.generatingInsights')}</span>
                </motion.div>
              )}
              {insight && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                  <MarkdownRenderer content={insight} />
                </motion.div>
              )}

              {hasGenerated && !isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Button
                    onClick={generateInsight}
                    variant="ghost"
                    size="sm"
                    className="mt-3 gap-1.5 text-[13px] text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t('toolsInternal.aiInsights.regenerate')}
                  </Button>
                </motion.div>
              )}

              <UsageFooter />

              {showDisclaimer && insight && !isLoading && (
                <p className="mt-3 text-center text-[9px] font-semibold text-muted-foreground/70 tracking-wide">
                  {t('ai.resultDisclaimer')}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );

  if (showPrintButton && insight && !isLoading) {
    return (
      <PrintableReport title={printTitle || displayTitle}>
        {cardContent}
      </PrintableReport>
    );
  }

  return cardContent;
};

export default AIInsightCard;
