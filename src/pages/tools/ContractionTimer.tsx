import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Trash2, Clock, Activity, AlertTriangle, Download, RotateCcw } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { InlineDisclaimer } from "@/components/compliance";

interface Contraction {
  id: string;
  start: number;
  end: number | null;
  duration: number; // seconds
}

const STORAGE_KEY = "contraction_timer_data";

function loadContractions(): Contraction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveContractions(data: Contraction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function ContractionTimer() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [contractions, setContractions] = useState<Contraction[]>(() => loadContractions());
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer tick
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
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
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

  const handleDelete = useCallback((id: string) => {
    const updated = contractions.filter(c => c.id !== id);
    setContractions(updated);
    saveContractions(updated);
  }, [contractions]);

  // Analytics
  const stats = useMemo(() => {
    if (contractions.length < 2) return null;
    const durations = contractions.map(c => c.duration);
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

    // Intervals between contractions (from end of one to start of next)
    const intervals: number[] = [];
    for (let i = 0; i < contractions.length - 1; i++) {
      const gap = Math.floor((contractions[i].start - (contractions[i + 1].end || contractions[i + 1].start)) / 1000);
      if (gap > 0) intervals.push(gap);
    }
    const avgInterval = intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : 0;

    // 5-1-1 rule: contractions 5 min apart, lasting 1 min, for 1 hour
    const isIntense = avgInterval <= 300 && avgDuration >= 60;

    return { avgDuration, avgInterval, isIntense, count: contractions.length };
  }, [contractions]);

  return (
    <Layout>
      <SEOHead
        title={isAr ? "عداد الانقباضات | أدوات الحمل" : "Contraction Timer | Pregnancy Toolkits"}
        description={isAr ? "تتبعي انقباضاتك بدقة" : "Track your contractions accurately"}
      />
      <div className="px-3 sm:px-4 md:px-6 max-w-2xl mx-auto pb-24">
        <BackButton />

        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-foreground mb-1">
            {isAr ? "⏱️ عداد الانقباضات" : "⏱️ Contraction Timer"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAr ? "تتبعي مدة الانقباضات والفترات بينها" : "Track duration and intervals between contractions"}
          </p>
        </div>

        {/* Main Timer */}
        <div className="text-center mb-6">
          {/* Elapsed time display */}
          <motion.div
            className={`inline-flex items-center justify-center w-40 h-40 rounded-full border-4 ${
              isActive
                ? "border-[hsl(0,72%,50%)] bg-[hsl(0,72%,50%)]/5"
                : "border-border/30 bg-card"
            } shadow-lg transition-colors duration-500`}
          >
            <div>
              <span className={`text-4xl font-extrabold tabular-nums ${isActive ? "text-[hsl(0,72%,50%)]" : "text-foreground"}`}>
                {formatDuration(elapsed)}
              </span>
              {isActive && (
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[11px] text-[hsl(0,72%,50%)] font-medium mt-1"
                >
                  {isAr ? "جارٍ التسجيل..." : "Recording..."}
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {!isActive ? (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleStart}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[hsl(0,72%,50%)] text-white font-bold text-sm shadow-lg shadow-[hsl(0,72%,50%)]/25 hover:bg-[hsl(0,72%,45%)] transition-colors"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                {isAr ? "بدأ انقباض" : "Start Contraction"}
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleStop}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-foreground text-background font-bold text-sm shadow-lg"
              >
                <Square className="w-5 h-5" fill="currentColor" />
                {isAr ? "انتهى" : "Stop"}
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-2 mb-5"
          >
            <div className="bg-card rounded-xl p-3 text-center border border-border/15 shadow-sm">
              <Activity className="w-4 h-4 mx-auto text-primary mb-1" />
              <span className="text-lg font-extrabold text-foreground tabular-nums">{stats.count}</span>
              <span className="text-[10px] text-muted-foreground block">{isAr ? "انقباض" : "Total"}</span>
            </div>
            <div className="bg-card rounded-xl p-3 text-center border border-border/15 shadow-sm">
              <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
              <span className="text-lg font-extrabold text-foreground tabular-nums">{formatDuration(stats.avgDuration)}</span>
              <span className="text-[10px] text-muted-foreground block">{isAr ? "متوسط المدة" : "Avg Duration"}</span>
            </div>
            <div className="bg-card rounded-xl p-3 text-center border border-border/15 shadow-sm">
              <Clock className="w-4 h-4 mx-auto text-amber-500 mb-1" />
              <span className="text-lg font-extrabold text-foreground tabular-nums">{formatDuration(stats.avgInterval)}</span>
              <span className="text-[10px] text-muted-foreground block">{isAr ? "متوسط الفاصل" : "Avg Interval"}</span>
            </div>
          </motion.div>
        )}

        {/* 5-1-1 Alert */}
        {stats?.isIntense && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-4 rounded-xl bg-[hsl(0,72%,50%)]/10 border border-[hsl(0,72%,50%)]/20"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-[hsl(0,72%,50%)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[hsl(0,72%,50%)]">
                  {isAr ? "🚨 قاعدة 5-1-1 محققة!" : "🚨 5-1-1 Rule Met!"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAr
                    ? "الانقباضات كل 5 دقائق أو أقل وتستمر لأكثر من دقيقة. قد يكون الوقت قد حان للتوجه إلى المستشفى. استشيري طبيبتك فوراً."
                    : "Contractions are 5 minutes apart or less and lasting over 1 minute. It may be time to head to the hospital. Contact your doctor immediately."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Contraction history */}
        {contractions.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">
                {isAr ? "السجل" : "History"}
              </h3>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                {isAr ? "مسح الكل" : "Clear All"}
              </button>
            </div>

            <div className="space-y-2">
              {contractions.slice(0, 20).map((c, i) => {
                const interval = i < contractions.length - 1
                  ? Math.floor((c.start - (contractions[i + 1].end || contractions[i + 1].start)) / 1000)
                  : null;

                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/10 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[hsl(0,72%,50%)]/10 flex items-center justify-center text-[11px] font-bold text-[hsl(0,72%,50%)] tabular-nums">
                      #{contractions.length - i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground tabular-nums">
                          {formatDuration(c.duration)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {isAr ? "مدة" : "duration"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {formatTime(c.start)}
                        </span>
                        {interval !== null && interval > 0 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            ← {formatDuration(interval)} {isAr ? "فاصل" : "gap"}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-destructive" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <MedicalDisclaimer />
      </div>
    </Layout>
  );
}
