import { memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Droplets, Plus } from "lucide-react";
import { getUserId } from "@/hooks/useSupabase";
import { safeSaveToLocalStorage, safeParseLocalStorage } from "@/lib/safeStorage";

const GOAL = 8;

export const HydrationTracker = memo(function HydrationTracker() {
  const { t } = useTranslation();
  const today = new Date().toISOString().split("T")[0];
  const userId = getUserId();
  const storageKey = `water_logs_${userId}`;

  const [glasses, setGlasses] = useState<number>(() => {
    const logs = safeParseLocalStorage<any[]>(storageKey, []);
    return logs.filter((l: any) => l.date?.startsWith(today)).reduce((s: number, l: any) => s + (l.glasses || 1), 0);
  });

  const addGlass = useCallback(() => {
    let logs = safeParseLocalStorage<any[]>(storageKey, []);
    logs.push({ date: today, glasses: 1, timestamp: new Date().toISOString() });
    // Keep last 30 days of water logs
    if (logs.length > 240) logs = logs.slice(-240); // 8 glasses × 30 days
    safeSaveToLocalStorage(storageKey, logs);
    setGlasses(prev => prev + 1);
    // Notify other tabs/components
    window.dispatchEvent(new Event("storage"));
  }, [storageKey, today]);

  const pct = Math.min(100, (glasses / GOAL) * 100);

  return (
    <motion.div
      id="hydration-tracker"
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border border-border/20 bg-card p-3.5"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Droplets className="w-4 h-4 text-primary flex-shrink-0" />
          <h3 className="text-sm font-extrabold text-foreground whitespace-normal leading-tight">{t("dailyDashboard.hydration.title")}</h3>
        </div>
        <span className="text-[10px] font-semibold text-primary">{glasses}/{GOAL}</span>
      </div>

      {/* Dots */}
      <div className="flex items-center gap-1.5 mb-3">
        {Array.from({ length: GOAL }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.03 * i }}
            className={`w-6 h-6 rounded-full border-2 transition-colors ${
              i < glasses
                ? "bg-primary/20 border-primary"
                : "bg-muted/30 border-border/40"
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden mb-2.5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={addGlass}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/15 text-primary text-xs font-semibold transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {t("dailyDashboard.hydration.addGlass")}
      </motion.button>
    </motion.div>
  );
});
