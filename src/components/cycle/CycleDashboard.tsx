import { useTranslation } from "react-i18next";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Target, Droplets, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { CyclePhaseRing } from "./CyclePhaseRing";
import type { CycleStats } from "@/hooks/useCycleData";
import { useEffect, useRef } from "react";

function CountUpNumber({ value, className }: { value: number; className?: string }) {
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

  return <span ref={ref} className={className}>0</span>;
}

interface Props {
  stats: CycleStats;
}

const phaseAccentMap = {
  menstrual: "border-rose-200/50 dark:border-rose-800/30",
  follicular: "border-amber-200/50 dark:border-amber-800/30",
  ovulation: "border-violet-200/50 dark:border-violet-800/30",
  luteal: "border-indigo-200/50 dark:border-indigo-800/30",
};

export function CycleDashboard({ stats }: Props) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <Card className={cn("overflow-hidden rounded-3xl border-2 transition-colors duration-500", phaseAccentMap[stats.phase])}>
      <CardContent className="pt-5 pb-4 space-y-5">
        {/* Phase Ring */}
        <CyclePhaseRing phase={stats.phase} day={stats.cycleDay} avgCycle={stats.avgCycle} />

        <motion.p
          key={stats.phase}
          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs text-center text-muted-foreground max-w-[280px] mx-auto leading-relaxed"
        >
          {t(`toolsInternal.cycleTracker.phaseDescription.${stats.phase}`)}
        </motion.p>

        {/* Countdown cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-violet-200/50 dark:border-violet-800/30 bg-violet-500/5 p-3.5 text-center"
          >
            <Target className="w-5 h-5 text-violet-500 mx-auto mb-1.5" />
            <p className="text-4xl font-extrabold text-violet-600 dark:text-violet-400 tabular-nums tracking-tight">{stats.daysToOv}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
              {t('toolsInternal.cycleTracker.daysUntilOvulation')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-rose-200/50 dark:border-rose-800/30 bg-rose-500/5 p-3.5 text-center"
          >
            <Droplets className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
            <p className="text-4xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums tracking-tight">{stats.daysToPeriod}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
              {t('toolsInternal.cycleTracker.daysUntilPeriod')}
            </p>
          </motion.div>
        </div>

        {/* Key dates */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between px-1 py-3 border-t border-b border-border/40 rounded-xl"
        >
          <div className="text-center flex-1">
            <p className="text-[10px] text-muted-foreground font-medium">{t('toolsInternal.cycleTracker.fertileWindowDates')}</p>
            <p className="text-xs font-bold text-foreground mt-1">
              {formatLocalized(stats.fertileStart, "MMM d", currentLanguage)} – {formatLocalized(stats.fertileEnd, "d", currentLanguage)}
            </p>
          </div>
          <div className="w-px h-8 bg-border/40" />
          <div className="text-center flex-1">
            <p className="text-[10px] text-muted-foreground font-medium">{t('toolsInternal.cycleTracker.ovulationDate')}</p>
            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mt-1">
              {formatLocalized(stats.ovulationDay, "MMM d", currentLanguage)}
            </p>
          </div>
          <div className="w-px h-8 bg-border/40" />
          <div className="text-center flex-1">
            <p className="text-[10px] text-muted-foreground font-medium">{t('toolsInternal.cycleTracker.nextPeriodDate')}</p>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">
              {formatLocalized(stats.nextPeriod, "MMM d", currentLanguage)}
            </p>
          </div>
        </motion.div>

        {/* Compact stats */}
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <p className="text-2xl font-extrabold text-foreground tabular-nums">{stats.avgCycle}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{t('toolsInternal.cycleTracker.avgCycleLength')}</p>
          </div>
          <div className="flex-1">
            <p className="text-2xl font-extrabold text-foreground tabular-nums">{stats.avgPeriod}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{t('toolsInternal.cycleTracker.avgPeriodLength')}</p>
          </div>
          <div className="flex-1">
            <p className={cn("text-xs font-bold", stats.isRegular ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
              {stats.isRegular ? t('toolsInternal.cycleTracker.regular') : t('toolsInternal.cycleTracker.irregular')}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">{t('toolsInternal.cycleTracker.regularity')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
