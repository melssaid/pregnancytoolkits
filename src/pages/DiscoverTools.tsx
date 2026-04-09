import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toolsData } from "@/lib/tools-data";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { useMemo } from "react";

/**
 * Recommends tools based on pregnancy week stored in localStorage.
 * If no week data, shows popular tools sorted by priority.
 */
function getRecommendedTools(week: number | null) {
  // Tools mapped to pregnancy phases
  const phaseMap: Record<string, [number, number]> = {
    "cycle-tracker": [0, 4],
    "due-date-calculator": [0, 10],
    "fertility-academy": [0, 6],
    "preconception-checkup": [0, 6],
    "nutrition-supplements": [0, 42],
    "fetal-growth": [5, 42],
    "weekly-summary": [4, 42],
    "ai-meal-suggestion": [4, 42],
    "kick-counter": [20, 42],
    "weight-gain": [8, 42],
    "contraction-timer": [34, 42],
    "ai-birth-plan": [28, 40],
    "ai-hospital-bag": [30, 40],
    "ai-fitness-coach": [4, 38],
    "pregnancy-comfort": [12, 42],
    "wellness-diary": [4, 42],
    "vitamin-tracker": [0, 42],
    "smart-pregnancy-plan": [4, 42],
    "ai-bump-photos": [10, 40],
    "ai-partner-guide": [20, 42],
    "baby-gear-recommender": [28, 42],
    "smart-appointment-reminder": [4, 42],
    "postpartum-recovery": [38, 50],
    "baby-cry-translator": [38, 50],
    "baby-sleep-tracker": [38, 50],
    "baby-growth": [38, 50],
    "diaper-tracker": [38, 50],
    "ai-lactation-prep": [30, 50],
    "postpartum-mental-health": [34, 50],
  };

  if (week === null) {
    return toolsData.slice().sort((a, b) => a.priority - b.priority);
  }

  // Score tools by relevance to current week
  return toolsData
    .map(tool => {
      const range = phaseMap[tool.id];
      let score = 0;
      if (range) {
        if (week >= range[0] && week <= range[1]) {
          score = 100 - Math.abs(week - (range[0] + range[1]) / 2);
        }
      }
      return { ...tool, score };
    })
    .sort((a, b) => b.score - a.score);
}

export default function DiscoverTools() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const week = useMemo(() => {
    try {
      const saved = localStorage.getItem("pregnancyWeek");
      if (saved) return parseInt(saved, 10);
      const dueDate = localStorage.getItem("dueDate");
      if (dueDate) {
        const diff = new Date(dueDate).getTime() - Date.now();
        const weeksLeft = Math.round(diff / (7 * 24 * 60 * 60 * 1000));
        return Math.max(4, 40 - weeksLeft);
      }
    } catch {}
    return null;
  }, []);

  // Track which tools user has visited
  const usedTools = useMemo(() => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("tool_visited_"));
      return new Set(keys.map(k => k.replace("tool_visited_", "")));
    } catch { return new Set<string>(); }
  }, []);

  const recommended = useMemo(() => getRecommendedTools(week), [week]);
  const newTools = recommended.filter(t => !usedTools.has(t.id));
  const usedToolsList = recommended.filter(t => usedTools.has(t.id));

  return (
    <Layout showBack>
      <SEOHead title={t("discover.seoTitle", "Discover New Tools")} noindex />
      <div className="container max-w-2xl pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
          <h1 className="text-xl font-bold text-foreground mb-1">
            {t("discover.title", "Discover Tools for You")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {week ? t("discover.weekContext", { week, defaultValue: "Recommended for week {{week}} of your journey" }) : t("discover.generalContext", "Based on popular tools")}
          </p>
        </motion.div>

        {/* New / Not yet tried */}
        {newTools.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="h-1 w-6 rounded-full bg-primary" />
              {t("discover.newForYou", "New for You")}
              <span className="text-[10px] text-muted-foreground font-normal">({newTools.length})</span>
            </h2>
            <div className="space-y-2">
              {newTools.slice(0, 10).map((tool, i) => {
                const Icon = tool.icon;
                return (
                  <motion.div key={tool.id} initial={{ opacity: 0, x: isRTL ? 10 : -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link to={tool.href} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{t(tool.titleKey)}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{t(tool.descriptionKey)}</div>
                      </div>
                      {tool.hasAI && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">AI</span>}
                      <ArrowIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Already used */}
        {usedToolsList.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-muted-foreground mb-3">
              {t("discover.alreadyUsed", "Already Used")} ({usedToolsList.length})
            </h2>
            <div className="space-y-1.5 opacity-70">
              {usedToolsList.slice(0, 8).map(tool => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} to={tool.href} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t(tool.titleKey)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
