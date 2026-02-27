import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Droplets, Heart, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CyclePhase } from "@/hooks/useCycleData";

export const phaseTheme: Record<CyclePhase, {
  icon: typeof Droplets;
  color: string;
  bg: string;
  ringStroke: string;
  gradientFrom: string;
  gradientTo: string;
  label: string;
  dotBg: string;
}> = {
  menstrual: {
    icon: Droplets,
    color: "text-rose-500",
    bg: "bg-rose-500",
    ringStroke: "#f43f5e",
    gradientFrom: "from-rose-100/80",
    gradientTo: "to-rose-50/40",
    label: "menstrual",
    dotBg: "bg-rose-500",
  },
  follicular: {
    icon: Sun,
    color: "text-amber-500",
    bg: "bg-amber-500",
    ringStroke: "#f59e0b",
    gradientFrom: "from-amber-100/60",
    gradientTo: "to-orange-50/30",
    label: "follicular",
    dotBg: "bg-amber-500",
  },
  ovulation: {
    icon: Heart,
    color: "text-violet-500",
    bg: "bg-violet-500",
    ringStroke: "#8b5cf6",
    gradientFrom: "from-violet-100/60",
    gradientTo: "to-purple-50/30",
    label: "ovulation",
    dotBg: "bg-violet-500",
  },
  luteal: {
    icon: Moon,
    color: "text-indigo-500",
    bg: "bg-indigo-500",
    ringStroke: "#6366f1",
    gradientFrom: "from-indigo-100/60",
    gradientTo: "to-blue-50/30",
    label: "luteal",
    dotBg: "bg-indigo-500",
  },
};

interface Props {
  phase: CyclePhase;
  day: number;
  avgCycle: number;
  daysUntilPeriod: number;
  daysUntilOvulation: number;
}

export function CycleHeroCircle({ phase, day, avgCycle, daysUntilPeriod, daysUntilOvulation }: Props) {
  const { t } = useTranslation();
  const theme = phaseTheme[phase];
  const PhaseIcon = theme.icon;
  const progress = Math.min(day / avgCycle, 1);
  
  const r = 90;
  const circ = 2 * Math.PI * r;
  const strokeDashoffset = circ * (1 - progress);

  // Background ring segments for all 4 phases
  const phases: CyclePhase[] = ["menstrual", "follicular", "ovulation", "luteal"];

  return (
    <div className="flex flex-col items-center py-4">
      {/* Main Circle */}
      <div className="relative w-56 h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background track */}
          <circle
            cx="100" cy="100" r={r} fill="none"
            strokeWidth="6" stroke="currentColor"
            className="text-muted/30"
          />
          {/* Progress arc */}
          <motion.circle
            cx="100" cy="100" r={r} fill="none"
            strokeWidth="7" stroke={theme.ringStroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            opacity={0.85}
          />
          {/* Glow circle */}
          <motion.circle
            cx="100" cy="100" r={r} fill="none"
            strokeWidth="12" stroke={theme.ringStroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            opacity={0.12}
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.3, stiffness: 180 }}
            className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-1", theme.bg, "bg-opacity-15")}
            style={{ backgroundColor: `${theme.ringStroke}15` }}
          >
            <PhaseIcon className={cn("w-5 h-5", theme.color)} />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-extrabold text-foreground tabular-nums"
          >
            {day}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-muted-foreground font-medium mt-0.5"
          >
            {t('toolsInternal.cycleTracker.cycleDay', { day })}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className={cn("text-[11px] font-bold mt-1", theme.color)}
          >
            {t(`toolsInternal.cycleTracker.${phase}`)}
          </motion.p>
        </div>
      </div>

      {/* Quick stats below circle */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-6 mt-3"
      >
        <div className="text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">{daysUntilOvulation}</p>
          <p className="text-[10px] text-muted-foreground font-medium">
            {t('toolsInternal.cycleTracker.daysUntilOvulation')}
          </p>
        </div>
        <div className="w-px h-8 bg-border/50" />
        <div className="text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">{daysUntilPeriod}</p>
          <p className="text-[10px] text-muted-foreground font-medium">
            {t('toolsInternal.cycleTracker.daysUntilPeriod')}
          </p>
        </div>
      </motion.div>

    </div>
  );
}
