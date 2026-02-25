import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CalendarIcon, Info, Droplets } from "lucide-react";
import { format } from "date-fns";
import { ToolFrame } from "@/components/ToolFrame";
import { RelatedToolLinks } from "@/components/RelatedToolLinks";

import { Card, CardContent } from "@/components/ui/card";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { VideoLibrary } from "@/components/VideoLibrary";
import { cycleTrackerVideosByLang } from "@/data/videoData";
import { useCycleData } from "@/hooks/useCycleData";
import { CycleCalendarView } from "@/components/cycle/CycleCalendarView";
import { CycleDaySheet } from "@/components/cycle/CycleDaySheet";
import { CycleDashboard } from "@/components/cycle/CycleDashboard";
import { CycleHistoryChart } from "@/components/cycle/CycleHistoryChart";
import { useToast } from "@/components/ui/use-toast";

export default function CycleTracker() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { dayLogs, stats, predictedDates, updateDay, deleteDay } = useCycleData();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  

  // Every tap opens the day sheet - simple and consistent
  const handleDayTap = (dateStr: string) => {
    setEditingDate(dateStr);
  };

  const handleSaveDay = (dateStr: string, log: import("@/hooks/useCycleData").DayLog) => {
    updateDay(dateStr, log);
    toast({ title: t('toolsInternal.cycleTracker.saved'), duration: 1500 });
  };

  const handleDeleteDay = (dateStr: string) => {
    deleteDay(dateStr);
    toast({ title: t('toolsInternal.cycleTracker.deleted'), duration: 1500 });
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
        {/* Instruction hint */}
        <div className="flex items-start gap-2.5 px-3 py-2 rounded-xl bg-primary/8 border border-primary/15">
          <Droplets className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t('toolsInternal.cycleTracker.calendarHintSimple', 'Tap any day to log your period, mood, and symptoms.')}
          </p>
        </div>

        {/* Calendar */}
        <CycleCalendarView
          dayLogs={dayLogs}
          predictedDates={predictedDates}
          onDayTap={handleDayTap}
        />

        {/* Dashboard or Empty State */}
        {stats ? (
          <CycleDashboard stats={stats} />
        ) : (
          <Card className="border-dashed border-2 border-primary/20 bg-primary/3">
            <CardContent className="py-6 text-center space-y-2">
              <CalendarIcon className="w-8 h-8 text-primary/40 mx-auto" />
              <p className="text-sm font-medium text-foreground">
                {t('toolsInternal.cycleTracker.emptyTitle', 'Start tracking your cycle')}
              </p>
              <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">
                {t('toolsInternal.cycleTracker.emptyDesc', 'Tap the days of your last period on the calendar above to get predictions and insights.')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Cycle History Chart */}
        {stats && stats.detectedCycles.length >= 2 && (
          <CycleHistoryChart cycles={stats.detectedCycles} avgCycle={stats.avgCycle} />
        )}

        {/* AI Analysis */}
        {stats && (
          <div>
            <AIInsightCard
              title={t('toolsInternal.cycleTracker.cycleInsights')}
              prompt={aiPrompt}
              variant="compact"
              buttonText={t('toolsInternal.cycleTracker.analyzePatterns')}
            />
          </div>
        )}

        {/* Videos */}
        <VideoLibrary
          videosByLang={cycleTrackerVideosByLang}
          title={t('toolsInternal.cycleTracker.videosTitle')}
          subtitle={t('toolsInternal.cycleTracker.videosSubtitle')}
        />

        <RelatedToolLinks links={[
          { to: "/tools/due-date-calculator", titleKey: "toolsInternal.cycleTracker.dueDateLink", titleFallback: "Due Date Calculator", descKey: "toolsInternal.cycleTracker.dueDateLinkDesc", descFallback: "Calculate your expected due date", icon: "calendar" },
        ]} />

        {/* Tip */}
        <div className="flex items-start gap-2.5 rounded-xl bg-muted/50 p-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t('toolsInternal.cycleTracker.trackTip')}
          </p>
        </div>
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
