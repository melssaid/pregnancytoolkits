import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Droplets, Heart, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CyclePhase } from "@/hooks/useCycleData";

const phaseConfig: Record<CyclePhase, { icon: typeof Droplets; label: string; gradient: string; ring: string; glow: string }> = {
  menstrual:  { icon: Droplets, label: "menstrual",  gradient: "from-rose-500/20 to-rose-600/5",  ring: "text-rose-500", glow: "shadow-rose-500/20" },
  follicular: { icon: Sun,      label: "follicular", gradient: "from-amber-500/20 to-amber-600/5", ring: "text-amber-500", glow: "shadow-amber-500/20" },
  ovulation:  { icon: Heart,    label: "ovulation",  gradient: "from-violet-500/20 to-violet-600/5", ring: "text-violet-500", glow: "shadow-violet-500/20" },
  luteal:     { icon: Moon,     label: "luteal",     gradient: "from-indigo-500/20 to-indigo-600/5", ring: "text-indigo-500", glow: "shadow-indigo-500/20" },
};

const phaseAngles: Record<CyclePhase, [number, number]> = {
  menstrual: [0, 90],
  follicular: [90, 180],
  ovulation: [180, 270],
  luteal: [270, 360],
};

interface Props {
  phase: CyclePhase;
  day: number;
  avgCycle: number;
}

export function CyclePhaseRing({ phase, day, avgCycle }: Props) {
  const { t } = useTranslation();
  const r = 52;
  const circ = 2 * Math.PI * r;
  const progress = Math.min(day / avgCycle, 1);
  const config = phaseConfig[phase];
  const PhaseIcon = config.icon;
  const phases: CyclePhase[] = ["menstrual", "follicular", "ovulation", "luteal"];

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Background segments */}
        {phases.map((p) => {
          const [startAngle, endAngle] = phaseAngles[p];
          const segAngle = endAngle - startAngle;
          const segLength = (segAngle / 360) * circ;
          const offset = ((360 - startAngle) / 360) * circ;
          const isActive = p === phase;
          return (
            <circle
              key={p} cx="60" cy="60" r={r} fill="none"
              strokeWidth={isActive ? 8 : 4} stroke="currentColor"
              className={cn("transition-all duration-700", isActive ? phaseConfig[p].ring : "text-muted-foreground/15")}
              strokeDasharray={`${segLength - 3} ${circ - segLength + 3}`}
              strokeDashoffset={offset} strokeLinecap="round"
              opacity={isActive ? 1 : 0.5}
            />
          );
        })}
        {/* Progress arc */}
        <motion.circle
          cx="60" cy="60" r={r - 11} fill="none" strokeWidth="3"
          stroke="currentColor" className={config.ring}
          strokeDasharray={circ * 0.72} strokeLinecap="round"
          initial={{ strokeDashoffset: circ * 0.72 }}
          animate={{ strokeDashoffset: circ * 0.72 * (1 - progress) }}
          transition={{ duration: 1.4, ease: "easeOut" }} opacity={0.25}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.15, stiffness: 200 }}
          className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg",
            config.gradient, config.glow
          )}
        >
          <PhaseIcon className={cn("w-5 h-5", config.ring)} />
        </motion.div>
        <p className="text-sm font-bold text-foreground mt-1.5">
          {t(`toolsInternal.cycleTracker.${phase}`)}
        </p>
        <p className="text-[11px] text-muted-foreground font-medium">
          {t('toolsInternal.cycleTracker.cycleDay', { day })}
        </p>
      </div>
    </div>
  );
}
