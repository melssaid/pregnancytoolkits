import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
// TodaysInsightCard removed — replaced by NutritionTipCard
import { useTranslation } from "react-i18next";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { Layout } from "@/components/Layout";
import { safeParseLocalStorage } from "@/lib/safeStorage";
import { useSmartConversionPrompt } from "@/hooks/useSmartConversionPrompt";

// Dashboard components
import { DailyHeroCard } from "@/components/dashboard/DailyHeroCard";
import { RiskAlertCard } from "@/components/dashboard/RiskAlertCard";
// TodaysInsightCard import removed
import { DailyPriorities } from "@/components/dashboard/DailyPriorities";
import { QuickActionsBar } from "@/components/dashboard/QuickActionsBar";
import { HydrationTracker } from "@/components/dashboard/HydrationTracker";
import { SymptomsSummary } from "@/components/dashboard/SymptomsSummary";
import { FetalMovementCard } from "@/components/dashboard/FetalMovementCard";
import { WeightTrendCard } from "@/components/dashboard/WeightTrendCard";
import { RecentAIResults } from "@/components/dashboard/RecentAIResults";
import { UsageStatsNudge } from "@/components/dashboard/UsageStatsNudge";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { BirthCountdownCard } from "@/components/dashboard/BirthCountdownCard";
import { AppRatingCard } from "@/components/dashboard/AppRatingCard";
import { WeekCertificateCard } from "@/components/dashboard/WeekCertificateCard";
import { StageRecommendation } from "@/components/dashboard/StageRecommendation";
import { WeeklyHealthChallenge } from "@/components/dashboard/WeeklyHealthChallenge";
import { DynamicFAQ } from "@/components/DynamicFAQ";
import { useTrimesterTheme } from "@/hooks/useTrimesterTheme";

// New innovative features
import { HealthScoreRing } from "@/components/dashboard/HealthScoreRing";
import { BabySizeCard } from "@/components/dashboard/BabySizeCard";
import { WeeklyComparisonCard } from "@/components/dashboard/WeeklyComparisonCard";
import { MilestonesTimeline } from "@/components/dashboard/MilestonesTimeline";
import { ContextualSymptomsCard } from "@/components/dashboard/ContextualSymptomsCard";
import { DoctorVisitPrepCard } from "@/components/dashboard/DoctorVisitPrepCard";
import { NutritionTipCard } from "@/components/dashboard/NutritionTipCard";
import { PartnerSummaryCard } from "@/components/dashboard/PartnerSummaryCard";
import { DailyHealthChallengeCard } from "@/components/dashboard/DailyHealthChallengeCard";
import { MedicalSummaryCard } from "@/components/dashboard/MedicalSummaryCard";

const SmartDashboard = () => {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();

  const healthCheckin = safeParseLocalStorage<any>("dashboard_health_checkin_v1", null);
  useSmartConversionPrompt();
  const trimesterTheme = useTrimesterTheme();
  const bloodPressure = healthCheckin?.bloodPressure || "";

  return (
    <Layout>
      <SEOHead
        title={t("dailyDashboard.pageTitle", "Pregnancy Dashboard")}
        description="Your personalized pregnancy dashboard"
      />

      <main className={`container py-4 space-y-3.5 pb-24 bg-gradient-to-b ${trimesterTheme.gradient}`}>
        {/* Streak Badge */}
        <div className="flex items-center justify-between">
          <StreakBadge />
          <span className="text-lg">{trimesterTheme.emoji}</span>
        </div>

        {/* 1. Hero — Pregnancy Week */}
        <DailyHeroCard week={profile.pregnancyWeek} dueDate={profile.dueDate} />

        {/* ★ Health Score Ring */}
        <HealthScoreRing />

        {/* ★ Baby Size Visualization */}
        <BabySizeCard />

        {/* Birth Countdown */}
        <BirthCountdownCard />

        {/* Week Certificate */}
        <WeekCertificateCard />

        {/* Stage Recommendation */}
        <StageRecommendation />

        {/* Usage Stats Nudge for free users */}
        <UsageStatsNudge />

        {/* 2. Risk Alerts (conditional) */}
        <RiskAlertCard
          bloodPressure={bloodPressure}
          todayKicks={stats.dailyTracking.todayKicks}
          week={profile.pregnancyWeek}
        />

        {/* TodaysInsightCard removed — NutritionTipCard covers this */}

        {/* ★ Contextual Symptoms */}
        <ContextualSymptomsCard />

        {/* ★ Nutrition Tip */}
        <NutritionTipCard />

        {/* Weekly Health Challenge */}
        <WeeklyHealthChallenge />

        {/* ★ Daily Health Challenges */}
        <DailyHealthChallengeCard />

        {/* 3. Daily Priorities */}
        <DailyPriorities
          vitaminsTaken={stats.dailyTracking.vitaminsTaken}
          todayKicks={stats.dailyTracking.todayKicks}
          waterGlasses={stats.dailyTracking.waterGlasses}
          upcomingAppointments={stats.planning.upcomingAppointments}
        />

        {/* 4. Quick Actions */}
        <QuickActionsBar />

        {/* 5. Hydration */}
        <HydrationTracker />

        {/* 6. Symptoms Summary */}
        <SymptomsSummary />

        {/* 7 & 8. Baby Movement + Weight — side by side on wider screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FetalMovementCard todayKicks={stats.dailyTracking.todayKicks} />
          <WeightTrendCard />
        </div>

        {/* ★ Weekly Comparison */}
        <WeeklyComparisonCard />

        {/* ★ Milestones Timeline */}
        <MilestonesTimeline />

        {/* ★ Doctor Visit Prep */}
        <DoctorVisitPrepCard />

        {/* ★ Partner Summary */}
        <PartnerSummaryCard />

        {/* ★ Medical Summary */}
        <MedicalSummaryCard />

        {/* App Rating */}
        <AppRatingCard />

        {/* 10. Recent AI Results */}
        <RecentAIResults />

        {/* Dynamic FAQ */}
        <DynamicFAQ />
      </main>
    </Layout>
  );
};

export default SmartDashboard;
