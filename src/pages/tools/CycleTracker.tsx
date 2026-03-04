import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Info, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { ToolFrame } from "@/components/ToolFrame";



import { Button } from "@/components/ui/button";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { VideoLibrary } from "@/components/VideoLibrary";
import { cycleTrackerVideosByLang } from "@/data/videoData";
import { useCycleData } from "@/hooks/useCycleData";
import { CycleCalendarView } from "@/components/cycle/CycleCalendarView";
import { CycleDaySheet } from "@/components/cycle/CycleDaySheet";
import { CycleHeroCircle } from "@/components/cycle/CycleHeroCircle";
import { CycleInsightsCards } from "@/components/cycle/CycleInsightsCards";
import { CycleHistoryChart } from "@/components/cycle/CycleHistoryChart";
import { CycleSetupWizard } from "@/components/cycle/CycleSetupWizard";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CycleTracker() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  const { dayLogs, isSetupDone, stats, predictedDates, saveSetup, updateDay, deleteDay, clearAll } = useCycleData();
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const handleDayTap = (dateStr: string) => setEditingDate(dateStr);

  const handleSaveDay = (dateStr: string, log: import("@/hooks/useCycleData").DayLog) => {
    updateDay(dateStr, log);
    toast({ title: t('toolsInternal.cycleTracker.saved'), duration: 1500 });
  };

  const handleDeleteDay = (dateStr: string) => {
    deleteDay(dateStr);
    toast({ title: t('toolsInternal.cycleTracker.deleted'), duration: 1500 });
  };

  const handleLogPeriod = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setEditingDate(today);
  };

  const getSymptomLabel = (key: string) => t(`toolsInternal.cycleTracker.symptomOptions.${key}`, key);

  const aiPrompt = useMemo(() => {
    if (!stats) return '';
    return `Analyze my menstrual cycle patterns:
- Average cycle length: ${stats.avgCycle} days
- Average period length: ${stats.avgPeriod} days
- Cycle regularity: ${stats.isRegular ? 'Regular' : 'Irregular'}
- Current phase: ${stats.phase} (day ${stats.cycleDay})
- Next ovulation: ${format(stats.ovulationDay, "yyyy-MM-dd")}
- Next period: ${format(stats.nextPeriod, "yyyy-MM-dd")}
- Total cycles tracked: ${stats.detectedCycles.length}

Recent cycle data:
${stats.detectedCycles.slice(-5).reverse().map((c) => {
  const logsInPeriod = Object.entries(dayLogs)
    .filter(([d]) => d >= c.startDate && d <= c.endDate)
    .map(([, log]) => log);
  const symptoms = [...new Set(logsInPeriod.flatMap(l => l.symptoms || []))];
  return `- ${c.startDate} to ${c.endDate}: ${c.periodLength} days${c.cycleLength ? `, ${c.cycleLength} day cycle` : ''}${symptoms.length ? `, symptoms: ${symptoms.map(s => getSymptomLabel(s)).join(', ')}` : ''}`;
}).join('\n')}

Please provide:
## Pattern Analysis
Analyze my cycle regularity and patterns

## Predictions
Insights about my upcoming cycles

## Health Tips
Personalized tips based on my cycle patterns and symptoms

## Things to Watch
Any patterns that might be worth discussing with a doctor`;
  }, [stats, dayLogs, t]);

  return (
    <ToolFrame
      title={t('toolsInternal.cycleTracker.title')}
      subtitle={t('toolsInternal.cycleTracker.subtitle')}
      customIcon="calendar"
      mood="nurturing"
      toolId="cycle-tracker"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-5 pb-16"
      >
        {/* Setup Wizard or Main Content */}
        {!isSetupDone ? (
          <CycleSetupWizard onComplete={saveSetup} />
        ) : (
          <>
            {/* Hero Circle */}
            {stats && (
              <CycleHeroCircle
                phase={stats.phase}
                day={stats.cycleDay}
                avgCycle={stats.avgCycle}
                daysUntilPeriod={stats.daysToPeriod}
                daysUntilOvulation={stats.daysToOv}
                nextPeriodLabel={formatLocalized(stats.nextPeriod, "MMM d", currentLanguage)}
                ovulationLabel={formatLocalized(stats.ovulationDay, "MMM d", currentLanguage)}
                isRegular={stats.isRegular}
                avgPeriod={stats.avgPeriod}
              />
            )}

            {/* Cycle History Chart */}
            {stats && stats.detectedCycles.length >= 2 && (
              <CycleHistoryChart cycles={stats.detectedCycles} avgCycle={stats.avgCycle} />
            )}

            {/* AI Analysis */}
            {stats && (
              <AIInsightCard
                title={t('toolsInternal.cycleTracker.cycleInsights')}
                prompt={aiPrompt}
                variant="compact"
                buttonText={t('toolsInternal.cycleTracker.analyzePatterns')}
              />
            )}

            {/* Clear All Data */}
            {Object.keys(dayLogs).length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10 h-11">
                    <Trash2 className="w-4 h-4 me-2" />
                    {t('toolsInternal.cycleTracker.clearAll', 'Clear All Data & Start Over')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('toolsInternal.cycleTracker.clearAllTitle', 'Clear all cycle data?')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('toolsInternal.cycleTracker.clearAllDesc', 'This will permanently delete all your tracked periods, symptoms, and predictions. This action cannot be undone.')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">{t('toolsInternal.cycleTracker.cancel', 'Cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                      onClick={() => {
                        clearAll();
                        toast({ title: t('toolsInternal.cycleTracker.clearedSuccess', 'All data cleared successfully'), duration: 2000 });
                      }}
                    >
                      {t('toolsInternal.cycleTracker.confirmClear', 'Yes, clear everything')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Videos */}
            <VideoLibrary
              videosByLang={cycleTrackerVideosByLang}
              title={t('toolsInternal.cycleTracker.videosTitle')}
              subtitle={t('toolsInternal.cycleTracker.videosSubtitle')}
            />

            {/* Tip */}
            <div className="flex items-start gap-2.5 rounded-2xl bg-muted/40 p-4">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('toolsInternal.cycleTracker.trackTip')}
              </p>
            </div>


          </>
        )}
      </motion.div>

      {/* Day Editor Sheet */}
      <CycleDaySheet
        open={!!editingDate}
        dateStr={editingDate || ""}
        currentLog={editingDate ? dayLogs[editingDate] : undefined}
        onSave={handleSaveDay}
        onDelete={handleDeleteDay}
        onClose={() => setEditingDate(null)}
      />
    </ToolFrame>
  );
}
