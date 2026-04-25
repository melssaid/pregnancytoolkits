import { memo } from "react";
import { ResultsArchiveCalendar } from "@/components/dashboard/ResultsArchiveCalendar";
import { MilestonesTimeline } from "@/components/dashboard/MilestonesTimeline";
import { WeekCertificateCard } from "@/components/dashboard/WeekCertificateCard";
import { StageRecommendation } from "@/components/dashboard/StageRecommendation";
import { useDashboardData } from "@/hooks/useDashboardData";

/**
 * "Archive" tab — saved results, history, milestones.
 */
export const ArchiveTab = memo(function ArchiveTab() {
  const { isPregnant, dataCheck } = useDashboardData();

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
