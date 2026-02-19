import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Calendar, Heart, Sparkles, Baby, Flower2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, format, subDays, differenceInDays } from "date-fns";
import { formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import ToolFrame from "@/components/ToolFrame";
import MotivationalQuote from "@/components/MotivationalQuote";
import useAnalytics from "@/hooks/useAnalytics";
import { useToast } from "@/components/ui/use-toast";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { VideoLibrary } from "@/components/VideoLibrary";
import { ovulationVideosByLang } from "@/data/videoData";
interface OvulationResult {
  id: string;
  lastPeriod: string;
  cycleLength: number;
  ovulationDate: string;
  fertileStart: string;
  fertileEnd: string;
  nextPeriod: string;
  calculatedAt: string;
}

const isValidResults = (data: unknown): data is OvulationResult[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && item !== null && 
    typeof (item as OvulationResult).id === 'string'
  );
};

export default function OvulationCalculator() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { trackAction } = useAnalytics("ovulation-calculator");
  const { toast } = useToast();
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [savedResults, setSavedResults] = useState<OvulationResult[]>([]);
  const [result, setResult] = useState<{
    ovulationDate: Date;
    fertileStart: Date;
    fertileEnd: Date;
    nextPeriod: Date;
    daysUntilOvulation: number;
  } | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const saved = safeParseLocalStorage<OvulationResult[]>('ovulationResults', [], isValidResults);
    setSavedResults(saved);
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage('ovulationResults', savedResults);
  }, [savedResults]);

  const calculate = () => {
    if (!lastPeriod) return;

    const lmpDate = new Date(lastPeriod);
    const cycle = parseInt(cycleLength);
    
    const ovulationDate = addDays(lmpDate, cycle - 14);
    const fertileStart = subDays(ovulationDate, 5);
    const fertileEnd = addDays(ovulationDate, 1);
    const nextPeriod = addDays(lmpDate, cycle);
    const daysUntilOvulation = differenceInDays(ovulationDate, new Date());

    setResult({
      ovulationDate,
      fertileStart,
      fertileEnd,
      nextPeriod,
      daysUntilOvulation,
    });

    trackAction("calculate", { cycleLength: cycle });
  };

  const saveResult = () => {
    if (!result || !lastPeriod) return;

    const newResult: OvulationResult = {
      id: Date.now().toString(),
      lastPeriod,
      cycleLength: parseInt(cycleLength),
      ovulationDate: result.ovulationDate.toISOString(),
      fertileStart: result.fertileStart.toISOString(),
      fertileEnd: result.fertileEnd.toISOString(),
      nextPeriod: result.nextPeriod.toISOString(),
      calculatedAt: new Date().toISOString(),
    };

    setSavedResults(prev => [newResult, ...prev].slice(0, 10));
    toast({ title: t('toolsInternal.ovulation.saved'), description: t('toolsInternal.ovulation.savedDesc') });
  };

  const deleteResult = (id: string) => {
    setSavedResults(prev => prev.filter(r => r.id !== id));
    toast({ title: t('toolsInternal.ovulation.deleted'), description: t('toolsInternal.ovulation.deletedDesc') });
  };

  return (
    <ToolFrame
      title={t("tools.ovulationCalculator.title")}
      subtitle={t("toolsInternal.ovulation.subtitle")}
      customIcon="calendar"
      mood="nurturing"
      toolId="ovulation-calculator"
    >
      <div className="space-y-4">
        <MotivationalQuote variant="banner" />

        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-secondary/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                <Flower2 className="h-4 w-4 text-primary" />
              </div>
              {t("toolsInternal.ovulation.calculateTitle")}
            </CardTitle>
            <CardDescription className="text-sm">
              {t("toolsInternal.ovulation.calculateDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lastPeriod" className="text-xs font-medium">
                {t("toolsInternal.ovulation.firstDayLastPeriod")}
              </Label>
              <Input
                id="lastPeriod"
                type="date"
                value={lastPeriod}
                onChange={(e) => setLastPeriod(e.target.value)}
                className="h-10 text-sm border-2 border-primary/20 focus:border-primary/50 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cycleLength" className="text-xs font-medium">
                {t("toolsInternal.ovulation.avgCycleLength")}
              </Label>
              <Input
                id="cycleLength"
                type="number"
                min="21"
                max="45"
                value={cycleLength}
                onChange={(e) => setCycleLength(e.target.value)}
                className="h-10 text-sm border-2 border-primary/20 focus:border-primary/50 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                {t("toolsInternal.ovulation.cycleRange")}
              </p>
            </div>

            <Button 
              onClick={calculate} 
              className="w-full h-10 text-xs font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Heart className="h-4 w-4 mr-2" />
              {t("toolsInternal.ovulation.calculateBtn")}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Button onClick={saveResult} variant="outline" className="w-full gap-2">
              <Save className="h-4 w-4" />
              {t("toolsInternal.ovulation.saveCalculation")}
            </Button>

            {result.daysUntilOvulation > 0 && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-6 text-primary-foreground shadow-xl"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-10 -right-10 opacity-20"
                >
                  <Sparkles className="h-40 w-40" />
                </motion.div>
                <div className="relative z-10 text-center">
                  <p className="text-primary-foreground/80 text-xs font-medium mb-1">{t("toolsInternal.ovulation.daysUntilOvulation")}</p>
                  <p className="text-xl font-bold mb-1.5">{result.daysUntilOvulation}</p>
                  <p className="text-primary-foreground/90">{t("toolsInternal.ovulation.getReady")} 🌸</p>
                </div>
              </motion.div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/50 p-5 border border-primary/20 shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <p className="text-xs font-medium text-muted-foreground">{t("toolsInternal.ovulation.ovulationDay")}</p>
                </div>
                <p className="text-sm font-bold text-primary">
                  {formatLocalized(result.ovulationDate, "MMM d", currentLanguage)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("toolsInternal.ovulation.peakFertility")}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-gradient-to-br from-secondary to-muted p-5 border border-border shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="text-xs font-medium text-muted-foreground">{t("toolsInternal.ovulation.nextPeriod")}</p>
                </div>
                <p className="text-sm font-bold text-foreground">
                  {formatLocalized(result.nextPeriod, "MMM d", currentLanguage)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("toolsInternal.ovulation.expectedStart")}
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-gradient-to-r from-accent/50 to-secondary p-6 border border-accent/30 shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-accent">
                  <Baby className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-base">{t("toolsInternal.ovulation.fertileWindow")}</p>
                  <p className="text-xs text-muted-foreground">{t("toolsInternal.ovulation.bestDays")}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{t("toolsInternal.ovulation.start")}</p>
                  <p className="text-lg font-bold text-foreground">{formatLocalized(result.fertileStart, "MMM d", currentLanguage)}</p>
                </div>
                <div className="flex items-center gap-1 text-primary/60">
                  <span>→</span>
                  <Heart className="h-4 w-4 animate-pulse" />
                  <span>→</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{t("toolsInternal.ovulation.end")}</p>
                  <p className="text-lg font-bold text-foreground">{formatLocalized(result.fertileEnd, "MMM d", currentLanguage)}</p>
                </div>
              </div>
              
              <p className="text-xs text-center text-muted-foreground mt-2">
                {t("toolsInternal.ovulation.sixDays")} 💕
              </p>
            </motion.div>

            {/* AI Insights */}
            <AIInsightCard
              title={t("toolsInternal.ovulation.aiFertilityInsights")}
              prompt={`I'm tracking my fertility. My cycle length is ${cycleLength} days. My last period started on ${lastPeriod}. My ovulation is predicted for ${formatLocalized(result.ovulationDate, "MMMM d, yyyy", currentLanguage)} and my fertile window is ${formatLocalized(result.fertileStart, "MMM d", currentLanguage)} to ${formatLocalized(result.fertileEnd, "MMM d", currentLanguage)}.

Please provide personalized advice in this format:
## 🌸 Your Fertile Window Analysis
Brief analysis of my cycle pattern

## 💕 Conception Tips
3-4 specific tips for maximizing chances during my fertile window

## 🍃 Lifestyle Recommendations
Diet, exercise, and lifestyle tips for this phase

## ⚠️ Important Notes
Any important reminders about fertility tracking`}
              context={{ week: parseInt(cycleLength) }}
              buttonText={t("toolsInternal.ovulation.getPersonalizedAdvice")}
              variant="default"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl bg-muted border border-border p-4"
            >
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold">💡 {t("toolsInternal.ovulation.tip")}:</span> {t("toolsInternal.ovulation.tipText")}
              </p>
            </motion.div>
          </motion.div>
        )}

        {savedResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("toolsInternal.ovulation.savedCalculations")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedResults.map((saved) => (
                  <div
                    key={saved.id}
                    className="flex items-start justify-between rounded-lg bg-muted p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {t("toolsInternal.ovulation.ovulation")}: {formatLocalized(new Date(saved.ovulationDate), "MMM d, yyyy", currentLanguage)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("toolsInternal.ovulation.cycle")}: {saved.cycleLength} {t("toolsInternal.ovulation.days")} • LMP: {formatLocalized(new Date(saved.lastPeriod), "MMM d", currentLanguage)}
                      </p>
                      <p className="text-[10px] text-primary mt-1">
                        {t("toolsInternal.ovulation.fertile")}: {formatLocalized(new Date(saved.fertileStart), "MMM d", currentLanguage)} - {formatLocalized(new Date(saved.fertileEnd), "MMM d", currentLanguage)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteResult(saved.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <VideoLibrary
          videosByLang={ovulationVideosByLang}
          title={t('toolsInternal.ovulation.videosTitle')}
          subtitle={t('toolsInternal.ovulation.videosSubtitle')}
        />

        <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary/50" />
          <p>
            {t("toolsInternal.ovulation.disclaimer")}
          </p>
        </div>
      </div>
    </ToolFrame>
  );
}
