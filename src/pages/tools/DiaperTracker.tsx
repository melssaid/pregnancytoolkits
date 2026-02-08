import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { QuickAddButtons } from "@/components/diaper/QuickAddButtons";
import { TimeSinceLastChange } from "@/components/diaper/TimeSinceLastChange";
import { DailyGoalProgress } from "@/components/diaper/DailyGoalProgress";
import { DiaperChart } from "@/components/diaper/DiaperChart";
import { DiaperHistory } from "@/components/diaper/DiaperHistory";
import { DiaperAIAnalysis } from "@/components/diaper/DiaperAIAnalysis";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

type DiaperType = "wet" | "dirty" | "both";

interface DiaperEntry {
  id: string;
  time: string;
  type: DiaperType;
}

const DiaperTracker = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<DiaperEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("diaperEntries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const addEntry = (type: DiaperType) => {
    const newEntry: DiaperEntry = {
      id: Date.now().toString(),
      time: new Date().toISOString(),
      type,
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("diaperEntries", JSON.stringify(updated));
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
  const lastChangeTime = entries.length > 0 ? entries[0].time : null;

  return (
    <ToolFrame
      title={t('diaperPage.title')}
      subtitle={t('diaperPage.subtitle')}
      customIcon="mother-baby"
      mood="nurturing"
      toolId="diaper-tracker"
    >
      <div className="space-y-4">
        {/* Live Timer */}
        <TimeSinceLastChange lastChangeTime={lastChangeTime} />

        {/* Quick Add */}
        <QuickAddButtons onAdd={addEntry} />

        {/* Daily Progress with Goal */}
        <DailyGoalProgress
          wet={stats.wet}
          dirty={stats.dirty}
          total={stats.total}
        />

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
          <Card className="overflow-hidden bg-muted/50">
            <CardContent className="py-3">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('diaperPage.info')}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* History grouped by day */}
        <DiaperHistory entries={entries} onDelete={deleteEntry} />
      </div>
    </ToolFrame>
  );
};

export default DiaperTracker;
