import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ContextualWarningBanner } from "@/components/safety";

interface RiskAlertCardProps {
  bloodPressure?: string;
  todayKicks: number;
  week: number;
}

export const RiskAlertCard = memo(function RiskAlertCard({ bloodPressure, todayKicks, week }: RiskAlertCardProps) {
  const { t } = useTranslation();
  const alerts: { level: "info" | "warning" | "urgent"; message: string }[] = [];

  if (bloodPressure) {
    const [sys] = bloodPressure.split("/").map(Number);
    if (sys > 140) alerts.push({ level: "urgent", message: t("safety.banners.highBP") });
    else if (sys < 90) alerts.push({ level: "warning", message: t("safety.banners.lowBP") });
  }

  if (week >= 28 && todayKicks > 0 && todayKicks < 10) {
    alerts.push({ level: "warning", message: t("safety.banners.lowKicks") });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <ContextualWarningBanner key={i} level={alert.level} message={alert.message} />
      ))}
    </div>
  );
});
