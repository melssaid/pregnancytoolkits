import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { AILoadingDots } from "@/components/ai/AILoadingDots";
import { motion } from "framer-motion";
import { differenceInHours } from "date-fns";
import { AIErrorBanner } from "@/components/ai/AIErrorBanner";

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
  const { streamChat, isLoading: aiLoading, error, errorType, clearError } = usePregnancyAI();
  const [aiInsight, setAiInsight] = useState('');
  const [showAiInsight, setShowAiInsight] = useState(false);

  useResetOnLanguageChange(() => {
    setAiInsight('');
    setShowAiInsight(false);
  });

  const analyzeWithAI = async () => {
    const last24h = entries.filter(e => differenceInHours(new Date(), new Date(e.time)) <= 24);
    const freq = {
      wet24h: last24h.filter(e => e.type === 'wet' || e.type === 'both').length,
      dirty24h: last24h.filter(e => e.type === 'dirty' || e.type === 'both').length,
      total24h: last24h.length,
    };

    setAiInsight('');
    setShowAiInsight(true);

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{
        role: 'user',
        content: `Analyze my baby's diaper patterns:
        
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
Helpful tips for diaper changes and tracking`
      }],
      onDelta: (text) => setAiInsight(prev => prev + text),
      onDone: () => {},
    });
  };

  if (entries.length < 3) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="space-y-3"
    >
      <Card className="overflow-hidden border-primary/20 bg-primary/5">
        <CardContent className="py-3">
          {!showAiInsight ? (
            <motion.button
              onClick={analyzeWithAI}
              disabled={aiLoading}
              whileTap={{ scale: 0.92 }}
              className="w-full relative overflow-hidden rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="w-full flex items-center justify-center gap-2.5 px-5 py-3 font-semibold text-white text-[13px] rounded-2xl" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))', boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.5)' }}>
                {aiLoading ? <AILoadingDots size="sm" /> : <Brain className="h-4 w-4 shrink-0" />}
                <span className="truncate">{t('diaperPage.analyzeWithAI')}</span>
              </div>
              <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
            </motion.button>
          ) : (
            <div className="overflow-hidden">
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Brain className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="font-semibold text-sm truncate">{t('diaperPage.aiPatternAnalysis')}</h3>
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
            </div>
          )}
        </CardContent>
      </Card>

      <AIErrorBanner
        errorType={errorType}
        message={error}
        onRetry={() => { setShowAiInsight(false); analyzeWithAI(); }}
        onDismiss={clearError}
      />
    </motion.div>
  );
};
