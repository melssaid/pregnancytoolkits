import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
// TodaysInsightCard removed — replaced by NutritionTipCard
import { useTranslation } from "react-i18next";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { Layout } from "@/components/Layout";
import { safeParseLocalStorage } from "@/lib/safeStorage";
import { useSmartConversionPrompt } from "@/hooks/useSmartConversionPrompt";
import roseLeft from "@/assets/rose-left.png";
import roseRight from "@/assets/rose-right.png";

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

      <main className={`container py-4 space-y-3.5 pb-24 bg-gradient-to-b ${trimesterTheme.gradient} relative`}>
        {/* Two realistic roses peeking from under the header */}
        <div className="absolute -top-3 left-0 right-0 flex justify-between pointer-events-none px-1 z-0">
          <motion.img
            src={roseLeft}
            alt=""
            width={72}
            height={72}
            initial={{ y: -30, opacity: 0, rotate: -25, scale: 0.6 }}
            animate={{
              y: [0, -3, 0],
              opacity: 0.9,
              rotate: [-8, -5, -8],
              scale: [1, 1.05, 1],
            }}
            transition={{
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.8, ease: "easeOut" },
            }}
            className="drop-shadow-lg"
          />
          <motion.img
            src={roseRight}
            alt=""
            width={72}
            height={72}
            initial={{ y: -30, opacity: 0, rotate: 25, scale: 0.6 }}
            animate={{
              y: [0, -4, 0],
              opacity: 0.9,
              rotate: [8, 5, 8],
              scale: [1, 1.06, 1],
            }}
            transition={{
              y: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
              rotate: { duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
              scale: { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
              opacity: { duration: 0.8, ease: "easeOut", delay: 0.12 },
            }}
            className="drop-shadow-lg"
          />
        </div>

        {/* 1. Hero — Pregnancy Week */}
        <DailyHeroCard week={profile.pregnancyWeek} dueDate={profile.dueDate} />

        {/* ★ Health Score Ring + Streak Badge attached */}
        <div className="relative">
          <div className="absolute -top-3 start-3 z-10">
            <StreakBadge />
          </div>
          <HealthScoreRing />
        </div>

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
