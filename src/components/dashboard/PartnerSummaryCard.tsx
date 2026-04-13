import { Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { motion } from "framer-motion";

export function PartnerSummaryCard() {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();

  const week = profile.pregnancyWeek;
  const trimester = week <= 12 ? 1 : week <= 26 ? 2 : 3;

  const handleShare = () => {
    const msg = t("partnerSummary.shareMessage", {
      week,
      kicks: stats.dailyTracking.todayKicks,
      water: stats.dailyTracking.waterGlasses,
    });

    if (navigator.share) {
      navigator.share({ text: msg }).catch(() => {});
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Card className="p-4 bg-card border-border/50">
      <div className="mb-2">
        <h3 className="text-base font-bold text-foreground">{t("partnerSummary.title")}</h3>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-pink-500/5 rounded-xl p-3 mb-2"
      >
        <p className="text-[11px] text-foreground leading-relaxed">
          {t("partnerSummary.message", { week, trimester })}
        </p>
        <div className="flex gap-3 mt-2">
          <span className="text-[10px] text-muted-foreground">
            👣 {stats.dailyTracking.todayKicks} {t("partnerSummary.kicks")}
          </span>
          <span className="text-[10px] text-muted-foreground">
            💧 {stats.dailyTracking.waterGlasses} {t("partnerSummary.glasses")}
          </span>
        </div>
      </motion.div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleShare}
        className="w-full text-xs h-8 gap-1"
      >
        <Share2 className="w-3.5 h-3.5" />
        {t("partnerSummary.share")}
      </Button>
    </Card>
  );
}
