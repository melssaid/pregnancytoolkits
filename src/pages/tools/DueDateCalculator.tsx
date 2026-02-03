import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Baby, Info, Calendar, Save, Bell, Trash2, Share2 } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, addWeeks, differenceInDays, format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { useNotifications } from "@/hooks/useNotifications";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { useTranslation } from "react-i18next";

interface SavedDueDate {
  id: string;
  lmpDate: string;
  dueDate: string;
  calculatedAt: string;
  reminderSet: boolean;
}

const isValidSaved = (data: unknown): data is SavedDueDate[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && item !== null && 
    typeof (item as SavedDueDate).id === 'string'
  );
};

export default function DueDateCalculator() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [lmpDate, setLmpDate] = useState("");
  const [conceptionDate, setConceptionDate] = useState("");
  const [savedDates, setSavedDates] = useState<SavedDueDate[]>([]);
  const [result, setResult] = useState<{
    dueDate: Date;
    currentWeeks: number;
    currentDays: number;
    trimester: number;
    conception: Date;
    firstTrimesterEnd: Date;
    secondTrimesterEnd: Date;
  } | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const saved = safeParseLocalStorage<SavedDueDate[]>('savedDueDates', [], isValidSaved);
    setSavedDates(saved);
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage('savedDueDates', savedDates);
  }, [savedDates]);

  const calculateFromLMP = () => {
    if (!lmpDate) return;
    const lmp = new Date(lmpDate);
    calculate(lmp, addWeeks(lmp, 2));
  };

  const calculateFromConception = () => {
    if (!conceptionDate) return;
    const conception = new Date(conceptionDate);
    const lmp = addWeeks(conception, -2);
    calculate(lmp, conception);
  };

  const calculate = (lmp: Date, conception: Date) => {
    const dueDate = addDays(lmp, 280);
    const today = new Date();
    
    const totalDaysPregnant = differenceInDays(today, lmp);
    const currentWeeks = Math.floor(totalDaysPregnant / 7);
    const currentDays = totalDaysPregnant % 7;
    
    let trimester = 1;
    if (currentWeeks >= 28) trimester = 3;
    else if (currentWeeks >= 14) trimester = 2;

    setResult({
      dueDate,
      currentWeeks: Math.max(0, currentWeeks),
      currentDays: Math.max(0, currentDays),
      trimester,
      conception,
      firstTrimesterEnd: addWeeks(lmp, 13),
      secondTrimesterEnd: addWeeks(lmp, 27),
    });
  };

  const saveResult = () => {
    if (!result || !lmpDate) return;

    const newSaved: SavedDueDate = {
      id: Date.now().toString(),
      lmpDate,
      dueDate: result.dueDate.toISOString(),
      calculatedAt: new Date().toISOString(),
      reminderSet: false,
    };

    setSavedDates(prev => [newSaved, ...prev].slice(0, 5));
    toast({ title: t('toolsInternal.dueDate.saved'), description: t('toolsInternal.dueDate.savedDesc') });
  };

  const setReminder = (saved: SavedDueDate) => {
    const dueDate = new Date(saved.dueDate);
    const formattedDate = format(dueDate, "MMMM d, yyyy");
    
    addNotification({
      type: 'appointment',
      title: 'Due Date Reminder',
      message: `Your baby's due date is ${formattedDate}. Get ready!`,
      actionUrl: '/tools/birth-prep',
    });

    setSavedDates(prev => prev.map(s => 
      s.id === saved.id ? { ...s, reminderSet: true } : s
    ));

    toast({ 
      title: t('toolsInternal.dueDate.reminderSetTitle'), 
      description: t('toolsInternal.dueDate.reminderSetDesc', { date: formattedDate })
    });
  };

  const deleteResult = (id: string) => {
    setSavedDates(prev => prev.filter(s => s.id !== id));
    toast({ title: t('toolsInternal.dueDate.deleted'), description: t('toolsInternal.dueDate.deletedDesc') });
  };

  const shareResult = async () => {
    if (!result) return;
    const text = `My Baby's Due Date: ${format(result.dueDate, "MMMM d, yyyy")}\nCurrently: ${result.currentWeeks} weeks, ${result.currentDays} days\nTrimester ${result.trimester}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Due Date", text });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: t('toolsInternal.dueDate.copied'), description: t('toolsInternal.dueDate.copiedDesc') });
    }
  };

  return (
    <ToolFrame 
      title={t('tools.dueDateCalculator.title')} 
      subtitle={t('tools.dueDateCalculator.description')}
      customIcon="calendar"
      mood="nurturing"
      toolId="due-date-calculator"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-primary" />
                  {t('toolsInternal.dueDate.calculateTitle')}
                </CardTitle>
                <CardDescription>
                  {t('toolsInternal.dueDate.calculateDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="lmp">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="lmp">{t('toolsInternal.dueDate.lastPeriod')}</TabsTrigger>
                    <TabsTrigger value="conception">{t('toolsInternal.dueDate.conceptionDate')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="lmp" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lmp">{t('toolsInternal.dueDate.lmpLabel')}</Label>
                      <Input
                        id="lmp"
                        type="date"
                        value={lmpDate}
                        onChange={(e) => setLmpDate(e.target.value)}
                      />
                    </div>
                    <Button onClick={calculateFromLMP} className="w-full">
                      {t('toolsInternal.dueDate.calculateBtn')}
                    </Button>
                  </TabsContent>

                  <TabsContent value="conception" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="conception">{t('toolsInternal.dueDate.conceptionLabel')}</Label>
                      <Input
                        id="conception"
                        type="date"
                        value={conceptionDate}
                        onChange={(e) => setConceptionDate(e.target.value)}
                      />
                    </div>
                    <Button onClick={calculateFromConception} className="w-full">
                      {t('toolsInternal.dueDate.calculateBtn')}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-primary/20 bg-secondary/30 mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {t('toolsInternal.dueDate.timeline')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-primary p-6 text-center">
                      <p className="text-sm text-primary-foreground/80 mb-1">{t('toolsInternal.dueDate.estimatedDueDate')}</p>
                      <p className="text-3xl font-bold text-primary-foreground">
                        {format(result.dueDate, "MMMM d, yyyy")}
                      </p>
                    </div>

                    {result.currentWeeks >= 0 && (
                      <div className="rounded-lg bg-card p-4 shadow-card text-center">
                        <p className="text-sm text-muted-foreground mb-1">{t('toolsInternal.dueDate.currentlyAt')}</p>
                        <p className="text-2xl font-semibold text-foreground">
                          {t('toolsInternal.dueDate.weeksAndDays', { weeks: result.currentWeeks, days: result.currentDays })}
                        </p>
                        <p className="text-sm text-primary mt-1">
                          {t('toolsInternal.dueDate.trimester', { number: result.trimester })}
                        </p>
                      </div>
                    )}

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-card p-3 shadow-card">
                        <p className="text-xs text-muted-foreground">{t('toolsInternal.dueDate.conception')}</p>
                        <p className="font-medium text-foreground">
                          {format(result.conception, "MMM d")}
                        </p>
                      </div>
                      <div className="rounded-lg bg-card p-3 shadow-card">
                        <p className="text-xs text-muted-foreground">{t('toolsInternal.dueDate.secondTrimester')}</p>
                        <p className="font-medium text-foreground">
                          {format(result.firstTrimesterEnd, "MMM d")}
                        </p>
                      </div>
                      <div className="rounded-lg bg-card p-3 shadow-card">
                        <p className="text-xs text-muted-foreground">{t('toolsInternal.dueDate.thirdTrimester')}</p>
                        <p className="font-medium text-foreground">
                          {format(result.secondTrimesterEnd, "MMM d")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveResult} variant="outline" className="flex-1 gap-2">
                        <Save className="h-4 w-4" />
                        {t('toolsInternal.dueDate.save')}
                      </Button>
                      <Button onClick={shareResult} variant="outline" className="flex-1 gap-2">
                        <Share2 className="h-4 w-4" />
                        {t('toolsInternal.dueDate.share')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Weekly Insights */}
                <AIInsightCard
                  title={t('toolsInternal.dueDate.aiGuideTitle')}
                  prompt={`I am currently ${result.currentWeeks} weeks and ${result.currentDays} days pregnant (Trimester ${result.trimester}). My due date is ${format(result.dueDate, "MMMM d, yyyy")}.

Please provide a comprehensive weekly guide:

## Week ${result.currentWeeks} Development
What's happening with my baby this week (size comparison, key developments)

## Your Body This Week
Physical changes and symptoms I might experience

## This Week's Checklist
5-6 specific tasks or appointments for week ${result.currentWeeks}

## Nutrition Focus
Key nutrients and foods to focus on this week

## Exercise Tips
Safe exercises for trimester ${result.trimester}

## Self-Care Reminder
A supportive message for this stage of pregnancy`}
                  context={{ week: result.currentWeeks, trimester: result.trimester }}
                  variant="banner"
                  buttonText={t('toolsInternal.dueDate.getWeeklyGuide')}
                />
              </motion.div>
            )}

            {savedDates.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">{t('toolsInternal.dueDate.savedDueDates')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {savedDates.map((saved) => (
                      <div
                        key={saved.id}
                        className="flex items-center justify-between rounded-lg bg-muted p-4"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {t('toolsInternal.dueDate.due')}: {format(new Date(saved.dueDate), "MMMM d, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('toolsInternal.dueDate.calculated')}: {format(new Date(saved.calculatedAt), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!saved.reminderSet && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setReminder(saved)}
                              className="gap-1"
                            >
                              <Bell className="h-4 w-4" />
                              {t('toolsInternal.dueDate.remind')}
                            </Button>
                          )}
                          {saved.reminderSet && (
                            <span className="text-xs text-primary px-2 py-1 bg-primary/10 rounded-full">
                              ✓ {t('toolsInternal.dueDate.reminderSet')}
                            </span>
                          )}
                          <button
                            onClick={() => deleteResult(saved.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {t('toolsInternal.dueDate.info')}
              </p>
            </div>
        </motion.div>
    </ToolFrame>
  );
}
