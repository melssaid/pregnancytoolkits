import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { Card, CardContent } from "@/components/ui/card";

export function UsageStatsNudge() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { used, limit, tier } = useAIUsage();

  // Only show for free-tier users who have used at least 1 analysis
  if (tier === "premium" || used < 1) return null;

  const percentage = Math.min(100, Math.round((used / limit) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow border-primary/15"
        onClick={() => navigate("/pricing-demo")}
      >
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {t("usageNudge.title", "{{used}}/{{limit}} analyses used", { used, limit })}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {t("usageNudge.upgrade", "Upgrade for 60 analyses/month →")}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-primary shrink-0" />
          </div>

          {/* Progress bar */}
          <div className="mt-2.5 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                percentage >= 80 ? "bg-destructive" : "bg-primary"
              }`}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
