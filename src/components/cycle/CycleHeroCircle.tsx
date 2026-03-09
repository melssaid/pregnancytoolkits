import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Droplets, Heart, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CyclePhase } from "@/hooks/useCycleData";
import { useEffect, useRef } from "react";

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

const phaseSegments: { phase: CyclePhase; startAngle: number; endAngle: number; stroke: string }[] = [
  { phase: "menstrual", startAngle: 0, endAngle: 90, stroke: "#f43f5e" },
  { phase: "follicular", startAngle: 90, endAngle: 180, stroke: "#f59e0b" },
  { phase: "ovulation", startAngle: 180, endAngle: 270, stroke: "#8b5cf6" },
  { phase: "luteal", startAngle: 270, endAngle: 360, stroke: "#6366f1" },
];

interface Props {
  phase: CyclePhase;
  day: number;
  avgCycle: number;
  daysUntilPeriod: number;
  daysUntilOvulation: number;
  nextPeriodLabel?: string;
  ovulationLabel?: string;
  fertileLabel?: string;
  isRegular?: boolean;
  avgPeriod?: number;
}

/* Animated number that counts up */
function CountUpNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    return controls.stop;
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = String(v);
    });
    return unsub;
  }, [rounded]);

  return <span ref={ref}>0</span>;
}

