import { Skeleton } from "@/components/ui/skeleton";

export type DashboardTabKey = "today" | "insights" | "archive" | "more";

interface DashboardTabSkeletonProps {
  tab?: DashboardTabKey;
}

/**
 * Per-tab skeleton placeholders.
 *
 * Heights and rounding are calibrated to the *real* card heights inside each
 * tab so lazy hydration produces zero Cumulative Layout Shift (CLS).
 * Update these values whenever a tab's card structure changes.
 */
export function DashboardTabSkeleton({ tab = "today" }: DashboardTabSkeletonProps) {
  if (tab === "insights") {
    return (
      <div className="space-y-4 py-4" aria-hidden="true">
        {/* HealthScoreRing — ring + stats row */}
        <Skeleton className="h-[180px] w-full rounded-3xl" />
        {/* WeeklyComparisonCard */}
        <Skeleton className="h-32 w-full rounded-2xl" />
        {/* Three weekly trend charts (mood / hydration / contraction) */}
        <Skeleton className="h-[224px] w-full rounded-2xl" />
        <Skeleton className="h-[224px] w-full rounded-2xl" />
        <Skeleton className="h-[224px] w-full rounded-2xl" />
        {/* Detail cards */}
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (tab === "archive") {
    return (
      <div className="space-y-4 py-4" aria-hidden="true">
        {/* WeekCertificateCard */}
        <Skeleton className="h-40 w-full rounded-3xl" />
        {/* StageRecommendation */}
        <Skeleton className="h-28 w-full rounded-2xl" />
        {/* MilestonesTimeline — vertical list */}
        <Skeleton className="h-[260px] w-full rounded-2xl" />
        {/* ResultsArchiveCalendar */}
        <Skeleton className="h-[280px] w-full rounded-2xl" />
      </div>
    );
  }

  if (tab === "more") {
    return (
      <div className="space-y-4 py-4" aria-hidden="true">
        {/* DoctorVisitPrepCard */}
        <Skeleton className="h-32 w-full rounded-2xl" />
        {/* PartnerSummaryCard */}
        <Skeleton className="h-28 w-full rounded-2xl" />
        {/* UsageStatsNudge */}
        <Skeleton className="h-24 w-full rounded-2xl" />
        {/* AppRatingCard */}
        <Skeleton className="h-32 w-full rounded-2xl" />
        {/* DynamicFAQ — accordion list */}
        <Skeleton className="h-[260px] w-full rounded-2xl" />
        {/* Back to home row */}
        <Skeleton className="h-[72px] w-full rounded-2xl" />
        {/* Danger zone */}
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  // Default: "today" tab
  return (
    <div className="space-y-4 py-4" aria-hidden="true">
      {/* TodayStoryHero — large ring + content */}
      <Skeleton className="h-[260px] w-full rounded-3xl" />
      {/* RiskAlertCard (collapses if no risk — keep slim) */}
      <Skeleton className="h-20 w-full rounded-2xl" />
      {/* DailyPriorities */}
      <Skeleton className="h-36 w-full rounded-2xl" />
      {/* UnifiedToolsGrid — 3 cols */}
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-[88px] rounded-2xl" />
        <Skeleton className="h-[88px] rounded-2xl" />
        <Skeleton className="h-[88px] rounded-2xl" />
        <Skeleton className="h-[88px] rounded-2xl" />
        <Skeleton className="h-[88px] rounded-2xl" />
        <Skeleton className="h-[88px] rounded-2xl" />
      </div>
      {/* Time-based dynamic card #1 (Nutrition / Hydration / Challenge) */}
      <Skeleton className="h-32 w-full rounded-2xl" />
      {/* Time-based dynamic card #2 */}
      <Skeleton className="h-32 w-full rounded-2xl" />
      {/* BabySizeCard (only when pregnant) */}
      <Skeleton className="h-[140px] w-full rounded-2xl" />
    </div>
  );
}
