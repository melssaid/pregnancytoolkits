import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { TodayStoryHero } from "@/components/dashboard/TodayStoryHero";
import { RiskAlertCard } from "@/components/dashboard/RiskAlertCard";
import { DailyPriorities } from "@/components/dashboard/DailyPriorities";
import { HydrationTracker } from "@/components/dashboard/HydrationTracker";
import { NutritionTipCard } from "@/components/dashboard/NutritionTipCard";
import { DailyHealthChallengeCard } from "@/components/dashboard/DailyHealthChallengeCard";
import { BabySizeCard } from "@/components/dashboard/BabySizeCard";
import { BirthCountdownCard } from "@/components/dashboard/BirthCountdownCard";
import { UnifiedToolsGrid } from "@/components/dashboard/UnifiedToolsGrid";
import { EmptyStateCard } from "@/components/dashboard/EmptyStateCard";
import { useDashboardData } from "@/hooks/useDashboardData";

/**
 * "Today" tab — primary daily focus.
 * Order is dynamic based on time of day (morning/afternoon/evening).
 * Cards self-hide when their underlying data is empty.
 */
export const TodayTab = memo(function TodayTab() {
  const { t } = useTranslation();
  const { profile, stats, bloodPressure, timeSlot, isPregnant, dataCheck } = useDashboardData();

  // Only show pregnancy-tied content when the user has set a real week
  const hasRealWeek = isPregnant && profile.pregnancyWeek >= 4;

  // Time-based card ordering — only mount cards that are relevant
  const morningOrder = [
    hasRealWeek ? <NutritionTipCard key="nut" /> : null,
    <HydrationTracker key="hyd" />,
    hasRealWeek ? <BabySizeCard key="baby" /> : null,
  ].filter(Boolean);

  const afternoonOrder = [
    <HydrationTracker key="hyd" />,
    hasRealWeek ? <NutritionTipCard key="nut" /> : null,
    hasRealWeek ? <BabySizeCard key="baby" /> : null,
  ].filter(Boolean);

  const eveningOrder = [
    <DailyHealthChallengeCard key="ch" />,
    hasRealWeek ? <NutritionTipCard key="nut" /> : null,
    hasRealWeek ? <BabySizeCard key="baby" /> : null,
  ].filter(Boolean);

  const dynamicCards =
    timeSlot === "morning" ? morningOrder : timeSlot === "afternoon" ? afternoonOrder : eveningOrder;

  // Smart empty state: brand-new user with no profile and no data
  const isBrandNew = !isPregnant && !dataCheck.hasAnyData;

  return (
    <div className="space-y-4 pb-6">
      <TodayStoryHero />

      <RiskAlertCard
        bloodPressure={bloodPressure}
        todayKicks={stats.dailyTracking.todayKicks}
        week={profile.pregnancyWeek}
      />

      <DailyPriorities
        vitaminsTaken={stats.dailyTracking.vitaminsTaken}
        todayKicks={stats.dailyTracking.todayKicks}
        waterGlasses={stats.dailyTracking.waterGlasses}
        upcomingAppointments={stats.planning.upcomingAppointments}
      />

      <UnifiedToolsGrid />

      {/* Brand-new user nudge */}
      {isBrandNew && (
        <EmptyStateCard
          icon={Sparkles}
          title={t("dashboardV2.todayEmpty.title")}
          description={t("dashboardV2.todayEmpty.desc")}
          ctaLabel={t("dashboardV2.todayEmpty.cta")}
          ctaHref="/discover"
        />
      )}

      {/* Time-based section */}
      <div className="space-y-4">
        {dynamicCards.map((card, i) => (
          <div key={i}>{card}</div>
        ))}
      </div>

      {/* Birth countdown only in last trimester */}
      {isPregnant && profile.pregnancyWeek >= 28 && <BirthCountdownCard />}

      {/* Evening: include challenge card if not shown above */}
      {timeSlot !== "evening" && <DailyHealthChallengeCard />}
    </div>
  );
});

export default TodayTab;
