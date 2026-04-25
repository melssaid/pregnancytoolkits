import { memo } from "react";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ResultsArchiveCalendar } from "@/components/dashboard/ResultsArchiveCalendar";
import { MilestonesTimeline } from "@/components/dashboard/MilestonesTimeline";
import { WeekCertificateCard } from "@/components/dashboard/WeekCertificateCard";
import { StageRecommendation } from "@/components/dashboard/StageRecommendation";
import { EmptyStateCard } from "@/components/dashboard/EmptyStateCard";
import { useDashboardData } from "@/hooks/useDashboardData";

/**
 * "Archive" tab — saved results, history, milestones.
 * Shows a polished empty state when nothing exists yet.
 */
export const ArchiveTab = memo(function ArchiveTab() {
  const { t } = useTranslation();
  const { isPregnant, dataCheck } = useDashboardData();

  const isCompletelyEmpty = !isPregnant && !dataCheck.hasSavedResults;

  if (isCompletelyEmpty) {
    return (
      <div className="mt-4">
        <EmptyStateCard
          icon={Calendar}
          title={t("dashboardV2.archiveEmpty.title")}
          description={t("dashboardV2.archiveEmpty.desc")}
          ctaLabel={t("dashboardV2.archiveEmpty.cta")}
          ctaHref="/discover"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {isPregnant && <WeekCertificateCard />}
      {isPregnant && <StageRecommendation />}
      {isPregnant && <MilestonesTimeline />}
      {dataCheck.hasSavedResults && <ResultsArchiveCalendar />}
    </div>
  );
});

export default ArchiveTab;
