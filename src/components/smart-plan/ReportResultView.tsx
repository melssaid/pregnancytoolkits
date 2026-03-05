import { forwardRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FileText, Globe, Loader2, RefreshCw, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { HealthStatsGrid } from "./HealthStatsGrid";

interface ReportResultViewProps {
  content: string;
  week: number;
  trimesterLabel: string;
  trimesterColor: string;
  progress: number;
  daysRemaining: number;
  bmi: string;
  calories: number;
  bloodPressure: string;
  researchEnhanced: boolean;
  isLoading: boolean;
  isRTL: boolean;
  lang: string;
  onGenerate: () => void;
}

export const ReportResultView = forwardRef<HTMLDivElement, ReportResultViewProps>(({
  content, week, trimesterLabel, trimesterColor, progress: progressValue, daysRemaining,
  bmi, calories, bloodPressure, researchEnhanced, isLoading, isRTL, lang, onGenerate,
}, ref) => {
  const { t } = useTranslation();

  if (!content) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-8 text-center space-y-4 rounded-2xl border border-dashed border-primary/20 bg-gradient-to-b from-primary/[0.03] to-transparent"
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(135deg, hsl(280 60% 55% / 0.12), hsl(var(--primary) / 0.08))' }}>
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
          {t("smartPlan.reportHintEnhanced", "Get a detailed health report enhanced with the latest medical research")}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600">
          <Globe className="w-3 h-3" />
          <span>{t("smartPlan.poweredByResearch", "Powered by real-time medical research")}</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onGenerate}
          disabled={isLoading}
          className="relative mx-auto overflow-hidden rounded-2xl h-10 px-6 flex items-center justify-center gap-2 text-white text-sm font-semibold disabled:opacity-60 disabled:pointer-events-none"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
          {t("smartPlan.generateReport", "Generate Health Report")}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        id="smart-plan-report"
        ref={ref}
        className="relative rounded-2xl overflow-hidden border border-primary/15 shadow-sm"
        dir={isRTL ? 'rtl' : 'ltr'}
        lang={lang}
      >
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, hsl(280 60% 55%), hsl(330 70% 55%), hsl(var(--primary)))' }} />
        <div className="px-4 pt-4 pb-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(280 60% 55% / 0.1))' }}>
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{t("smartPlan.weeklyReport")} — {t("common.week", "Week")} {week}</h3>
                <p className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString(isRTL ? 'ar-SA' : undefined)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {researchEnhanced && (
                <Badge variant="outline" className="text-[8px] gap-0.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 shrink-0">
                  <Globe className="w-2 h-2" />
                  {t("smartPlan.researchEnhanced", "Research-Enhanced")}
                </Badge>
              )}
              <Badge className={`${trimesterColor} text-white text-[10px]`}>{trimesterLabel}</Badge>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{t("smartPlan.pregnancyProgress", "Pregnancy Progress")}</span>
              <span>{progressValue}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <p className="text-[10px] text-center text-muted-foreground">
              {t("smartPlan.daysRemaining", "{{days}} days remaining", { days: daysRemaining })}
            </p>
          </div>

          <HealthStatsGrid week={week} bmi={bmi} calories={calories} bloodPressure={bloodPressure} />
        </div>

        <div className="px-4 pb-5">
          <div className="rounded-xl bg-gradient-to-b from-primary/[0.04] to-transparent p-3">
            <MarkdownRenderer content={content} isLoading={isLoading} />
          </div>
        </div>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onGenerate}
        disabled={isLoading}
        className="relative w-full overflow-hidden rounded-2xl h-9 flex items-center justify-center gap-1.5 text-white text-xs font-semibold disabled:opacity-60 disabled:pointer-events-none"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))' }}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        {t("smartPlan.regenerate", "Regenerate")}
      </motion.button>
    </div>
  );
});

ReportResultView.displayName = "ReportResultView";
