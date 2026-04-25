import { memo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface FetalMovementCardProps {
  todayKicks: number;
  goal?: number;
}

export const FetalMovementCard = memo(function FetalMovementCard({ todayKicks, goal = 10 }: FetalMovementCardProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const pct = Math.min(100, (todayKicks / goal) * 100);
  const reached = todayKicks >= goal;

  return (
    <Link to="/tools/kick-counter">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border/20 bg-card p-3.5 hover:border-primary/20 transition-colors group"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-foreground whitespace-normal leading-tight">{t("dailyDashboard.fetalMovement.title")}</h3>
          <Arrow className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>

        <div className="flex items-end gap-3 mb-2">
          <span className="text-2xl font-black text-foreground leading-none">{todayKicks}</span>
          <span className="text-[10px] text-muted-foreground mb-0.5">/ {goal} {t("dailyDashboard.fetalMovement.goal")}</span>
        </div>

        <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${reached ? "bg-primary" : "bg-primary/60"}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, delay: 0.3 }}
          />
        </div>

        {todayKicks === 0 && (
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            {t("dailyDashboard.fetalMovement.empty")}
          </p>
        )}
      </motion.div>
    </Link>
  );
});
