import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, Play, RotateCcw, Info, History } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface KickSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  kicks: number;
  duration: number;
}

const STORAGE_KEY = "kick-counter-sessions";

export default function KickCounter() {
  const [isActive, setIsActive] = useState(false);
  const [kicks, setKicks] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<KickSession[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
        endTime: s.endTime ? new Date(s.endTime) : undefined,
      })));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const startSession = () => {
    setIsActive(true);
    setKicks(0);
    setElapsed(0);
    setStartTime(new Date());
  };

  const recordKick = () => {
    if (!isActive) return;
    setKicks((k) => k + 1);
    
    // Check if goal reached (10 kicks)
    if (kicks + 1 >= 10) {
      endSession();
    }
  };

  const endSession = () => {
    if (!startTime) return;
    
    const session: KickSession = {
      id: Date.now().toString(),
      startTime,
      endTime: new Date(),
      kicks: kicks + (kicks < 10 ? 0 : 1),
      duration: elapsed,
    };

    const newSessions = [session, ...sessions].slice(0, 10);
    setSessions(newSessions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
    
    setIsActive(false);
    setStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (duration: number, kicks: number) => {
    if (kicks >= 10 && duration <= 7200) return "text-success"; // 10 kicks in 2 hours
    if (kicks >= 10) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <Layout title="Kick Counter" showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="mb-6">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Hand className="h-5 w-5 text-primary" />
                  Track Baby's Movements
                </CardTitle>
                <CardDescription>
                  Count 10 kicks to monitor fetal activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isActive ? (
                  <div className="text-center py-8">
                    <Button onClick={startSession} size="lg" className="gap-2">
                      <Play className="h-5 w-5" />
                      Start Counting
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4">
                      Tap the button each time you feel movement
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Time Elapsed</p>
                      <p className="text-4xl font-bold text-foreground tabular-nums">
                        {formatTime(elapsed)}
                      </p>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={recordKick}
                      className="mx-auto flex h-40 w-40 flex-col items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated transition-transform hover:bg-primary/90"
                    >
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={kicks}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1.5, opacity: 0 }}
                          className="text-5xl font-bold"
                        >
                          {kicks}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-sm text-primary-foreground/80">kicks</span>
                    </motion.button>

                    <div className="flex justify-center gap-3">
                      <Button variant="outline" onClick={endSession}>
                        End Session
                      </Button>
                      <Button variant="ghost" onClick={startSession} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </Button>
                    </div>

                    <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-center">
                      <p className="text-sm text-success font-medium">
                        Goal: 10 kicks in 2 hours or less
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {10 - kicks} more kicks to go
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {sessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    Recent Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sessions.slice(0, 5).map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between rounded-lg bg-muted p-3"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {format(session.startTime, "MMM d, h:mm a")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {formatTime(session.duration)}
                          </p>
                        </div>
                        <div className={`text-right ${getStatusColor(session.duration, session.kicks)}`}>
                          <p className="text-2xl font-bold">{session.kicks}</p>
                          <p className="text-xs">kicks</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Starting at 28 weeks, count fetal movements daily. Contact your 
                healthcare provider if you notice decreased movement or don't 
                reach 10 kicks in 2 hours.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
