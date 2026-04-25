/**
 * UltrasoundSummaryCard
 *
 * Lightweight dashboard summary that surfaces the most-recent ultrasound /
 * bump photo + its saved AI reading. Read-only — no upload here. Tapping the
 * CTA navigates to the full AI Bump Photos tool for new uploads / analysis.
 *
 * Reads exclusively from the existing storage used by `BumpPhotoService` —
 * no new persistence layer is introduced.
 */
import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Camera, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { BumpPhotoService } from "@/services/localStorageServices";

interface BumpPhoto {
  id: string;
  week: number;
  caption: string | null;
  image_ref: string;
  ai_analysis: string | null;
  created_at: string;
}

export const UltrasoundSummaryCard = memo(function UltrasoundSummaryCard() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [latest, setLatest] = useState<BumpPhoto | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all: BumpPhoto[] = await BumpPhotoService.getAll();
        if (!mounted) return;
        const sorted = [...all].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setLatest(sorted[0] || null);
        setTotal(all.length);
      } catch {
        if (mounted) {
          setLatest(null);
          setTotal(0);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Empty state: invite first upload
  if (!latest) {
    return (
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card to-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">
                {t("dashboardV2.ultrasound.title")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                {t("dashboardV2.ultrasound.emptyDesc")}
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="w-full mt-3 h-9 rounded-xl text-xs font-semibold"
          >
            <Link to="/tools/ai-bump-photos">
              {t("dashboardV2.ultrasound.uploadCta")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const summary = (latest.ai_analysis || "").trim();
  const snippet =
    summary.length > 0
      ? summary.slice(0, 180).replace(/\s+/g, " ") +
        (summary.length > 180 ? "…" : "")
      : t("dashboardV2.ultrasound.noAnalysisYet");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden border-primary/20">
        <div className="h-1 bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40" />
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {t("dashboardV2.ultrasound.title")}
                </h3>
                <p className="text-[10.5px] text-muted-foreground">
                  {t("dashboardV2.ultrasound.totalCount", { count: total })}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
              {t("dashboardV2.ultrasound.weekTag", { week: latest.week })}
            </span>
          </div>

          <div className="flex gap-3">
            <img
              src={latest.image_ref}
              alt={latest.caption || `Week ${latest.week}`}
              loading="lazy"
              className="w-20 h-20 rounded-xl object-cover border border-primary/15 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10.5px] font-semibold text-primary">
                  {t("dashboardV2.ultrasound.aiReading")}
                </span>
              </div>
              <p className="text-[11.5px] text-muted-foreground leading-relaxed line-clamp-4">
                {snippet}
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full mt-3 h-8 rounded-xl text-[11px] font-semibold gap-1"
          >
            <Link to="/tools/ai-bump-photos">
              {t("dashboardV2.ultrasound.openCta")}
              {isRTL ? (
                <ChevronLeft className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default UltrasoundSummaryCard;
