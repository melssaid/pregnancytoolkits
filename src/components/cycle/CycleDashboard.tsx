import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Target, Droplets, Share2 } from "lucide-react";
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
      <CardContent className="pt-5 pb-4 space-y-4">
        {/* Phase Ring */}
        <CyclePhaseRing phase={stats.phase} day={stats.cycleDay} avgCycle={stats.avgCycle} />

        <motion.p
          key={stats.phase}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-[11px] text-center text-muted-foreground max-w-xs mx-auto leading-relaxed"
        >
          {t(`toolsInternal.cycleTracker.phaseDescription.${stats.phase}`)}
        </motion.p>

        {/* Two main countdowns */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-pink-200/40 dark:border-pink-800/30 bg-pink-500/5 p-3 text-center">
            <Target className="w-4 h-4 text-pink-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground tabular-nums">{stats.daysToOv}</p>
            <p className="text-[10px] text-muted-foreground">{t('toolsInternal.cycleTracker.daysUntilOvulation')}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
            <Droplets className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground tabular-nums">{stats.daysToPeriod}</p>
            <p className="text-[10px] text-muted-foreground">{t('toolsInternal.cycleTracker.daysUntilPeriod')}</p>
          </div>
        </div>

        {/* Key dates row */}
        <div className="flex items-center justify-between px-1 py-2 border-t border-b border-border/50">
          <div className="text-center flex-1">
            <p className="text-[9px] text-muted-foreground">{t('toolsInternal.cycleTracker.fertileWindowDates')}</p>
            <p className="text-[11px] font-semibold text-foreground mt-0.5">
              {formatLocalized(stats.fertileStart, "MMM d", currentLanguage)} – {formatLocalized(stats.fertileEnd, "d", currentLanguage)}
            </p>
          </div>
          <div className="w-px h-6 bg-border/50" />
          <div className="text-center flex-1">
            <p className="text-[9px] text-muted-foreground">{t('toolsInternal.cycleTracker.ovulationDate')}</p>
            <p className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 mt-0.5">
              {formatLocalized(stats.ovulationDay, "MMM d", currentLanguage)}
            </p>
          </div>
          <div className="w-px h-6 bg-border/50" />
          <div className="text-center flex-1">
            <p className="text-[9px] text-muted-foreground">{t('toolsInternal.cycleTracker.nextPeriodDate')}</p>
            <p className="text-[11px] font-semibold text-primary mt-0.5">
              {formatLocalized(stats.nextPeriod, "MMM d", currentLanguage)}
            </p>
          </div>
        </div>

        {/* Compact stats + share */}
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{stats.avgCycle}</p>
            <p className="text-[8px] text-muted-foreground">{t('toolsInternal.cycleTracker.avgCycleLength')}</p>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{stats.avgPeriod}</p>
            <p className="text-[8px] text-muted-foreground">{t('toolsInternal.cycleTracker.avgPeriodLength')}</p>
          </div>
          <div className="flex-1">
            <p className={cn("text-[10px] font-semibold", stats.isRegular ? "text-emerald-600" : "text-amber-600")}>
              {stats.isRegular ? t('toolsInternal.cycleTracker.regular') : t('toolsInternal.cycleTracker.irregular')}
            </p>
            <p className="text-[8px] text-muted-foreground">{t('toolsInternal.cycleTracker.regularity')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={shareStats} className="h-8 w-8 text-muted-foreground shrink-0">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
