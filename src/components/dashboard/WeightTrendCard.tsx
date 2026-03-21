import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Gauge, TrendingUp, TrendingDown, ArrowRight, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { getUserId } from "@/hooks/useSupabase";
import { safeParseLocalStorage } from "@/lib/safeStorage";

export const WeightTrendCard = memo(function WeightTrendCard() {
  const { t } = useTranslation();
  const userId = getUserId();

  const { current, change, status } = useMemo(() => {
    const logs = safeParseLocalStorage<any[]>(`weight_logs_${userId}`, []);
    if (logs.length === 0) return { current: null, change: null, status: "empty" as const };

    const sorted = [...logs].sort((a, b) => new Date(a.date || a.logged_at || 0).getTime() - new Date(b.date || b.logged_at || 0).getTime());
    const last = sorted[sorted.length - 1];
    const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    const diff = prev ? +(last.weight - prev.weight).toFixed(1) : null;

    return {
      current: last.weight,
      change: diff,
      status: diff === null ? "single" as const : diff > 0 ? "up" as const : diff < 0 ? "down" as const : "same" as const,
    };
  }, [userId]);

  const TrendIcon = status === "up" ? TrendingUp : status === "down" ? TrendingDown : Minus;

  return (
    <Link to="/tools/weight-gain">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-border/20 bg-card p-3.5 hover:border-primary/20 transition-colors group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground">{t("dailyDashboard.weight.title")}</h3>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {current ? (
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-foreground leading-none">{current}</span>
            <span className="text-[10px] text-muted-foreground mb-0.5">kg</span>
            {change !== null && (
              <span className={`flex items-center gap-0.5 text-[10px] font-semibold ms-auto mb-0.5 ${
                status === "up" ? "text-primary" : status === "down" ? "text-primary" : "text-muted-foreground"
              }`}>
                <TrendIcon className="w-3 h-3" />
                {change > 0 ? "+" : ""}{change}
              </span>
            )}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground text-center py-2">
            {t("dailyDashboard.weight.empty")}
          </p>
        )}
      </motion.div>
    </Link>
  );
});
