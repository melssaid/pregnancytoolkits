import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CircleDot, Plus, Clock, History, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, startOfDay, isToday, isYesterday } from "date-fns";

interface FeedingSession {
  id: string;
  startTime: Date;
  duration: number; // minutes
  side: "left" | "right" | "both" | "bottle";
  notes?: string;
}

const STORAGE_KEY = "breastfeeding-tracker-data";

export default function BreastfeedingTracker() {
  const [sessions, setSessions] = useState<FeedingSession[]>([]);
  const [side, setSide] = useState<"left" | "right" | "both" | "bottle">("left");
  const [duration, setDuration] = useState("15");
  const [lastSide, setLastSide] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed.map((s: any) => ({
        ...s,
        startTime: new Date(s.startTime),
      })));
      
      // Determine last side used
      if (parsed.length > 0) {
        const last = parsed[0];
        if (last.side === "left" || last.side === "right") {
          setLastSide(last.side);
          setSide(last.side === "left" ? "right" : "left");
        }
      }
    }
  }, []);

  const logSession = () => {
    const newSession: FeedingSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      duration: parseInt(duration),
      side,
    };

    const newSessions = [newSession, ...sessions].slice(0, 100);
    setSessions(newSessions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));

    if (side === "left" || side === "right") {
      setLastSide(side);
      setSide(side === "left" ? "right" : "left");
    }
  };

  const getTodayStats = () => {
    const today = startOfDay(new Date());
    const todaySessions = sessions.filter(
      (s) => s.startTime >= today
    );

    const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const totalSessions = todaySessions.length;

    return { totalMinutes, totalSessions };
  };

  const stats = getTodayStats();

  const getSideColor = (s: string) => {
    switch (s) {
      case "left": return "bg-blue-100 text-blue-700";
      case "right": return "bg-pink-100 text-pink-700";
      case "both": return "bg-purple-100 text-purple-700";
      case "bottle": return "bg-amber-100 text-amber-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const groupSessionsByDay = () => {
    const groups: Record<string, FeedingSession[]> = {};
    sessions.forEach((session) => {
      const dayKey = format(session.startTime, "yyyy-MM-dd");
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(session);
    });
    return groups;
  };

  const groupedSessions = groupSessionsByDay();

  const formatDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMM d");
  };

  return (
    <Layout title="Breastfeeding Tracker" showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Today's Stats */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <Card className="bg-secondary/50">
                <CardContent className="pt-4 text-center">
                  <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.totalMinutes}</p>
                  <p className="text-xs text-muted-foreground">Minutes Today</p>
                </CardContent>
              </Card>
              
              <Card className="bg-secondary/50">
                <CardContent className="pt-4 text-center">
                  <CircleDot className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Sessions Today</p>
                </CardContent>
              </Card>
            </div>

            {/* Log New Session */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Log Feeding Session
                </CardTitle>
                {lastSide && (
                  <CardDescription>
                    Last feeding was on the <strong>{lastSide}</strong> side
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Side</Label>
                    <Select value={side} onValueChange={(v) => setSide(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                        <SelectItem value="bottle">Bottle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={logSession} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Log Session
                </Button>
              </CardContent>
            </Card>

            {/* Session History */}
            {Object.keys(groupedSessions).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    Feeding History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(groupedSessions).slice(0, 3).map(([day, daySessions]) => (
                      <div key={day}>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {formatDayLabel(day)}
                        </p>
                        <div className="space-y-2">
                          {daySessions.map((session) => (
                            <div
                              key={session.id}
                              className="flex items-center justify-between rounded-lg bg-muted p-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${getSideColor(session.side)}`}>
                                  {session.side}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {format(session.startTime, "h:mm a")}
                                </span>
                              </div>
                              <span className="font-medium text-foreground">
                                {session.duration} min
                              </span>
                            </div>
                          ))}
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
                Newborns typically feed 8-12 times in 24 hours. Tracking helps ensure 
                balanced feeding and identify patterns.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
