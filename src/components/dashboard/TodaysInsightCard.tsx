import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";

type InsightKey = "hydration" | "movement" | "vitamins" | "rest" | "nutrition" | "appointment" | "hospitalBag" | "bonding" | "general";

function pickInsightKey(week: number, water: number, kicks: number, vitamins: number, appointments: number): InsightKey {
  // Priority-based: actionable first
  if (week >= 34 && water < 4) return "hydration";
  if (week >= 28 && kicks === 0) return "movement";
  if (vitamins === 0) return "vitamins";
  if (appointments > 0 && week >= 36) return "appointment";
  if (week >= 35) return "hospitalBag";
  if (week >= 28) return "hydration";
  if (week >= 20) return "movement";
  if (week >= 12) return "nutrition";
  if (week >= 6) return "rest";
  return "general";
}

export const TodaysInsightCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();

  const week = profile.pregnancyWeek || 0;
  const insightKey = pickInsightKey(
    week,
    stats.dailyTracking.waterGlasses,
    stats.dailyTracking.todayKicks,
    stats.dailyTracking.vitaminsTaken,
    stats.planning.upcomingAppointments
  );

  const message = t(`dailyInsights.tips.${insightKey}`, { week });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/20 overflow-hidden">
        <CardContent className="p-3.5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center mt-0.5">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-wide whitespace-normal leading-tight">
                {t("dailyInsights.todaysInsight")}
              </p>
              <p className="text-[12px] text-foreground/85 leading-relaxed whitespace-normal">
                {message}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-0 text-[11px] text-primary hover:text-primary/80 gap-1 whitespace-normal"
                onClick={() => navigate("/daily-insights")}
              >
                {t("dailyInsights.viewFull")}
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
