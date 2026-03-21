import { memo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Brain, ChevronRight, ChevronLeft, MessageCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAIUsage } from "@/contexts/AIUsageContext";

interface DailyAIInsightProps {
  week: number;
}

export const DailyAIInsight = memo(function DailyAIInsight({ week }: DailyAIInsightProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { used, limit } = useAIUsage();
  const isRTL = currentLanguage === "ar";
  const remaining = Math.max(0, limit - used);
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const quickPrompts = [
    { label: t("dailyDashboard.aiInsight.askSymptom"), icon: "🩺" },
    { label: t("dailyDashboard.aiInsight.askNutrition"), icon: "🥗" },
    { label: t("dailyDashboard.aiInsight.askSleep"), icon: "😴" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      {/* Main card — navigates to AI assistant */}
      <button
        onClick={() => navigate("/tools/pregnancy-assistant")}
        className="w-full text-start rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-transparent p-4 transition-all active:scale-[0.98] hover:border-primary/30"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground leading-tight">
                {t("dailyDashboard.aiInsight.title")}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {t("dailyDashboard.aiInsight.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground/70 tabular-nums">
              {remaining}/{limit}
            </span>
            <ChevronIcon className="w-4 h-4 text-muted-foreground/40" />
          </div>
        </div>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/[0.07] text-[10px] font-medium text-primary/80"
            >
              <span>{prompt.icon}</span>
              {prompt.label}
            </span>
          ))}
        </div>
      </button>
    </motion.div>
  );
});
