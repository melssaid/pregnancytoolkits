import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { 
  Baby, 
  Sparkles, 
  Loader2, 
  TrendingUp,
  Heart,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ToolFrame } from "@/components/ToolFrame";
import { MedicalDisclaimer } from "@/components/compliance";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { WeekSlider } from "@/components/WeekSlider";

const STORAGE_KEY = "weekly-summary-data";

interface WeeklySummaryData {
  week: number;
  content: string;
  generatedAt: string;
}

export default function WeeklySummary() {
  const { t } = useTranslation();
  const { streamChat, isLoading, error } = usePregnancyAI();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [week, setWeek] = useState<number>(20);
  const [summary, setSummary] = useState<string>("");
  const [savedSummaries, setSavedSummaries] = useState<WeeklySummaryData[]>([]);

  useEffect(() => {
    const saved = safeParseLocalStorage<WeeklySummaryData[]>(
      STORAGE_KEY,
      [],
      (data): data is WeeklySummaryData[] => Array.isArray(data)
    );
    setSavedSummaries(saved);
  }, []);

  const handleWeekChange = useCallback((newWeek: number) => {
    setWeek(newWeek);
  }, []);

  const getSummary = async () => {
    setSummary("");

    const prompt = `Please provide a comprehensive summary for week ${week} of pregnancy.`;

    await streamChat({
      type: "weekly-summary",
      messages: [{ role: "user", content: prompt }],
      context: { week },
      onDelta: (chunk) => setSummary((prev) => prev + chunk),
      onDone: () => {
        // Save to history
        const newSummary: WeeklySummaryData = {
          week,
          content: summary,
          generatedAt: new Date().toISOString(),
        };
        const updated = [newSummary, ...savedSummaries.filter(s => s.week !== week)].slice(0, 10);
        setSavedSummaries(updated);
        safeSaveToLocalStorage(STORAGE_KEY, updated);
      },
    });
  };

  const getTrimester = (w: number) => {
    if (w <= 12) return { label: "First Trimester", color: "bg-emerald-500" };
    if (w <= 27) return { label: "Second Trimester", color: "bg-blue-500" };
    return { label: "Third Trimester", color: "bg-purple-500" };
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
      subtitle="Smart weekly tracking for your pregnancy"
      customIcon="calendar"
      mood="nurturing"
      toolId="weekly-summary"
    >
      <div className="space-y-6">
        {/* Progress Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
          <Badge className={`${trimesterInfo.color} text-white text-xs`}>{trimesterInfo.label}</Badge>
          <span className="text-xs text-muted-foreground">{daysRemaining} days to go</span>
        </div>

        {/* Week Selector - Using WeekSlider */}
        <WeekSlider
          week={week}
          onChange={handleWeekChange}
          showTrimester={false}
          label="Pregnancy Week"
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
                  <p className="text-lg font-bold text-foreground">Week {week}</p>
                  <p className="text-xs text-muted-foreground">{trimesterInfo.label}</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Approximately {daysRemaining} days remaining
              </p>
            </div>
          </CardContent>
        </Card>

        {!summary ? (
          <>
            {/* Generate Button */}
            <Button
              onClick={getSummary}
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Show Week {week} Summary
            </Button>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <Card>
                <CardContent className="p-3 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto text-green-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Baby Growth</p>
                  <p className="text-sm font-medium">Normal</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Heart className="w-5 h-5 mx-auto text-red-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Mom's Health</p>
                  <p className="text-sm font-medium">Good</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <CheckCircle className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Checkups</p>
                  <p className="text-sm font-medium">Complete</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Summary Result */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Baby className="w-5 h-5 text-purple-600" />
                  Week {week} Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer 
                  content={summary} 
                  isLoading={isLoading} 
                  accentColor="purple-500" 
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={() => setSummary("")} variant="outline" className="flex-1">
                Different Week
              </Button>
              <Button onClick={getSummary} disabled={isLoading} className="flex-1 gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
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
              Track your week to get personalized information about your baby's growth and your body changes
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
