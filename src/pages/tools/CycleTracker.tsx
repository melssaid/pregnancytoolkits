import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Activity, Plus, Calendar, TrendingUp, Info, Share2, Trash2 } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, differenceInDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

interface CycleEntry {
  id: string;
  startDate: string;
  endDate?: string;
  flowIntensity: "light" | "medium" | "heavy";
  symptoms?: string[];
}

const STORAGE_KEY = "cycle-tracker-data";

const symptomOptions = [
  "Cramps",
  "Headache",
  "Bloating",
  "Mood swings",
  "Fatigue",
  "Breast tenderness",
  "Acne",
  "Back pain",
];

const isValidCycles = (data: unknown): data is CycleEntry[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && item !== null && 
    typeof (item as CycleEntry).id === 'string' &&
    typeof (item as CycleEntry).startDate === 'string'
  );
};

export default function CycleTracker() {
  const { toast } = useToast();
  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flowIntensity, setFlowIntensity] = useState<"light" | "medium" | "heavy">("medium");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
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
    if (!startDate) return;

    const newCycle: CycleEntry = {
      id: Date.now().toString(),
      startDate,
      endDate: endDate || undefined,
      flowIntensity,
      symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
    };

    setCycles(prev => [newCycle, ...prev].slice(0, 12));
    toast({ title: 'Saved!', description: 'Cycle entry has been recorded.' });

    setStartDate("");
    setEndDate("");
    setFlowIntensity("medium");
    setSelectedSymptoms([]);
  };

  const deleteCycle = (id: string) => {
    setCycles(prev => prev.filter((c) => c.id !== id));
    toast({ title: 'Deleted', description: 'Cycle entry removed.' });
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const getStats = () => {
    if (cycles.length < 2) return null;

    const cycleLengths: number[] = [];
    for (let i = 0; i < cycles.length - 1; i++) {
      const current = new Date(cycles[i].startDate);
      const previous = new Date(cycles[i + 1].startDate);
      const length = differenceInDays(current, previous);
      if (length > 0 && length < 60) {
        cycleLengths.push(length);
      }
    }

    if (cycleLengths.length === 0) return null;

    const avgCycleLength = Math.round(
      cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
    );

    const periodLengths = cycles
      .filter((c) => c.endDate)
      .map((c) => differenceInDays(new Date(c.endDate!), new Date(c.startDate)) + 1);
    
    const avgPeriodLength = periodLengths.length > 0
      ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
      : null;

    const lastPeriod = new Date(cycles[0].startDate);
    const nextPeriod = addDays(lastPeriod, avgCycleLength);

    return { avgCycleLength, avgPeriodLength, nextPeriod };
  };

  const stats = getStats();

  const getFlowColor = (intensity: string) => {
    switch (intensity) {
      case "light": return "bg-primary/30";
      case "medium": return "bg-primary/60";
      case "heavy": return "bg-primary";
      default: return "bg-primary/50";
    }
  };

  const shareStats = async () => {
    if (!stats) return;
    
    const text = `📊 My Cycle Stats

🔄 Average Cycle: ${stats.avgCycleLength} days
${stats.avgPeriodLength ? `🩸 Average Period: ${stats.avgPeriodLength} days\n` : ''}📅 Next Period: ${format(stats.nextPeriod, "MMMM d, yyyy")}

Tracked ${cycles.length} cycles
— via Pregnancy Toolkits`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Cycle Stats', text });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied!', description: 'Stats copied to clipboard.' });
    }
  };

  return (
    <ToolFrame 
      title="Menstrual Cycle Tracker" 
      subtitle="Track your cycle and predict your period"
      customIcon="calendar"
      mood="nurturing"
      toolId="cycle-tracker"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
            {stats && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Your Statistics</h3>
                  <Button variant="ghost" size="sm" onClick={shareStats} className="gap-1">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="bg-secondary/50">
                    <CardContent className="pt-4 text-center">
                      <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-foreground">{stats.avgCycleLength}</p>
                      <p className="text-xs text-muted-foreground">Avg Cycle Length</p>
                    </CardContent>
                  </Card>
                  
                  {stats.avgPeriodLength && (
                    <Card className="bg-secondary/50">
                      <CardContent className="pt-4 text-center">
                        <Activity className="h-5 w-5 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">{stats.avgPeriodLength}</p>
                        <p className="text-xs text-muted-foreground">Avg Period Length</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-primary/10 border-primary/20">
                    <CardContent className="pt-4 text-center">
                      <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-lg font-bold text-primary">
                        {format(stats.nextPeriod, "MMM d")}
                      </p>
                      <p className="text-xs text-muted-foreground">Next Period</p>
                    </CardContent>
                  </Card>
              </div>
                
                {/* AI Analysis for Cycle Patterns */}
                <AIInsightCard
                  title="AI Cycle Analysis"
                  prompt={`Analyze my menstrual cycle patterns:
- Average cycle length: ${stats.avgCycleLength} days
- Average period length: ${stats.avgPeriodLength || 'Not tracked'} days
- Next predicted period: ${format(stats.nextPeriod, "MMMM d, yyyy")}
- Total cycles tracked: ${cycles.length}

Recent cycle data:
${cycles.slice(0, 5).map((c, i) => {
  const length = i < cycles.length - 1 
    ? differenceInDays(new Date(c.startDate), new Date(cycles[i + 1].startDate))
    : null;
  return `- ${format(new Date(c.startDate), "MMM d")}: ${c.flowIntensity} flow${c.symptoms?.length ? `, symptoms: ${c.symptoms.join(', ')}` : ''}${length ? `, ${length} day cycle` : ''}`;
}).join('\n')}

Please provide:
## 📊 Pattern Analysis
Analyze my cycle regularity and patterns

## 🎯 Predictions
Insights about my upcoming cycles

## 💡 Health Tips
Personalized tips based on my cycle patterns and symptoms

## ⚠️ Things to Watch
Any patterns that might be worth discussing with a doctor`}
                  variant="compact"
                  buttonText="Analyze My Patterns"
                />
              </div>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Log Period
                </CardTitle>
                <CardDescription>
                  Record the start and end of your menstrual cycle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={format(new Date(), "yyyy-MM-dd")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={format(new Date(), "yyyy-MM-dd")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Flow Intensity</Label>
                  <Select value={flowIntensity} onValueChange={(v) => setFlowIntensity(v as "light" | "medium" | "heavy")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Symptoms (optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {symptomOptions.map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`rounded-full px-3 py-1.5 text-sm transition-all border-2 ${
                          selectedSymptoms.includes(symptom)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary text-secondary-foreground hover:bg-muted border-transparent"
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={addCycle} disabled={!startDate} className="w-full">
                  Log Period
                </Button>
              </CardContent>
            </Card>

            {cycles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cycle History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cycles.map((cycle, index) => {
                      const cycleLength = index < cycles.length - 1
                        ? differenceInDays(
                            new Date(cycle.startDate),
                            new Date(cycles[index + 1].startDate)
                          )
                        : null;

                      return (
                        <div
                          key={cycle.id}
                          className="flex items-start justify-between rounded-xl bg-muted p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-3 w-3 rounded-full mt-1.5 ${getFlowColor(cycle.flowIntensity)}`} />
                            <div>
                              <p className="font-medium text-foreground">
                                {format(new Date(cycle.startDate), "MMM d, yyyy")}
                                {cycle.endDate && (
                                  <span className="text-muted-foreground">
                                    {" "}– {format(new Date(cycle.endDate), "MMM d")}
                                  </span>
                                )}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-xs text-muted-foreground capitalize">
                                  {cycle.flowIntensity} flow
                                </span>
                                {cycleLength && (
                                  <span className="text-xs text-primary">
                                    • {cycleLength} day cycle
                                  </span>
                                )}
                              </div>
                              {cycle.symptoms && cycle.symptoms.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {cycle.symptoms.map((s) => (
                                    <span
                                      key={s}
                                      className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteCycle(cycle.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Track at least 3-6 cycles for more accurate predictions. Cycle length can 
                vary due to stress, illness, or other factors.
              </p>
            </div>
          </motion.div>
    </ToolFrame>
  );
}
