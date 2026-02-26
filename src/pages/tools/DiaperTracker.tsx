import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { DiaperChart } from "@/components/diaper/DiaperChart";
import { DiaperHistory } from "@/components/diaper/DiaperHistory";
import { DiaperAIAnalysis } from "@/components/diaper/DiaperAIAnalysis";
import { Info, Droplet, Circle, Clock, Minus, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

type DiaperType = "wet" | "dirty" | "both";

interface DiaperEntry {
  id: string;
  time: string;
  type: DiaperType;
}

const DAILY_GOAL = 8;

const DiaperTracker = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [entries, setEntries] = useState<DiaperEntry[]>([]);
  const [lastAdded, setLastAdded] = useState<DiaperType | null>(null);
  const [elapsed, setElapsed] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("diaperEntries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  // Live timer
  const lastChangeTime = entries.length > 0 ? entries[0].time : null;
  useEffect(() => {
    if (!lastChangeTime) return;
    const update = () => {
      const diff = Date.now() - new Date(lastChangeTime).getTime();
      const totalSeconds = Math.floor(diff / 1000);
      setElapsed({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lastChangeTime]);

  const addEntry = (type: DiaperType) => {
    const newEntry: DiaperEntry = {
      id: Date.now().toString(),
      time: new Date().toISOString(),
      type,
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("diaperEntries", JSON.stringify(updated));
    setLastAdded(type);
    setTimeout(() => setLastAdded(null), 800);
  };

  const undoLast = (type: DiaperType) => {
    const today = new Date().toDateString();
    const idx = entries.findIndex(
      (e) => (e.type === type || e.type === "both") && new Date(e.time).toDateString() === today
    );
    if (idx !== -1) {
      const updated = entries.filter((_, i) => i !== idx);
      setEntries(updated);
      localStorage.setItem("diaperEntries", JSON.stringify(updated));
    }
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("diaperEntries", JSON.stringify(updated));
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayEntries = entries.filter(
      (e) => new Date(e.time).toDateString() === today
    );
    return {
      wet: todayEntries.filter((e) => e.type === "wet" || e.type === "both").length,
      dirty: todayEntries.filter((e) => e.type === "dirty" || e.type === "both").length,
      total: todayEntries.length,
    };
  };

  const stats = getTodayStats();
  const progress = Math.min((stats.total / DAILY_GOAL) * 100, 100);
  const isComplete = stats.total >= DAILY_GOAL;
  const isUrgent = elapsed.hours >= 3;
  const isWarning = elapsed.hours >= 2;

  return (
    <ToolFrame
      title={t('diaperPage.title')}
      subtitle={t('diaperPage.subtitle')}
      customIcon="mother-baby"
      mood="nurturing"
      toolId="diaper-tracker"
    >
      <div className="space-y-4">
        {/* ═══ UNIFIED HERO: Timer + Counters + Progress ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Card className="overflow-hidden border-primary/15">
            <CardContent className="p-0">
              {/* Timer strip */}
              <div className={`flex items-center justify-between px-4 py-2.5 border-b border-border/40 ${
                isUrgent 
                  ? 'bg-destructive/8' 
                  : isWarning 
                    ? 'bg-orange-500/8' 
                    : 'bg-primary/5'
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className={`h-3.5 w-3.5 shrink-0 ${
                    isUrgent ? 'text-destructive' : isWarning ? 'text-orange-500' : 'text-primary'
                  }`} />
                  <span className="text-xs text-muted-foreground truncate">
                    {t('diaperPage.timeSinceLastChange')}
                  </span>
                </div>
                {lastChangeTime ? (
                  <div className="flex items-baseline gap-0.5 font-mono shrink-0" dir="ltr">
                    <span className={`text-sm font-bold tabular-nums ${
                      isUrgent ? 'text-destructive' : 'text-foreground'
                    }`}>
                      {String(elapsed.hours).padStart(2, '0')}
                    </span>
                    <span className="text-muted-foreground text-xs">:</span>
                    <span className={`text-sm font-bold tabular-nums ${
                      isUrgent ? 'text-destructive' : 'text-foreground'
                    }`}>
                      {String(elapsed.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-muted-foreground text-xs">:</span>
                    <span className={`text-sm font-bold tabular-nums ${
                      isUrgent ? 'text-destructive' : 'text-foreground'
                    }`}>
                      {String(elapsed.seconds).padStart(2, '0')}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">--:--:--</span>
                )}
              </div>

              {/* Counter buttons */}
              <div className="grid grid-cols-3 divide-x divide-border/40 rtl:divide-x-reverse">
                <CounterButton
                  type="wet"
                  count={stats.wet}
                  label={t('diaperPage.wet')}
                  icon={<Droplet className="h-6 w-6" />}
                  color="text-blue-500"
                  bgColor="bg-blue-500/10"
                  activeBg="bg-blue-500/20"
                  isActive={lastAdded === "wet"}
                  onAdd={() => addEntry("wet")}
                  onUndo={() => undoLast("wet")}
                />
                <CounterButton
                  type="dirty"
                  count={stats.dirty}
                  label={t('diaperPage.dirty')}
                  icon={<Circle className="h-6 w-6 fill-current" />}
                  color="text-amber-500"
                  bgColor="bg-amber-500/10"
                  activeBg="bg-amber-500/20"
                  isActive={lastAdded === "dirty"}
                  onAdd={() => addEntry("dirty")}
                  onUndo={() => undoLast("dirty")}
                />
                <CounterButton
                  type="both"
                  count={stats.wet + stats.dirty}
                  label={t('diaperPage.total')}
                  color="text-primary"
                  bgColor="bg-primary/10"
                  activeBg="bg-primary/20"
                  isActive={lastAdded === "both"}
                  onAdd={() => addEntry("both")}
                  onUndo={() => {}}
                  isTotal
                  icon={
                    <div className="flex -space-x-1">
                      <Droplet className="h-4 w-4 text-blue-500" />
                      <Circle className="h-4 w-4 text-amber-500 fill-amber-500" />
                    </div>
                  }
                />
              </div>

              {/* Progress bar */}
              <div className="px-4 py-2.5 bg-muted/30 border-t border-border/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground">
                    {t('diaperPage.todayStats')}
                  </span>
                  <span className={`text-[11px] font-semibold ${isComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {stats.total}/{DAILY_GOAL} {t('diaperPage.dailyGoal')}
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      isComplete 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-r from-primary/60 to-primary'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Chart */}
        <DiaperChart entries={entries} />

        {/* AI Analysis */}
        <DiaperAIAnalysis entries={entries} todayStats={stats} />

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex items-start gap-2.5 rounded-xl bg-muted/50 p-3.5">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/60 leading-relaxed">
              {t('diaperPage.info')}
            </p>
          </div>
        </motion.div>

        {/* History grouped by day */}
        <DiaperHistory entries={entries} onDelete={deleteEntry} />
      </div>
    </ToolFrame>
  );
};

/* ═══ Counter Button Component ═══ */
interface CounterButtonProps {
  type: DiaperType;
  count: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  activeBg: string;
  isActive: boolean;
  onAdd: () => void;
  onUndo: () => void;
  isTotal?: boolean;
}

const CounterButton = ({
  count, label, icon, color, bgColor, activeBg, isActive, onAdd, onUndo, isTotal
}: CounterButtonProps) => (
  <div className={`flex flex-col items-center py-4 px-2 transition-colors duration-200 ${
    isActive ? activeBg : 'bg-background'
  }`}>
    {/* Count display */}
    <AnimatePresence mode="popLayout">
      <motion.span
        key={count}
        initial={{ y: -8, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 8, opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`text-2xl font-bold tabular-nums ${color}`}
      >
        {count}
      </motion.span>
    </AnimatePresence>

    <span className="text-[10px] text-muted-foreground mb-2.5 font-medium">{label}</span>

    {/* Action buttons */}
    {isTotal ? (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onAdd}
        className={`${bgColor} rounded-xl p-2.5 ${color} transition-colors`}
      >
        {icon}
      </motion.button>
    ) : (
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg opacity-50 hover:opacity-100"
          onClick={onUndo}
          disabled={count === 0}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onAdd}
          className={`${bgColor} rounded-xl p-2.5 ${color} transition-colors`}
        >
          {icon}
        </motion.button>
      </div>
    )}
  </div>
);

export default DiaperTracker;
