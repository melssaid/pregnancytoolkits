import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Droplets, Activity, Pill, Calendar, Brain, ChevronRight } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { AIActionButton } from "@/components/ai/AIActionButton";
import { AIResponseFrame } from "@/components/ai/AIResponseFrame";
import { InlineDisclaimer } from "@/components/compliance/InlineDisclaimer";

const DailyInsights = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();
  const [aiContent, setAiContent] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const week = profile.pregnancyWeek || 0;
  const trimester = week <= 13 ? 1 : week <= 27 ? 2 : 3;

  const { generateContent, isLoading, error } = usePregnancyAI();

  const handleGenerateInsight = useCallback(async () => {
    setShowAI(true);
    setAiLoading(true);
    setAiContent("");
    try {
      const prompt = `Give me a personalized daily insight for pregnancy week ${week} (trimester ${trimester}).
Context: Water intake today: ${stats.dailyTracking.waterGlasses} glasses. Kicks today: ${stats.dailyTracking.todayKicks}. Vitamins taken: ${stats.dailyTracking.vitaminsTaken}. Upcoming appointments: ${stats.planning.upcomingAppointments}.
${profile.healthConditions?.length ? `Health conditions: ${profile.healthConditions.join(', ')}` : ''}
Provide: 1 main recommendation, 2 secondary tips (nutrition + activity). Keep it concise and actionable.`;
      const result = await generateContent(prompt);
      setAiContent(result || "");
    } catch {
      // error handled by hook
    } finally {
      setAiLoading(false);
    }
  }, [week, trimester, stats, profile.healthConditions, generateContent]);

  // Secondary suggestion cards based on local data
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

  // Quick actions
  const quickActions = [
    { icon: Brain, label: t("dailyInsights.actions.logSymptoms"), path: "/tools/wellness-diary" },
    { icon: Droplets, label: t("dailyInsights.actions.trackWater"), path: "/dashboard" },
    { icon: Pill, label: t("dailyInsights.actions.logVitamins"), path: "/tools/vitamin-tracker" },
    { icon: Calendar, label: t("dailyInsights.actions.viewAppointments"), path: "/tools/smart-appointment-reminder" },
  ];

  return (
    <Layout>
      <SEOHead
        title={t("dailyInsights.pageTitle")}
        description="Personalized daily pregnancy insights"
      />

      <main className="container py-4 space-y-4 pb-24">
        {/* Header */}
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

        {/* AI Main Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">
                  {t("dailyInsights.mainRecommendation")}
                </h2>
              </div>

              {showAI && (aiContent || aiLoading || error) ? (
                <AIResponseFrame
                  content={aiContent}
                  isLoading={aiLoading || isLoading}
                  toolId="daily-insights"
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("dailyInsights.aiPromptDesc")}
                  </p>
                  <AIActionButton
                    onClick={handleGenerateInsight}
                    isLoading={aiLoading || isLoading}
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
                  <h3 className="text-xs font-semibold text-foreground">{s.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{s.desc}</p>
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
              <h2 className="text-sm font-semibold text-foreground">
                {t("dailyInsights.quickActions")}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((a, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2.5 px-3 justify-start gap-2 text-xs"
                    onClick={() => navigate(a.path)}
                  >
                    <a.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{a.label}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground/50 ms-auto flex-shrink-0" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Section */}
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
