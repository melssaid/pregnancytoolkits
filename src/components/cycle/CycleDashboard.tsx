import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Target, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { CyclePhaseRing } from "./CyclePhaseRing";
import type { CycleStats } from "@/hooks/useCycleData";

interface Props {
  stats: CycleStats;
}

export function CycleDashboard({ stats }: Props) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();

  const shareStats = async () => {
    const text = `${t('toolsInternal.cycleTracker.yourStatistics')}\n\n${t('toolsInternal.cycleTracker.avgCycleLength')}: ${stats.avgCycle} ${t('toolsInternal.cycleTracker.days')}\n${t('toolsInternal.cycleTracker.nextPeriod')}: ${formatLocalized(stats.nextPeriod, "MMMM d, yyyy", currentLanguage)}\n\n— via Pregnancy Toolkits`;
    if (navigator.share) {
      try { await navigator.share({ title: t('toolsInternal.cycleTracker.yourStatistics'), text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: t('toolsInternal.cycleTracker.copied'), description: t('toolsInternal.cycleTracker.copiedDesc') });
    }
  };

  return (
    <Card className="overflow-hidden border-border">
      <CardContent className="pt-5 pb-4 space-y-5">
        {/* Phase Ring */}
        <CyclePhaseRing phase={stats.phase} day={stats.cycleDay} avgCycle={stats.avgCycle} />

        <motion.p
          key={stats.phase}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-xs text-center text-foreground/70 max-w-xs mx-auto leading-relaxed"
        >
          {t(`toolsInternal.cycleTracker.phaseDescription.${stats.phase}`)}
        </motion.p>

        {/* Two main countdowns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-pink-200/50 dark:border-pink-800/30 bg-pink-500/5 p-3.5 text-center">
            <Target className="w-5 h-5 text-pink-500 mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-foreground tabular-nums">{stats.daysToOv}</p>
            <p className="text-xs text-foreground/60 mt-0.5">{t('toolsInternal.cycleTracker.daysUntilOvulation')}</p>
          </div>
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 text-center">
            <Droplets className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-2xl font-bold text-foreground tabular-nums">{stats.daysToPeriod}</p>
            <p className="text-xs text-foreground/60 mt-0.5">{t('toolsInternal.cycleTracker.daysUntilPeriod')}</p>
          </div>
        </div>

        {/* Key dates row */}
        <div className="flex items-center justify-between px-1 py-3 border-t border-b border-border/50">
          <div className="text-center flex-1">
            <p className="text-[10px] text-foreground/50 font-medium">{t('toolsInternal.cycleTracker.fertileWindowDates')}</p>
            <p className="text-xs font-bold text-foreground mt-1">
              {formatLocalized(stats.fertileStart, "MMM d", currentLanguage)} – {formatLocalized(stats.fertileEnd, "d", currentLanguage)}
            </p>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="text-center flex-1">
            <p className="text-[10px] text-foreground/50 font-medium">{t('toolsInternal.cycleTracker.ovulationDate')}</p>
            <p className="text-xs font-bold text-pink-600 dark:text-pink-400 mt-1">
              {formatLocalized(stats.ovulationDay, "MMM d", currentLanguage)}
            </p>
          </div>
          <div className="w-px h-8 bg-border/50" />
          <div className="text-center flex-1">
            <p className="text-[10px] text-foreground/50 font-medium">{t('toolsInternal.cycleTracker.nextPeriodDate')}</p>
            <p className="text-xs font-bold text-primary mt-1">
              {formatLocalized(stats.nextPeriod, "MMM d", currentLanguage)}
            </p>
          </div>
        </div>

        {/* Compact stats */}
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <p className="text-base font-bold text-foreground">{stats.avgCycle}</p>
            <p className="text-[10px] text-foreground/50 font-medium">{t('toolsInternal.cycleTracker.avgCycleLength')}</p>
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-foreground">{stats.avgPeriod}</p>
            <p className="text-[10px] text-foreground/50 font-medium">{t('toolsInternal.cycleTracker.avgPeriodLength')}</p>
          </div>
          <div className="flex-1">
            <p className={cn("text-xs font-bold", stats.isRegular ? "text-emerald-600" : "text-amber-600")}>
              {stats.isRegular ? t('toolsInternal.cycleTracker.regular') : t('toolsInternal.cycleTracker.irregular')}
            </p>
            <p className="text-[10px] text-foreground/50 font-medium">{t('toolsInternal.cycleTracker.regularity')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
