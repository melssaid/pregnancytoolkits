import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Brain, Globe, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AIActionButton } from "@/components/ai/AIActionButton";

interface PlanResultViewProps {
  content: string;
  week: number;
  trimesterLabel: string;
  researchEnhanced: boolean;
  isLoading: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export function PlanResultView({
  content, week, trimesterLabel, researchEnhanced, isLoading, onGenerate, onRegenerate,
}: PlanResultViewProps) {
  const { t } = useTranslation();

  if (!content) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-8 text-center space-y-4 rounded-2xl border border-dashed border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent"
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(330 70% 55% / 0.08))' }}>
          <Brain className="h-7 w-7 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
          {t("smartPlan.aiPlanHintEnhanced", "Get a personalized AI plan enhanced with the latest medical research")}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600">
          <Globe className="w-3 h-3" />
          <span>{t("smartPlan.poweredByResearch", "Powered by real-time medical research")}</span>
        </div>
        <AIActionButton
          onClick={onGenerate}
          isLoading={isLoading}
          label={t("smartPlan.getAIPlan", "Get Smart Plan")}
        />
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl overflow-hidden border border-primary/15 shadow-sm"
      >
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }} />
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(330 70% 55% / 0.1))' }}>
            <Brain className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground">{t("smartPlan.aiPlan", "AI Plan")}</h3>
            <p className="text-[10px] text-muted-foreground">{t("common.week", "Week")} {week} • {trimesterLabel}</p>
          </div>
          {researchEnhanced && (
            <Badge variant="outline" className="text-[9px] gap-1 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 shrink-0">
              <Globe className="w-2.5 h-2.5" />
              {t("smartPlan.researchEnhanced", "Research-Enhanced")}
            </Badge>
          )}
          {isLoading && (
            <div className="flex gap-1 ms-auto">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          )}
        </div>
        <div className="px-4 pb-5 pt-1">
          <div className="rounded-xl bg-gradient-to-b from-primary/[0.04] to-transparent p-3">
            <MarkdownRenderer content={content} isLoading={isLoading} />
          </div>
        </div>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onRegenerate}
        disabled={isLoading}
        className="relative w-full overflow-hidden rounded-2xl h-9 flex items-center justify-center gap-1.5 text-white text-xs font-semibold disabled:opacity-60 disabled:pointer-events-none"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        {t("smartPlan.regenerate", "Regenerate")}
      </motion.button>
    </div>
  );
}
