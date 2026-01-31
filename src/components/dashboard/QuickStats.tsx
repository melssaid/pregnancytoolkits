import { motion } from "framer-motion";
import { Scale, Activity, Heart, Droplets, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface StatCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext?: string;
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
  mood = "Good",
  waterGlasses = 0,
  nextAppointment
}: QuickStatsProps) {
  const stats: StatCard[] = [
    {
      id: "weight",
      icon: Scale,
      label: "Weight",
      value: weight > 0 ? `${weight} kg` : "—",
      subtext: "Last recorded",
      href: "/tools/weight-gain",
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: "kicks",
      icon: Activity,
      label: "Kicks Today",
      value: kicks > 0 ? String(kicks) : "—",
      subtext: kicks >= 10 ? "Goal reached!" : "Goal: 10",
      href: "/tools/kick-counter",
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "mood",
      icon: Heart,
      label: "Mood",
      value: mood || "—",
      subtext: "How you feel",
      href: "/tools/mental-health-coach",
      color: "from-pink-500 to-rose-500"
    },
    {
      id: "water",
      icon: Droplets,
      label: "Water",
      value: `${waterGlasses}/10`,
      subtext: "Glasses today",
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
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                {stat.subtext && (
                  <p className="text-[10px] text-muted-foreground/70 mt-1">{stat.subtext}</p>
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
                Next Appointment
              </p>
              <p className="text-xs text-muted-foreground">{nextAppointment}</p>
            </div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
