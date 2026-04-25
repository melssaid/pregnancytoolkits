/**
 * DailyNutritionCard
 *
 * Surfaces the user's most recent saved meal-suggestion and a quick balance
 * tip. Reads from the same `SAVED_RESULTS` storage used by the AI Meal tool
 * — no new persistence layer.
 */
import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Apple, ChevronLeft, ChevronRight, Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeParseLocalStorage } from "@/lib/safeStorage";
import { STORAGE_KEYS } from "@/lib/dataBus";

interface SavedResult {
  toolId: string;
  title?: string;
  summary?: string;
  createdAt?: string;
  timestamp?: string;
}

export const DailyNutritionCard = memo(function DailyNutritionCard() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const data = useMemo(() => {
    const saved =
      safeParseLocalStorage<SavedResult[]>(STORAGE_KEYS.SAVED_RESULTS, []) ||
      [];
    const meals = saved.filter((r) => r?.toolId === "ai-meal-suggestion");
    const sorted = [...meals].sort((a, b) => {
      const tb = new Date(b.createdAt || b.timestamp || 0).getTime();
      const ta = new Date(a.createdAt || a.timestamp || 0).getTime();
      return tb - ta;
    });
    return { latest: sorted[0] || null, total: meals.length };
  }, []);

  if (!data.latest) {
    return (
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-card to-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Apple className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">
                {t("dashboardV2.nutrition.title")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                {t("dashboardV2.nutrition.emptyDesc")}
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="w-full mt-3 h-9 rounded-xl text-xs font-semibold"
          >
            <Link to="/tools/ai-meal-suggestion">
              {t("dashboardV2.nutrition.startCta")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const title = (data.latest.title || data.latest.summary || "").trim();
  const snippet =
    title.length > 0
      ? title.slice(0, 100) + (title.length > 100 ? "…" : "")
      : t("dashboardV2.nutrition.savedMeal");

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-primary/20">
        <div className="h-1 bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40" />
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Utensils className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {t("dashboardV2.nutrition.title")}
                </h3>
                <p className="text-[10.5px] text-muted-foreground">
                  {t("dashboardV2.nutrition.totalSaved", {
                    count: data.total,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 p-3 border border-border/50">
            <p className="text-[11.5px] text-foreground/90 leading-relaxed line-clamp-3">
              {snippet}
            </p>
          </div>

          <p className="text-[10.5px] text-muted-foreground mt-2 leading-snug">
            💡 {t("dashboardV2.nutrition.tip")}
          </p>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full mt-3 h-8 rounded-xl text-[11px] font-semibold gap-1"
          >
            <Link to="/tools/ai-meal-suggestion">
              {t("dashboardV2.nutrition.openCta")}
              {isRTL ? (
                <ChevronLeft className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default DailyNutritionCard;
