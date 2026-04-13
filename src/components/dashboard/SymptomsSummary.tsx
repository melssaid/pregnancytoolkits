import { memo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface QuickLog {
  date: string;
  mood: number;
  symptoms: string[];
}

interface DiaryEntry {
  id: string;
  date: string;
  symptoms: string[];
  mood: string;
  notes: string;
  createdAt: string;
}

const MOOD_NUM_MAP: Record<number, { emoji: string; key: string }> = {
  1: { emoji: "😢", key: "bad" },
  2: { emoji: "😟", key: "low" },
  3: { emoji: "😐", key: "okay" },
  4: { emoji: "😊", key: "good" },
  5: { emoji: "🤩", key: "great" },
};

const MOOD_STR_MAP: Record<string, string> = {
  great: "😊", good: "🙂", okay: "😐", tired: "😴", tough: "😔",
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function loadData() {
  const today = getToday();
  let moodEmoji = "";
  const moodLabel = "";
  let moodKey = "";
  let symptoms: string[] = [];
  let hasData = false;

  // 1. Try QuickSymptomLogger (primary daily source)
  try {
    const logs: QuickLog[] = JSON.parse(localStorage.getItem("quick_symptom_logs") || "[]");
    const todayLog = logs.find(l => l.date === today);
    if (todayLog) {
      hasData = true;
      symptoms = todayLog.symptoms || [];
      const m = MOOD_NUM_MAP[todayLog.mood];
      if (m) {
        moodEmoji = m.emoji;
        moodKey = m.key;
      }
    }
  } catch { /* ignore */ }

  // 2. Fallback to Wellness Diary (latest entry today)
  if (!hasData) {
    try {
      const entries: DiaryEntry[] = JSON.parse(localStorage.getItem("wellness-diary-entries") || "[]");
      const todayEntry = entries.find(e => e.date === today || e.createdAt?.startsWith(today));
      if (todayEntry) {
        hasData = true;
        symptoms = todayEntry.symptoms || [];
        moodKey = todayEntry.mood || "";
        moodEmoji = MOOD_STR_MAP[moodKey] || "😐";
      }
    } catch { /* ignore */ }
  }

  // 3. Fallback to legacy dashboard_health_checkin_v1
  if (!hasData) {
    try {
      const data = JSON.parse(localStorage.getItem("dashboard_health_checkin_v1") || "null");
      if (data) {
        hasData = true;
        symptoms = data.symptoms || [];
        moodKey = (data.mood || "").toLowerCase();
        moodEmoji = MOOD_STR_MAP[moodKey] || MOOD_NUM_MAP[data.mood]?.emoji || "";
      }
    } catch { /* ignore */ }
  }

  return { moodEmoji, moodKey, moodLabel, symptoms, hasData };
}

export const SymptomsSummary = memo(function SymptomsSummary() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [data, setData] = useState(() => loadData());

  const refresh = useCallback(() => setData(loadData()), []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onStorage = () => refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const { moodEmoji, moodKey, symptoms, hasData } = data;

  return (
    <Link to="/tools/wellness-diary">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="rounded-2xl border border-border/20 bg-card p-3.5 hover:border-primary/20 transition-colors group"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-foreground whitespace-normal leading-tight">{t("dailyDashboard.symptoms.title")}</h3>
          <ArrowIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>

        {!hasData ? (
          <p className="text-[10px] text-muted-foreground">{t("dailyDashboard.symptoms.noData")}</p>
        ) : (
          <>
            {moodEmoji && (
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{moodEmoji}</span>
                <span className="text-[11px] font-medium text-foreground">
                  {t(`dashboard.health.moods.${moodKey}`, moodKey)}
                </span>
              </div>
            )}

            {symptoms.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {symptoms.map((s: string) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {t(`dashboard.health.symptoms.${s}`, t(`symptomAnalyzer.symptoms.${s}`, s))}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground">{t("dailyDashboard.symptoms.noSymptoms")}</p>
            )}
          </>
        )}
      </motion.div>
    </Link>
  );
});
