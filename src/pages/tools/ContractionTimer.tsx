import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Trash2, Clock, Activity, AlertTriangle, RotateCcw } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { InlineDisclaimer } from "@/components/compliance";

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

  const stats = useMemo(() => {
    if (contractions.length < 2) return null;
    const durations = contractions.map(c => c.duration);
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

    const intervals: number[] = [];
    for (let i = 0; i < contractions.length - 1; i++) {
      const gap = Math.floor((contractions[i].start - (contractions[i + 1].end || contractions[i + 1].start)) / 1000);
      if (gap > 0) intervals.push(gap);
    }
    const avgInterval = intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : 0;
    const isIntense = avgInterval <= 300 && avgDuration >= 60;

    return { avgDuration, avgInterval, isIntense, count: contractions.length };
  }, [contractions]);

  return (
    <ToolFrame
      title={t('toolsInternal.contractionTimer.title', 'Contraction Timer')}
      subtitle={t('toolsInternal.contractionTimer.subtitle', 'Track duration and intervals between contractions')}
      customIcon="contraction-timer"
      mood="calm"
      toolId="contraction-timer"
    >
      <div className="space-y-4">
        {/* Main Timer */}
        <div className="text-center py-2">
          <motion.div
            className={`inline-flex items-center justify-center w-40 h-40 rounded-full border-4 ${
              isActive
                ? "border-destructive bg-destructive/5"
                : "border-border/30 bg-card"
            } shadow-lg transition-colors duration-500`}
          >
            <div>
              <span className={`text-4xl font-extrabold tabular-nums ${isActive ? "text-destructive" : "text-foreground"}`}>
                {formatDuration(elapsed)}
              </span>
              {isActive && (
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[11px] text-destructive font-medium mt-1"
                >
                  {t('toolsInternal.contractionTimer.recording', 'Recording...')}
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
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-destructive text-destructive-foreground font-bold text-sm shadow-lg shadow-destructive/25 hover:opacity-90 transition-opacity"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                {t('toolsInternal.contractionTimer.startContraction', 'Start Contraction')}
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={handleStop}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-foreground text-background font-bold text-sm shadow-lg"
              >
                <Square className="w-5 h-5" fill="currentColor" />
                {t('toolsInternal.contractionTimer.stop', 'Stop')}
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-2"
          >
            <div className="bg-card rounded-xl p-3 text-center border border-border/15 shadow-sm">
              <Activity className="w-4 h-4 mx-auto text-primary mb-1" />
              <span className="text-lg font-extrabold text-foreground tabular-nums">{stats.count}</span>
              <span className="text-[10px] text-muted-foreground block">{t('toolsInternal.contractionTimer.total', 'Total')}</span>
            </div>
            <div className="bg-card rounded-xl p-3 text-center border border-border/15 shadow-sm">
              <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
              <span className="text-lg font-extrabold text-foreground tabular-nums">{formatDuration(stats.avgDuration)}</span>
              <span className="text-[10px] text-muted-foreground block">{t('toolsInternal.contractionTimer.avgDuration', 'Avg Duration')}</span>
            </div>
            <div className="bg-card rounded-xl p-3 text-center border border-border/15 shadow-sm">
              <Clock className="w-4 h-4 mx-auto text-amber-500 mb-1" />
              <span className="text-lg font-extrabold text-foreground tabular-nums">{formatDuration(stats.avgInterval)}</span>
              <span className="text-[10px] text-muted-foreground block">{t('toolsInternal.contractionTimer.avgInterval', 'Avg Interval')}</span>
            </div>
          </motion.div>
        )}

        {/* 5-1-1 Alert */}
        {stats?.isIntense && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-destructive">
                  🚨 {t('toolsInternal.contractionTimer.ruleMetTitle', '5-1-1 Rule Met!')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('toolsInternal.contractionTimer.ruleMetDesc', 'Contractions are 5 minutes apart or less and lasting over 1 minute. It may be time to head to the hospital. Contact your doctor immediately.')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Contraction history */}
        {contractions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">
                {t('toolsInternal.contractionTimer.history', 'History')}
              </h3>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                {t('toolsInternal.contractionTimer.clearAll', 'Clear All')}
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
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-[11px] font-bold text-destructive tabular-nums">
                      #{contractions.length - i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground tabular-nums">
                          {formatDuration(c.duration)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {t('toolsInternal.contractionTimer.duration', 'duration')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          {formatTime(c.start)}
                        </span>
                        {interval !== null && interval > 0 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            ← {formatDuration(interval)} {t('toolsInternal.contractionTimer.gap', 'gap')}
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

        <InlineDisclaimer />
      </div>
    </ToolFrame>
  );
}
