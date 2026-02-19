import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Clock, Trash2, TrendingUp, BarChart3, Sparkles, Loader2, AlertTriangle, ChevronRight, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInMinutes, startOfDay, subDays, eachDayOfInterval } from "date-fns";
import { formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Progress } from "@/components/ui/progress";

interface SleepSession {
  id: string;
  startTime: string;
  endTime: string | null;
  type: "nap" | "night";
}

const STORAGE_KEY = "baby-sleep-tracker-data";

const BabySleepTracker = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { trackAction } = useAnalytics("baby-sleep-tracker");
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiAdvice('');
    setShowAiAdvice(false);
  });

  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [activeSleep, setActiveSleep] = useState<SleepSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [showAiAdvice, setShowAiAdvice] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed.filter((s: SleepSession) => s.endTime));
        const active = parsed.find((s: SleepSession) => !s.endTime);
        if (active) setActiveSleep(active);
      } catch (e) {
        console.error('Failed to load sleep data');
      }
    }
  }, []);

  useEffect(() => {
    if (!activeSleep) {
      setElapsedTime(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedTime(differenceInMinutes(new Date(), new Date(activeSleep.startTime)));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSleep]);

  const saveToStorage = (newSessions: SleepSession[], active: SleepSession | null) => {
    const toSave = active ? [...newSessions, active] : newSessions;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave.slice(-100)));
  };

  const startSleep = (type: "nap" | "night") => {
    const newSession: SleepSession = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      endTime: null,
      type,
    };
    setActiveSleep(newSession);
    saveToStorage(sessions, newSession);
    trackAction("sleep_started", { type });
  };

  const endSleep = () => {
    if (!activeSleep) return;
    const completed = { ...activeSleep, endTime: new Date().toISOString() };
    const updated = [completed, ...sessions];
    setSessions(updated);
    setActiveSleep(null);
    saveToStorage(updated, null);
    trackAction("sleep_ended", {
      type: activeSleep.type,
      duration: differenceInMinutes(new Date(), new Date(activeSleep.startTime))
    });
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveToStorage(updated, activeSleep);
  };

  const formatDuration = (mins: number) => {
    if (mins < 0) mins = 0;
    const hours = Math.floor(mins / 60);
    const remaining = Math.abs(mins % 60);
    if (hours > 0) return `${hours}h ${remaining}m`;
    return `${mins}m`;
  };

  const getTodayStats = () => {
    const today = startOfDay(new Date()).toISOString();
    const todaySessions = sessions.filter(
      (s) => new Date(s.startTime) >= new Date(today) && s.endTime
    );
    let totalMinutes = 0;
    let napMinutes = 0;
    let nightMinutes = 0;

    todaySessions.forEach((s) => {
      if (s.endTime) {
        const mins = Math.max(0, differenceInMinutes(new Date(s.endTime), new Date(s.startTime)));
        totalMinutes += mins;
        if (s.type === "nap") napMinutes += mins;
        else nightMinutes += mins;
      }
    });

    return { count: todaySessions.length, totalMinutes, napMinutes, nightMinutes };
  };

  const getLast7DaysAverage = () => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });
    let totalMinutes = 0;
    days.forEach(day => {
      const dayStart = startOfDay(day);
      const nextDay = new Date(dayStart);
      nextDay.setDate(nextDay.getDate() + 1);
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= dayStart && sessionDate < nextDay && s.endTime;
      });
      daySessions.forEach(s => {
        if (s.endTime) {
          totalMinutes += Math.max(0, differenceInMinutes(new Date(s.endTime), new Date(s.startTime)));
        }
      });
    });
    return Math.round(totalMinutes / 7);
  };

  const getBabyAgeEstimate = () => {
    const avgDailyMinutes = getLast7DaysAverage();
    const avgHours = avgDailyMinutes / 60;
    if (avgHours >= 14) return "newborn (0-3 months)";
    if (avgHours >= 12) return "infant (4-12 months)";
    if (avgHours >= 11) return "toddler (1-2 years)";
    return "child (2+ years)";
  };

  // Sleep quality score (0-100) based on consistency and total
  const getSleepQuality = () => {
    if (sessions.length < 3) return null;
    const weeklyAvg = getLast7DaysAverage();
    const avgHours = weeklyAvg / 60;
    
    // Score based on recommended range (12-17 hours for babies)
    let score = 0;
    if (avgHours >= 12 && avgHours <= 17) score = 90;
    else if (avgHours >= 10 && avgHours <= 19) score = 70;
    else if (avgHours >= 8) score = 50;
    else score = 30;
    
    // Adjust for consistency (check if sessions exist on recent days)
    const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    let daysWithData = 0;
    days.forEach(day => {
      const dayStart = startOfDay(day);
      const nextDay = new Date(dayStart);
      nextDay.setDate(nextDay.getDate() + 1);
      const hasData = sessions.some(s => {
        const d = new Date(s.startTime);
        return d >= dayStart && d < nextDay && s.endTime;
      });
      if (hasData) daysWithData++;
    });
    
    const consistencyBonus = Math.round((daysWithData / 7) * 10);
    return Math.min(100, score + consistencyBonus);
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return t('toolsInternal.babySleep.qualityExcellent', 'Excellent');
    if (score >= 60) return t('toolsInternal.babySleep.qualityGood', 'Good');
    if (score >= 40) return t('toolsInternal.babySleep.qualityFair', 'Fair');
    return t('toolsInternal.babySleep.qualityNeedsAttention', 'Needs Attention');
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-amber-600';
    return 'text-destructive';
  };

  const getAIAdvice = async () => {
    if (sessions.length < 2) {
      setAiAdvice(t('toolsInternal.babySleep.noDataYet'));
      setShowAiAdvice(true);
      return;
    }

    const stats = getTodayStats();
    const weeklyAvg = getLast7DaysAverage();
    const ageEstimate = getBabyAgeEstimate();
    const recentSessions = sessions.slice(0, 10);
    const napCount = recentSessions.filter(s => s.type === "nap").length;
    const nightCount = recentSessions.filter(s => s.type === "night").length;
    const avgNapDuration = napCount > 0
      ? recentSessions.filter(s => s.type === "nap" && s.endTime)
          .reduce((sum, s) => sum + differenceInMinutes(new Date(s.endTime!), new Date(s.startTime)), 0) / napCount
      : 0;

    const prompt = `As a pediatric sleep specialist, analyze this baby's sleep data and provide brief, actionable advice:

Baby's estimated age: ${ageEstimate}
Today's total sleep: ${formatDuration(stats.totalMinutes)}
7-day daily average: ${formatDuration(weeklyAvg)}
Recent naps: ${napCount} (avg ${Math.round(avgNapDuration)} mins each)
Recent night sleeps: ${nightCount}

Provide 3 specific tips to improve this baby's sleep schedule. Keep response under 150 words. Be encouraging and supportive.`;

    setAiAdvice("");
    setShowAiAdvice(true);

    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      onDelta: (text) => setAiAdvice(prev => prev + text),
      onDone: () => {},
    });
  };

  const stats = getTodayStats();
  const weeklyAvg = getLast7DaysAverage();
  const sleepQuality = getSleepQuality();

  return (
    <ToolFrame
      title={t('toolsInternal.babySleep.title')}
      subtitle={t('toolsInternal.babySleep.subtitle')}
      mood="nurturing"
      toolId="baby-sleep-tracker"
    >
      <div className="space-y-4">
        {/* Active Session or Start Buttons */}
        <AnimatePresence mode="wait">
          {activeSleep ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <Card className="border-primary/40 bg-primary/5">
                <CardContent className="pt-5 pb-4 text-center">
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-3"
                  >
                    {activeSleep.type === "night" ? (
                      <Moon className="h-10 w-10 mx-auto text-primary" />
                    ) : (
                      <Sun className="h-10 w-10 mx-auto text-amber-500" />
                    )}
                  </motion.div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {activeSleep.type === "night" ? t('toolsInternal.babySleep.nightSleep') : t('toolsInternal.babySleep.napTime')} {t('toolsInternal.babySleep.inProgress')}
                  </p>
                  <div className="text-lg font-bold text-primary mb-1">
                    {formatDuration(elapsedTime)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-4">
                    {t('toolsInternal.babySleep.startedAt', 'Started at')} {formatLocalized(new Date(activeSleep.startTime), "HH:mm", currentLanguage)}
                  </p>
                  <Button onClick={endSleep} size="lg" className="w-full">
                    {t('toolsInternal.babySleep.endSleep')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center justify-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {t('toolsInternal.babySleep.startSleepTracking')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={() => startSleep("nap")}
                        variant="outline"
                        className="h-16 w-full flex-col gap-1.5 border hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20"
                      >
                        <Sun className="h-5 w-5 text-amber-500 shrink-0" />
                        <span className="font-medium text-xs">{t('toolsInternal.babySleep.startNap')}</span>
                      </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={() => startSleep("night")}
                        variant="outline"
                        className="h-16 w-full flex-col gap-1.5 border hover:border-primary/60 hover:bg-primary/5"
                      >
                        <Moon className="h-5 w-5 text-primary shrink-0" />
                        <span className="font-medium text-xs">{t('toolsInternal.babySleep.nightSleep')}</span>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardContent className="py-3 px-3 text-center">
              <TrendingUp className="h-4 w-4 mx-auto text-primary mb-1" />
              <p className="text-base font-bold text-primary">{formatDuration(stats.totalMinutes)}</p>
              <p className="text-[10px] text-muted-foreground">{t('toolsInternal.babySleep.totalToday')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 px-3 text-center">
              <BarChart3 className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-base font-bold">{formatDuration(weeklyAvg)}</p>
              <p className="text-[10px] text-muted-foreground">{t('toolsInternal.babySleep.avgSleep')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sleep Quality Score */}
        {sleepQuality !== null && (
          <Card>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {t('toolsInternal.babySleep.sleepQuality', 'Sleep Quality')}
                </span>
                <span className={`text-xs font-semibold ${getQualityColor(sleepQuality)}`}>
                  {getQualityLabel(sleepQuality)} ({sleepQuality}%)
                </span>
              </div>
              <Progress value={sleepQuality} className="h-1.5" />
            </CardContent>
          </Card>
        )}

        {/* AI Advice Button */}
        <motion.button onClick={getAIAdvice} disabled={aiLoading} whileTap={{ scale: 0.92 }} className="w-full relative overflow-hidden rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed">
          <div className="w-full flex items-center justify-center gap-3 px-5 py-3.5 font-semibold text-white text-sm rounded-2xl" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))', boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.5)' }}>
            {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin shrink-0" /><span>{t('toolsInternal.babySleep.analyzing')}</span></> : <><Brain className="h-4 w-4 shrink-0" /><span>{t('toolsInternal.babySleep.getAISleepAdvice')}</span><Sparkles className="h-3.5 w-3.5 shrink-0 opacity-80" /></>}
            <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" aria-hidden />
          </div>
        </motion.button>

        {/* AI Advice Card */}
        <AnimatePresence>
          {showAiAdvice && aiAdvice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-1.5 pt-3">
                  <CardTitle className="text-xs flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    {t('toolsInternal.babySleep.aiSleepAdvisor')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="text-xs leading-relaxed">
                    <MarkdownRenderer content={aiAdvice} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's Breakdown */}
        {stats.count > 0 && (
          <Card>
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm">{t('toolsInternal.babySleep.todaysBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-secondary/60">
                  <p className="text-base font-bold">{stats.count}</p>
                  <p className="text-[10px] text-muted-foreground">{t('toolsInternal.babySleep.sessions')}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/15">
                  <p className="text-base font-bold text-amber-600">{formatDuration(stats.napMinutes)}</p>
                  <p className="text-[10px] text-muted-foreground">{t('toolsInternal.babySleep.naps')}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-primary/5">
                  <p className="text-base font-bold text-primary">{formatDuration(stats.nightMinutes)}</p>
                  <p className="text-[10px] text-muted-foreground">{t('toolsInternal.babySleep.night')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <Card>
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm">{t('toolsInternal.babySleep.recentSessions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 pb-3">
              {sessions.slice(0, 8).map((session) => {
                const duration = session.endTime
                  ? Math.max(0, differenceInMinutes(new Date(session.endTime), new Date(session.startTime)))
                  : 0;
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {session.type === "night" ? (
                        <Moon className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <Sun className="h-4 w-4 text-amber-500 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">
                          {formatLocalized(new Date(session.startTime), "MMM d", currentLanguage)}
                          <span className="text-muted-foreground mx-1">·</span>
                          {formatLocalized(new Date(session.startTime), "HH:mm", currentLanguage)}
                          {session.endTime && (
                            <>
                              <ChevronRight className="inline h-3 w-3 text-muted-foreground mx-0.5" />
                              {formatLocalized(new Date(session.endTime), "HH:mm", currentLanguage)}
                            </>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {session.type === "night" ? t('toolsInternal.babySleep.nightSleep') : t('toolsInternal.babySleep.napTime')}
                          <span className="mx-1">·</span>
                          {formatDuration(duration)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSession(session.id)}
                      className="h-7 w-7 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive/60" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Sleep Reference Guide */}
        <Card className="bg-muted/30">
          <CardContent className="pt-3 pb-3">
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {t('toolsInternal.babySleep.recommendedSleep')}
            </h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between p-1.5 bg-background/60 rounded">
                <span>{t('toolsInternal.babySleep.newborn')}</span>
                <span className="font-medium text-foreground">14-17 {t('toolsInternal.babySleep.hours')}</span>
              </div>
              <div className="flex justify-between p-1.5 bg-background/60 rounded">
                <span>{t('toolsInternal.babySleep.infant')}</span>
                <span className="font-medium text-foreground">12-16 {t('toolsInternal.babySleep.hours')}</span>
              </div>
              <div className="flex justify-between p-1.5 bg-background/60 rounded">
                <span>{t('toolsInternal.babySleep.toddler')}</span>
                <span className="font-medium text-foreground">11-14 {t('toolsInternal.babySleep.hours')}</span>
              </div>
              <div className="flex justify-between p-1.5 bg-background/60 rounded">
                <span>{t('toolsInternal.babySleep.child')}</span>
                <span className="font-medium text-foreground">10-13 {t('toolsInternal.babySleep.hours')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/20">
          <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {t('toolsInternal.babySleep.disclaimer')}
          </p>
        </div>
      </div>
    </ToolFrame>
  );
};

export default BabySleepTracker;
