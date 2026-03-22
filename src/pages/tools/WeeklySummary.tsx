import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Baby, RefreshCw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ToolFrame } from "@/components/ToolFrame";
import { MedicalDisclaimer } from "@/components/compliance";
import { useSmartInsight } from "@/hooks/useSmartInsight";
import { AIActionButton } from "@/components/ai/AIActionButton";
import { AIResponseFrame } from "@/components/ai/AIResponseFrame";
import { PrintableReport } from "@/components/PrintableReport";
import { WeekSlider } from "@/components/WeekSlider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";

// Weekly journey editorial components
import { WeeklyHeroSection } from "@/components/weekly-journey/WeeklyHeroSection";
import { FetalDevelopmentCard } from "@/components/weekly-journey/FetalDevelopmentCard";
import { BodyChangesCard } from "@/components/weekly-journey/BodyChangesCard";
import { NutritionFocusCard } from "@/components/weekly-journey/NutritionFocusCard";
import { MentalWellnessCard } from "@/components/weekly-journey/MentalWellnessCard";
import { DoctorQuestionsCard } from "@/components/weekly-journey/DoctorQuestionsCard";
import { WeeklyChecklistCard } from "@/components/weekly-journey/WeeklyChecklistCard";

const STORAGE_KEY = "weekly-summary-data";

interface WeeklySummaryEntry {
  week: number;
  content: string;
  generatedAt: string;
}

function loadSavedSummaries(): WeeklySummaryEntry[] {
  return safeParseLocalStorage<WeeklySummaryEntry[]>(STORAGE_KEY, [], (d): d is WeeklySummaryEntry[] => Array.isArray(d));
}

function saveSummary(week: number, content: string) {
  const entries = loadSavedSummaries();
  const filtered = entries.filter(e => e.week !== week);
  const newEntry: WeeklySummaryEntry = { week, content, generatedAt: new Date().toISOString() };
  const updated = [newEntry, ...filtered].slice(0, 20);
  safeSaveToLocalStorage(STORAGE_KEY, updated);
}

export default function WeeklySummary() {
  const { t } = useTranslation();
  const { generate, isLoading, content: aiSummary, error, reset: resetAI } = useSmartInsight({
    section: 'pregnancy-plan',
    toolType: 'weekly-summary',
  });
  const { profile: userProfile, setPregnancyWeek } = useUserProfile();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [week, setWeek] = useState<number>(userProfile.pregnancyWeek || 20);
  const [showAI, setShowAI] = useState(false);
  const [savedContent, setSavedContent] = useState("");

  // Load saved AI result for the current week
  useEffect(() => {
    const saved = loadSavedSummaries().find(e => e.week === week);
    if (saved && !showAI) {
      setSavedContent(saved.content);
      setShowAI(true);
    }
  }, [week]);

  const handleWeekChange = useCallback((newWeek: number) => {
    setWeek(newWeek);
    setPregnancyWeek(newWeek);
    resetAI();
    const saved = loadSavedSummaries().find(e => e.week === newWeek);
    if (saved) {
      setSavedContent(saved.content);
      setShowAI(true);
    } else {
      setSavedContent("");
      setShowAI(false);
    }
  }, [setPregnancyWeek, resetAI]);

  const generateAIInsight = async () => {
    setSavedContent("");
    setShowAI(true);

    const prompt = `As a pregnancy wellness guide, provide a comprehensive personalized analysis for week ${week} of pregnancy. Include specific advice, warnings to watch for, and personalized tips based on this stage.`;

    await generate({
      prompt,
      context: { week },
      onDelta: (chunk) => {
        // We'll save after completion using content from the hook
      },
    });
  };

  // Save to localStorage when generation completes
  useEffect(() => {
    if (!isLoading && aiSummary && aiSummary.length > 10) {
      saveSummary(week, aiSummary);
    }
  }, [isLoading, aiSummary, week]);

  const displayContent = aiSummary || savedContent;

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="Weekly Summary"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t("tools.weeklySummary.title")}
      subtitle={t("weeklyJourney.subtitle")}
      customIcon="calendar"
      mood="nurturing"
      toolId="weekly-summary"
    >
      <div className="space-y-4">
        <WeekSlider
          week={week}
          onChange={handleWeekChange}
          showTrimester={false}
          label={t("toolsInternal.weeklySummary.pregnancyWeek")}
        />

        <WeeklyHeroSection week={week} />
        <FetalDevelopmentCard week={week} />
        <BodyChangesCard week={week} />
        <NutritionFocusCard week={week} />
        <MentalWellnessCard week={week} />
        <DoctorQuestionsCard week={week} />
        <WeeklyChecklistCard week={week} />

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {!showAI && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">{t("weeklyJourney.sections.aiInsight")}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {t("weeklyJourney.aiDescription")}
            </p>
            <AIActionButton
              onClick={generateAIInsight}
              isLoading={isLoading}
              label={t("weeklyJourney.generateAI")}
              loadingLabel={t("toolsInternal.weeklySummary.generating")}
            />
          </motion.div>
        )}

        <AnimatePresence>
          {(showAI || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <PrintableReport title={t("toolsInternal.weeklySummary.weekSummary", { week })} isLoading={isLoading}>
                <AIResponseFrame
                  title={t("weeklyJourney.sections.aiInsight")}
                  content={displayContent}
                  isLoading={isLoading}
                  icon={Baby}
                  toolId="weekly-summary"
                />
              </PrintableReport>

              {!isLoading && displayContent && (
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={generateAIInsight}
                    className="flex-1 rounded-xl h-10 flex items-center justify-center gap-2 text-white text-xs font-semibold"
                    style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))" }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t("toolsInternal.weeklySummary.regenerate")}
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="p-4 rounded-xl border border-destructive/50 bg-destructive/10">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}
      </div>
    </ToolFrame>
  );
}
