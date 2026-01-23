import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, Play, RotateCcw, Info, History, BarChart3, Share2, FileText } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { KickChart } from "@/components/charts/KickChart";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState("counter");

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

    const newSessions = [session, ...sessions].slice(0, 30);
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
    if (kicks >= 10 && duration <= 7200) return "text-success";
    if (kicks >= 10) return "text-warning";
    return "text-muted-foreground";
  };

  const exportToPDF = () => {
    // Generate text report for sharing
    const report = generateReport();
    
    // Create a blob and download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kick-count-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded successfully!");
  };

  const shareReport = async () => {
    const report = generateReport();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kick Count Report',
          text: report,
        });
        toast.success("Report shared!");
      } catch (err) {
        // User cancelled or error
        copyToClipboard(report);
      }
    } else {
      copyToClipboard(report);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Report copied to clipboard!");
  };

  const generateReport = () => {
    const recentSessions = sessions.slice(0, 7);
    const avgKicks = recentSessions.length > 0 
      ? recentSessions.reduce((sum, s) => sum + s.kicks, 0) / recentSessions.length 
      : 0;
    const goodSessions = recentSessions.filter(s => s.kicks >= 10 && s.duration <= 7200).length;

    let report = `KICK COUNT REPORT\n`;
    report += `Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}\n`;
    report += `${'='.repeat(40)}\n\n`;
    report += `SUMMARY (Last 7 Sessions)\n`;
    report += `- Total Sessions: ${recentSessions.length}\n`;
    report += `- Average Kicks: ${avgKicks.toFixed(1)}\n`;
    report += `- Excellent Sessions (10+ kicks in <2hrs): ${goodSessions}\n\n`;
    report += `SESSION DETAILS\n`;
    report += `${'-'.repeat(40)}\n`;

    recentSessions.forEach((session, index) => {
      const isGood = session.kicks >= 10 && session.duration <= 7200;
      report += `${index + 1}. ${format(session.startTime, 'MMM d, h:mm a')}\n`;
      report += `   Kicks: ${session.kicks} | Duration: ${Math.round(session.duration / 60)} min`;
      report += isGood ? ' ✓ Excellent\n' : '\n';
    });

    report += `\n${'-'.repeat(40)}\n`;
    report += `Note: Goal is 10 kicks within 2 hours.\n`;
    report += `Contact provider if decreased movement is noticed.\n`;

    return report;
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="counter" className="gap-2">
                  <Hand className="h-4 w-4" />
                  Counter
                </TabsTrigger>
                <TabsTrigger value="chart" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Chart
                </TabsTrigger>
              </TabsList>

              <TabsContent value="counter" className="space-y-6">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Hand className="h-5 w-5 text-primary" />
                      Track Fetal Movements
                    </CardTitle>
                    <CardDescription>
                      Count 10 kicks to monitor baby's activity
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
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        Recent Sessions
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportToPDF}>
                          <FileText className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm" onClick={shareReport}>
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
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
              </TabsContent>

              <TabsContent value="chart">
                <KickChart sessions={sessions} />
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Starting at week 28, count fetal movements daily. Contact your healthcare 
                provider if you notice decreased movement or don't reach 10 kicks in 2 hours.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
