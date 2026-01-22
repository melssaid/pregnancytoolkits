import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, Play, Square, Trash2, Info, AlertTriangle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface Contraction {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
}

export default function ContractionTimer() {
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentStart, setCurrentStart] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && currentStart) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - currentStart.getTime()) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive, currentStart]);

  const startContraction = () => {
    setIsActive(true);
    setCurrentStart(new Date());
    setElapsed(0);
  };

  const stopContraction = () => {
    if (!currentStart) return;
    
    const contraction: Contraction = {
      id: Date.now().toString(),
      startTime: currentStart,
      endTime: new Date(),
      duration: elapsed,
    };

    setContractions([contraction, ...contractions]);
    setIsActive(false);
    setCurrentStart(null);
    setElapsed(0);
  };

  const clearAll = () => {
    setContractions([]);
    setIsActive(false);
    setCurrentStart(null);
    setElapsed(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateInterval = (index: number) => {
    if (index >= contractions.length - 1) return null;
    const current = contractions[index];
    const previous = contractions[index + 1];
    const intervalMs = current.startTime.getTime() - previous.startTime.getTime();
    return Math.floor(intervalMs / 1000 / 60); // minutes
  };

  const getAverages = () => {
    if (contractions.length < 2) return null;
    
    const lastSix = contractions.slice(0, 6);
    const avgDuration = lastSix.reduce((sum, c) => sum + c.duration, 0) / lastSix.length;
    
    const intervals: number[] = [];
    for (let i = 0; i < Math.min(5, contractions.length - 1); i++) {
      const interval = calculateInterval(i);
      if (interval !== null) intervals.push(interval);
    }
    const avgInterval = intervals.length > 0 
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length 
      : 0;

    return { avgDuration, avgInterval };
  };

  const averages = getAverages();
  const shouldCallHospital = averages && averages.avgInterval <= 5 && averages.avgDuration >= 45;

  return (
    <Layout title="Contraction Timer" showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {shouldCallHospital && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-lg bg-warning/10 border border-warning/30 p-4 flex items-start gap-3"
              >
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Time to Call Your Provider</p>
                  <p className="text-sm text-muted-foreground">
                    Contractions are 5 minutes apart and lasting 45+ seconds. 
                    Consider heading to the hospital.
                  </p>
                </div>
              </motion.div>
            )}

            <Card className="mb-6">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Timer className="h-5 w-5 text-primary" />
                  Time Your Contractions
                </CardTitle>
                <CardDescription>
                  Track duration and frequency of contractions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-4">
                  <p className="text-6xl font-bold text-foreground tabular-nums mb-4">
                    {formatDuration(elapsed)}
                  </p>
                  
                  {!isActive ? (
                    <Button onClick={startContraction} size="lg" className="gap-2 h-16 px-12">
                      <Play className="h-6 w-6" />
                      Contraction Started
                    </Button>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      <Button 
                        onClick={stopContraction} 
                        size="lg" 
                        variant="destructive"
                        className="gap-2 h-16 px-12 animate-pulse"
                      >
                        <Square className="h-6 w-6" />
                        Contraction Ended
                      </Button>
                    </motion.div>
                  )}
                </div>

                {averages && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-secondary p-4 text-center">
                      <p className="text-sm text-muted-foreground">Avg Duration</p>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.round(averages.avgDuration)}s
                      </p>
                    </div>
                    <div className="rounded-lg bg-secondary p-4 text-center">
                      <p className="text-sm text-muted-foreground">Avg Interval</p>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.round(averages.avgInterval)} min
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {contractions.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Contraction Log</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {contractions.map((contraction, index) => {
                      const interval = calculateInterval(index);
                      return (
                        <div
                          key={contraction.id}
                          className="flex items-center justify-between rounded-lg bg-muted p-3"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {format(contraction.startTime, "h:mm:ss a")}
                            </p>
                            {interval !== null && (
                              <p className="text-sm text-muted-foreground">
                                {interval} min since last
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              {contraction.duration}s
                            </p>
                            <p className="text-xs text-muted-foreground">duration</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">5-1-1 Rule</p>
                <p>
                  Call your provider when contractions are <strong>5 minutes apart</strong>, 
                  lasting <strong>1 minute each</strong>, for at least <strong>1 hour</strong>.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
