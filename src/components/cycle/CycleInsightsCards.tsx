import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Calendar, TrendingUp } from "lucide-react";
import type { CycleStats } from "@/hooks/useCycleData";
import { phaseTheme } from "./CycleHeroCircle";

interface Props {
  stats: CycleStats;
}

export function CycleInsightsCards({ stats }: Props) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const theme = phaseTheme[stats.phase];

  const cards = [
    {
      label: t('toolsInternal.cycleTracker.fertileWindowDates'),
      value: `${formatLocalized(stats.fertileStart, "MMM d", currentLanguage)} – ${formatLocalized(stats.fertileEnd, "d", currentLanguage)}`,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/8 border-violet-200/40 dark:border-violet-800/30",
    },
    {
      label: t('toolsInternal.cycleTracker.ovulationDate'),
      value: formatLocalized(stats.ovulationDay, "MMM d", currentLanguage),
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/8 border-violet-200/40 dark:border-violet-800/30",
    },
    {
      label: t('toolsInternal.cycleTracker.nextPeriodDate'),
      value: formatLocalized(stats.nextPeriod, "MMM d", currentLanguage),
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/8 border-rose-200/40 dark:border-rose-800/30",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Key dates */}
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className={cn("rounded-2xl border p-3 text-center", card.bg)}
          >
            <p className="text-[10px] text-muted-foreground font-medium mb-1">{card.label}</p>
            <p className={cn("text-xs font-bold", card.color)}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between rounded-2xl bg-muted/30 border border-border/40 px-4 py-3"
      >
        <div className="text-center flex-1">
          <p className="text-base font-bold text-foreground">{stats.avgCycle}</p>
          <p className="text-[10px] text-muted-foreground font-medium">{t('toolsInternal.cycleTracker.avgCycleLength')}</p>
        </div>
        <div className="w-px h-8 bg-border/40" />
        <div className="text-center flex-1">
          <p className="text-base font-bold text-foreground">{stats.avgPeriod}</p>
          <p className="text-[10px] text-muted-foreground font-medium">{t('toolsInternal.cycleTracker.avgPeriodLength')}</p>
        </div>
        <div className="w-px h-8 bg-border/40" />
        <div className="text-center flex-1">
          <p className={cn("text-xs font-bold", stats.isRegular ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
            {stats.isRegular ? t('toolsInternal.cycleTracker.regular') : t('toolsInternal.cycleTracker.irregular')}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">{t('toolsInternal.cycleTracker.regularity')}</p>
        </div>
      </motion.div>

      {/* Phase description */}
      <motion.div
        key={stats.phase}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border/40 p-3.5"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className={cn("w-2 h-2 rounded-full", theme.dotBg)} />
          <span className="text-xs font-bold text-foreground">
            {t(`toolsInternal.cycleTracker.${stats.phase}`)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t(`toolsInternal.cycleTracker.phaseDescription.${stats.phase}`)}
        </p>
      </motion.div>
    </div>
  );
}
