import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Crown } from "lucide-react";
import { useSmartInsight } from "@/hooks/useSmartInsight";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AILoadingDots } from "@/components/ai/AILoadingDots";
import { AIActionButton } from "@/components/ai/AIActionButton";
import { AIErrorBanner } from "@/components/ai/AIErrorBanner";
import { UsagePulseFooter } from "@/components/ai/UsagePulseFooter";
import { differenceInHours } from "date-fns";

interface DiaperEntry {
  id: string;
  time: string;
  type: "wet" | "dirty" | "both";
}

interface DiaperAIAnalysisProps {
  entries: DiaperEntry[];
  todayStats: { wet: number; dirty: number; total: number };
}

export const DiaperAIAnalysis = ({ entries, todayStats }: DiaperAIAnalysisProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { remaining, limit, tier, isLimitReached } = useAIUsage();
  const isFree = tier === 'free';
  const usagePct = limit > 0 ? Math.round((remaining / limit) * 100) : 100;
  const usageColor = isLimitReached
    ? 'text-destructive'
    : usagePct <= 20
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-muted-foreground';
  const { generate, isLoading: aiLoading, content: aiInsight, error, errorType, clearError, reset } = useSmartInsight({
    section: 'postpartum',
    toolType: 'baby-cry-analysis', // closest postpartum tool type
  });
  const [showAiInsight, setShowAiInsight] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const prevRef = useRef<string>('');
  useEffect(() => {
    if (aiInsight && !aiLoading && prevRef.current !== aiInsight) {
      prevRef.current = aiInsight;
      setPulseKey(k => k + 1);
    }
  }, [aiInsight, aiLoading]);

  const analyzeWithAI = async () => {
    const last24h = entries.filter(e => differenceInHours(new Date(), new Date(e.time)) <= 24);
    const freq = {
      wet24h: last24h.filter(e => e.type === 'wet' || e.type === 'both').length,
      dirty24h: last24h.filter(e => e.type === 'dirty' || e.type === 'both').length,
      total24h: last24h.length,
    };

    setShowAiInsight(true);

    await generate({
      prompt: `Analyze my baby's diaper patterns:
        
Today's stats:
- Wet diapers: ${todayStats.wet}
- Dirty diapers: ${todayStats.dirty}
- Total changes: ${todayStats.total}

Last 24 hours:
- Wet: ${freq.wet24h}
- Dirty: ${freq.dirty24h}
- Total: ${freq.total24h}

Please provide:

## Hydration Assessment
Is the wet diaper count normal? What does it indicate?

## Health Indicators
What the diaper patterns might tell us about baby's health

## Normal Ranges
Remind me of typical diaper counts for different ages

## When to Be Concerned
Signs that would warrant calling the pediatrician

## Tips
Helpful tips for diaper changes and tracking`,
    });
  };

  if (entries.length < 3) return null;

  return (
    <div className="space-y-3">
      {!showAiInsight ? (
        <AIActionButton
          onClick={analyzeWithAI}
          isLoading={aiLoading}
          label={t('diaperPage.analyzeWithAI')}
          loadingLabel={t('diaperPage.analyzingPatterns')}
          icon={Brain}
        />
      ) : (
        <Card className="overflow-hidden border-primary/20 bg-primary/5">
          <CardContent className="py-3">
            <div className="overflow-hidden">
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Brain className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="font-semibold text-sm leading-snug">{t('diaperPage.aiPatternAnalysis')}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-7 w-7 p-0"
                  onClick={() => { setShowAiInsight(false); clearError(); }}
                >
                  ✕
                </Button>
              </div>
              {aiLoading && !aiInsight && (
                <AILoadingDots text={t('diaperPage.analyzingPatterns')} />
              )}
              {aiInsight && (
                <div className="overflow-x-auto">
                  <MarkdownRenderer content={aiInsight} />
                </div>
              )}
              {aiInsight && !aiLoading && (
                <UsagePulseFooter
                  toolType="baby-cry-analysis"
                  section="postpartum"
                  justConsumed={pulseKey > 0}
                  key={pulseKey}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <AIErrorBanner
        errorType={errorType}
        message={error}
        onRetry={() => { setShowAiInsight(false); analyzeWithAI(); }}
        onDismiss={clearError}
      />
    </div>
  );
};
