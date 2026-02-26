import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, ChevronUp, RefreshCw, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AIErrorBanner } from '@/components/ai/AIErrorBanner';

interface AIInsightCardProps {
  title?: string;
  prompt: string;
  context?: { week?: number; trimester?: number };
  buttonText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact' | 'banner';
  autoExpand?: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title, prompt, context, buttonText, icon, variant = 'default', autoExpand = false,
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language?.split('-')[0] || 'en';
  const { streamChat, isLoading, error, errorType, clearError } = usePregnancyAI();
  const [insight, setInsight] = useState('');
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [hasGenerated, setHasGenerated] = useState(false);
  const prevLangRef = useRef(currentLanguage);

  useEffect(() => {
    if (prevLangRef.current !== currentLanguage) {
      prevLangRef.current = currentLanguage;
      if (hasGenerated) {
        setInsight('');
        setHasGenerated(false);
        setIsExpanded(false);
        clearError();
      }
    }
  }, [currentLanguage, hasGenerated, clearError]);

  const contextWithLanguage = useMemo(() => ({
    ...context,
    language: currentLanguage,
  }), [context, currentLanguage]);

  const displayTitle = title || t('toolsInternal.aiInsights.title');
  const displayButtonText = buttonText || t('toolsInternal.aiInsights.getInsights');

  const generateInsight = async () => {
    if (isLoading) return;
    setInsight('');
    clearError();
    setIsExpanded(true);
    setHasGenerated(true);
    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{ role: 'user', content: prompt }],
      context: contextWithLanguage,
      onDelta: (text) => setInsight(prev => prev + text),
      onDone: () => {},
    });
  };

  /* ── COMPACT ── */
  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {!hasGenerated && (
          <motion.button
            onClick={generateInsight}
            disabled={isLoading}
            whileTap={{ scale: 0.92 }}
            className="w-full relative overflow-hidden rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="w-full flex items-center justify-center gap-2.5 px-5 py-3 font-semibold text-white text-[13px] rounded-2xl" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))', boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.5)' }}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : (icon || <Brain className="h-4 w-4 shrink-0" />)}
              <span className="truncate">{displayButtonText}</span>
            </div>
            <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
          </motion.button>
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
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-2 text-primary"
                    >
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span className="text-sm">{t('toolsInternal.aiInsights.analyzing')}</span>
                    </motion.div>
                  )}
                  {insight && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <MarkdownRenderer content={insight} />
                    </motion.div>
                  )}
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
                disabled={isLoading}
                whileTap={{ scale: 0.92 }}
                className="relative shrink-0 overflow-hidden rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-1.5 px-3.5 py-2 font-semibold text-white text-[13px] rounded-xl" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))', boxShadow: '0 4px 16px -4px hsl(var(--primary) / 0.45)' }}>
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> : <Brain className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{t('toolsInternal.aiInsights.analyze')}</span>
                </div>
                <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
              </motion.button>
            </div>

            <AnimatePresence>
              {insight && !error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="mt-4 pt-4 border-t border-primary/15"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                  >
                    <MarkdownRenderer content={insight} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <AIErrorBanner errorType={errorType} message={error} onRetry={generateInsight} onDismiss={clearError} />
      </div>
    );
  }

  /* ── DEFAULT ── */
  return (
    <Card className="border-primary/20 bg-primary/5">
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
              disabled={isLoading}
              whileTap={{ scale: 0.92 }}
              className="relative shrink-0 overflow-hidden rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-1.5 px-3.5 py-2 font-semibold text-white text-[13px] rounded-xl" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))', boxShadow: '0 4px 16px -4px hsl(var(--primary) / 0.45)' }}>
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
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 text-primary"
                >
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span className="text-sm">{t('toolsInternal.aiInsights.generatingInsights')}</span>
                </motion.div>
              )}
              {insight && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <MarkdownRenderer content={insight} />
                </motion.div>
              )}

              {hasGenerated && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
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
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AIInsightCard;
