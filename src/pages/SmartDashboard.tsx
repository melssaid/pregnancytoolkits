import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { motion, useScroll, useTransform } from "framer-motion";
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
import { RecentMealFitnessSummary } from "@/components/dashboard/RecentMealFitnessSummary";
import { QuickActionsBar } from "@/components/dashboard/QuickActionsBar";
import { HydrationTracker } from "@/components/dashboard/HydrationTracker";
import { SymptomsSummary } from "@/components/dashboard/SymptomsSummary";
import { FetalMovementCard } from "@/components/dashboard/FetalMovementCard";
import { WeightTrendCard } from "@/components/dashboard/WeightTrendCard";
import { RecentAIResults } from "@/components/dashboard/RecentAIResults";
import { UsageStatsNudge } from "@/components/dashboard/UsageStatsNudge";

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
import { WeeklySymptomsCard } from "@/components/dashboard/WeeklySymptomsCard";
import { ContractionSummaryCard } from "@/components/dashboard/ContractionSummaryCard";
import { MoodTrendCard } from "@/components/dashboard/MoodTrendCard";
import { SavedResultsCountCard } from "@/components/dashboard/SavedResultsCountCard";
import { ResultsArchiveCalendar } from "@/components/dashboard/ResultsArchiveCalendar";
import { useDashboardDataCheck } from "@/hooks/useDashboardDataCheck";

const SmartDashboard = () => {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();

  const healthCheckin = safeParseLocalStorage<any>("dashboard_health_checkin_v1", null);
  useSmartConversionPrompt();
  const trimesterTheme = useTrimesterTheme();
  const dataCheck = useDashboardDataCheck();
  const bloodPressure = healthCheckin?.bloodPressure || "";

  const { scrollY } = useScroll();
  const roseLeftY = useTransform(scrollY, [0, 400], [0, -60]);
  const roseRightY = useTransform(scrollY, [0, 400], [0, -45]);
  const roseOpacity = useTransform(scrollY, [0, 300], [0.92, 0]);
  const roseLeftScale = useTransform(scrollY, [0, 400], [1, 0.7]);
  const roseRightScale = useTransform(scrollY, [0, 400], [1, 0.75]);

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
            width={96}
            height={96}
            style={{ y: roseLeftY, opacity: roseOpacity, scale: roseLeftScale }}
            initial={{ y: -20, opacity: 0, rotate: -20, scale: 0.5 }}
            animate={{
              y: [0, -5, 0],
              opacity: 0.92,
              rotate: [-10, -4, -10],
              scale: [1, 1.06, 1],
            }}
            transition={{
              y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.8, ease: "easeOut" },
            }}
            className="drop-shadow-lg"
          />
          <motion.img
            src={roseRight}
            alt=""
            width={96}
            height={96}
            style={{ y: roseRightY, opacity: roseOpacity, scale: roseRightScale }}
            initial={{ y: -20, opacity: 0, rotate: 20, scale: 0.5 }}
            animate={{
              y: [0, -6, 0],
              opacity: 0.92,
              rotate: [10, 4, 10],
              scale: [1, 1.08, 1],
            }}
            transition={{
              y: { duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
              rotate: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
              scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
              opacity: { duration: 0.8, ease: "easeOut", delay: 0.15 },
            }}
            className="drop-shadow-lg"
          />
        </div>

        {/* 1. Hero — always visible */}
        <DailyHeroCard week={profile.pregnancyWeek} dueDate={profile.dueDate} />

        {/* ★ Health Score Ring — always visible */}
        <HealthScoreRing />

        {/* ★ Baby Size — always visible */}
        <BabySizeCard />

        {/* Birth Countdown — always visible */}
        <BirthCountdownCard />

        {/* Risk Alerts — conditional */}
        <RiskAlertCard
          bloodPressure={bloodPressure}
          todayKicks={stats.dailyTracking.todayKicks}
          week={profile.pregnancyWeek}
        />

        {/* ═══ DATA-FIRST SECTION: cards that have user data appear here ═══ */}

        {dataCheck.hasRecentActivity && <RecentMealFitnessSummary />}

        {dataCheck.hasSymptomsData && <WeeklySymptomsCard />}

        {dataCheck.hasMoodData && <MoodTrendCard />}

        {dataCheck.hasContractions && <ContractionSummaryCard />}

        {dataCheck.hasWeight && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FetalMovementCard todayKicks={stats.dailyTracking.todayKicks} />
            <WeightTrendCard />
          </div>
        )}

        {dataCheck.hasSavedResults && <SavedResultsCountCard />}
        <ResultsArchiveCalendar />
        {dataCheck.hasSavedResults && <RecentAIResults />}

        {/* ═══ ALWAYS-VISIBLE SECTION ═══ */}

        <WeekCertificateCard />
        <StageRecommendation />
        <UsageStatsNudge />
        <ContextualSymptomsCard />
        <NutritionTipCard />
        <WeeklyHealthChallenge />
        <DailyHealthChallengeCard />

        <DailyPriorities
          vitaminsTaken={stats.dailyTracking.vitaminsTaken}
          todayKicks={stats.dailyTracking.todayKicks}
          waterGlasses={stats.dailyTracking.waterGlasses}
          upcomingAppointments={stats.planning.upcomingAppointments}
        />

        <QuickActionsBar />
        <HydrationTracker />
        <SymptomsSummary />

        {/* Data cards that weren't shown above (no data yet) */}
        {!dataCheck.hasRecentActivity && <RecentMealFitnessSummary />}
        {!dataCheck.hasSymptomsData && <WeeklySymptomsCard />}
        {!dataCheck.hasMoodData && <MoodTrendCard />}
        {!dataCheck.hasContractions && <ContractionSummaryCard />}

        {!dataCheck.hasWeight && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <FetalMovementCard todayKicks={stats.dailyTracking.todayKicks} />
            <WeightTrendCard />
          </div>
        )}

        {!dataCheck.hasSavedResults && <SavedResultsCountCard />}
        {!dataCheck.hasSavedResults && <RecentAIResults />}

        {/* Bottom section — always visible */}
        <WeeklyComparisonCard />
        <MilestonesTimeline />
        <DoctorVisitPrepCard />
        <PartnerSummaryCard />
        <MedicalSummaryCard />
        <AppRatingCard />
        <DynamicFAQ />

        {/* Back to Home Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/"
            className="block rounded-2xl bg-gradient-to-br from-primary/10 via-card to-pink-100/30 dark:from-primary/15 dark:to-primary/5 border border-primary/15 p-5 text-center hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <span className="text-2xl mb-2 block">🏠</span>
            <h3 className="text-base font-extrabold text-foreground mb-1">
              {t("dashboard.backHome.title", "العودة للصفحة الرئيسية")}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {t("dashboard.backHome.subtitle", "استكشفي واستخدمي كافة الأدوات المتاحة")}
            </p>
          </Link>
        </motion.div>
      </main>
    </Layout>
  );
};

export default SmartDashboard;
