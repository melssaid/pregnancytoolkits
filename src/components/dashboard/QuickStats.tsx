import { motion } from "framer-motion";
import { Scale, Activity, Heart, Droplets, Calendar } from "lucide-react";
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
  color: string;
}

interface QuickStatsProps {
  weight?: number;
  kicks?: number;
  mood?: string;
  waterGlasses?: number;
  nextAppointment?: string;
}

export function QuickStats({ 
  weight = 0, 
  kicks = 0, 
  mood = "",
  waterGlasses = 0,
  nextAppointment
}: QuickStatsProps) {
  const { t } = useTranslation();
  
  const stats: StatCard[] = [
    {
      id: "weight",
      icon: Scale,
      labelKey: "dashboard.quickStats.weight",
      value: weight > 0 ? `${weight} kg` : "—",
      subtextKey: "dashboard.quickStats.lastRecorded",
      href: "/tools/weight-gain",
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: "kicks",
      icon: Activity,
      labelKey: "dashboard.quickStats.kicksToday",
      value: kicks > 0 ? String(kicks) : "—",
      subtextKey: kicks >= 10 ? "dashboard.quickStats.goalReached" : "dashboard.quickStats.goal",
      subtextParams: { goal: 10 },
      href: "/tools/kick-counter",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "mood",
      icon: Heart,
      labelKey: "dashboard.quickStats.mood",
      value: mood ? t(`dashboard.quickStats.moods.${mood.toLowerCase()}`, mood) : "—",
      subtextKey: "dashboard.quickStats.howYouFeel",
      href: "/tools/mental-health-coach",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: "water",
      icon: Droplets,
      labelKey: "dashboard.quickStats.water",
      value: `${waterGlasses}/10`,
      subtextKey: "dashboard.quickStats.glassesToday",
      href: "/tools/vitamin-tracker",
      color: "from-cyan-500 to-blue-500"
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
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <Icon className="w-4 h-4 text-white" />
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
            className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all group"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Calendar className="w-5 h-5 text-primary-foreground" />
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
