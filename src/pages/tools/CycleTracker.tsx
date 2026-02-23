import { useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Activity, Brain, CalendarIcon, Info } from "lucide-react";
import { format } from "date-fns";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
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
  const { dayLogs, stats, predictedDates, toggleDay, updateDay, deleteDay } = useCycleData();
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);

  const handleDayTap = (dateStr: string) => {
    // If day is already logged, open editor for edit/delete
    if (dayLogs[dateStr]?.flow) {
      setEditingDate(dateStr);
      return;
    }
    // Otherwise toggle period marking
    toggleDay(dateStr);
    toast({
      title: t('toolsInternal.cycleTracker.dayMarked', 'Period day marked'),
      duration: 1500,
    });
  };

  const handleDayLongPress = (dateStr: string) => {
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

  const scrollToAI = () => {
    aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-primary/8 border border-primary/15">
          <Activity className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-foreground">
              {t('toolsInternal.cycleTracker.calendarHintTitle', 'How to use')}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t('toolsInternal.cycleTracker.calendarHint', 'Tap a day to mark your period. Tap a marked day to edit or delete it.')}
            </p>
          </div>
        </div>

        {/* Calendar */}
        <CycleCalendarView
          dayLogs={dayLogs}
          predictedDates={predictedDates}
          onDayTap={handleDayTap}
          onDayLongPress={handleDayLongPress}
        />

        {/* Dashboard */}
        {stats ? (
          <CycleDashboard stats={stats} />
        ) : (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="py-8 text-center">
              <CalendarIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t('toolsInternal.cycleTracker.noDataYet')}</p>
            </CardContent>
          </Card>
        )}

        {/* Cycle History Chart */}
        {stats && stats.detectedCycles.length >= 2 && (
          <CycleHistoryChart cycles={stats.detectedCycles} avgCycle={stats.avgCycle} />
        )}

        {/* AI Analysis */}
        {stats && (
          <div ref={aiSectionRef}>
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

      {/* Sticky AI Button */}
      {stats && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40"
        >
          <Button
            onClick={scrollToAI}
            className="h-10 px-5 rounded-full shadow-lg shadow-primary/25 gap-2 text-sm"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))',
            }}
          >
            <Brain className="w-4 h-4" />
            {t('toolsInternal.cycleTracker.stickyAnalyze')}
          </Button>
        </motion.div>
      )}
    </ToolFrame>
  );
}
