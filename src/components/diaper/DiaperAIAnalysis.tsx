import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { motion } from "framer-motion";
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
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();
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
    >
      <Card className="overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
        <CardContent className="py-3">
          {!showAiInsight ? (
            <Button
              onClick={analyzeWithAI}
              disabled={aiLoading}
              className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-xs sm:text-sm h-9"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <Sparkles className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{t('diaperPage.analyzeWithAI')}</span>
            </Button>
          ) : (
            <div className="overflow-hidden">
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
                  <h3 className="font-semibold text-sm truncate">{t('diaperPage.aiPatternAnalysis')}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 h-7 w-7 p-0"
                  onClick={() => setShowAiInsight(false)}
                >
                  ✕
                </Button>
              </div>
              {aiLoading && !aiInsight && (
                <div className="flex items-center gap-2 text-violet-600">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span className="text-xs sm:text-sm">{t('diaperPage.analyzingPatterns')}</span>
                </div>
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
    </motion.div>
  );
};
