import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  Baby, 
  Loader2, 
  RefreshCw,
  History,
  ChevronRight,
  Trash2,
  CloudOff,
  Save,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ToolFrame } from "@/components/ToolFrame";
import { MedicalDisclaimer } from "@/components/compliance";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { AIActionButton } from '@/components/ai/AIActionButton';
import { AIResponseFrame } from "@/components/ai/AIResponseFrame";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { WeekSlider } from "@/components/WeekSlider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { RelatedToolLinks } from "@/components/RelatedToolLinks";

const STORAGE_KEY = "weekly-summary-data";

interface WeeklySummaryData {
  week: number;
  content: string;
  generatedAt: string;
}

export default function WeeklySummary() {
  const { t } = useTranslation();
  const { streamChat, isLoading, error } = usePregnancyAI();
  const { profile: userProfile } = useUserProfile();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [week, setWeek] = useState<number>(userProfile.pregnancyWeek || 20);
  const [summary, setSummary] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useResetOnLanguageChange(() => {
    setSummary('');
  });
  const [savedSummaries, setSavedSummaries] = useState<WeeklySummaryData[]>([]);

  useEffect(() => {
    const saved = safeParseLocalStorage<WeeklySummaryData[]>(
      STORAGE_KEY,
      [],
      (data): data is WeeklySummaryData[] => Array.isArray(data)
    );
    setSavedSummaries(saved);
    if (userProfile.pregnancyWeek) setWeek(userProfile.pregnancyWeek);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-load saved summary for selected week
  useEffect(() => {
    const existingSummary = savedSummaries.find(s => s.week === week);
    if (existingSummary && !isLoading) {
      setSummary(existingSummary.content);
    } else if (!isLoading) {
      setSummary("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  const handleWeekChange = useCallback((newWeek: number) => {
    setWeek(newWeek);
  }, []);

  const deleteSummary = useCallback((generatedAt: string) => {
    const updated = savedSummaries.filter(s => s.generatedAt !== generatedAt);
    setSavedSummaries(updated);
    safeSaveToLocalStorage(STORAGE_KEY, updated);
    // If deleting current week's summary, clear display
    const deleted = savedSummaries.find(s => s.generatedAt === generatedAt);
    if (deleted && deleted.week === week) {
      setSummary("");
    }
  }, [savedSummaries, week]);

  const accumulatedRef = useRef("");

  const getSummary = async () => {
    setSummary("");
    setJustSaved(false);
    accumulatedRef.current = "";

    const prompt = `As a pregnancy wellness guide, provide a comprehensive weekly summary for week ${week} of pregnancy. Cover baby's development, mother's changes, nutrition tips, exercise recommendations, and important milestones.`;

    await streamChat({
      type: "weekly-summary",
      messages: [{ role: "user", content: prompt }],
      context: { week },
      onDelta: (chunk) => {
        accumulatedRef.current += chunk;
        setSummary((prev) => prev + chunk);
      },
      onDone: () => {
        const newSummary: WeeklySummaryData = {
          week,
          content: accumulatedRef.current,
          generatedAt: new Date().toISOString(),
        };
        const updated = [newSummary, ...savedSummaries.filter(s => s.week !== week)].slice(0, 40);
        setSavedSummaries(updated);
        safeSaveToLocalStorage(STORAGE_KEY, updated);
        setJustSaved(true);
        // Reset the "just saved" indicator after 3 seconds
        setTimeout(() => setJustSaved(false), 3000);
      },
    });
  };

  const getTrimester = (w: number) => {
    if (w <= 12) return { label: t("toolsInternal.weeklySummary.trimester.first"), color: "bg-accent" };
    if (w <= 27) return { label: t("toolsInternal.weeklySummary.trimester.second"), color: "bg-primary" };
    return { label: t("toolsInternal.weeklySummary.trimester.third"), color: "bg-secondary-foreground" };
  };

  const trimesterInfo = getTrimester(week);
  const progress = (week / 40) * 100;
  const daysRemaining = (40 - week) * 7;
  const currentWeekSaved = savedSummaries.find(s => s.week === week);

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
      subtitle={t("toolsInternal.weeklySummary.subtitle")}
      customIcon="calendar"
      mood="nurturing"
      toolId="weekly-summary"
    >
      <div className="space-y-4">
        {/* Progress Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
            <Badge className={`${trimesterInfo.color} text-white text-xs`}>{trimesterInfo.label}</Badge>
            <span className="text-xs text-muted-foreground">{t("toolsInternal.weeklySummary.daysToGo", { days: daysRemaining })}</span>
          </div>
          {/* Auto-save indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Save className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] font-medium text-emerald-600">
              {t("toolsInternal.weeklySummary.autoSave", "حفظ تلقائي")}
            </span>
          </div>
        </div>

        {/* Week Selector */}
        <WeekSlider
          week={week}
          onChange={handleWeekChange}
          showTrimester={false}
          label={t("toolsInternal.weeklySummary.pregnancyWeek")}
        />

        {/* Progress Card */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Baby className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t("toolsInternal.weeklySummary.week", { week })}</p>
                  <p className="text-xs text-muted-foreground">{trimesterInfo.label}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {t("toolsInternal.weeklySummary.approximatelyRemaining", { days: daysRemaining })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Generate / Regenerate Button */}
        {!summary && !isLoading && (
          <AIActionButton
            onClick={getSummary}
            isLoading={isLoading}
            label={t("toolsInternal.weeklySummary.showSummary", { week })}
            loadingLabel={t("toolsInternal.weeklySummary.generating", "Generating...")}
          />
        )}

        {/* Summary Result */}
        {(summary || isLoading) && (
          <div className="space-y-3">
            {/* Auto-save confirmation toast */}
            <AnimatePresence>
              {justSaved && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">
                    {t("toolsInternal.weeklySummary.savedAutomatically", "تم الحفظ تلقائياً")}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <AIResponseFrame
              title={t("toolsInternal.weeklySummary.weekSummary", { week })}
              content={summary}
              isLoading={isLoading}
              icon={Baby}
            />

            {/* Saved date indicator */}
            {currentWeekSaved && !isLoading && (
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground/60">
                <Calendar className="w-3 h-3" />
                <span className="text-[10px]">
                  {t("toolsInternal.weeklySummary.lastGenerated", "آخر تحديث")}: {new Date(currentWeekSaved.generatedAt).toLocaleDateString()} — {new Date(currentWeekSaved.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}

            {/* Actions */}
            {!isLoading && (
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={getSummary}
                  disabled={isLoading}
                  className="relative flex-1 overflow-hidden rounded-xl h-10 flex items-center justify-center gap-2 text-white text-xs font-semibold disabled:opacity-60 disabled:pointer-events-none"
                  style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))" }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t("toolsInternal.weeklySummary.regenerate", "إعادة التوليد")}
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* History Section */}
        {savedSummaries.length > 0 && (
          <div className="space-y-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  {t("toolsInternal.weeklySummary.previousSummaries", "الملخصات السابقة")}
                </span>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {savedSummaries.length}
                </Badge>
              </div>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${showHistory ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 overflow-hidden"
                >
                  {savedSummaries.map((s) => {
                    const tri = getTrimester(s.week);
                    const isActive = s.week === week && summary === s.content;
                    return (
                      <motion.button
                        key={s.generatedAt}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => { setWeek(s.week); setSummary(s.content); setShowHistory(false); }}
                        className={`w-full text-start p-3 rounded-xl border transition-all group relative ${
                          isActive 
                            ? 'bg-primary/8 border-primary/30 shadow-sm' 
                            : 'bg-muted/30 hover:bg-muted border-border/40 hover:border-primary/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Baby className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-semibold text-foreground">
                              {t("toolsInternal.weeklySummary.week", { week: s.week })}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full text-white ${tri.color}`}>
                              {tri.label}
                            </span>
                            {isActive && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                                {t("toolsInternal.weeklySummary.current", "الحالي")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="text-[10px]">
                              {new Date(s.generatedAt).toLocaleDateString()}
                            </span>
                            <span
                              role="button"
                              onClick={(e) => { e.stopPropagation(); deleteSummary(s.generatedAt); }}
                              className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {s.content.replace(/[#*`]/g, '').slice(0, 120)}…
                        </p>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {!summary && !isLoading && savedSummaries.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Baby className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs font-medium">
              {t("toolsInternal.weeklySummary.noSummariesYet", "لا توجد ملخصات بعد")}
            </p>
            <p className="text-[11px] mt-1 opacity-70">
              {t("toolsInternal.weeklySummary.generateFirstHint")}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-sm text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Storage info */}
        <div className="flex items-center justify-center gap-2 py-2">
          <CloudOff className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/40">
            {t("toolsInternal.weeklySummary.localStorageNote", "البيانات محفوظة محلياً على جهازك")}
          </span>
        </div>

        {/* Related Tools */}
        <RelatedToolLinks links={[
          { to: "/tools/pregnancy-assistant", titleKey: "toolsInternal.weeklySummary.assistantLink", titleFallback: "Pregnancy Assistant", descKey: "toolsInternal.weeklySummary.assistantLinkDesc", descFallback: "Chat with your AI pregnancy assistant", icon: "heart" },
          { to: "/tools/smart-plan", titleKey: "toolsInternal.weeklySummary.smartPlanLink", titleFallback: "Smart Pregnancy Plan", descKey: "toolsInternal.weeklySummary.smartPlanLinkDesc", descFallback: "Personalized pregnancy planning", icon: "fileText" },
        ]} />

        {/* Tips */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              {t("toolsInternal.weeklySummary.trackTip")}
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
