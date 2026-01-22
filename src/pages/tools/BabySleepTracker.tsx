import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Clock, Trash2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInMinutes, differenceInHours } from "date-fns";

interface SleepSession {
  id: string;
  startTime: string;
  endTime: string | null;
  type: "nap" | "night";
}

const BabySleepTracker = () => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [activeSleep, setActiveSleep] = useState<SleepSession | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("babySleepSessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed.filter((s: SleepSession) => s.endTime));
      const active = parsed.find((s: SleepSession) => !s.endTime);
      if (active) setActiveSleep(active);
    }
  }, []);

  const saveToStorage = (newSessions: SleepSession[], active: SleepSession | null) => {
    const toSave = active ? [...newSessions, active] : newSessions;
    localStorage.setItem("babySleepSessions", JSON.stringify(toSave));
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
  };

  const endSleep = () => {
    if (!activeSleep) return;
    const completed = { ...activeSleep, endTime: new Date().toISOString() };
    const updated = [completed, ...sessions];
    setSessions(updated);
    setActiveSleep(null);
    saveToStorage(updated, null);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveToStorage(updated, activeSleep);
  };

  const formatDuration = (start: string, end: string) => {
    const mins = differenceInMinutes(new Date(end), new Date(start));
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    if (hours > 0) {
      return `${hours}${t('common.hours')} ${remaining}${t('common.minutes')}`;
    }
    return `${mins} ${t('common.minutes')}`;
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(
      (s) => new Date(s.startTime).toDateString() === today && s.endTime
    );
    
    let totalMinutes = 0;
    todaySessions.forEach((s) => {
      if (s.endTime) {
        totalMinutes += differenceInMinutes(new Date(s.endTime), new Date(s.startTime));
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return {
      count: todaySessions.length,
      totalHours: hours,
      totalMins: mins,
    };
  };

  const stats = getTodayStats();

  return (
    <Layout title={t('tools.babySleepTracker.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Active Session */}
          {activeSleep ? (
            <Card className="mb-6 border-primary">
              <CardContent className="pt-6 text-center">
                <div className="mb-4">
                  {activeSleep.type === "night" ? (
                    <Moon className="h-12 w-12 mx-auto text-primary animate-pulse" />
                  ) : (
                    <Sun className="h-12 w-12 mx-auto text-yellow-500 animate-pulse" />
                  )}
                </div>
                <p className="text-lg font-medium mb-2">
                  {t(`babySleepPage.${activeSleep.type}Sleep`)}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('babySleepPage.startedAt')} {format(new Date(activeSleep.startTime), "HH:mm")}
                </p>
                <Button onClick={endSleep} variant="destructive" size="lg">
                  {t('babySleepPage.endSleep')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-center">{t('babySleepPage.startTracking')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => startSleep("nap")}
                    variant="outline"
                    className="h-24 flex-col gap-2"
                  >
                    <Sun className="h-8 w-8 text-yellow-500" />
                    {t('babySleepPage.startNap')}
                  </Button>
                  <Button
                    onClick={() => startSleep("night")}
                    variant="outline"
                    className="h-24 flex-col gap-2"
                  >
                    <Moon className="h-8 w-8 text-primary" />
                    {t('babySleepPage.startNight')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Stats */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('babySleepPage.todayStats')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-2xl font-bold text-primary">{stats.count}</p>
                  <p className="text-sm text-muted-foreground">{t('babySleepPage.sleepSessions')}</p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-2xl font-bold text-primary">
                    {stats.totalHours}h {stats.totalMins}m
                  </p>
                  <p className="text-sm text-muted-foreground">{t('babySleepPage.totalSleep')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          {sessions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">{t('babySleepPage.recentSessions')}</h2>
              <div className="space-y-2">
                {sessions.slice(0, 10).map((session) => (
                  <Card key={session.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {session.type === "night" ? (
                            <Moon className="h-5 w-5 text-primary" />
                          ) : (
                            <Sun className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium">
                              {format(new Date(session.startTime), "MMM d, HH:mm")}
                              {" - "}
                              {session.endTime && format(new Date(session.endTime), "HH:mm")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.endTime && formatDuration(session.startTime, session.endTime)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSession(session.id)}
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
      </div>
    </Layout>
  );
};

export default BabySleepTracker;
