import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Utensils, Dumbbell, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { safeParseLocalStorage } from "@/lib/safeStorage";
import type { SavedAIResult } from "@/hooks/useSavedResults";
import { formatDistanceToNow } from "date-fns";
import { ar, de, fr, es, pt, tr } from "date-fns/locale";

const localeMap: Record<string, Locale> = { ar, de, fr, es, pt, tr };

function getLatest(toolId: string): SavedAIResult | null {
  const all = safeParseLocalStorage<SavedAIResult[]>('ai-saved-results', [], (d): d is SavedAIResult[] => Array.isArray(d));
  const filtered = all.filter(r => r.toolId === toolId).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  return filtered[0] || null;
}

export const RecentMealFitnessSummary = memo(function RecentMealFitnessSummary() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const dateFnsLocale = localeMap[lang];

  const latestMeal = useMemo(() => getLatest('ai-meal-suggestion'), []);
  const latestFitness = useMemo(() => getLatest('ai-fitness-coach'), []);

  if (!latestMeal && !latestFitness) return null;

  const items = [
    latestMeal && {
      icon: Utensils,
      title: latestMeal.title,
      time: latestMeal.savedAt,
      href: "/tools/ai-meal-suggestion",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    latestFitness && {
      icon: Dumbbell,
      title: latestFitness.title,
      time: latestFitness.savedAt,
      href: "/tools/ai-fitness-coach",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ].filter(Boolean) as Array<{ icon: React.ElementType; title: string; time: string; href: string; color: string; bg: string }>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border border-border/20 bg-card p-3.5"
    >
      <h3 className="text-base font-bold text-foreground mb-2.5 whitespace-normal leading-tight">
        {t("dailyDashboard.recentActivity", "النشاط الأخير")}
      </h3>

      <div className="space-y-2">
        {items.map((item) => (
          <Link key={item.href} to={item.href}>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(item.time), { addSuffix: true, locale: dateFnsLocale })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
});
