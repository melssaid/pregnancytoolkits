import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Circle, Trash2, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInHours } from "date-fns";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type DiaperType = "wet" | "dirty" | "both";

interface DiaperEntry {
  id: string;
  time: string;
  type: DiaperType;
  notes?: string;
}

const DiaperTracker = () => {
  const { t } = useTranslation();
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();
  const [entries, setEntries] = useState<DiaperEntry[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [showAiInsight, setShowAiInsight] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("diaperEntries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const addEntry = (type: DiaperType) => {
    const newEntry: DiaperEntry = {
      id: Date.now().toString(),
      time: new Date().toISOString(),
      type,
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("diaperEntries", JSON.stringify(updated));
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("diaperEntries", JSON.stringify(updated));
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayEntries = entries.filter(
      (e) => new Date(e.time).toDateString() === today
    );
    
    return {
      wet: todayEntries.filter((e) => e.type === "wet" || e.type === "both").length,
      dirty: todayEntries.filter((e) => e.type === "dirty" || e.type === "both").length,
      total: todayEntries.length,
    };
  };

  const stats = getTodayStats();

  // Calculate frequency for AI
  const getFrequencyData = () => {
    const last24h = entries.filter(e => {
      const hours = differenceInHours(new Date(), new Date(e.time));
      return hours <= 24;
    });
    return {
      wet24h: last24h.filter(e => e.type === 'wet' || e.type === 'both').length,
      dirty24h: last24h.filter(e => e.type === 'dirty' || e.type === 'both').length,
      total24h: last24h.length,
    };
  };

  const analyzeWithAI = async () => {
    const freq = getFrequencyData();
    setAiInsight('');
    setShowAiInsight(true);

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{
        role: 'user',
        content: `Analyze my baby's diaper patterns:
        
Today's stats:
- Wet diapers: ${stats.wet}
- Dirty diapers: ${stats.dirty}
- Total changes: ${stats.total}

Last 24 hours:
- Wet: ${freq.wet24h}
- Dirty: ${freq.dirty24h}
- Total: ${freq.total24h}

Please provide:

## Hydration Assessment
Is the wet diaper count normal? What does it indicate?

## Health Indicators
What the diaper patterns might tell us about baby's health

## Normal Ranges
Remind me of typical diaper counts for different ages

## When to Be Concerned
Signs that would warrant calling the pediatrician

## Tips
Helpful tips for diaper changes and tracking`
      }],
      onDelta: (text) => setAiInsight(prev => prev + text),
      onDone: () => {},
    });
  };

  const getTypeIcon = (type: DiaperType) => {
    switch (type) {
      case "wet":
        return <Droplet className="h-5 w-5 text-blue-500" />;
      case "dirty":
        return <Circle className="h-5 w-5 text-amber-600 fill-amber-600" />;
      case "both":
        return (
          <div className="flex gap-1">
            <Droplet className="h-4 w-4 text-blue-500" />
            <Circle className="h-4 w-4 text-amber-600 fill-amber-600" />
          </div>
        );
    }
  };

  return (
    <ToolFrame 
      title={t('tools.diaperTracker.title')} 
      subtitle="Track your baby's diaper changes"
      customIcon="mother-baby"
      mood="nurturing"
      toolId="diaper-tracker"
    >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Quick Add */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">{t('diaperPage.quickAdd')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => addEntry("wet")}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <Droplet className="h-8 w-8 text-blue-500" />
                  {t('diaperPage.wet')}
                </Button>
                <Button
                  onClick={() => addEntry("dirty")}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <Circle className="h-8 w-8 text-amber-600 fill-amber-600" />
                  {t('diaperPage.dirty')}
                </Button>
                <Button
                  onClick={() => addEntry("both")}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <div className="flex gap-1">
                    <Droplet className="h-6 w-6 text-blue-500" />
                    <Circle className="h-6 w-6 text-amber-600 fill-amber-600" />
                  </div>
                  {t('diaperPage.both')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('diaperPage.todayStats')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                  <Droplet className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{stats.wet}</p>
                  <p className="text-sm text-muted-foreground">{t('diaperPage.wet')}</p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4">
                  <Circle className="h-6 w-6 text-amber-600 fill-amber-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-amber-600">{stats.dirty}</p>
                  <p className="text-sm text-muted-foreground">{t('diaperPage.dirty')}</p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">{t('diaperPage.total')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Button */}
          {entries.length >= 3 && (
            <Card className="mb-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
              <CardContent className="pt-4">
                {!showAiInsight ? (
                  <Button
                    onClick={analyzeWithAI}
                    disabled={aiLoading}
                    className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-500"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Analyze Diaper Patterns with AI
                  </Button>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-violet-500" />
                        <h3 className="font-semibold">AI Pattern Analysis</h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowAiInsight(false)}
                      >
                        ✕
                      </Button>
                    </div>
                    {aiLoading && !aiInsight && (
                      <div className="flex items-center gap-2 text-violet-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Analyzing patterns...</span>
                      </div>
                    )}
                    {aiInsight && <MarkdownRenderer content={aiInsight} />}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="mb-6 bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                {t('diaperPage.info')}
              </p>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          {entries.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">{t('diaperPage.recentChanges')}</h2>
              <div className="space-y-2">
                {entries.slice(0, 15).map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(entry.type)}
                          <div>
                            <p className="font-medium">
                              {t(`diaperPage.${entry.type}`)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(entry.time), "MMM d, HH:mm")}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </motion.div>
    </ToolFrame>
  );
};

export default DiaperTracker;
