import { memo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HealthScoreRing } from "@/components/dashboard/HealthScoreRing";
import { WeeklyComparisonCard } from "@/components/dashboard/WeeklyComparisonCard";
import { MoodTrendCard } from "@/components/dashboard/MoodTrendCard";
import { WeeklySymptomsCard } from "@/components/dashboard/WeeklySymptomsCard";
import { WeightTrendCard } from "@/components/dashboard/WeightTrendCard";
import { FetalMovementCard } from "@/components/dashboard/FetalMovementCard";
import { RecentMealFitnessSummary } from "@/components/dashboard/RecentMealFitnessSummary";
import { useDashboardData } from "@/hooks/useDashboardData";

/**
 * "Insights" tab — analytics, trends and visualisations.
 * Empty cards are hidden via dataCheck for clean professional UX.
 */
export const InsightsTab = memo(function InsightsTab() {
  const { t } = useTranslation();
  const { stats, dataCheck, isPregnant } = useDashboardData();

  const hasAnyInsight =
    dataCheck.hasMoodData || dataCheck.hasWeight || dataCheck.hasSymptomsData ||
    dataCheck.hasRecentActivity || stats.dailyTracking.todayKicks > 0;

  return (
    <div className="space-y-4 pb-6">
      {/* Always-on: Health score */}
      <HealthScoreRing />

      {isPregnant && <WeeklyComparisonCard />}

      {dataCheck.hasMoodData && <MoodTrendCard />}
      {dataCheck.hasSymptomsData && <WeeklySymptomsCard />}
      {dataCheck.hasWeight && <WeightTrendCard />}
      {(stats.dailyTracking.todayKicks > 0 || dataCheck.hasKickSessions) && (
        <FetalMovementCard todayKicks={stats.dailyTracking.todayKicks} />
      )}
      {dataCheck.hasRecentActivity && <RecentMealFitnessSummary />}

      {/* Smart empty state */}
      {!hasAnyInsight && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-dashed border-border/60 bg-card/50 p-6 text-center"
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {t("dashboardV2.insightsEmpty.title")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
            {t("dashboardV2.insightsEmpty.desc")}
          </p>
          <Link
            to="/tools/wellness-diary"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("dashboardV2.insightsEmpty.cta")}
          </Link>
        </motion.div>
      )}
    </div>
  );
});

export default InsightsTab;
