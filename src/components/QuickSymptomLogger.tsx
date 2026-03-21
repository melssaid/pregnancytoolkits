import { memo, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, TrendingUp } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DailyLog {
  date: string;
  mood: number;
  symptoms: string[];
  week?: number;
}

const moods = [
  { emoji: "😢", labelEn: "Bad", labelAr: "سيء", value: 1, color: "hsl(0,60%,55%)" },
  { emoji: "😟", labelEn: "Low", labelAr: "منخفض", value: 2, color: "hsl(25,70%,55%)" },
  { emoji: "😐", labelEn: "Okay", labelAr: "عادي", value: 3, color: "hsl(45,70%,50%)" },
  { emoji: "😊", labelEn: "Good", labelAr: "جيد", value: 4, color: "hsl(130,45%,50%)" },
  { emoji: "🤩", labelEn: "Great", labelAr: "ممتاز", value: 5, color: "hsl(160,50%,45%)" },
];

const commonSymptoms = [
  { id: "nausea", en: "Nausea", ar: "غثيان", emoji: "🤢" },
  { id: "fatigue", en: "Fatigue", ar: "إرهاق", emoji: "😴" },
  { id: "headache", en: "Headache", ar: "صداع", emoji: "🤕" },
  { id: "backpain", en: "Back pain", ar: "آلام ظهر", emoji: "💆" },
  { id: "cramps", en: "Cramps", ar: "تقلصات", emoji: "⚡" },
  { id: "insomnia", en: "Insomnia", ar: "أرق", emoji: "🌙" },
  { id: "swelling", en: "Swelling", ar: "انتفاخ", emoji: "🦶" },
  { id: "heartburn", en: "Heartburn", ar: "حرقة", emoji: "🔥" },
];

const STORAGE_KEY = "quick_symptom_logs";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getLogs(): DailyLog[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveLogs(logs: DailyLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-30))); // keep 30 days
}

const QuickSymptomLogger = memo(function QuickSymptomLogger() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const today = getToday();
  const { profile } = useUserProfile();

  const [logs, setLogs] = useState<DailyLog[]>(() => getLogs());
  const todayLog = useMemo(() => logs.find(l => l.date === today), [logs, today]);

  const [selectedMood, setSelectedMood] = useState<number>(todayLog?.mood || 0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(todayLog?.symptoms || []);
  const [saved, setSaved] = useState(!!todayLog);
  const [showChart, setShowChart] = useState(false);

  const toggleSymptom = useCallback((id: string) => {
    setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!selectedMood) return;
    const newLog: DailyLog = { date: today, mood: selectedMood, symptoms: selectedSymptoms, week: profile.pregnancyWeek || undefined };
    const updated = [...logs.filter(l => l.date !== today), newLog];
    saveLogs(updated);
    setLogs(updated);
    setSaved(true);
    // Notify dashboard components
    window.dispatchEvent(new Event("storage"));
  }, [selectedMood, selectedSymptoms, today, logs, profile.pregnancyWeek]);

  // Last 7 days mood chart
  const last7 = useMemo(() => {
    const days: { date: string; mood: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = logs.find(l => l.date === dateStr);
      days.push({ date: dateStr, mood: log?.mood || 0 });
    }
    return days;
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/20 shadow-sm overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h3 className="text-[13px] font-bold text-foreground">
              {t("quickLog.title")}
            </h3>
          </div>
          {logs.length > 1 && (
            <button
              onClick={() => setShowChart(!showChart)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium">
                {t("quickLog.trend")}
              </span>
            </button>
          )}
        </div>

        {/* Mood selector */}
        <div className="mb-3">
          <p className="text-[11px] text-muted-foreground mb-2">
            {t("quickLog.howFeeling")}
          </p>
          <div className="flex items-center justify-between gap-1">
            {moods.map(m => (
              <motion.button
                key={m.value}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setSelectedMood(m.value); setSaved(false); }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${
                  selectedMood === m.value
                    ? "bg-primary/10 border-2 border-primary/30 shadow-sm"
                    : "bg-muted/20 border-2 border-transparent hover:bg-muted/40"
                }`}
              >
                <span className={`text-xl ${selectedMood === m.value ? "" : "grayscale-[40%] opacity-70"} transition-all`}>
                  {m.emoji}
                </span>
                <span className="text-[9px] font-medium text-muted-foreground">
                  {t(`quickLog.moods.${m.value}`)}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Symptom chips */}
        <div className="mb-3">
          <p className="text-[11px] text-muted-foreground mb-2">
            {t("quickLog.symptoms")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {commonSymptoms.map(s => {
              const active = selectedSymptoms.includes(s.id);
              return (
                <motion.button
                  key={s.id}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => toggleSymptom(s.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    active
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : "bg-muted/25 text-muted-foreground border border-transparent hover:bg-muted/40"
                  }`}
                >
                  <span className="text-xs">{s.emoji}</span>
                  {isAr ? s.ar : s.en}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={!selectedMood}
          className={`w-full py-2.5 rounded-xl text-[12px] font-bold transition-all ${
            saved
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : selectedMood
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/30 text-muted-foreground cursor-not-allowed"
          }`}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              {t("quickLog.saved")}
            </span>
          ) : t("quickLog.save")}
        </motion.button>

        {/* 7-day trend chart */}
        <AnimatePresence>
          {showChart && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-border/10">
                <p className="text-[10px] text-muted-foreground mb-2">
                  {t("quickLog.last7Days")}
                </p>
                <div className="flex items-end gap-1 h-16">
                  {last7.map((d, i) => {
                    const h = d.mood ? (d.mood / 5) * 100 : 5;
                    const moodData = moods.find(m => m.value === d.mood);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className="w-full rounded-t-md"
                          style={{ backgroundColor: moodData?.color || "hsl(var(--muted))", minHeight: 3 }}
                        />
                        <span className="text-[8px] text-muted-foreground tabular-nums">
                          {new Date(d.date).toLocaleDateString(isAr ? "ar" : "en", { weekday: "narrow" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default QuickSymptomLogger;
