import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  Baby, 
  Sparkles, 
  Loader2, 
  RefreshCw,
  History,
  ChevronRight,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ToolFrame } from "@/components/ToolFrame";
import { MedicalDisclaimer } from "@/components/compliance";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { WeekSlider } from "@/components/WeekSlider";
import { useUserProfile } from "@/hooks/useUserProfile";

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
  // Initialize week from central profile
  const [week, setWeek] = useState<number>(userProfile.pregnancyWeek ?? 20);
  const [summary, setSummary] = useState<string>("");

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
    // Sync week from central profile on mount
    if (userProfile.pregnancyWeek) setWeek(userProfile.pregnancyWeek);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWeekChange = useCallback((newWeek: number) => {
    setWeek(newWeek);
  }, []);

  const accumulatedRef = useRef("");

  const getSummary = async () => {
    setSummary("");
    accumulatedRef.current = "";

    const prompt = `Please provide a comprehensive summary for week ${week} of pregnancy.`;

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
        const updated = [newSummary, ...savedSummaries.filter(s => s.week !== week)].slice(0, 10);
        setSavedSummaries(updated);
        safeSaveToLocalStorage(STORAGE_KEY, updated);
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
          <Badge className={`${trimesterInfo.color} text-white text-xs`}>{trimesterInfo.label}</Badge>
          <span className="text-xs text-muted-foreground">{t("toolsInternal.weeklySummary.daysToGo", { days: daysRemaining })}</span>
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

        {!summary ? (
          <>
            {/* Generate Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={getSummary}
              disabled={isLoading}
              className="relative w-full overflow-hidden rounded-xl h-11 flex items-center justify-center gap-2 text-white text-sm font-semibold shadow-lg disabled:opacity-60 disabled:pointer-events-none"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin shrink-0" /><span>{t("toolsInternal.weeklySummary.generating", "Generating...")}</span></>
              ) : (
                <><Brain className="w-4 h-4 shrink-0" /><span>{t("toolsInternal.weeklySummary.showSummary", { week })}</span><Sparkles className="w-3.5 h-3.5 shrink-0 opacity-80" /></>
              )}
            </motion.button>

            {/* Real Previous Summaries — replaces fake static cards */}
            {savedSummaries.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <History className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("toolsInternal.weeklySummary.previousSummaries", "Previous Summaries")}
                  </p>
                </div>
                {savedSummaries.slice(0, 4).map((s) => {
                  const tri = getTrimester(s.week);
                  return (
                    <button
                      key={s.generatedAt}
                      onClick={() => { setWeek(s.week); setSummary(s.content); }}
                      className="w-full text-start p-3 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Baby className="w-3.5 h-3.5 text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            {t("toolsInternal.weeklySummary.week", { week: s.week })}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${tri.color}`}>
                            {tri.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                          <span className="text-[10px]">
                            {new Date(s.generatedAt).toLocaleDateString()}
                          </span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                        {s.content.replace(/[#*`]/g, '').slice(0, 130)}…
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Empty state — only shown if no summaries exist yet */
              <div className="text-center py-8 text-muted-foreground">
                <Baby className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">
                  {t("toolsInternal.weeklySummary.noSummariesYet", "No summaries yet")}
                </p>
                <p className="text-xs mt-1 opacity-70">
                  {t("toolsInternal.weeklySummary.generateFirstHint", "Tap the button above to generate your first weekly summary")}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Summary Result */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Baby className="w-5 h-5 text-primary" />
                  {t("toolsInternal.weeklySummary.weekSummary", { week })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer 
                  content={summary} 
                  isLoading={isLoading} 
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => setSummary("")} variant="outline" className="flex-1 text-xs h-9">
                {t("toolsInternal.weeklySummary.differentWeek")}
              </Button>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={getSummary}
                disabled={isLoading}
                className="relative flex-1 overflow-hidden rounded-md h-9 flex items-center justify-center gap-1.5 text-white text-xs font-semibold disabled:opacity-60 disabled:pointer-events-none"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))" }}
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                {t("toolsInternal.weeklySummary.refresh")}
              </motion.button>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-sm text-destructive text-center">{error}</p>
            </CardContent>
          </Card>
        )}

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
