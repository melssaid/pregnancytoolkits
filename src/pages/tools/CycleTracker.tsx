import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Plus, Calendar as CalendarIcon, TrendingUp, Info, Share2, Trash2,
  Droplets, Heart, Moon, Sun, Target, ChevronDown, ChevronUp, Brain,
  FileText,
} from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, differenceInDays } from "date-fns";
import { formatLocalized, getDateLocale } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { VideoLibrary } from "@/components/VideoLibrary";
import { cycleTrackerVideosByLang } from "@/data/videoData";
import { cn } from "@/lib/utils";

interface CycleEntry {
  id: string;
  startDate: string;
  endDate?: string;
  flowIntensity: "light" | "medium" | "heavy";
  symptoms?: string[];
}

const STORAGE_KEY = "cycle-tracker-data";

const symptomKeys = [
  "cramps", "headache", "bloating", "moodSwings",
  "fatigue", "breastTenderness", "acne", "backPain",
];

const isValidCycles = (data: unknown): data is CycleEntry[] => {
  return Array.isArray(data) && data.every(item =>
    typeof item === 'object' && item !== null &&
    typeof (item as CycleEntry).id === 'string' &&
    typeof (item as CycleEntry).startDate === 'string'
  );
};

/* ── Phase utilities ── */
type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

function getCurrentPhase(lastStart: Date, avgCycle: number, avgPeriod: number): { phase: CyclePhase; day: number } {
  const today = new Date();
  const day = differenceInDays(today, lastStart) + 1;
  const ovDay = Math.round(avgCycle - 14);
  if (day <= avgPeriod) return { phase: "menstrual", day };
  if (day < ovDay - 2) return { phase: "follicular", day };
  if (day <= ovDay + 1) return { phase: "ovulation", day };
  return { phase: "luteal", day };
}

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

