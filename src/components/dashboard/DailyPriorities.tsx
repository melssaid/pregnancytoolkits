import { memo, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Check, Circle, Droplets, Hand, Dumbbell, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

interface DailyPrioritiesProps {
  vitaminsTaken: number;
  todayKicks: number;
  waterGlasses: number;
  upcomingAppointments: number;
}

interface PriorityItem {
  id: string;
  labelKey: string;
  done: boolean;
  icon: React.ElementType;
  href: string;
  detail?: string;
}

export const DailyPriorities = memo(function DailyPriorities({
  vitaminsTaken, todayKicks, waterGlasses, upcomingAppointments,
}: DailyPrioritiesProps) {
  const { t } = useTranslation();

  const items: PriorityItem[] = useMemo(() => [
    {
      id: "kicks",
      labelKey: "dailyDashboard.priorities.kicks",
      done: todayKicks >= 10,
      icon: Hand,
      href: "/tools/kick-counter",
      detail: todayKicks > 0 ? `${todayKicks}` : undefined,
    },
    {
      id: "water",
      labelKey: "dailyDashboard.priorities.water",
      done: waterGlasses >= 8,
      icon: Droplets,
      href: "#hydration-tracker",
      detail: `${waterGlasses}/8`,
    },
    {
      id: "meals",
      labelKey: "dailyDashboard.priorities.meals",
      done: false,
      icon: Utensils,
      href: "/tools/ai-meal-suggestion",
    },
    {
      id: "fitness",
      labelKey: "dailyDashboard.priorities.fitness",
      done: false,
      icon: Dumbbell,
      href: "/tools/ai-fitness-coach",
    },
  ], [todayKicks, waterGlasses]);

  const completedCount = items.filter(i => i.done).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border/20 bg-card p-3.5"
    >
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-bold text-foreground whitespace-normal leading-tight">{t("dailyDashboard.priorities.title")}</h3>
        <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
          {completedCount}/{items.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map((item, i) => {
          const isAnchor = item.href.startsWith("#");
          const handleClick = (e: React.MouseEvent) => {
            if (isAnchor) {
              e.preventDefault();
              const el = document.getElementById(item.href.slice(1));
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          };
          return (
            <Link key={item.id} to={isAnchor ? "#" : item.href} onClick={handleClick}>
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                  item.done ? "bg-primary/5" : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.done ? "bg-primary/15" : "bg-muted/50"
                }`}>
                  {item.done ? (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Circle className="w-3 h-3 text-muted-foreground/50" />
                  )}
                </div>
                <span className={`text-xs font-medium flex-1 whitespace-normal leading-tight ${item.done ? "text-primary" : "text-foreground"}`}>
                  {t(item.labelKey)}
                </span>
                {item.detail && (
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {item.detail}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
});
