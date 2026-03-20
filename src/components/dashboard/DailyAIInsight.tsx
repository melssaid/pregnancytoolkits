import { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2 } from "lucide-react";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useLanguage } from "@/contexts/LanguageContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";

interface DailyAIInsightProps {
  week: number;
}

export const DailyAIInsight = memo(function DailyAIInsight({ week }: DailyAIInsightProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { streamChat, isLoading } = usePregnancyAI();
  const [insight, setInsight] = useState("");

  const generateInsight = useCallback(() => {
    if (isLoading || week <= 0) return;
    setInsight("");
    const prompt = t("dailyDashboard.aiInsight.prompt", { week });
    streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { week, language: currentLanguage },
      onDelta: (chunk) => setInsight(prev => prev + chunk),
      onDone: () => {},
    });
  }, [isLoading, week, t, streamChat, currentLanguage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] to-transparent p-3.5"
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-xs font-bold text-foreground">{t("dailyDashboard.aiInsight.title")}</h3>
      </div>

      {insight ? (
        <div className="text-sm leading-relaxed">
          <MarkdownRenderer content={insight} />
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-[11px]">{t("dailyDashboard.aiInsight.loading")}</span>
        </div>
      ) : (
        <div className="text-center py-2">
          <p className="text-[10px] text-muted-foreground mb-2">{t("dailyDashboard.aiInsight.description")}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={generateInsight}
            disabled={week <= 0}
            className="text-xs h-8 rounded-xl border-primary/20 text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-3 h-3 me-1.5" />
            {t("dailyDashboard.aiInsight.generate")}
          </Button>
        </div>
      )}
    </motion.div>
  );
});
