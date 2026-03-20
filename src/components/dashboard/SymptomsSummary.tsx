import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { safeParseLocalStorage } from "@/lib/safeStorage";

export const SymptomsSummary = memo(function SymptomsSummary() {
  const { t } = useTranslation();

  const { symptoms, mood, savedAt } = useMemo(() => {
    const data = safeParseLocalStorage<any>("dashboard_health_checkin_v1", null);
    if (!data) return { symptoms: [], mood: "", savedAt: "" };
    return {
      symptoms: data.symptoms || [],
      mood: data.mood || "",
      savedAt: data.savedAt || "",
    };
  }, []);

  const moodEmoji: Record<string, string> = {
    Excellent: "😄", Good: "🙂", Normal: "😐", Anxious: "😰", Bad: "😞",
  };

  if (!savedAt && symptoms.length === 0 && !mood) return null;

  return (
    <Link to="/tools/wellness-diary">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="rounded-2xl border border-border/20 bg-card p-3.5 hover:border-primary/20 transition-colors group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground">{t("dailyDashboard.symptoms.title")}</h3>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {mood && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">{moodEmoji[mood] || "😐"}</span>
            <span className="text-[11px] font-medium text-foreground">
              {t(`dashboard.health.moods.${mood.toLowerCase()}`, mood)}
            </span>
          </div>
        )}

        {symptoms.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {symptoms.map((s: string) => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {t(`dashboard.health.symptoms.${s}`, s)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground">{t("dailyDashboard.symptoms.noSymptoms")}</p>
        )}
      </motion.div>
    </Link>
  );
});
