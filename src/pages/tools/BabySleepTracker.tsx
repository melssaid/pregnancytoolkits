import { useState, useEffect } from "react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Clock, Trash2, TrendingUp, Baby, BarChart3, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInMinutes, startOfDay, subDays, eachDayOfInterval } from "date-fns";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";

interface SleepSession {
  id: string;
  startTime: string;
  endTime: string | null;
  type: "nap" | "night";
}

const STORAGE_KEY = "baby-sleep-tracker-data";

const BabySleepTracker = () => {
  const { trackAction } = useAnalytics("baby-sleep-tracker");
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [activeSleep, setActiveSleep] = useState<SleepSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [showAiAdvice, setShowAiAdvice] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed.filter((s: SleepSession) => s.endTime));
      const active = parsed.find((s: SleepSession) => !s.endTime);
      if (active) setActiveSleep(active);
    }
  }, []);

  // Timer for active session
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
    if (hours > 0) {
      return `${hours}h ${remaining}m`;
    }
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

    return {
      count: todaySessions.length,
      totalMinutes,
      napMinutes,
      nightMinutes,
    };
  };

  // Fixed 7-day average calculation - includes all 7 days even with no data
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
          const mins = Math.max(0, differenceInMinutes(new Date(s.endTime), new Date(s.startTime)));
          totalMinutes += mins;
        }
      });
    });
    
    // Always divide by 7 for true weekly average
    return Math.round(totalMinutes / 7);
  };

  // Get baby's age category based on sleep patterns for AI
  const getBabyAgeEstimate = () => {
    const avgDailyMinutes = getLast7DaysAverage();
    const avgHours = avgDailyMinutes / 60;
    
    if (avgHours >= 14) return "newborn (0-3 months)";
    if (avgHours >= 12) return "infant (4-12 months)";
    if (avgHours >= 11) return "toddler (1-2 years)";
    return "child (2+ years)";
  };

  // AI-powered personalized advice
  const getAIAdvice = async () => {
    if (sessions.length < 2) {
      setAiAdvice("💡 Record at least 2-3 sleep sessions to get personalized AI advice based on your baby's patterns.");
      setShowAiAdvice(true);
      return;
    }

    const stats = getTodayStats();
    const weeklyAvg = getLast7DaysAverage();
    const ageEstimate = getBabyAgeEstimate();
    
    // Analyze patterns
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

  return (
    <ToolFrame
      title="Baby Sleep Tracker"
      subtitle="AI-powered sleep pattern analysis for your baby"
      customIcon="mother-baby"
      mood="nurturing"
      toolId="baby-sleep-tracker"
    >
      <div className="space-y-6">
        {/* Active Session */}
        <AnimatePresence mode="wait">
          {activeSleep ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="pt-6 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-4"
                  >
                    {activeSleep.type === "night" ? (
                      <Moon className="h-16 w-16 mx-auto text-primary" />
                    ) : (
                      <Sun className="h-16 w-16 mx-auto text-amber-500" />
                    )}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">
                    {activeSleep.type === "night" ? "Night Sleep" : "Nap Time"} in Progress
                  </h3>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {formatDuration(elapsedTime)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Started at {format(new Date(activeSleep.startTime), "h:mm a")}
                  </p>
                  <Button onClick={endSleep} size="lg" className="w-full">
                    End Sleep Session
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-center flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5" />
                    Start Sleep Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => startSleep("nap")}
                        variant="outline"
                        className="h-20 sm:h-24 w-full flex-col gap-2 border-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 overflow-hidden"
                      >
                        <Sun className="h-7 w-7 sm:h-8 sm:w-8 text-amber-500 shrink-0" />
                        <span className="font-semibold text-xs sm:text-sm truncate">Start Nap</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => startSleep("night")}
                        variant="outline"
                        className="h-20 sm:h-24 w-full flex-col gap-2 border-2 hover:border-primary hover:bg-primary/10 overflow-hidden"
                      >
                        <Moon className="h-7 w-7 sm:h-8 sm:w-8 text-primary shrink-0" />
                        <span className="font-semibold text-xs sm:text-sm truncate">Night Sleep</span>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardContent className="py-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1 shrink-0" />
              <p className="text-lg sm:text-xl font-bold text-primary truncate">{formatDuration(stats.totalMinutes)}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Today's Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <BarChart3 className="h-5 w-5 mx-auto text-muted-foreground mb-1 shrink-0" />
              <p className="text-lg sm:text-xl font-bold truncate">{formatDuration(weeklyAvg)}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">7-Day Avg</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Advice Button */}
        <Button
          onClick={getAIAdvice}
          disabled={aiLoading}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-xs h-9"
        >
          {aiLoading ? (
            <Loader2 className="h-4 w-4 me-1.5 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 me-1.5" />
          )}
          Get AI Sleep Advice
        </Button>

        {/* AI Advice Card */}
        <AnimatePresence>
          {showAiAdvice && aiAdvice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
                <CardHeader className="pb-1.5 pt-3">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    AI Sleep Advisor
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="text-xs whitespace-pre-wrap leading-relaxed">{aiAdvice}</div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today Breakdown */}
        {stats.count > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today's Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xl font-bold">{stats.count}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                  <p className="text-xl font-bold text-amber-600">{formatDuration(stats.napMinutes)}</p>
                  <p className="text-xs text-muted-foreground">Naps</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <p className="text-xl font-bold text-primary">{formatDuration(stats.nightMinutes)}</p>
                  <p className="text-xs text-muted-foreground">Night</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessions.slice(0, 10).map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between py-3 px-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    {session.type === "night" ? (
                      <Moon className="h-5 w-5 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 text-amber-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {format(new Date(session.startTime), "MMM d")} • {format(new Date(session.startTime), "h:mm a")}
                        {session.endTime && ` - ${format(new Date(session.endTime), "h:mm a")}`}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {session.type} • {session.endTime && formatDuration(
                          Math.max(0, differenceInMinutes(new Date(session.endTime), new Date(session.startTime)))
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSession(session.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Sleep Reference Guide */}
        <Card className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20">
          <CardContent className="pt-4">
            <h4 className="font-medium mb-3">💤 Recommended Sleep by Age (AAP Guidelines)</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between p-2 bg-white/50 dark:bg-white/5 rounded">
                <span>Newborn (0-3 months)</span>
                <span className="font-medium">14-17 hours</span>
              </div>
              <div className="flex justify-between p-2 bg-white/50 dark:bg-white/5 rounded">
                <span>Infant (4-12 months)</span>
                <span className="font-medium">12-16 hours</span>
              </div>
              <div className="flex justify-between p-2 bg-white/50 dark:bg-white/5 rounded">
                <span>Toddler (1-2 years)</span>
                <span className="font-medium">11-14 hours</span>
              </div>
              <div className="flex justify-between p-2 bg-white/50 dark:bg-white/5 rounded">
                <span>Preschool (3-5 years)</span>
                <span className="font-medium">10-13 hours</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              ⚠️ These are general guidelines. Every baby is unique. Consult your pediatrician for personalized advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default BabySleepTracker;