import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Target, Timer, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ToolFrame } from '@/components/ToolFrame';
import { useTranslation } from 'react-i18next';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { toast } from 'sonner';

interface KegelSession {
  date: string;
  reps: number;
  sets: number;
}

const STORAGE_KEY = 'kegelExerciseData';
const DAILY_GOAL = 30; // reps per day

export default function KegelExercise() {
  const { t } = useTranslation();
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'squeeze' | 'release' | 'idle'>('idle');
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todayStr = new Date().toDateString();

  // Load saved data
  useEffect(() => {
    const sessions = safeParseLocalStorage<KegelSession[]>(STORAGE_KEY, [], (v): v is KegelSession[] => Array.isArray(v));
    const todaySession = sessions.find(s => s.date === todayStr);
    if (todaySession) {
      setTodayTotal(todaySession.reps);
    }
    // Calculate streak
    let s = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const found = sessions.find(ses => ses.date === d.toDateString());
      if (found && found.reps > 0) {
        s++;
      } else if (i > 0) {
        break;
      }
    }
    setStreak(s);
  }, [todayStr]);

  const saveSession = useCallback((newReps: number) => {
    const sessions = safeParseLocalStorage<KegelSession[]>(STORAGE_KEY, [], (v): v is KegelSession[] => Array.isArray(v));
    const idx = sessions.findIndex(s => s.date === todayStr);
    if (idx >= 0) {
      sessions[idx].reps = newReps;
      sessions[idx].sets++;
    } else {
      sessions.push({ date: todayStr, reps: newReps, sets: 1 });
    }
    // Keep last 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const filtered = sessions.filter(s => new Date(s.date) >= cutoff);
    safeSaveToLocalStorage(STORAGE_KEY, filtered);
  }, [todayStr]);

  // Exercise timer logic
  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setPhaseTimer(prev => {
        if (prev <= 1) {
          // Switch phase
          setPhase(current => {
            if (current === 'squeeze') {
              return 'release';
            } else {
              // Completed one rep
              setReps(r => r + 1);
              return 'squeeze';
            }
          });
          return 5; // 5 seconds per phase
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const startExercise = () => {
    setIsActive(true);
    setPhase('squeeze');
    setPhaseTimer(5);
    setReps(0);
  };

  const pauseExercise = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const finishSet = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const newTotal = todayTotal + reps;
    setTodayTotal(newTotal);
    setSets(prev => prev + 1);
    saveSession(newTotal);
    setPhase('idle');
    setPhaseTimer(0);

    if (newTotal >= DAILY_GOAL) {
      toast.success(t('toolsInternal.kegel.goalReached'));
    } else {
      toast.success(t('toolsInternal.kegel.setComplete', { reps }));
    }
    setReps(0);
  };

  const resetToday = () => {
    setReps(0);
    setSets(0);
    setTodayTotal(0);
    setIsActive(false);
    setPhase('idle');
    if (intervalRef.current) clearInterval(intervalRef.current);
    const sessions = safeParseLocalStorage<KegelSession[]>(STORAGE_KEY, [], (v): v is KegelSession[] => Array.isArray(v));
    const filtered = sessions.filter(s => s.date !== todayStr);
    safeSaveToLocalStorage(STORAGE_KEY, filtered);
  };

  const progress = Math.min((todayTotal / DAILY_GOAL) * 100, 100);

  return (
    <ToolFrame
      title={t('tools.kegelExercise.title')}
      subtitle={t('tools.kegelExercise.description')}
      toolId="kegel-exercise"
      mood="empowering"
    >
      <div className="space-y-4 pb-24">
        {/* Daily Progress */}
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-sm">{t('toolsInternal.kegel.dailyGoal')}</h3>
              </div>
              <span className="text-xs text-muted-foreground">{todayTotal}/{DAILY_GOAL}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            {todayTotal >= DAILY_GOAL && (
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" />
                {t('toolsInternal.kegel.goalReached')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="p-3 text-center">
              <Trophy className="w-5 h-5 mx-auto text-amber-500 mb-1" />
              <p className="text-lg font-bold">{streak}</p>
              <p className="text-[10px] text-muted-foreground">{t('toolsInternal.kegel.streak')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
              <p className="text-lg font-bold">{todayTotal}</p>
              <p className="text-[10px] text-muted-foreground">{t('toolsInternal.kegel.todayReps')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Timer className="w-5 h-5 mx-auto text-sky-500 mb-1" />
              <p className="text-lg font-bold">{sets}</p>
              <p className="text-[10px] text-muted-foreground">{t('toolsInternal.kegel.sets')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Exercise Circle */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" className="stroke-muted" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none" strokeWidth="6"
                  strokeLinecap="round"
                  className={phase === 'squeeze' ? 'stroke-primary' : 'stroke-accent'}
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  animate={{
                    strokeDashoffset: isActive ? `${2 * Math.PI * 45 * (1 - phaseTimer / 5)}` : `${2 * Math.PI * 45}`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {phase === 'idle' ? (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                      <p className="text-3xl font-bold">{reps}</p>
                      <p className="text-xs text-muted-foreground">{t('toolsInternal.kegel.reps')}</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={phase}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center"
                    >
                      <motion.div
                        animate={phase === 'squeeze' ? { scale: [1, 1.1, 1] } : { scale: [1, 0.95, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <p className="text-lg font-bold text-primary">
                          {phase === 'squeeze' ? t('toolsInternal.kegel.squeeze') : t('toolsInternal.kegel.release')}
                        </p>
                      </motion.div>
                      <p className="text-3xl font-bold mt-1">{phaseTimer}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t('toolsInternal.kegel.rep')} #{reps + 1}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {!isActive && phase === 'idle' ? (
                <Button onClick={startExercise} size="lg" className="gap-2 px-8">
                  <Play className="w-5 h-5" />
                  {t('toolsInternal.kegel.start')}
                </Button>
              ) : isActive ? (
                <>
                  <Button onClick={pauseExercise} variant="outline" size="lg" className="gap-2">
                    <Pause className="w-5 h-5" />
                    {t('toolsInternal.kegel.pause')}
                  </Button>
                  <Button onClick={finishSet} size="lg" className="gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {t('toolsInternal.kegel.finish')}
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={startExercise} size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    {t('toolsInternal.kegel.resume')}
                  </Button>
                  <Button onClick={finishSet} variant="outline" size="lg" className="gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {t('toolsInternal.kegel.finish')}
                  </Button>
                </>
              )}
            </div>

            {todayTotal > 0 && (
              <Button onClick={resetToday} variant="ghost" size="sm" className="mt-3 gap-1 text-xs text-muted-foreground">
                <RotateCcw className="w-3 h-3" />
                {t('toolsInternal.kegel.resetToday')}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-2">{t('toolsInternal.kegel.howTo')}</h3>
            <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
              <li>{t('toolsInternal.kegel.step1')}</li>
              <li>{t('toolsInternal.kegel.step2')}</li>
              <li>{t('toolsInternal.kegel.step3')}</li>
              <li>{t('toolsInternal.kegel.step4')}</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