/* SVG arc path helper */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const rad = (a: number) => ((a - 90) * Math.PI) / 180;
  const start = { x: cx + r * Math.cos(rad(endAngle)), y: cy + r * Math.sin(rad(endAngle)) };
  const end = { x: cx + r * Math.cos(rad(startAngle)), y: cy + r * Math.sin(rad(startAngle)) };
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export function CycleHeroCircle({ phase, day, avgCycle, daysUntilPeriod, daysUntilOvulation, nextPeriodLabel, ovulationLabel, fertileLabel, isRegular, avgPeriod }: Props) {
  const { t } = useTranslation();
  const theme = phaseTheme[phase];
  const PhaseIcon = theme.icon;
  const progress = Math.min(day / avgCycle, 1);

  const r = 88;
  const cx = 100, cy = 100;

  // Glowing dot position at the tip of progress arc
  const progressAngle = progress * 360;
  const dotRad = ((progressAngle - 90) * Math.PI) / 180;
  const dotX = cx + r * Math.cos(dotRad);
  const dotY = cy + r * Math.sin(dotRad);

  const smoothEase = [0.25, 0.46, 0.45, 0.94] as const;

  return (
    <div className="flex flex-col items-center py-4">
      {/* Radial glow background */}
      <div className="relative w-60 h-60">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: smoothEase }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${theme.ringStroke}12 0%, transparent 70%)`,
          }}
        />

        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: `${theme.ringStroke}20` }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.15, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <svg className="w-full h-full relative z-10" viewBox="0 0 200 200">
          <defs>
            <filter id="heroGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={`progressGrad-${phase}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.ringStroke} stopOpacity="1" />
              <stop offset="100%" stopColor={theme.ringStroke} stopOpacity="0.5" />
            </linearGradient>
            <filter id="dotGlow">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>

          {/* Multi-phase background segments */}
          {phaseSegments.map((seg, i) => {
            const isActive = seg.phase === phase;
            const gap = 4;
            const d = describeArc(cx, cy, r, seg.startAngle + gap / 2, seg.endAngle - gap / 2);
            return (
              <motion.path
                key={seg.phase}
                d={d}
                fill="none"
                stroke={seg.stroke}
                strokeWidth={isActive ? 7 : 3.5}
                strokeLinecap="round"
                opacity={isActive ? 0.9 : 0.2}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.15,
                  ease: smoothEase,
                }}
                filter={isActive ? "url(#heroGlow)" : undefined}
              />
            );
          })}

          {/* Inner progress arc */}
          <motion.circle
            cx={cx} cy={cy} r={r - 14} fill="none"
            strokeWidth="3"
            stroke={`url(#progressGrad-${phase})`}
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * (r - 14)}
            style={{ rotate: "-90deg", transformOrigin: "center" }}
            initial={{ strokeDashoffset: 2 * Math.PI * (r - 14) }}
            animate={{ strokeDashoffset: 2 * Math.PI * (r - 14) * (1 - progress) }}
            transition={{ duration: 1.6, ease: smoothEase }}
            opacity={0.3}
          />

          {/* Glowing dot at progress tip */}
          <motion.circle
            cx={dotX} cy={dotY} r="5"
            fill={theme.ringStroke}
            filter="url(#dotGlow)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.6, 1, 0.6], scale: 1 }}
            transition={{
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 0.8, delay: 1.2, ease: smoothEase },
            }}
          />
          <motion.circle
            cx={dotX} cy={dotY} r="3"
            fill="white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ delay: 1.3, duration: 0.4 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-1"
              style={{ backgroundColor: `${theme.ringStroke}18` }}
            >
              <PhaseIcon className={cn("w-5.5 h-5.5", theme.color)} />
            </motion.div>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ease: smoothEase }}
            className="text-4xl font-extrabold text-foreground tabular-nums"
          >
            <CountUpNumber value={day} />
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-xs text-muted-foreground font-medium mt-0.5"
          >
            {t('toolsInternal.cycleTracker.cycleDay', { day })}
          </motion.p>
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className={cn("text-[11px] font-bold mt-1", theme.color)}
            >
              {t(`toolsInternal.cycleTracker.${phase}`)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Compact info strip */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, ease: smoothEase }}
        className="w-full max-w-xs mt-4 space-y-2"
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-xl bg-violet-500/8 border border-violet-200/30 dark:border-violet-800/20 px-3 py-2.5 text-center">
            <p className="text-3xl font-extrabold text-violet-600 dark:text-violet-400 tabular-nums">{daysUntilOvulation}</p>
            <p className="text-[9px] text-muted-foreground font-medium leading-tight">
              {t('toolsInternal.cycleTracker.daysUntilOvulation')}
            </p>
            {ovulationLabel && <p className="text-[9px] text-violet-500/70 mt-0.5">{ovulationLabel}</p>}
          </div>
          <div className="flex-1 rounded-xl bg-rose-500/8 border border-rose-200/30 dark:border-rose-800/20 px-3 py-2.5 text-center">
            <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">{daysUntilPeriod}</p>
            <p className="text-[9px] text-muted-foreground font-medium leading-tight">
              {t('toolsInternal.cycleTracker.daysUntilPeriod')}
            </p>
            {nextPeriodLabel && <p className="text-[9px] text-rose-500/70 mt-0.5">{nextPeriodLabel}</p>}
          </div>
        </div>

        {avgPeriod !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-between rounded-xl bg-muted/30 border border-border/30 px-3 py-2"
          >
            <div className="text-center flex-1">
              <p className="text-sm font-bold text-foreground">{avgCycle}</p>
              <p className="text-[9px] text-muted-foreground">{t('toolsInternal.cycleTracker.avgCycleLength')}</p>
            </div>
            <div className="w-px h-6 bg-border/40" />
            <div className="text-center flex-1">
              <p className="text-sm font-bold text-foreground">{avgPeriod}</p>
              <p className="text-[9px] text-muted-foreground">{t('toolsInternal.cycleTracker.avgPeriodLength')}</p>
            </div>
            <div className="w-px h-6 bg-border/40" />
            <div className="text-center flex-1">
              <p className={cn("text-[11px] font-bold", isRegular ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                {isRegular ? t('toolsInternal.cycleTracker.regular') : t('toolsInternal.cycleTracker.irregular')}
              </p>
              <p className="text-[9px] text-muted-foreground">{t('toolsInternal.cycleTracker.regularity')}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
