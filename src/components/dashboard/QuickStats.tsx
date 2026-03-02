import { motion } from "framer-motion";
import { Scale, Activity, Heart, Droplets, Calendar, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface StatCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  value: string;
  subtextKey?: string;
  subtextParams?: Record<string, unknown>;
  href: string;
  colorClass: string;
}

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
  
  const stats: StatCard[] = [
    {
      id: "weight",
      icon: Scale,
      labelKey: "dashboard.quickStats.weight",
      value: weight > 0 ? `${weight} kg` : "—",
      subtextKey: "dashboard.quickStats.lastRecorded",
      href: "/tools/weight-gain",
      colorClass: "bg-primary/10 text-primary"
    },
    {
      id: "kicks",
      icon: Activity,
      labelKey: "dashboard.quickStats.kicksToday",
      value: kicks > 0 ? String(kicks) : "—",
      subtextKey: kicks >= 10 ? "dashboard.quickStats.goalReached" : "dashboard.quickStats.goal",
      subtextParams: { goal: 10 },
      href: "/tools/kick-counter",
      colorClass: "bg-primary/10 text-primary"
    },
    {
      id: "mood",
      icon: Heart,
      labelKey: "dashboard.quickStats.mood",
      value: mood ? t(`dashboard.quickStats.moods.${mood.toLowerCase()}`, mood) : "—",
      subtextKey: "dashboard.quickStats.howYouFeel",
      href: "/tools/mental-health-coach",
      colorClass: "bg-destructive/10 text-destructive"
    },
    {
      id: "water",
      icon: Droplets,
      labelKey: "dashboard.quickStats.water",
      value: `${waterGlasses}/8`,
      subtextKey: "dashboard.quickStats.glassesToday",
      href: "/tools/vitamin-tracker",
      colorClass: "bg-primary/8 text-primary"
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Link
              to={stat.href}
              className="block p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl ${stat.colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t(stat.labelKey)}</p>
                {stat.subtextKey && (
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    {t(stat.subtextKey, stat.subtextParams)}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        );
      })}

      {/* BMI Card - عرض فقط إذا توفر الوزن والطول */}
      {bmi !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="col-span-2"
        >
          <Link
            to="/settings"
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Ruler className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t("dashboard.quickStats.bmi", "BMI")}</p>
              <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{bmi}</p>
              <p className="text-[10px] text-muted-foreground/70">
                {bmi < 18.5
                  ? t("settings.profile.bmi.underweight", "Underweight")
                  : bmi < 25
                  ? t("settings.profile.bmi.normal", "Normal")
                  : bmi < 30
                  ? t("settings.profile.bmi.overweight", "Overweight")
                  : t("settings.profile.bmi.obese", "Obese")}
              </p>
            </div>
            <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              bmi < 18.5 ? 'bg-primary/10 text-primary'
              : bmi < 25  ? 'bg-primary/15 text-primary'
              : bmi < 30  ? 'bg-primary/10 text-primary'
              :             'bg-destructive/10 text-destructive'
            }`}>
              {bmi < 18.5 ? '↓' : bmi < 25 ? '✓' : '↑'}
            </div>
          </Link>
        </motion.div>
      )}

      {/* Next Appointment Card - Full width */}
      {nextAppointment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-2"
        >
          <Link
            to="/tools/smart-appointment-reminder"
            className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all group"
          >
            <div className="p-3 rounded-xl bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {t("dashboard.quickStats.nextAppointment")}
              </p>
              <p className="text-xs text-muted-foreground">{nextAppointment}</p>
            </div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
