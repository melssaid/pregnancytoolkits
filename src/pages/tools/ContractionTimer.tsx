import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Timer, TrendingUp } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { InlineDisclaimer } from "@/components/compliance";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContractionChart } from "@/components/contraction/ContractionChart";
import { ContractionStats } from "@/components/contraction/ContractionStats";
import { ContractionHistory } from "@/components/contraction/ContractionHistory";
import { LaborPhaseIndicator } from "@/components/contraction/LaborPhaseIndicator";
import { AIInsightCard } from "@/components/ai/AIInsightCard";

interface Contraction {
  id: string;
  start: number;
  end: number | null;
  duration: number;
}

const STORAGE_KEY = "contraction_timer_data";

function loadContractions(): Contraction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveContractions(data: Contraction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ContractionTimer() {
  const { t } = useTranslation();

  const [contractions, setContractions] = useState<Contraction[]>(() => loadContractions());
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handleStart = useCallback(() => {
    setIsActive(true);
  }, []);

  const handleStop = useCallback(() => {
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const newContraction: Contraction = {
      id: `c_${Date.now()}`,
      start: startTimeRef.current,
      end: Date.now(),
      duration,
    };
    const updated = [newContraction, ...contractions];
    setContractions(updated);
    saveContractions(updated);
    setIsActive(false);
  }, [contractions]);

  const handleClear = useCallback(() => {
    setContractions([]);
    saveContractions([]);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const updated = contractions.filter((c) => c.id !== id);
      setContractions(updated);
      saveContractions(updated);
    },
    [contractions]
  );

  // Compute stats for labor phase
  const phaseStats = useMemo(() => {
    if (contractions.length < 2) return null;
    const durations = contractions.map((c) => c.duration);
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const intervals: number[] = [];
    for (let i = 0; i < contractions.length - 1; i++) {
      const gap = Math.floor(
        (contractions[i].start - (contractions[i + 1].end || contractions[i + 1].start)) / 1000
      );
      if (gap > 0) intervals.push(gap);
    }
    const avgInterval =
      intervals.length > 0
        ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
        : 0;
    return { avgDuration, avgInterval, count: contractions.length };
  }, [contractions]);

  // Last contraction info
  const lastContraction = contractions.length > 0 ? contractions[0] : null;
  const timeSinceLast = lastContraction
    ? Math.floor((Date.now() - (lastContraction.end || lastContraction.start)) / 1000)
    : 0;

  return (
    <ToolFrame
      title={t("toolsInternal.contractionTimer.title", "عداد الانقباضات")}
      subtitle={t(
        "toolsInternal.contractionTimer.subtitle",
        "تتبعي مدة الانقباضات والفترات بينها"
      )}
      customIcon="contraction-timer"
      mood="calm"
      toolId="contraction-timer"
    >
      <div className="space-y-4">
        {/* Timer Section */}
        <div className="text-center py-1">
          <motion.div
            className={`relative inline-flex items-center justify-center w-36 h-36 rounded-full border-[3px] ${
              isActive
                ? "border-destructive bg-destructive/5"
                : "border-border/30 bg-card"
            } shadow-lg transition-colors duration-500`}
          >
            {/* Pulsing ring when active */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-destructive/30"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <div>
              <span
                className={`text-3xl font-extrabold tabular-nums ${
                  isActive ? "text-destructive" : "text-foreground"
                }`}
              >
                {formatDuration(elapsed)}
              </span>
              {isActive && (
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[10px] text-destructive font-medium mt-0.5"
                >
                  {t("toolsInternal.contractionTimer.recording", "جارٍ التسجيل...")}
                </motion.p>
              )}
              {!isActive && lastContraction && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {t("toolsInternal.contractionTimer.lastOne", "آخر انقباض")}:{" "}
                  {formatDuration(lastContraction.duration)}
                </p>
              )}
            </div>
          </motion.div>

          {/* Action button */}
          <div className="flex items-center justify-center gap-3 mt-5">
            {!isActive ? (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleStart}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-destructive text-destructive-foreground font-bold text-sm shadow-lg shadow-destructive/25 hover:opacity-90 transition-opacity"
              >
                <Play className="w-4.5 h-4.5" fill="currentColor" />
                {t("toolsInternal.contractionTimer.startContraction", "بدء انقباض")}
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleStop}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-foreground text-background font-bold text-sm shadow-lg"
              >
                <Square className="w-4.5 h-4.5" fill="currentColor" />
                {t("toolsInternal.contractionTimer.stop", "انتهى")}
              </motion.button>
            )}
          </div>
        </div>

        {/* Labor Phase Indicator */}
        {phaseStats && (
          <LaborPhaseIndicator
            avgDuration={phaseStats.avgDuration}
            avgInterval={phaseStats.avgInterval}
            count={phaseStats.count}
          />
        )}

        {/* Stats */}
        <ContractionStats contractions={contractions} />

        {/* Tabs: Chart & History */}
        {contractions.length >= 2 && (
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-9">
              <TabsTrigger value="chart" className="text-xs">
                {t("toolsInternal.contractionTimer.chartTab", "📊 الرسم البياني")}
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                {t("toolsInternal.contractionTimer.historyTab", "📋 السجل")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              <ContractionChart contractions={contractions} />
            </TabsContent>
            <TabsContent value="history">
              <ContractionHistory
                contractions={contractions}
                onDelete={handleDelete}
                onClear={handleClear}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Show history without tabs if only 1 contraction */}
        {contractions.length === 1 && (
          <ContractionHistory
            contractions={contractions}
            onDelete={handleDelete}
            onClear={handleClear}
          />
        )}

        {/* AI Analysis */}
        {contractions.length >= 3 && phaseStats && (
          <AIInsightCard
            title={t("toolsInternal.contractionTimer.aiAnalysisTitle", "تحليل ذكي للانقباضات")}
            aiType="contraction-analysis"
            prompt={`Analyze my contraction data:
- Total contractions: ${contractions.length}
- Average duration: ${phaseStats.avgDuration} seconds
- Average interval: ${phaseStats.avgInterval} seconds
- Shortest contraction: ${Math.min(...contractions.map(c => c.duration))} seconds
- Longest contraction: ${Math.max(...contractions.map(c => c.duration))} seconds
- Session started: ${contractions.length > 0 ? new Date(contractions[contractions.length - 1].start).toLocaleTimeString() : 'N/A'}
- Latest contraction: ${contractions.length > 0 ? new Date(contractions[0].start).toLocaleTimeString() : 'N/A'}
- Recent 5 durations (seconds): ${contractions.slice(0, 5).map(c => c.duration).join(', ')}
- Recent 5 intervals (seconds): ${contractions.slice(0, 5).map((c, i) => i < contractions.length - 1 ? Math.floor((c.start - (contractions[i + 1].end || contractions[i + 1].start)) / 1000) : 0).filter(v => v > 0).join(', ')}

Analyze contraction pattern, regularity, and labor progression. Provide guidance on when to go to the hospital based on the 5-1-1 rule. Include safety recommendations.`}
            context={{ week: 38 }}
            buttonText={t("toolsInternal.contractionTimer.aiAnalysisButton", "تحليل الانقباضات بالذكاء الاصطناعي")}
            icon={<TrendingUp className="w-4 h-4" />}
          />
        )}

        <InlineDisclaimer />
      </div>
    </ToolFrame>
  );
}
