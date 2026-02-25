import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Baby, Info, Calendar, Save, Bell, Trash2, Share2, CalendarIcon } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ToolFrame } from "@/components/ToolFrame";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addDays, addWeeks, differenceInDays, format } from "date-fns";
import { formatLocalized } from "@/lib/dateLocale";
import { useToast } from "@/components/ui/use-toast";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { useNotifications } from "@/hooks/useNotifications";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { VideoLibrary } from "@/components/VideoLibrary";
import { dueDateVideosByLang } from "@/data/videoData";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { profile: userProfile, setLastPeriodDate: saveProfileLMP } = useUserProfile();
  const [lmpDate, setLmpDate] = useState<Date | undefined>(
    userProfile.lastPeriodDate ? new Date(userProfile.lastPeriodDate) : undefined
  );
  const [conceptionDate, setConceptionDate] = useState<Date | undefined>();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage('savedDueDates', savedDates);
  }, [savedDates]);

  const calculateFromLMP = () => {
    if (!lmpDate) return;
    const lmpStr = format(lmpDate, 'yyyy-MM-dd');
    saveProfileLMP(lmpStr);
    calculate(lmpDate, addWeeks(lmpDate, 2));
  };

  const calculateFromConception = () => {
    if (!conceptionDate) return;
    const lmp = addWeeks(conceptionDate, -2);
    calculate(lmp, conceptionDate);
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
      lmpDate: format(lmpDate, 'yyyy-MM-dd'),
      dueDate: result.dueDate.toISOString(),
      calculatedAt: new Date().toISOString(),
      reminderSet: false,
    };
    setSavedDates(prev => [newSaved, ...prev].slice(0, 5));
    toast({ title: t('toolsInternal.dueDate.saved'), description: t('toolsInternal.dueDate.savedDesc') });
  };

  const setReminder = (saved: SavedDueDate) => {
    const dueDate = new Date(saved.dueDate);
    const formattedDate = formatLocalized(dueDate, "MMMM d, yyyy", currentLanguage);
    
    addNotification({
      type: 'appointment',
      title: t('toolsInternal.dueDate.dueDateReminderTitle'),
      message: t('toolsInternal.dueDate.dueDateReminderMessage', { date: formattedDate }),
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

  const copyToClipboardFallback = (text: string): boolean => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  };

  const shareResult = async () => {
    if (!result) return;
    const text = `${t('toolsInternal.dueDate.estimatedDueDate')}: ${formatLocalized(result.dueDate, "MMMM d, yyyy", currentLanguage)}\n${t('toolsInternal.dueDate.currentlyAt')}: ${t('toolsInternal.dueDate.weeksAndDays', { weeks: result.currentWeeks, days: result.currentDays })}\n${t('toolsInternal.dueDate.trimester', { number: result.trimester })}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: t('tools.dueDateCalculator.title'), text });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      toast({ title: t('toolsInternal.dueDate.copied'), description: t('toolsInternal.dueDate.copiedDesc') });
    } catch {
      const success = copyToClipboardFallback(text);
      if (success) {
        toast({ title: t('toolsInternal.dueDate.copied'), description: t('toolsInternal.dueDate.copiedDesc') });
      } else {
        toast({ title: t('toolsInternal.dueDate.shareError', 'خطأ'), description: t('toolsInternal.dueDate.shareErrorDesc', 'تعذّر نسخ النص'), variant: "destructive" });
      }
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
        className="space-y-4"
      >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Baby className="h-4 w-4 text-primary" />
                  {t('toolsInternal.dueDate.calculateTitle')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('toolsInternal.dueDate.calculateDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="lmp">
                  <TabsList className="grid w-full grid-cols-2 mb-4 h-10">
                    <TabsTrigger value="lmp" className="text-xs px-2">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                      {t('toolsInternal.dueDate.lastPeriod')}
                    </TabsTrigger>
                    <TabsTrigger value="conception" className="text-xs px-2">
                      <Baby className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                      {t('toolsInternal.dueDate.conceptionDate')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="lmp" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">{t('toolsInternal.dueDate.lmpLabel')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 border-border/60", !lmpDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4 text-primary shrink-0" />
                            {lmpDate ? formatLocalized(lmpDate, "PPP", currentLanguage) : <span>{t('toolsInternal.dueDate.pickDate', 'Pick a date')}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarUI
                            mode="single"
                            selected={lmpDate}
                            onSelect={setLmpDate}
                            disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      {lmpDate && userProfile.lastPeriodDate && format(lmpDate, 'yyyy-MM-dd') === userProfile.lastPeriodDate && (
                        <p className="text-xs text-primary flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          {t('toolsInternal.dueDate.fromProfile', 'Pre-filled from your profile')}
                        </p>
                      )}
                    </div>
                    <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.1 }}>
                      <Button onClick={calculateFromLMP} className="w-full h-11 font-medium shadow-sm" disabled={!lmpDate}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('toolsInternal.dueDate.calculateBtn')}
                      </Button>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="conception" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs">{t('toolsInternal.dueDate.conceptionLabel')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 border-border/60", !conceptionDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4 text-primary shrink-0" />
                            {conceptionDate ? formatLocalized(conceptionDate, "PPP", currentLanguage) : <span>{t('toolsInternal.dueDate.pickDate', 'Pick a date')}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarUI
                            mode="single"
                            selected={conceptionDate}
                            onSelect={setConceptionDate}
                            disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.1 }}>
                      <Button onClick={calculateFromConception} className="w-full h-11 font-medium shadow-sm" disabled={!conceptionDate}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('toolsInternal.dueDate.calculateBtn')}
                      </Button>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card className="border-primary/20 bg-secondary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {t('toolsInternal.dueDate.timeline')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl bg-primary p-4 text-center shadow-sm">
                       <p className="text-[10px] text-primary-foreground/80 mb-1 uppercase tracking-wider">{t('toolsInternal.dueDate.estimatedDueDate')}</p>
                       <p className="text-base font-bold text-primary-foreground">
                        {formatLocalized(result.dueDate, "MMMM d, yyyy", currentLanguage)}
                      </p>
                    </div>

                    {result.currentWeeks >= 0 && (
                      <div className="rounded-xl bg-card p-3 shadow-sm border border-border/40 text-center">
                         <p className="text-[10px] text-muted-foreground mb-1">{t('toolsInternal.dueDate.currentlyAt')}</p>
                         <p className="text-sm font-semibold text-foreground">
                           {t('toolsInternal.dueDate.weeksAndDays', { weeks: result.currentWeeks, days: result.currentDays })}
                         </p>
                         <p className="text-xs text-primary mt-1 font-medium">
                          {t('toolsInternal.dueDate.trimester', { number: result.trimester })}
                        </p>
                      </div>
                    )}

                    <div className="grid gap-2 grid-cols-3">
                      <div className="rounded-lg bg-card p-2.5 shadow-sm border border-border/30 text-center">
                        <p className="text-[10px] text-muted-foreground leading-tight">{t('toolsInternal.dueDate.conception')}</p>
                        <p className="text-xs font-semibold text-foreground mt-1">
                          {formatLocalized(result.conception, "MMM d", currentLanguage)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-card p-2.5 shadow-sm border border-border/30 text-center">
                        <p className="text-[10px] text-muted-foreground leading-tight">{t('toolsInternal.dueDate.secondTrimester')}</p>
                        <p className="text-xs font-semibold text-foreground mt-1">
                          {formatLocalized(result.firstTrimesterEnd, "MMM d", currentLanguage)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-card p-2.5 shadow-sm border border-border/30 text-center">
                        <p className="text-[10px] text-muted-foreground leading-tight">{t('toolsInternal.dueDate.thirdTrimester')}</p>
                        <p className="text-xs font-semibold text-foreground mt-1">
                          {formatLocalized(result.secondTrimesterEnd, "MMM d", currentLanguage)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                        <Button onClick={saveResult} variant="outline" className="w-full gap-2 text-xs h-9">
                          <Save className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{t('toolsInternal.dueDate.save')}</span>
                        </Button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                        <Button onClick={shareResult} variant="outline" className="w-full gap-2 text-xs h-9">
                          <Share2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{t('toolsInternal.dueDate.share')}</span>
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Weekly Insights */}
                <AIInsightCard
                  title={t('toolsInternal.dueDate.aiGuideTitle')}
                  prompt={`I am currently ${result.currentWeeks} weeks and ${result.currentDays} days pregnant (Trimester ${result.trimester}). My due date is ${formatLocalized(result.dueDate, "MMMM d, yyyy", currentLanguage)}.

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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs flex items-center gap-2">
                    <Save className="h-3.5 w-3.5 text-muted-foreground" />
                    {t('toolsInternal.dueDate.savedDueDates')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedDates.map((saved) => (
                      <div
                        key={saved.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 border border-border/30 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-xs break-words">
                            {t('toolsInternal.dueDate.due')}: {formatLocalized(new Date(saved.dueDate), "MMMM d, yyyy", currentLanguage)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {t('toolsInternal.dueDate.calculated')}: {formatLocalized(new Date(saved.calculatedAt), "MMM d, yyyy", currentLanguage)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!saved.reminderSet ? (
                            <motion.div whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setReminder(saved)}
                                className="gap-1 h-8 px-2 text-xs"
                              >
                                <Bell className="h-3.5 w-3.5" />
                                {t('toolsInternal.dueDate.remind')}
                              </Button>
                            </motion.div>
                          ) : (
                            <span className="text-[10px] text-primary px-2 py-1 bg-primary/8 rounded-full flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              {t('toolsInternal.dueDate.reminderSet')}
                            </span>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => deleteResult(saved.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <VideoLibrary
              videosByLang={dueDateVideosByLang}
              title={t('toolsInternal.dueDate.videosTitle')}
              subtitle={t('toolsInternal.dueDate.videosSubtitle')}
            />

            <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                {t('toolsInternal.dueDate.info')}
              </p>
            </div>
        </motion.div>
    </ToolFrame>
  );
}
