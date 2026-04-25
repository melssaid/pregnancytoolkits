import { memo } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HealthScoreRing } from "@/components/dashboard/HealthScoreRing";
import { HolisticAIAnalysisCard } from "@/components/dashboard/HolisticAIAnalysisCard";
import { SavedHolisticReports } from "@/components/dashboard/SavedHolisticReports";
import { WeeklyComparisonCard } from "@/components/dashboard/WeeklyComparisonCard";
import { MoodTrendCard } from "@/components/dashboard/MoodTrendCard";
import { WeeklySymptomsCard } from "@/components/dashboard/WeeklySymptomsCard";
import { WeightTrendCard } from "@/components/dashboard/WeightTrendCard";
import { FetalMovementCard } from "@/components/dashboard/FetalMovementCard";
import { RecentMealFitnessSummary } from "@/components/dashboard/RecentMealFitnessSummary";
import { UltrasoundSummaryCard } from "@/components/dashboard/UltrasoundSummaryCard";
import { DailyNutritionCard } from "@/components/dashboard/DailyNutritionCard";
import { WeeklyKickFrequencyChart } from "@/components/charts/WeeklyKickFrequencyChart";
import { WeeklyHydrationChart } from "@/components/charts/WeeklyHydrationChart";
import { WeeklyContractionFrequencyChart } from "@/components/charts/WeeklyContractionFrequencyChart";
import { EmptyStateCard } from "@/components/dashboard/EmptyStateCard";
import { useDashboardData } from "@/hooks/useDashboardData";

/**
 * "Insights" tab — analytics, trends and visualisations.
 * Each card is gated by dataCheck so empty cards never render.
 */
export const InsightsTab = memo(function InsightsTab() {
  const { t } = useTranslation();
  const { stats, dataCheck, isPregnant } = useDashboardData();

  const hasAnyInsight =
    dataCheck.hasMoodData || dataCheck.hasWeight || dataCheck.hasSymptomsData ||
    dataCheck.hasRecentActivity || dataCheck.hasHydration || dataCheck.hasContractions ||
    stats.dailyTracking.todayKicks > 0 || dataCheck.hasKickSessions;

  return (
    <div className="space-y-4 pb-6">
      {/* Premium holistic AI analysis (7 points) — synthesises all tracked data */}
      <HolisticAIAnalysisCard />

      {/* Always-on: Health score */}
      <HealthScoreRing />

      {/* New summary cards: ultrasound journal + daily nutrition */}
      <UltrasoundSummaryCard />
      <DailyNutritionCard />

      {isPregnant && <WeeklyComparisonCard />}

      {/* Weekly trend charts — all read from the unified storage keys
          (kick_sessions / water_logs_<uid> / contraction_timer_data) and
          re-render live via subscribeToData when the underlying tool saves. */}
      {dataCheck.hasKickSessions && <WeeklyKickFrequencyChart />}
      {dataCheck.hasHydration && <WeeklyHydrationChart />}
      {dataCheck.hasContractions && <WeeklyContractionFrequencyChart />}

      {/* Detail cards */}
      {dataCheck.hasMoodData && <MoodTrendCard />}
      {dataCheck.hasSymptomsData && <WeeklySymptomsCard />}
      {dataCheck.hasWeight && <WeightTrendCard />}
      {(stats.dailyTracking.todayKicks > 0 || dataCheck.hasKickSessions) && (
        <FetalMovementCard todayKicks={stats.dailyTracking.todayKicks} />
      )}
      {dataCheck.hasRecentActivity && <RecentMealFitnessSummary />}

      {/* Smart empty state */}
      {!hasAnyInsight && (
        <EmptyStateCard
          icon={Sparkles}
          title={t("dashboardV2.insightsEmpty.title")}
          description={t("dashboardV2.insightsEmpty.desc")}
          ctaLabel={t("dashboardV2.insightsEmpty.cta")}
          ctaHref="/tools/wellness-diary"
        />
      )}
    </div>
  );
});

export default InsightsTab;
