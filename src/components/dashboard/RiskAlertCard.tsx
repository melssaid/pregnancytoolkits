import { memo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

interface RiskAlertCardProps {
  bloodPressure?: string;
  todayKicks: number;
  week: number;
}

export const RiskAlertCard = memo(function RiskAlertCard({ bloodPressure, todayKicks, week }: RiskAlertCardProps) {
  const { t } = useTranslation();
  const alerts: string[] = [];

  // High BP
  if (bloodPressure) {
    const [sys] = bloodPressure.split("/").map(Number);
    if (sys > 140) alerts.push(t("dailyDashboard.alerts.highBP"));
    else if (sys < 90) alerts.push(t("dailyDashboard.alerts.lowBP"));
  }

  // Low kicks after week 28
  if (week >= 28 && todayKicks > 0 && todayKicks < 10) {
    alerts.push(t("dailyDashboard.alerts.lowKicks"));
  }

  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-3.5"
    >
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-destructive/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-destructive mb-1">{t("dailyDashboard.alerts.title")}</h3>
          {alerts.map((a, i) => (
            <p key={i} className="text-[11px] text-destructive/80 leading-relaxed">• {a}</p>
          ))}
        </div>
      </div>
    </motion.div>
  );
});
