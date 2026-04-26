import { memo } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HealthScoreRing } from "@/components/dashboard/HealthScoreRing";
import { HolisticAIAnalysisCard } from "@/components/dashboard/HolisticAIAnalysisCard";
import { SonarHistoryTrendsCard } from "@/components/dashboard/SonarHistoryTrendsCard";
import { DataSourcesPanel } from "@/components/dashboard/DataSourcesPanel";
import { SignalsPreviewPanel } from "@/components/dashboard/SignalsPreviewPanel";
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
import { useUserProfile } from "@/hooks/useUserProfile";

/**
 * "Insights" tab — analytics, trends and visualisations.
 *
 * Refactored ordering (Option A) — funnel from simple → deep → detailed:
 *   1. Quick glance: HealthScoreRing
 *   2. Transparency: DataSourcesPanel  (what's feeding the analysis?)
 *   3. Live derived signals: SignalsPreviewPanel
 *   4. Deep AI synthesis: HolisticAIAnalysisCard (premium, 7 pts)
 *   5. Cross-snapshot history: SonarHistoryTrendsCard
 *   6. Stage-aware summary cards (pregnancy-only hidden for fertility/postpartum)
 *   7. Trend charts (auto-hide if no data)
 *   8. Detail cards (auto-hide if no data)
 *
 * Each card is gated by dataCheck or stage so empty/irrelevant cards never render.
 */
export const InsightsTab = memo(function InsightsTab() {
  const { t } = useTranslation();
  const { stats, dataCheck, isPregnant } = useDashboardData();
  const { profile: userProfile } = useUserProfile();
  const stage = userProfile.journeyStage || (isPregnant ? "pregnant" : "pregnant");
  const isPregnancyStage = stage === "pregnant";

  const hasAnyInsight =
    dataCheck.hasMoodData || dataCheck.hasWeight || dataCheck.hasSymptomsData ||
    dataCheck.hasRecentActivity || dataCheck.hasHydration || dataCheck.hasContractions ||
    stats.dailyTracking.todayKicks > 0 || dataCheck.hasKickSessions ||
    dataCheck.hasSleepData;

  return (
    <div className="space-y-4 pb-6">
      {/* 1️⃣ Quick glance — at-a-glance score */}
      <HealthScoreRing />

      {/* 2️⃣ Transparency — which data sources feed the analysis (stage-aware) */}
      <DataSourcesPanel />

      {/* 3️⃣ Live derived signals from current data */}
      <SignalsPreviewPanel />

      {/* 4️⃣ Premium holistic AI synthesis — uses everything above */}
      <HolisticAIAnalysisCard />

      {/* 5️⃣ Cross-snapshot trends across previous holistic runs */}
      <SonarHistoryTrendsCard />

      {/* 6️⃣ Stage-aware summary cards — only relevant during pregnancy */}
      {isPregnancyStage && <UltrasoundSummaryCard />}
      <DailyNutritionCard />
      {isPregnancyStage && isPregnant && <WeeklyComparisonCard />}

      {/* 7️⃣ Weekly trend charts — render only when their data exists.
              Kick / contraction charts only make sense during pregnancy. */}
      {isPregnancyStage && dataCheck.hasKickSessions && <WeeklyKickFrequencyChart />}
      {dataCheck.hasHydration && <WeeklyHydrationChart />}
      {isPregnancyStage && dataCheck.hasContractions && <WeeklyContractionFrequencyChart />}

      {/* 8️⃣ Detail cards — auto-hide when empty / irrelevant for stage */}
      {dataCheck.hasMoodData && <MoodTrendCard />}
      {dataCheck.hasSymptomsData && <WeeklySymptomsCard />}
      {dataCheck.hasWeight && <WeightTrendCard />}
      {isPregnancyStage && (stats.dailyTracking.todayKicks > 0 || dataCheck.hasKickSessions) && (
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