/* ── Phase Ring SVG ── */
function PhaseRing({ phase, day, avgCycle }: { phase: CyclePhase; day: number; avgCycle: number }) {
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

/* ── Main Component ── */
export default function CycleTracker() {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const { toast } = useToast();
  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [startPickerDate, setStartPickerDate] = useState<Date>();
  const [endPickerDate, setEndPickerDate] = useState<Date>();
  const [flowIntensity, setFlowIntensity] = useState<"light" | "medium" | "heavy">("medium");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const aiSectionRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const saved = safeParseLocalStorage<CycleEntry[]>(STORAGE_KEY, [], isValidCycles);
    setCycles(saved);
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage(STORAGE_KEY, cycles);
  }, [cycles]);

  const addCycle = () => {
    if (!startPickerDate) return;
    const newCycle: CycleEntry = {
      id: Date.now().toString(),
      startDate: format(startPickerDate, "yyyy-MM-dd"),
      endDate: endPickerDate ? format(endPickerDate, "yyyy-MM-dd") : undefined,
      flowIntensity,
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
    };
    setCycles(prev => [newCycle, ...prev].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 24));
    toast({ title: t('toolsInternal.cycleTracker.saved'), description: t('toolsInternal.cycleTracker.savedDesc') });
    setStartPickerDate(undefined);
    setEndPickerDate(undefined);
    setFlowIntensity("medium");
    setSelectedSymptoms([]);
    setShowForm(false);
  };

  const deleteCycle = (id: string) => {
    setCycles(prev => prev.filter(c => c.id !== id));
    toast({ title: t('toolsInternal.cycleTracker.deleted'), description: t('toolsInternal.cycleTracker.deletedDesc') });
  };

  const toggleSymptom = (s: string) =>
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const getSymptomLabel = (key: string) => t(`toolsInternal.cycleTracker.symptomOptions.${key}`, key);

  /* ── Computed stats ── */
  const stats = useMemo(() => {
    if (cycles.length < 2) return null;
    const cycleLengths: number[] = [];
    for (let i = 0; i < cycles.length - 1; i++) {
      const len = differenceInDays(new Date(cycles[i].startDate), new Date(cycles[i + 1].startDate));
      if (len > 0 && len < 60) cycleLengths.push(len);
    }
    if (!cycleLengths.length) return null;

    const avg = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
    const periodLengths = cycles.filter(c => c.endDate).map(c => differenceInDays(new Date(c.endDate!), new Date(c.startDate)) + 1);
    const avgPeriod = periodLengths.length ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length) : 5;

    const lastStart = new Date(cycles[0].startDate);
    const nextPeriod = addDays(lastStart, avg);
    const ovulationDay = addDays(lastStart, avg - 14);
    const fertileStart = addDays(ovulationDay, -4);
    const fertileEnd = addDays(ovulationDay, 1);
    const daysToOv = Math.max(0, differenceInDays(ovulationDay, new Date()));
    const daysToPeriod = Math.max(0, differenceInDays(nextPeriod, new Date()));
    const daysToFertile = Math.max(0, differenceInDays(fertileStart, new Date()));

    const stdDev = cycleLengths.length > 1
      ? Math.sqrt(cycleLengths.reduce((s, v) => s + (v - avg) ** 2, 0) / cycleLengths.length)
      : 0;
    const isRegular = stdDev <= 3;
    const phaseInfo = getCurrentPhase(lastStart, avg, avgPeriod);

    return {
      avgCycle: avg, avgPeriod, nextPeriod, ovulationDay,
      fertileStart, fertileEnd, daysToOv, daysToPeriod, daysToFertile,
      isRegular, phase: phaseInfo.phase, cycleDay: phaseInfo.day,
    };
  }, [cycles]);

  /* ── Status Summary text ── */
  const statusSummary = useMemo(() => {
    if (!stats) return null;
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
      day: stats.cycleDay,
      phase: phaseLabel,
      avgCycle: stats.avgCycle,
      nextDate,
      fertileNote,
    });
  }, [stats, t, currentLanguage]);

  const getFlowColor = (i: string) =>
    i === "light" ? "bg-primary/30" : i === "medium" ? "bg-primary/60" : "bg-primary";

  const shareStats = async () => {
    if (!stats) return;
    const text = `${t('toolsInternal.cycleTracker.yourStatistics')}\n\n${t('toolsInternal.cycleTracker.avgCycleLength')}: ${stats.avgCycle} ${t('toolsInternal.cycleTracker.days')}\n${t('toolsInternal.cycleTracker.nextPeriod')}: ${formatLocalized(stats.nextPeriod, "MMMM d, yyyy", currentLanguage)}\n\n— via Pregnancy Toolkits`;
    if (navigator.share) {
      try { await navigator.share({ title: t('toolsInternal.cycleTracker.yourStatistics'), text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: t('toolsInternal.cycleTracker.copied'), description: t('toolsInternal.cycleTracker.copiedDesc') });
    }
  };

  const scrollToAI = () => {
    aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const locale = getDateLocale(currentLanguage);

  const aiPrompt = stats ? `Analyze my menstrual cycle patterns:
- Average cycle length: ${stats.avgCycle} days
- Average period length: ${stats.avgPeriod} days
- Cycle regularity: ${stats.isRegular ? 'Regular' : 'Irregular'}
- Current phase: ${stats.phase} (day ${stats.cycleDay})
- Next ovulation: ${format(stats.ovulationDay, "yyyy-MM-dd")}
- Next period: ${format(stats.nextPeriod, "yyyy-MM-dd")}
- Total cycles tracked: ${cycles.length}

Recent cycle data:
${cycles.slice(0, 5).map((c, i) => {
  const length = i < cycles.length - 1
    ? differenceInDays(new Date(c.startDate), new Date(cycles[i + 1].startDate))
    : null;
  return `- ${c.startDate}: ${c.flowIntensity} flow${c.symptoms?.length ? `, symptoms: ${c.symptoms.map(s => getSymptomLabel(s)).join(', ')}` : ''}${length ? `, ${length} day cycle` : ''}`;
}).join('\n')}

Please provide:
## Pattern Analysis
Analyze my cycle regularity and patterns

## Predictions
Insights about my upcoming cycles

## Health Tips
Personalized tips based on my cycle patterns and symptoms

## Things to Watch
Any patterns that might be worth discussing with a doctor` : '';

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
        {/* ═══ UNIFIED DASHBOARD CARD ═══ */}
        {stats ? (
          <Card className="overflow-hidden border-border">
            <CardContent className="pt-5 pb-4 space-y-4">
              {/* Phase Ring */}
              <PhaseRing phase={stats.phase} day={stats.cycleDay} avgCycle={stats.avgCycle} />

              {/* Phase description */}
              <motion.p
                key={stats.phase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] text-center text-muted-foreground max-w-xs mx-auto leading-relaxed"
              >
                {t(`toolsInternal.cycleTracker.phaseDescription.${stats.phase}`)}
              </motion.p>

              {/* ── Countdown cards ── */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-pink-200/40 dark:border-pink-800/30 bg-gradient-to-br from-pink-500/8 to-transparent p-3 text-center">
                  <Target className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground tabular-nums">{stats.daysToOv}</p>
                  <p className="text-[10px] text-muted-foreground">{t('toolsInternal.cycleTracker.daysUntilOvulation')}</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/8 to-transparent p-3 text-center">
                  <Droplets className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground tabular-nums">{stats.daysToPeriod}</p>
                  <p className="text-[10px] text-muted-foreground">{t('toolsInternal.cycleTracker.daysUntilPeriod')}</p>
                </div>
              </div>

              {/* ── Key dates ── */}
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

              {/* ── Quick Stats bar ── */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <div className="rounded-lg bg-muted/40 p-2 text-center">
                  <p className="text-sm font-bold text-foreground">{stats.avgCycle}</p>
                  <p className="text-[8px] text-muted-foreground leading-tight">{t('toolsInternal.cycleTracker.avgCycleLength')}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2 text-center">
                  <p className="text-sm font-bold text-foreground">{stats.avgPeriod}</p>
                  <p className="text-[8px] text-muted-foreground leading-tight">{t('toolsInternal.cycleTracker.avgPeriodLength')}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2 text-center">
                  <Badge variant="outline" className={cn("text-[8px] px-1", stats.isRegular ? "border-emerald-300 text-emerald-600" : "border-amber-300 text-amber-600")}>
                    {stats.isRegular ? t('toolsInternal.cycleTracker.regular') : t('toolsInternal.cycleTracker.irregular')}
                  </Badge>
                  <p className="text-[8px] text-muted-foreground mt-0.5">{t('toolsInternal.cycleTracker.regularity')}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-2 text-center">
                  <p className="text-sm font-bold text-foreground">{cycles.length}</p>
                  <p className="text-[8px] text-muted-foreground leading-tight">{t('toolsInternal.cycleTracker.cyclesTracked')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="py-8 text-center">
              <CalendarIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t('toolsInternal.cycleTracker.noDataYet')}</p>
            </CardContent>
          </Card>
        )}

        {/* ═══ GENERAL STATUS SUMMARY ═══ */}
        {stats && statusSummary && (
          <Card className="border-primary/15 bg-gradient-to-br from-primary/4 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-1.5">
                    {t('toolsInternal.cycleTracker.generalStatus')}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {statusSummary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══ AI ANALYSIS (scrollable target) ═══ */}
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

        {/* ═══ ADD ENTRY ═══ */}
        <Card>
          <CardContent className="p-0">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{t('toolsInternal.cycleTracker.addNewEntry')}</span>
              </div>
              {showForm ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t('toolsInternal.cycleTracker.startDate')}</Label>
                        <Popover open={startOpen} onOpenChange={setStartOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full h-9 justify-start text-left text-sm font-normal", !startPickerDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                              {startPickerDate ? formatLocalized(startPickerDate, "PPP", currentLanguage) : t('toolsInternal.cycleTracker.selectStartDate')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single" selected={startPickerDate}
                              onSelect={(d) => { setStartPickerDate(d); setStartOpen(false); }}
                              disabled={date => date > new Date()}
                              locale={locale} initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t('toolsInternal.cycleTracker.endDate')}</Label>
                        <Popover open={endOpen} onOpenChange={setEndOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full h-9 justify-start text-left text-sm font-normal", !endPickerDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                              {endPickerDate ? formatLocalized(endPickerDate, "PPP", currentLanguage) : t('toolsInternal.cycleTracker.selectEndDate')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single" selected={endPickerDate}
                              onSelect={(d) => { setEndPickerDate(d); setEndOpen(false); }}
                              disabled={date => date > new Date() || (startPickerDate ? date < startPickerDate : false)}
                              locale={locale} initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('toolsInternal.cycleTracker.flowIntensity')}</Label>
                      <Select value={flowIntensity} onValueChange={(v) => setFlowIntensity(v as "light" | "medium" | "heavy")}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">{t('toolsInternal.cycleTracker.flowLevels.light')}</SelectItem>
                          <SelectItem value="medium">{t('toolsInternal.cycleTracker.flowLevels.medium')}</SelectItem>
                          <SelectItem value="heavy">{t('toolsInternal.cycleTracker.flowLevels.heavy')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">{t('toolsInternal.cycleTracker.symptoms')}</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {symptomKeys.map((key) => (
                          <button
                            key={key} type="button" onClick={() => toggleSymptom(key)}
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] transition-all border",
                              selectedSymptoms.includes(key)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted text-muted-foreground hover:bg-accent border-transparent"
                            )}
                          >
                            {getSymptomLabel(key)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button onClick={addCycle} disabled={!startPickerDate} className="w-full h-9 text-sm">
                      <Plus className="w-4 h-4 mr-1.5" />
                      {t('toolsInternal.cycleTracker.logPeriod')}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* ═══ HISTORY ═══ */}
        {cycles.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">{t('toolsInternal.cycleTracker.cycleHistory')}</h3>
                {stats && (
                  <Button variant="ghost" size="sm" onClick={shareStats} className="gap-1 h-7 text-xs">
                    <Share2 className="h-3.5 w-3.5" />
                    {t('toolsInternal.cycleTracker.share')}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {cycles.map((cycle, index) => {
                  const cycleLength = index < cycles.length - 1
                    ? differenceInDays(new Date(cycle.startDate), new Date(cycles[index + 1].startDate))
                    : null;
                  return (
                    <motion.div
                      key={cycle.id}
                      initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start justify-between rounded-xl bg-muted/50 p-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 shrink-0", getFlowColor(cycle.flowIntensity))} />
                        <div className="min-w-0">
                          <p className="font-medium text-xs text-foreground">
                            {formatLocalized(new Date(cycle.startDate), "MMM d, yyyy", currentLanguage)}
                            {cycle.endDate && (
                              <span className="text-muted-foreground">
                                {" "}– {formatLocalized(new Date(cycle.endDate), "MMM d", currentLanguage)}
                              </span>
                            )}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              {t(`toolsInternal.cycleTracker.flowLevels.${cycle.flowIntensity}`)}
                            </span>
                            {cycleLength && cycleLength > 0 && cycleLength < 60 && (
                              <span className="text-[10px] text-primary font-medium">
                                {cycleLength} {t('toolsInternal.cycleTracker.dayCycle')}
                              </span>
                            )}
                          </div>
                          {cycle.symptoms && cycle.symptoms.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {cycle.symptoms.map((s) => (
                                <span key={s} className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] text-secondary-foreground">
                                  {getSymptomLabel(s)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteCycle(cycle.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors p-1.5 shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══ Videos ═══ */}
        <VideoLibrary
          videosByLang={cycleTrackerVideosByLang}
          title={t('toolsInternal.cycleTracker.videosTitle')}
          subtitle={t('toolsInternal.cycleTracker.videosSubtitle')}
        />

        {/* ═══ Tip ═══ */}
        <div className="flex items-start gap-2.5 rounded-xl bg-muted/50 p-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {t('toolsInternal.cycleTracker.trackTip')}
          </p>
        </div>
      </motion.div>

      {/* ═══ STICKY AI BUTTON ═══ */}
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
