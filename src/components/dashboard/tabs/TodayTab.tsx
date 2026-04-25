import { memo } from "react";
import { TodayStoryHero } from "@/components/dashboard/TodayStoryHero";
import { RiskAlertCard } from "@/components/dashboard/RiskAlertCard";
import { DailyPriorities } from "@/components/dashboard/DailyPriorities";
import { HydrationTracker } from "@/components/dashboard/HydrationTracker";
import { NutritionTipCard } from "@/components/dashboard/NutritionTipCard";
import { DailyHealthChallengeCard } from "@/components/dashboard/DailyHealthChallengeCard";
import { BabySizeCard } from "@/components/dashboard/BabySizeCard";
import { BirthCountdownCard } from "@/components/dashboard/BirthCountdownCard";
import { UnifiedToolsGrid } from "@/components/dashboard/UnifiedToolsGrid";
import { useDashboardData } from "@/hooks/useDashboardData";

/**
 * "Today" tab — primary daily focus.
 * Order is dynamic based on time of day (morning/afternoon/evening).
 */
export const TodayTab = memo(function TodayTab() {
  const { profile, stats, bloodPressure, timeSlot, isPregnant } = useDashboardData();

  // Time-based card ordering (after the persistent Hero + Risk + Priorities)
  const morningOrder = [<NutritionTipCard key="nut" />, <HydrationTracker key="hyd" />, <BabySizeCard key="baby" />];
  const afternoonOrder = [<HydrationTracker key="hyd" />, <NutritionTipCard key="nut" />, <BabySizeCard key="baby" />];
  const eveningOrder = [<DailyHealthChallengeCard key="ch" />, <NutritionTipCard key="nut" />, <BabySizeCard key="baby" />];
  const dynamicCards =
    timeSlot === "morning" ? morningOrder : timeSlot === "afternoon" ? afternoonOrder : eveningOrder;

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
