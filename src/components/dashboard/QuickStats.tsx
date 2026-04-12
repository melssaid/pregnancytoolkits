import { motion } from "framer-motion";
import { Gauge, Activity, Heart, Droplets, Calendar, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface QuickStatsProps {
  weight?: number;
  height?: number;
  kicks?: number;
  mood?: string;
  waterGlasses?: number;
  nextAppointment?: string;
}

function calcBMI(weight: number, heightCm: number) {
  if (!weight || !heightCm || heightCm < 100) return null;
  const hm = heightCm / 100;
  return Math.round((weight / (hm * hm)) * 10) / 10;
}

export function QuickStats({ 
  weight = 0, 
  height = 0,
  kicks = 0, 
  mood = "",
  waterGlasses = 0,
  nextAppointment
}: QuickStatsProps) {
  const { t } = useTranslation();
  const bmi = calcBMI(weight, height);

  const stats = [
    {
      id: "weight",
      icon: Gauge,
      labelKey: "dashboard.quickStats.weight",
      value: weight > 0 ? `${weight}` : "—",
      unit: weight > 0 ? "kg" : "",
      href: "/tools/weight-gain",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      id: "kicks",
      icon: Activity,
      labelKey: "dashboard.quickStats.kicksToday",
      value: kicks > 0 ? String(kicks) : "—",
      unit: "",
      href: "/tools/kick-counter",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      id: "mood",
      icon: Heart,
      labelKey: "dashboard.quickStats.mood",
      value: mood ? t(`dashboard.quickStats.moods.${mood.toLowerCase()}`, mood) : "—",
      unit: "",
      href: "/tools/mental-health-coach",
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      id: "water",
      icon: Droplets,
      labelKey: "dashboard.quickStats.water",
      value: `${waterGlasses}/8`,
      unit: "",
      href: "#hydration-tracker",
      color: "text-primary",
      bg: "bg-primary/8",
    },
  ];

  return (
    <div className="space-y-2">
      {/* 4 compact stat cards in 2x2 grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {stats.map((stat, i) => {
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Link
                to={stat.href}
                className="flex flex-col items-center p-3 rounded-xl bg-card border border-border/40 hover:border-primary/30 transition-all group text-center min-h-[68px] justify-center"
              >
                <p className={`text-base font-bold leading-none group-hover:text-primary transition-colors ${stat.color}`}>
                  {stat.value}
                  {stat.unit && <span className="text-[10px] font-medium text-muted-foreground ms-0.5">{stat.unit}</span>}
                </p>
                <p className="text-[11px] text-foreground/60 font-medium mt-1.5 leading-tight whitespace-normal break-words overflow-wrap-anywhere w-full">{t(stat.labelKey)}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* BMI + Appointment row */}
      {(bmi !== null || nextAppointment) && (
        <div className="flex gap-1.5">
          {bmi !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex-1"
            >
              <Link
                to="/settings"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/40 hover:border-primary/30 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Ruler className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-muted-foreground">{t("dashboard.quickStats.bmi", "BMI")}</p>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-none">
                    {bmi}
                    <span className={`text-[9px] font-medium ms-1 ${
                      bmi < 18.5 ? 'text-primary' : bmi < 25 ? 'text-emerald-600' : bmi < 30 ? 'text-amber-600' : 'text-destructive'
                    }`}>
                      {bmi < 18.5
                        ? t("settings.profile.bmi.underweight", "↓")
                        : bmi < 25
                        ? "✓"
                        : bmi < 30
                        ? t("settings.profile.bmi.overweight", "↑")
                        : t("settings.profile.bmi.obese", "↑↑")}
                    </span>
                  </p>
                </div>
              </Link>
            </motion.div>
          )}

          {nextAppointment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1"
            >
              <Link
                to="/tools/ai-meal-suggestion"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all group"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-foreground group-hover:text-primary transition-colors leading-tight whitespace-normal break-words">
                    {t("dashboard.quickStats.nextAppointment")}
                  </p>
                  <p className="text-[9px] text-muted-foreground whitespace-normal break-words">{nextAppointment}</p>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}