import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Target, Droplets, Share2, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { CyclePhaseRing } from "./CyclePhaseRing";
import type { CycleStats } from "@/hooks/useCycleData";
import { format } from "date-fns";

interface Props {
  stats: CycleStats;
}

export function CycleDashboard({ stats }: Props) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();

  const statusSummary = (() => {
    const phaseLabel = t(`toolsInternal.cycleTracker.${stats.phase}`);
    const nextDate = formatLocalized(stats.nextPeriod, "MMM d", currentLanguage);
    const ovDate = formatLocalized(stats.ovulationDay, "MMM d", currentLanguage);
    const fertileDate = formatLocalized(stats.fertileStart, "MMM d", currentLanguage);

    let fertileNote = '';
    if (stats.phase === 'ovulation' || (stats.daysToOv <= 2 && stats.daysToOv >= 0)) {
      fertileNote = t('toolsInternal.cycleTracker.fertileNoteActive', { ovDate });
    } else if (stats.daysToFertile > 0) {
      fertileNote = t('toolsInternal.cycleTracker.fertileNoteUpcoming', { fertileDate, days: stats.daysToFertile });
    } else {
      fertileNote = t('toolsInternal.cycleTracker.fertileNotePassed');
    }

    return t('toolsInternal.cycleTracker.statusSummary', {
      day: stats.cycleDay, phase: phaseLabel, avgCycle: stats.avgCycle,
      nextDate, fertileNote,
    });
  })();

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
    <div className="space-y-3">
      <Card className="overflow-hidden border-border">
        <CardContent className="pt-5 pb-4 space-y-4">
          <CyclePhaseRing phase={stats.phase} day={stats.cycleDay} avgCycle={stats.avgCycle} />

          <motion.p
            key={stats.phase}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-[11px] text-center text-muted-foreground max-w-xs mx-auto leading-relaxed"
          >
            {t(`toolsInternal.cycleTracker.phaseDescription.${stats.phase}`)}
          </motion.p>

          {/* Countdown cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-pink-200/40 dark:border-pink-800/30 bg-gradient-to-br from-pink-500/8 to-transparent p-3 text-center">
              <Target className="w-4 h-4 text-pink-500 mx-auto mb-1" />
              <p className="text-base font-bold text-foreground tabular-nums">{stats.daysToOv}</p>
              <p className="text-[10px] text-muted-foreground">{t('toolsInternal.cycleTracker.daysUntilOvulation')}</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/8 to-transparent p-3 text-center">
              <Droplets className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-base font-bold text-foreground tabular-nums">{stats.daysToPeriod}</p>
              <p className="text-[10px] text-muted-foreground">{t('toolsInternal.cycleTracker.daysUntilPeriod')}</p>
            </div>
          </div>

          {/* Key dates */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-[9px] text-muted-foreground mb-0.5">{t('toolsInternal.cycleTracker.fertileWindowDates')}</p>
              <p className="text-[11px] font-semibold text-foreground">
                {formatLocalized(stats.fertileStart, "MMM d", currentLanguage)} – {formatLocalized(stats.fertileEnd, "d", currentLanguage)}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-pink-500/8">
              <p className="text-[9px] text-muted-foreground mb-0.5">{t('toolsInternal.cycleTracker.ovulationDate')}</p>
              <p className="text-[11px] font-semibold text-pink-600 dark:text-pink-400">
                {formatLocalized(stats.ovulationDay, "MMM d", currentLanguage)}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg bg-primary/8">
              <p className="text-[9px] text-muted-foreground mb-0.5">{t('toolsInternal.cycleTracker.nextPeriodDate')}</p>
              <p className="text-[11px] font-semibold text-primary">
                {formatLocalized(stats.nextPeriod, "MMM d", currentLanguage)}
              </p>
            </div>
          </div>

          {/* Quick Stats bar */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <div className="rounded-lg bg-muted/40 p-2 text-center">
              <p className="text-xs font-bold text-foreground">{stats.avgCycle}</p>
              <p className="text-[8px] text-muted-foreground leading-tight">{t('toolsInternal.cycleTracker.avgCycleLength')}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2 text-center">
              <p className="text-xs font-bold text-foreground">{stats.avgPeriod}</p>
              <p className="text-[8px] text-muted-foreground leading-tight">{t('toolsInternal.cycleTracker.avgPeriodLength')}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2 text-center">
              <Badge variant="outline" className={cn("text-[8px] px-1", stats.isRegular ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>
                {stats.isRegular ? t('toolsInternal.cycleTracker.regular') : t('toolsInternal.cycleTracker.irregular')}
              </Badge>
              <p className="text-[8px] text-muted-foreground mt-0.5">{t('toolsInternal.cycleTracker.regularity')}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2 text-center">
              <p className="text-xs font-bold text-foreground">{stats.detectedCycles.length}</p>
              <p className="text-[8px] text-muted-foreground leading-tight">{t('toolsInternal.cycleTracker.cyclesTracked')}</p>
            </div>
          </div>

          {/* Share */}
          <Button variant="ghost" size="sm" onClick={shareStats} className="w-full gap-1.5 h-8 text-xs text-muted-foreground">
            <Share2 className="h-3.5 w-3.5" />
            {t('toolsInternal.cycleTracker.share')}
          </Button>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="border-primary/15 bg-gradient-to-br from-primary/4 to-transparent">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-foreground mb-1">
                {t('toolsInternal.cycleTracker.generalStatus')}
              </h3>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {statusSummary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
