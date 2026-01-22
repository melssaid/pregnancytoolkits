import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassWater, Plus, Minus, RotateCcw, Droplets } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const STORAGE_KEY = "water-intake-data";
const GLASS_SIZE = 8; // oz
const DAILY_GOAL = 80; // oz (10 glasses for pregnancy)

interface WaterLog {
  date: string;
  intake: number;
}

export default function WaterIntake() {
  const [todayIntake, setTodayIntake] = useState(0);
  const [logs, setLogs] = useState<WaterLog[]>([]);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: WaterLog[] = JSON.parse(saved);
      setLogs(parsed);
      const todayLog = parsed.find((l) => l.date === today);
      if (todayLog) {
        setTodayIntake(todayLog.intake);
      }
    }
  }, [today]);

  const saveIntake = (newIntake: number) => {
    const newLogs = logs.filter((l) => l.date !== today);
    if (newIntake > 0) {
      newLogs.unshift({ date: today, intake: newIntake });
    }
    setLogs(newLogs.slice(0, 7));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs.slice(0, 7)));
  };

  const addGlass = () => {
    const newIntake = Math.min(todayIntake + GLASS_SIZE, 200);
    setTodayIntake(newIntake);
    saveIntake(newIntake);
  };

  const removeGlass = () => {
    const newIntake = Math.max(todayIntake - GLASS_SIZE, 0);
    setTodayIntake(newIntake);
    saveIntake(newIntake);
  };

  const resetToday = () => {
    setTodayIntake(0);
    saveIntake(0);
  };

  const progressPercent = Math.min((todayIntake / DAILY_GOAL) * 100, 100);
  const glassesCount = Math.floor(todayIntake / GLASS_SIZE);
  const goalGlasses = DAILY_GOAL / GLASS_SIZE;

  return (
    <Layout title="Water Intake Tracker" showBack>
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
                  <GlassWater className="h-5 w-5 text-primary" />
                  Daily Hydration
                </CardTitle>
                <CardDescription>
                  Stay hydrated during pregnancy — aim for 10+ glasses daily
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Visual Progress */}
                <div className="relative">
                  <div className="flex justify-center mb-6">
                    <motion.div
                      className="relative h-48 w-32 rounded-b-3xl border-4 border-primary/30 bg-secondary overflow-hidden"
                      style={{ borderTopWidth: 0 }}
                    >
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-primary/20"
                        initial={{ height: 0 }}
                        animate={{ height: `${progressPercent}%` }}
                        transition={{ duration: 0.5, type: "spring" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-primary/10" />
                        <motion.div
                          className="absolute top-0 left-0 right-0 h-2 bg-primary/30"
                          animate={{ y: [0, 3, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Droplets className="h-12 w-12 text-primary/30" />
                      </div>
                    </motion.div>
                  </div>

                  <div className="text-center mb-4">
                    <AnimatePresence mode="popLayout">
                      <motion.p
                        key={todayIntake}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-5xl font-bold text-foreground"
                      >
                        {todayIntake}
                        <span className="text-2xl text-muted-foreground ml-1">oz</span>
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-muted-foreground">
                      {glassesCount} of {goalGlasses} glasses
                    </p>
                  </div>

                  <Progress value={progressPercent} className="h-3" />
                  
                  {progressPercent >= 100 && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-success font-medium mt-2"
                    >
                      🎉 Daily goal reached!
                    </motion.p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={removeGlass}
                    disabled={todayIntake === 0}
                    className="h-14 w-14 rounded-full p-0"
                  >
                    <Minus className="h-6 w-6" />
                  </Button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={addGlass}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elevated"
                  >
                    <Plus className="h-8 w-8" />
                  </motion.button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={resetToday}
                    className="h-14 w-14 rounded-full p-0"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Each tap adds 8 oz (1 glass)
                </p>
              </CardContent>
            </Card>

            {/* Weekly History */}
            {logs.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (6 - i));
                      const dateStr = format(date, "yyyy-MM-dd");
                      const log = logs.find((l) => l.date === dateStr);
                      const intake = log?.intake || 0;
                      const percent = Math.min((intake / DAILY_GOAL) * 100, 100);
                      const isToday = dateStr === today;

                      return (
                        <div key={dateStr} className="text-center">
                          <p className={`text-xs mb-1 ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                            {format(date, "EEE")}
                          </p>
                          <div className="h-16 w-full rounded-lg bg-muted overflow-hidden relative">
                            <motion.div
                              className="absolute bottom-0 left-0 right-0 bg-primary/30"
                              initial={{ height: 0 }}
                              animate={{ height: `${percent}%` }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                            />
                          </div>
                          <p className="text-xs mt-1 text-muted-foreground">
                            {Math.floor(intake / GLASS_SIZE)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
