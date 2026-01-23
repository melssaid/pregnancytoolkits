import { useState, useEffect } from "react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Clock, Trash2, TrendingUp, Baby, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInMinutes, startOfDay, subDays, eachDayOfInterval } from "date-fns";
import { useAnalytics } from "@/hooks/useAnalytics";

interface SleepSession {
  id: string;
  startTime: string;
  endTime: string | null;
  type: "nap" | "night";
}

const STORAGE_KEY = "baby-sleep-tracker-data";

const BabySleepTracker = () => {
  const { trackAction } = useAnalytics("baby-sleep-tracker");
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [activeSleep, setActiveSleep] = useState<SleepSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

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
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
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
        const mins = differenceInMinutes(new Date(s.endTime), new Date(s.startTime));
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

  const getLast7DaysAverage = () => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });
    
    let totalMinutes = 0;
    let daysWithData = 0;
    
    days.forEach(day => {
      const dayStart = startOfDay(day);
      const daySessions = sessions.filter(s => {
        const sessionDate = startOfDay(new Date(s.startTime));
        return sessionDate.getTime() === dayStart.getTime() && s.endTime;
      });
      
      if (daySessions.length > 0) {
        daysWithData++;
        daySessions.forEach(s => {
          if (s.endTime) {
            totalMinutes += differenceInMinutes(new Date(s.endTime), new Date(s.startTime));
          }
        });
      }
    });
    
    return daysWithData > 0 ? Math.round(totalMinutes / daysWithData) : 0;
  };

  const stats = getTodayStats();
  const weeklyAvg = getLast7DaysAverage();

  return (
    <ToolFrame
      title="Baby Sleep Tracker"
      subtitle="Monitor your baby's sleep patterns and habits"
      icon={Baby}
      mood="nurturing"
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
                      <Sun className="h-16 w-16 mx-auto text-yellow-500" />
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
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => startSleep("nap")}
                        variant="outline"
                        className="h-28 w-full flex-col gap-3 border-2 hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      >
                        <Sun className="h-10 w-10 text-yellow-500" />
                        <span className="font-semibold">Start Nap</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => startSleep("night")}
                        variant="outline"
                        className="h-28 w-full flex-col gap-3 border-2 hover:border-primary hover:bg-primary/10"
                      >
                        <Moon className="h-10 w-10 text-primary" />
                        <span className="font-semibold">Start Night Sleep</span>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">{formatDuration(stats.totalMinutes)}</p>
              <p className="text-xs text-muted-foreground">Today's Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <BarChart3 className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{formatDuration(weeklyAvg)}</p>
              <p className="text-xs text-muted-foreground">7-Day Average</p>
            </CardContent>
          </Card>
        </div>

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
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                  <p className="text-xl font-bold text-yellow-600">{formatDuration(stats.napMinutes)}</p>
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
                      <Sun className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {format(new Date(session.startTime), "MMM d")} • {format(new Date(session.startTime), "h:mm a")}
                        {session.endTime && ` - ${format(new Date(session.endTime), "h:mm a")}`}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {session.type} • {session.endTime && formatDuration(
                          differenceInMinutes(new Date(session.endTime), new Date(session.startTime))
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

        {/* Sleep Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="pt-4">
            <h4 className="font-medium mb-2">💤 Healthy Sleep Tips for Babies</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Newborns need 14-17 hours of sleep per day</li>
              <li>Infants (4-12 months) need 12-16 hours including naps</li>
              <li>Create a consistent bedtime routine</li>
              <li>Keep the room dark and cool for better sleep</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default BabySleepTracker;
