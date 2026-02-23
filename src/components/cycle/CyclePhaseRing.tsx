import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Droplets, Heart, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CyclePhase } from "@/hooks/useCycleData";

const phaseConfig: Record<CyclePhase, { icon: typeof Droplets; gradient: string; ring: string }> = {
  menstrual:  { icon: Droplets, gradient: "from-red-500/15 to-red-600/5",  ring: "text-red-500" },
  follicular: { icon: Sun,      gradient: "from-amber-500/15 to-amber-600/5", ring: "text-amber-500" },
  ovulation:  { icon: Heart,    gradient: "from-pink-500/15 to-pink-600/5", ring: "text-pink-500" },
  luteal:     { icon: Moon,     gradient: "from-indigo-500/15 to-indigo-600/5", ring: "text-indigo-500" },
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
  const PhaseIcon = phaseConfig[phase].icon;
  const phases: CyclePhase[] = ["menstrual", "follicular", "ovulation", "luteal"];

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {phases.map((p) => {
          const [startAngle, endAngle] = phaseAngles[p];
          const segAngle = endAngle - startAngle;
          const segLength = (segAngle / 360) * circ;
          const offset = ((360 - startAngle) / 360) * circ;
          const isActive = p === phase;
          return (
            <circle
              key={p} cx="60" cy="60" r={r} fill="none"
              strokeWidth={isActive ? 7 : 5} stroke="currentColor"
              className={cn("transition-all duration-500", isActive ? phaseConfig[p].ring : "text-muted/20")}
              strokeDasharray={`${segLength - 3} ${circ - segLength + 3}`}
              strokeDashoffset={offset} strokeLinecap="round"
              opacity={isActive ? 1 : 0.4}
            />
          );
        })}
        <motion.circle
          cx="60" cy="60" r={r - 10} fill="none" strokeWidth="3"
          stroke="currentColor" className={phaseConfig[phase].ring}
          strokeDasharray={circ * 0.72} strokeLinecap="round"
          initial={{ strokeDashoffset: circ * 0.72 }}
          animate={{ strokeDashoffset: circ * 0.72 * (1 - progress) }}
          transition={{ duration: 1.2, ease: "easeOut" }} opacity={0.3}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className={cn("w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br", phaseConfig[phase].gradient)}
        >
          <PhaseIcon className={cn("w-4 h-4", phaseConfig[phase].ring)} />
        </motion.div>
        <p className="text-[11px] font-bold text-foreground mt-1">{t(`toolsInternal.cycleTracker.${phase}`)}</p>
        <p className="text-[9px] text-muted-foreground">{t('toolsInternal.cycleTracker.cycleDay', { day })}</p>
      </div>
    </div>
  );
}
