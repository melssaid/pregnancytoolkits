import { Baby, Gauge, Flame, Droplets } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HealthStatsGridProps {
  week: number;
  bmi: string;
  calories: number;
  bloodPressure: string;
}

export function HealthStatsGrid({ week, bmi, calories, bloodPressure }: HealthStatsGridProps) {
  const { t } = useTranslation();

  const stats = [
    { icon: Baby, label: t("smartPlan.currentWeek", "Week"), value: `${week}/40`, color: "text-primary" },
    { icon: Gauge, label: t("smartPlan.bmi", "BMI"), value: bmi, color: "text-blue-500" },
    { icon: Flame, label: t("smartPlan.calories", "Calories"), value: `${calories}`, color: "text-orange-500" },
    { icon: Droplets, label: t("smartPlan.bp", "BP"), value: bloodPressure, color: "text-rose-500" },
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {stats.map((stat, i) => (
        <div key={i} className="text-center p-2 rounded-xl bg-muted/40 border border-border/30 min-w-0">
          <stat.icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${stat.color}`} />
          <p className="text-sm font-bold tabular-nums">{stat.value}</p>
          <p className="text-[8px] text-muted-foreground leading-tight whitespace-normal break-words" style={{ overflowWrap: 'anywhere' }}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
