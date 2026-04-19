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
    { label: t("smartPlan.currentWeek", "Week"), value: `${week}/40`, color: "text-primary" },
    { label: t("smartPlan.bmi", "BMI"), value: bmi, color: "text-blue-500" },
    { label: t("smartPlan.calories", "Calories"), value: `${calories}`, color: "text-orange-500" },
    { label: t("smartPlan.bp", "BP"), value: bloodPressure, color: "text-rose-500" },
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {stats.map((stat, i) => (
        <div key={i} className="text-center p-2 rounded-xl bg-muted/40 border border-border/30 min-w-0">
          <p className={`text-sm font-bold tabular-nums leading-tight whitespace-normal break-words ${stat.color}`} style={{ overflowWrap: 'anywhere' }}>{stat.value}</p>
          <p className="text-[10px] text-foreground/60 font-medium leading-tight whitespace-normal break-words mt-1" style={{ overflowWrap: 'anywhere', hyphens: 'auto' as const }}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
