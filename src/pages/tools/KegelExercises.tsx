import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, Play, Pause, RotateCcw, Timer, Award, TrendingUp, Info } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAnalytics } from "@/hooks/useAnalytics";

interface ExerciseSession {
  date: string;
  reps: number;
  duration: number;
}

interface ExerciseProgram {
  id: string;
  name: string;
  description: string;
  holdTime: number;
  restTime: number;
  reps: number;
  level: "beginner" | "intermediate" | "advanced";
}

const STORAGE_KEY = "kegel-exercises-data";

const programs: ExerciseProgram[] = [
  { id: "beginner", name: "المبتدئ", description: "مثالي للبدء", holdTime: 3, restTime: 3, reps: 10, level: "beginner" },
  { id: "intermediate", name: "المتوسط", description: "لتقوية أكثر", holdTime: 5, restTime: 5, reps: 15, level: "intermediate" },
  { id: "advanced", name: "المتقدم", description: "للقوة القصوى", holdTime: 10, restTime: 5, reps: 20, level: "advanced" },
];

const KegelExercises = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics("kegel-exercises");
  
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ExerciseProgram>(programs[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"hold" | "rest">("hold");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const saveSessions = (newSessions: ExerciseSession[]) => {
    setSessions(newSessions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions.slice(-30)));
  };

  const startExercise = () => {
    setIsActive(true);
    setPhase("hold");
    setTimeLeft(selectedProgram.holdTime);
    setCurrentRep(1);
    trackAction("exercise_started", { program: selectedProgram.id });
    runTimer();
  };

  const runTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPhase(currentPhase => {
            if (currentPhase === "hold") {
              setTimeLeft(selectedProgram.restTime);
              return "rest";
            } else {
              setCurrentRep(rep => {
                if (rep >= selectedProgram.reps) {
                  completeExercise();
                  return rep;
                }
                setTimeLeft(selectedProgram.holdTime);
                return rep + 1;
              });
              return "hold";
            }
          });
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    
    const newSession: ExerciseSession = {
      date: new Date().toISOString(),
      reps: selectedProgram.reps,
      duration: (selectedProgram.holdTime + selectedProgram.restTime) * selectedProgram.reps,
    };
    
    saveSessions([newSession, ...sessions]);
    trackAction("exercise_completed", { program: selectedProgram.id, reps: selectedProgram.reps });
  };

  const stopExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);
    setCurrentRep(0);
  };

  const getTodayReps = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return sessions
      .filter(s => s.date.startsWith(today))
      .reduce((sum, s) => sum + s.reps, 0);
  };

  const getWeeklyStreak = () => {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = format(new Date(now.getTime() - i * 86400000), "yyyy-MM-dd");
      if (sessions.some(s => s.date.startsWith(date))) streak++;
      else break;
    }
    return streak;
  };

  const progress = isActive ? ((currentRep - 1) / selectedProgram.reps) * 100 : 0;

  return (
    <ToolFrame
      title={t('tools.kegelExercises.title')}
      subtitle={t('tools.kegelExercises.description')}
      icon={Activity}
      mood="empowering"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-pink-100/50">
            <CardContent className="pt-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">{getTodayReps()}</p>
              <p className="text-xs text-muted-foreground">تكرار اليوم</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-100/50 to-orange-100/50">
            <CardContent className="pt-4 text-center">
              <Award className="h-6 w-6 mx-auto text-amber-600 mb-2" />
              <p className="text-2xl font-bold text-amber-600">{getWeeklyStreak()}</p>
              <p className="text-xs text-muted-foreground">أيام متتالية</p>
            </CardContent>
          </Card>
        </div>

        {/* Program Selection */}
        {!isActive && (
          <div>
            <h3 className="font-semibold mb-3">اختاري البرنامج</h3>
            <div className="grid gap-3">
              {programs.map((program) => (
                <motion.div
                  key={program.id}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      selectedProgram.id === program.id
                        ? 'border-2 border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedProgram(program)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{program.name}</h4>
                          <p className="text-sm text-muted-foreground">{program.description}</p>
                        </div>
                        <div className="text-left text-sm">
                          <p className="text-primary font-medium">{program.reps} تكرار</p>
                          <p className="text-muted-foreground">{program.holdTime}s شد / {program.restTime}s راحة</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Timer */}
        {isActive ? (
          <Card className="overflow-hidden">
            <div className={`p-8 text-center ${phase === "hold" ? 'bg-gradient-to-br from-primary to-pink-500' : 'bg-gradient-to-br from-blue-400 to-cyan-500'} text-white`}>
              <motion.div
                key={phase}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <h3 className="text-2xl font-bold">
                  {phase === "hold" ? "🔥 شدّي" : "😮‍💨 استرخي"}
                </h3>
                <div className="relative w-32 h-32 mx-auto">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-white/30"
                    animate={{
                      scale: phase === "hold" ? [1, 1.1, 1] : [1, 0.9, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold">{timeLeft}</span>
                  </div>
                </div>
                <p className="text-lg">
                  التكرار {currentRep} من {selectedProgram.reps}
                </p>
              </motion.div>
            </div>
            <CardContent className="pt-4">
              <Progress value={progress} className="h-2 mb-4" />
              <div className="flex justify-center gap-4">
                <Button variant="destructive" onClick={stopExercise}>
                  <Pause className="h-4 w-4 mr-2" />
                  إيقاف
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              className="w-full py-8 text-xl bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-400"
              onClick={startExercise}
            >
              <Play className="h-6 w-6 mr-3" />
              ابدئي التمرين
            </Button>
          </motion.div>
        )}

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                آخر التمارين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessions.slice(0, 5).map((session, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(session.date), "EEEE، d MMMM", { locale: ar })}
                    </span>
                    <span className="font-medium text-primary">{session.reps} تكرار</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Benefits Info */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-purple-900">فوائد تمارين كيجل</p>
                <ul className="text-sm text-purple-700 mt-1 space-y-1 list-disc list-inside">
                  <li>تقوية عضلات قاع الحوض</li>
                  <li>تسهيل الولادة والتعافي</li>
                  <li>منع سلس البول أثناء وبعد الحمل</li>
                  <li>تحسين الدورة الدموية</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default KegelExercises;
