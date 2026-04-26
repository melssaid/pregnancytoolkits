import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Brain, Baby, ChevronLeft, ChevronRight, HeartPulse } from "lucide-react";
import { Card } from "@/components/ui/card";
import { safeParseLocalStorage } from "@/lib/safeStorage";

interface MoodEntry { date?: string; score?: number; }
interface SleepLog { startedAt?: string; }

/**
 * Postpartum-stage hero card on the dashboard.
 * Surfaces emotional-wellness (EPDS-style mood) check-in, lactation prep,
 * and recent baby sleep activity — the three pillars of postpartum care.
 */
export const PostpartumCareCard = memo(function PostpartumCareCard() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const moodEntries = safeParseLocalStorage<MoodEntry[]>(
    "wellness-diary-entries",
    [],
    (d): d is MoodEntry[] => Array.isArray(d)
  );
  const sleepLogs = safeParseLocalStorage<SleepLog[]>(
    "baby-sleep-logs",
    [],
    (d): d is SleepLog[] => Array.isArray(d)
  );

  const stats = useMemo(() => {
    const now = Date.now();
    const last7 = 7 * 86400000;
    const recentMood = moodEntries.filter(e => {
      if (!e.date) return false;
      const t = new Date(e.date).getTime();
      return !isNaN(t) && now - t < last7;
    });
    const recentSleep = sleepLogs.filter(s => {
      if (!s.startedAt) return false;
      const t = new Date(s.startedAt).getTime();
      return !isNaN(t) && now - t < last7;
    });
    return {
      moodCount: recentMood.length,
      sleepCount: recentSleep.length,
    };
  }, [moodEntries, sleepLogs]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
      aria-labelledby="postpartum-care-heading"
    >
      <h3
        id="postpartum-care-heading"
        className="text-[15px] font-extrabold text-foreground tracking-tight px-0.5"
      >
        {t("dashboardV2.postpartumCard.title", "ركائز التعافي")}
      </h3>

      <div className="grid grid-cols-1 gap-2">
        <Link to="/tools/postpartum-mental-health" className="block">
          <Card className="relative overflow-hidden rounded-2xl border-border/40 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-violet-500/10 p-3.5 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/85 text-violet-600 dark:text-violet-400 ring-1 ring-border/40 shadow-sm">
                <Brain className="h-5 w-5" strokeWidth={1.85} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-bold text-foreground leading-tight">
                  {t("dashboardV2.postpartumCard.mood.title", "الفحص النفسي الأسبوعي")}
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {stats.moodCount > 0
                    ? t("dashboardV2.postpartumCard.mood.recent", { count: stats.moodCount, defaultValue: `${stats.moodCount} تسجيل خلال 7 أيام` })
                    : t("dashboardV2.postpartumCard.mood.empty", "ابدئي تقييم EPDS هذا الأسبوع")}
                </p>
              </div>
              <Chevron className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
            </div>
          </Card>
        </Link>

        <Link to="/tools/ai-lactation-prep" className="block">
          <Card className="relative overflow-hidden rounded-2xl border-border/40 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 p-3.5 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/85 text-amber-600 dark:text-amber-400 ring-1 ring-border/40 shadow-sm">
                <HeartPulse className="h-5 w-5" strokeWidth={1.85} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-bold text-foreground leading-tight">
                  {t("dashboardV2.postpartumCard.lactation.title", "دعم الرضاعة الطبيعية")}
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {t("dashboardV2.postpartumCard.lactation.desc", "خطة وإرشادات يومية للرضاعة")}
                </p>
              </div>
              <Chevron className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
            </div>
          </Card>
        </Link>

        <Link to="/tools/baby-sleep-tracker" className="block">
          <Card className="relative overflow-hidden rounded-2xl border-border/40 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-indigo-500/10 p-3.5 hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/85 text-indigo-600 dark:text-indigo-400 ring-1 ring-border/40 shadow-sm">
                <Baby className="h-5 w-5" strokeWidth={1.85} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-bold text-foreground leading-tight">
                  {t("dashboardV2.postpartumCard.sleep.title", "نوم الطفل")}
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {stats.sleepCount > 0
                    ? t("dashboardV2.postpartumCard.sleep.recent", { count: stats.sleepCount, defaultValue: `${stats.sleepCount} جلسة خلال 7 أيام` })
                    : t("dashboardV2.postpartumCard.sleep.empty", "سجّلي أول جلسة نوم لطفلكِ")}
                </p>
              </div>
              <Chevron className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
            </div>
          </Card>
        </Link>
      </div>
    </motion.section>
  );
});

export default PostpartumCareCard;
