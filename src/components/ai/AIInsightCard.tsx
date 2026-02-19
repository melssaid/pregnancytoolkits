import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useLanguage } from '@/contexts/LanguageContext';

interface AIInsightCardProps {
  title?: string;
  prompt: string;
  context?: {
    week?: number;
    trimester?: number;
  };
  buttonText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact' | 'banner';
  autoExpand?: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  prompt,
  context,
  buttonText,
  icon,
  variant = 'default',
  autoExpand = false,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { streamChat, isLoading, error } = usePregnancyAI();
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
      }
    }
  }, [currentLanguage, hasGenerated]);

  const contextWithLanguage = useMemo(() => ({
    ...context,
    language: currentLanguage,
  }), [context, currentLanguage]);

  const displayTitle = title || t('toolsInternal.aiInsights.title');
  const displayButtonText = buttonText || t('toolsInternal.aiInsights.getInsights');

  const generateInsight = async () => {
    if (isLoading) return;
    setInsight('');
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
          <Button
            onClick={generateInsight}
            disabled={isLoading}
            className="w-full gap-2 h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/20 hover:shadow-primary/30 hover:opacity-90 transition-all text-[13px]"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              icon || <Sparkles className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">{displayButtonText}</span>
          </Button>
        )}

        <AnimatePresence>
          {(insight || isLoading) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4 pb-4">
                  {isLoading && !insight && (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span className="text-sm">{t('toolsInternal.aiInsights.analyzing')}</span>
                    </div>
                  )}
                  {insight && <MarkdownRenderer content={insight} />}
                  {error && <p className="text-sm text-destructive">{error}</p>}
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
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-sm shadow-primary/20 shrink-0">
                {icon || <Sparkles className="w-5 h-5 text-primary-foreground" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base text-foreground truncate">{displayTitle}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('toolsInternal.aiInsights.personalizedRec')}
                </p>
              </div>
            </div>
            <Button
              onClick={generateInsight}
              disabled={isLoading}
              size="sm"
              className="shrink-0 gap-1.5 h-9 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm hover:opacity-90 transition-all text-[13px]"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {t('toolsInternal.aiInsights.analyze')}
            </Button>
          </div>

          <AnimatePresence>
            {insight && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-primary/15"
              >
                <MarkdownRenderer content={insight} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  }

  /* ── DEFAULT ── */
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-4 pb-4">
        {/* Header row */}
        <div
          className="flex items-center justify-between gap-3 cursor-pointer"
          onClick={() => hasGenerated && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm shadow-primary/20 shrink-0">
              {icon || <Sparkles className="w-4 h-4 text-primary-foreground" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">{displayTitle}</h3>
              {hasGenerated && (
                <p className="text-[11px] text-muted-foreground">
                  {isExpanded
                    ? t('toolsInternal.aiInsights.clickToCollapse')
                    : t('toolsInternal.aiInsights.clickToExpand')}
                </p>
              )}
            </div>
          </div>

          {!hasGenerated ? (
            <Button
              onClick={(e) => { e.stopPropagation(); generateInsight(); }}
              disabled={isLoading}
              size="sm"
              className="shrink-0 gap-1.5 h-9 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm hover:opacity-90 transition-all text-[13px]"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {t('toolsInternal.aiInsights.analyze')}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0 rounded-lg">
              {isExpanded
                ? <ChevronUp className="h-4 w-4" />
                : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (insight || isLoading) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-primary/15 overflow-hidden"
            >
              {isLoading && !insight && (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span className="text-sm">{t('toolsInternal.aiInsights.generatingInsights')}</span>
                </div>
              )}
              {insight && <MarkdownRenderer content={insight} />}
              {error && <p className="text-sm text-destructive">{error}</p>}

              {hasGenerated && !isLoading && (
                <Button
                  onClick={generateInsight}
                  variant="ghost"
                  size="sm"
                  className="mt-3 gap-1.5 text-[13px] text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t('toolsInternal.aiInsights.regenerate')}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AIInsightCard;
