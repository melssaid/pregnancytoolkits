import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check } from "lucide-react";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { Card, CardContent } from "@/components/ui/card";

export function UsageStatsNudge() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { used, limit, tier } = useAIUsage();

  if (tier === "premium" || used < 1) return null;

  const percentage = Math.min(100, Math.round((used / limit) * 100));
  const isExhausted = percentage >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card
        className={`cursor-pointer hover:shadow-lg transition-all border-2 ${
          isExhausted ? 'border-destructive/30 bg-destructive/[0.03]' : 'border-primary/20 bg-primary/[0.03]'
        }`}
        onClick={() => navigate("/pricing-demo")}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isExhausted ? 'bg-destructive/15' : 'bg-primary/15'
            }`}>
              <Crown className={`w-5 h-5 ${isExhausted ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-foreground">
                {t("usageNudge.title", "{{used}}/{{limit}} analyses used", { used, limit })}
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {t("usageNudge.upgrade", "Upgrade for 60 analyses/month")}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isExhausted ? "bg-destructive" : percentage >= 80 ? "bg-amber-500" : "bg-primary"
              }`}
            />
          </div>

          {/* Subscribe button */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center gap-2 shadow-md"
          >
            <Crown className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-bold">
              {t("usageNudge.subscribe", "Subscribe Now")}
            </span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
