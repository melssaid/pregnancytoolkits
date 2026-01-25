import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  Baby, 
  Sparkles, 
  Loader2, 
  Calendar,
  TrendingUp,
  Heart,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Layout } from "@/components/Layout";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const STORAGE_KEY = "weekly-summary-data";

interface WeeklySummaryData {
  week: number;
  content: string;
  generatedAt: string;
}

export default function WeeklySummary() {
  const { t } = useTranslation();
  const { streamChat, isLoading, error } = usePregnancyAI();
  const [week, setWeek] = useState<string>("20");
  const [summary, setSummary] = useState<string>("");
  const [savedSummaries, setSavedSummaries] = useState<WeeklySummaryData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSavedSummaries(JSON.parse(saved));
    }
  }, []);

  const getSummary = async () => {
    setSummary("");

    const prompt = `Please provide a comprehensive summary for week ${week} of pregnancy.`;

    await streamChat({
      type: "weekly-summary",
      messages: [{ role: "user", content: prompt }],
      context: { week: parseInt(week) },
      onDelta: (chunk) => setSummary((prev) => prev + chunk),
      onDone: () => {
        // Save to history
        const newSummary: WeeklySummaryData = {
          week: parseInt(week),
          content: summary,
          generatedAt: new Date().toISOString(),
        };
        const updated = [newSummary, ...savedSummaries.filter(s => s.week !== parseInt(week))].slice(0, 10);
        setSavedSummaries(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      },
    });
  };

  const getTrimester = (w: number) => {
    if (w <= 12) return { label: "First Trimester", color: "bg-pink-500" };
    if (w <= 27) return { label: "Second Trimester", color: "bg-purple-500" };
    return { label: "Third Trimester", color: "bg-blue-500" };
  };

  const trimesterInfo = getTrimester(parseInt(week));
  const progress = (parseInt(week) / 40) * 100;
  const daysRemaining = (40 - parseInt(week)) * 7;

  return (
    <Layout showBack>
      <div className="container py-6 space-y-5">
        {/* Header - Consistent Smart Tool Style */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t("tools.weeklySummary.title")}</h1>
              <p className="text-xs text-muted-foreground">
                Smart weekly tracking for your pregnancy
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Week Selector & Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30">
            <Badge className={`${trimesterInfo.color} text-white text-xs`}>{trimesterInfo.label}</Badge>
            <span className="text-xs text-muted-foreground">{daysRemaining} days to go</span>
          </div>
        </motion.div>

        {/* Week Selector */}
        <Card className="border-border/50 overflow-hidden">
          <div className={`h-1 ${trimesterInfo.color}`} />
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Baby className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pregnancy Week</p>
                  <Select value={week} onValueChange={setWeek}>
                    <SelectTrigger className="w-32 h-8 text-lg font-bold border-0 p-0 shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 40 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          Week {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Badge variant="secondary">{trimesterInfo.label}</Badge>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Approximately {daysRemaining} days remaining 💫
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
              <Card className="border-border/50">
                <CardContent className="p-3 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto text-green-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Baby Growth</p>
                  <p className="text-sm font-medium">Normal</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-3 text-center">
                  <Heart className="w-5 h-5 mx-auto text-red-500 mb-1" />
                  <p className="text-xs text-muted-foreground">Mom's Health</p>
                  <p className="text-sm font-medium">Good</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20">
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
            </motion.div>

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
        <Card className="border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              💡 Track your week to get personalized information about your baby's growth and your body changes
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
