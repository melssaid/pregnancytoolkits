import { memo } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ResultsArchiveCalendar } from "@/components/dashboard/ResultsArchiveCalendar";
import { MilestonesTimeline } from "@/components/dashboard/MilestonesTimeline";
import { WeekCertificateCard } from "@/components/dashboard/WeekCertificateCard";
import { StageRecommendation } from "@/components/dashboard/StageRecommendation";
import { useDashboardData } from "@/hooks/useDashboardData";

/**
 * "Archive" tab — saved results, history, milestones.
 * Shows a polished empty state when nothing exists yet.
 */
export const ArchiveTab = memo(function ArchiveTab() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { isPregnant, dataCheck } = useDashboardData();

  const isCompletelyEmpty = !isPregnant && !dataCheck.hasSavedResults;

  if (isCompletelyEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-dashed border-border/60 bg-card/50 p-8 text-center mt-4"
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Calendar className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">
          {isAr ? "أرشيفكِ فارغ" : "Your archive is empty"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
          {isAr
            ? "ستظهر هنا نتائجكِ المحفوظة، شهاداتكِ الأسبوعية، ومحطاتكِ المهمة"
            : "Your saved results, weekly certificates, and milestones will appear here"}
        </p>
        <Link
          to="/discover"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isAr ? "استكشفي الأدوات" : "Explore tools"}
        </Link>
      </motion.div>
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
