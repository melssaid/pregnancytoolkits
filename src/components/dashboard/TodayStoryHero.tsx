import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sun, Coffee, Moon, Sparkles, Check } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { useDashboardData } from "@/hooks/useDashboardData";

interface DailyLog {
  date: string;
  mood: number;
  symptoms: string[];
  week?: number;
}

const STORAGE_KEY = "quick_symptom_logs";

/**
 * Premium professional hero — Apple Health × Flo style.
 * - Large progress ring (140px)
 * - Time-based greeting
 * - Formal mood quick-tap (icons + labels, no emojis)
 * - Hides pregnancy data if week <= 0
 */
export const TodayStoryHero = memo(function TodayStoryHero() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { profile, week, timeSlot, isPregnant } = useDashboardData();

  // Mood state
  const today = new Date().toISOString().split("T")[0];
  const [logs, setLogs] = useState<DailyLog[]>(() =>
    safeParseLocalStorage<DailyLog[]>(STORAGE_KEY, [])
  );
  const todayLog = useMemo(() => logs.find(l => l.date === today), [logs, today]);
  const [selectedMood, setSelectedMood] = useState<number>(todayLog?.mood || 0);
  const [justSaved, setJustSaved] = useState(false);

  // Sync state if logs change externally
  useEffect(() => {
    const onStorage = () => {
      const fresh = safeParseLocalStorage<DailyLog[]>(STORAGE_KEY, []);
      setLogs(fresh);
      const todayFresh = fresh.find(l => l.date === today);
      if (todayFresh) setSelectedMood(todayFresh.mood);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [today]);

  // Time-based greeting (translated via i18n in 7 languages)
  const greeting = useMemo(() => {
    const slot = timeSlot;
    return {
      icon: slot === "morning" ? Sun : slot === "afternoon" ? Coffee : Moon,
      title: t(`dashboardV2.greeting.${slot}`),
      tip: t(`dashboardV2.greeting.${slot}Tip`),
    };
  }, [timeSlot, t]);

  // Pregnancy progress
  const progress = isPregnant ? Math.min(100, (week / 40) * 100) : 0;
  const trimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;
  const daysRemaining = profile.dueDate
    ? Math.max(0, Math.ceil((new Date(profile.dueDate).getTime() - Date.now()) / 86400000))
    : isPregnant
    ? (40 - week) * 7
    : 0;

  // Ring math (140px)
  const ringSize = 140;
  const ringRadius = 60;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDash = (progress / 100) * circumference;

  // Formal mood scale — translated, no emojis
  const moods = [
    { value: 1, key: "difficult",  color: "hsl(0,55%,55%)" },
    { value: 2, key: "low",        color: "hsl(25,65%,55%)" },
    { value: 3, key: "neutral",    color: "hsl(45,60%,50%)" },
    { value: 4, key: "good",       color: "hsl(160,45%,45%)" },
    { value: 5, key: "excellent",  color: "hsl(180,50%,40%)" },
  ];

  const handleMoodTap = useCallback(
    (value: number) => {
      haptic("tap");
      setSelectedMood(value);

      const newLog: DailyLog = {
        date: today,
        mood: value,
        symptoms: todayLog?.symptoms || [],
        week: week || undefined,
      };
      const updated = [...logs.filter(l => l.date !== today), newLog].slice(-30);
      safeSaveToLocalStorage(STORAGE_KEY, updated);
      setLogs(updated);
      setJustSaved(true);
      window.dispatchEvent(new Event("storage"));
      setTimeout(() => setJustSaved(false), 1800);
    },
    [today, todayLog, logs, week]
  );

  const GreetingIcon = greeting.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-card via-card to-primary/[0.04] shadow-lg shadow-primary/5"
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-16 -end-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -start-20 h-44 w-44 rounded-full bg-secondary/15 blur-3xl" />

      <div className="relative px-5 pt-5 pb-4">
        {/* Greeting row */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GreetingIcon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary/70">
              {greeting.title}
            </p>
            <p className="mt-0.5 text-xs font-medium leading-tight text-muted-foreground line-clamp-2">
              {greeting.tip}
            </p>
          </div>
        </div>

        {/* Pregnancy section */}
        {isPregnant ? (
          <div className="flex items-center gap-5 mb-5">
            {/* Large Progress Ring */}
            <div className="relative flex-shrink-0" style={{ width: ringSize, height: ringSize }}>
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle cx="70" cy="70" r={ringRadius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity={0.2} />
                <motion.circle
                  cx="70" cy="70" r={ringRadius}
                  fill="none"
                  stroke="url(#heroProgressGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - strokeDash }}
                  transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />
                <defs>
                  <linearGradient id="heroProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="60%" stopColor="hsl(340, 60%, 60%)" />
                    <stop offset="100%" stopColor="hsl(300, 50%, 65%)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="text-5xl font-black leading-none text-foreground tabular-nums"
                  style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : undefined }}
                >
                  {week}
                </motion.span>
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("dashboardV2.progress.week")}
                </span>
              </div>
            </div>

            {/* Stats column */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary/80">
                  {t(`dashboardV2.progress.trimester${trimester}`)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-border/40 bg-background/60 px-2.5 py-2 backdrop-blur-sm">
                  <p className="text-2xl font-black leading-none text-foreground tabular-nums">{daysRemaining}</p>
                  <p className="mt-1 text-[9px] font-semibold leading-tight text-muted-foreground">
                    {t("dashboardV2.progress.daysLeft")}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/40 bg-background/60 px-2.5 py-2 backdrop-blur-sm">
                  <p className="text-2xl font-black leading-none text-foreground tabular-nums">{Math.round(progress)}<span className="text-sm">%</span></p>
                  <p className="mt-1 text-[9px] font-semibold leading-tight text-muted-foreground">
                    {t("dashboardV2.progress.complete")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Non-pregnant: simple welcome panel */
          <div className="flex items-center gap-3 mb-5 rounded-2xl border border-border/40 bg-background/60 p-4">
            <Sparkles className="h-7 w-7 text-primary flex-shrink-0" />
            <p className="text-sm font-semibold text-foreground leading-snug">
              {t("dashboardV2.progress.welcomeWellness")}
            </p>
          </div>
        )}

        {/* Mood Quick-Tap — formal scale */}
        <div className="rounded-2xl border border-border/30 bg-background/40 p-3 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-foreground">
              {t("dashboardV2.mood.title")}
            </p>
            {justSaved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
                {t("dashboardV2.mood.saved")}
              </motion.span>
            )}
          </div>

          <div className="flex items-center justify-between gap-1.5">
            {moods.map(m => {
              const active = selectedMood === m.value;
              const label = t(`dashboardV2.mood.${m.key}`);
              return (
                <motion.button
                  key={m.value}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleMoodTap(m.value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-primary/12 ring-1 ring-primary/40 shadow-sm"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                  aria-label={label}
                >
                  <span
                    className="block w-2.5 h-2.5 rounded-full transition-all"
                    style={{
                      backgroundColor: m.color,
                      opacity: active ? 1 : 0.55,
                      transform: active ? "scale(1.4)" : "scale(1)",
                    }}
                  />
                  <span
                    className={`text-[9px] font-semibold leading-none ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
