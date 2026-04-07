import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Droplets, Activity, Dumbbell, Utensils, Brain, ChevronRight, Bookmark, BookmarkCheck, Trash2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { useSmartInsight } from "@/hooks/useSmartInsight";
import { AIActionButton } from "@/components/ai/AIActionButton";
import { AIResponseFrame } from "@/components/ai/AIResponseFrame";
import { InlineDisclaimer } from "@/components/compliance/InlineDisclaimer";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";

interface SavedTip {
  id: string;
  message: string;
  week: number;
  savedAt: string;
}

const SAVED_TIPS_KEY = "daily_insights_saved_tips";
const MAX_SAVED_TIPS = 20;

const DailyInsights = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();
  const [showAI, setShowAI] = useState(false);
  const [savedTips, setSavedTips] = useState<SavedTip[]>(() =>
    safeParseLocalStorage<SavedTip[]>(SAVED_TIPS_KEY, [])
  );
  const [showSaved, setShowSaved] = useState(false);

  const week = profile.pregnancyWeek || 0;
  const trimester = week <= 13 ? 1 : week <= 27 ? 2 : 3;

  const { generate, isLoading, content: aiContent, error } = useSmartInsight({
    section: 'pregnancy-plan',
    toolType: 'daily-tips',
  });

  const currentTipKey = useMemo(() => {
    const w = week;
    const water = stats.dailyTracking.waterGlasses;
    const kicks = stats.dailyTracking.todayKicks;
    const vitamins = stats.dailyTracking.vitaminsTaken;
    const appointments = stats.planning.upcomingAppointments;
    if (w >= 34 && water < 4) return "hydration";
    if (w >= 28 && kicks === 0) return "movement";
    if (vitamins === 0) return "vitamins";
    if (appointments > 0 && w >= 36) return "appointment";
    if (w >= 35) return "hospitalBag";
    if (w >= 28) return "hydration";
    if (w >= 20) return "movement";
    if (w >= 12) return "nutrition";
    if (w >= 6) return "rest";
    return "general";
  }, [week, stats]);

  const currentTipMessage = t(`dailyInsights.tips.${currentTipKey}`, { week });

  const isTipSaved = useMemo(
    () => savedTips.some((tip) => tip.message === currentTipMessage),
    [savedTips, currentTipMessage]
  );

  const saveTip = useCallback(() => {
    if (isTipSaved) return;
    const newTip: SavedTip = {
      id: Date.now().toString(),
      message: currentTipMessage,
      week,
      savedAt: new Date().toISOString(),
    };
    const updated = [newTip, ...savedTips].slice(0, MAX_SAVED_TIPS);
    setSavedTips(updated);
    safeSaveToLocalStorage(SAVED_TIPS_KEY, updated);
  }, [isTipSaved, currentTipMessage, week, savedTips]);

  const removeTip = useCallback((id: string) => {
    const updated = savedTips.filter((tip) => tip.id !== id);
    setSavedTips(updated);
    safeSaveToLocalStorage(SAVED_TIPS_KEY, updated);
  }, [savedTips]);

  const handleGenerateInsight = useCallback(async () => {
    setShowAI(true);
    const prompt = `Give me a personalized daily insight for pregnancy week ${week} (trimester ${trimester}).
Context: Water intake today: ${stats.dailyTracking.waterGlasses} glasses. Kicks today: ${stats.dailyTracking.todayKicks}. Vitamins taken: ${stats.dailyTracking.vitaminsTaken}. Upcoming appointments: ${stats.planning.upcomingAppointments}.
${profile.healthConditions?.length ? `Health conditions: ${profile.healthConditions.join(", ")}` : ""}
Provide: 1 main recommendation, 2 secondary tips (nutrition + activity). Keep it concise and actionable.`;
    await generate({ prompt });
  }, [week, trimester, stats, profile.healthConditions, generate]);

  const suggestions = [
    {
      icon: Droplets,
      title: t("dailyInsights.suggestions.hydration.title"),
      desc: t("dailyInsights.suggestions.hydration.desc", { glasses: stats.dailyTracking.waterGlasses }),
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      action: () => {
        navigate("/dashboard");
        setTimeout(() => document.getElementById("hydration-tracker")?.scrollIntoView({ behavior: "smooth" }), 300);
      },
    },
    {
      icon: Activity,
      title: t("dailyInsights.suggestions.movement.title"),
      desc: t("dailyInsights.suggestions.movement.desc", { kicks: stats.dailyTracking.todayKicks }),
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      action: () => navigate("/tools/kick-counter"),
    },
  ];

  const quickActions = [
    { icon: Brain, label: t("dailyInsights.actions.logSymptoms"), path: "/tools/wellness-diary" },
    { icon: Droplets, label: t("dailyInsights.actions.trackWater"), path: "/dashboard" },
    { icon: Dumbbell, label: t("dailyInsights.actions.fitness", "Fitness"), path: "/tools/ai-fitness-coach" },
    { icon: Utensils, label: t("dailyInsights.actions.meals", "Meals"), path: "/tools/ai-meal-suggestion" },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("dailyInsights.pageTitle")}
        description="Personalized daily pregnancy insights"
      />

      <main className="container py-4 space-y-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary">
              {t("dailyInsights.badge", { week })}
            </span>
          </div>
          <h1 className="text-lg font-bold text-foreground">
            {t("dailyInsights.title")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("dailyInsights.subtitle")}
          </p>
        </motion.div>

        {/* Today's Tip with Save */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/8 to-accent/5">
            <CardContent className="p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-wide whitespace-normal leading-tight">
                      {t("dailyInsights.todaysInsight")}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 flex-shrink-0"
                      onClick={saveTip}
                      disabled={isTipSaved}
                    >
                      {isTipSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-primary" />
                      ) : (
                        <Bookmark className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <p className="text-[12px] text-foreground/85 leading-relaxed whitespace-normal">
                    {currentTipMessage}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Saved Tips Toggle */}
        {savedTips.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full h-9 text-xs gap-2"
              onClick={() => setShowSaved(!showSaved)}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="whitespace-normal leading-tight">
                {t("dailyInsights.savedTips.title")} ({savedTips.length})
              </span>
            </Button>

            <AnimatePresence>
              {showSaved && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-1.5 max-h-60 overflow-y-auto"
                >
                  {savedTips.map((tip) => (
                    <div
                      key={tip.id}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/10"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-foreground/80 leading-relaxed whitespace-normal">
                          {tip.message}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-1">
                          {t("dailyInsights.savedTips.week", { week: tip.week })} •{" "}
                          {new Date(tip.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeTip(tip.id)}
                        className="p-1 rounded hover:bg-destructive/10 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground/50 hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* AI Main Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                <h2 className="text-sm font-semibold text-foreground whitespace-normal leading-tight">
                  {t("dailyInsights.mainRecommendation")}
                </h2>
              </div>

              {showAI && (aiContent || isLoading || error) ? (
                <AIResponseFrame
                  content={aiContent}
                  isLoading={isLoading}
                  toolId="daily-insights"
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-normal">
                    {t("dailyInsights.aiPromptDesc")}
                  </p>
                  <AIActionButton
                    onClick={handleGenerateInsight}
                    isLoading={isLoading}
                    label={t("dailyInsights.generateInsight")}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Suggestions */}
        <div className="grid grid-cols-2 gap-3">
          {suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow h-full"
                onClick={s.action}
              >
                <CardContent className="p-3 space-y-2">
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <h3 className="text-xs font-semibold text-foreground whitespace-normal leading-tight">{s.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed whitespace-normal">{s.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4 space-y-3">
              <h2 className="text-sm font-semibold text-foreground whitespace-normal leading-tight">
                {t("dailyInsights.quickActions")}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((a, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2.5 px-3 justify-start gap-2 text-xs whitespace-normal leading-normal"
                    onClick={() => navigate(a.path)}
                  >
                    <a.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="whitespace-normal leading-tight">{a.label}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/50 ms-auto flex-shrink-0" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <InlineDisclaimer />
        </motion.div>
      </main>
    </Layout>
  );
};

export default DailyInsights;
