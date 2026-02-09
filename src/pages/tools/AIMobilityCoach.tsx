import React, { useState, useEffect, useRef } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Footprints, Play, Pause, CheckCircle, Flame, Sparkles, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import MedicalDisclaimer from '@/components/compliance/MedicalDisclaimer';
import { useTranslation } from 'react-i18next';

interface WalkSession {
  id: string;
  date: string;
  duration: number;
  steps: number;
  legExercises: number;
}

interface MobilityData {
  weeklyGoal: number;
  sessions: WalkSession[];
}

const DEFAULT_DATA: MobilityData = {
  weeklyGoal: 30,
  sessions: [],
};

const isValidData = (data: unknown): data is MobilityData => {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d.weeklyGoal === 'number' && Array.isArray(d.sessions);
};

const legExerciseKeys = ['calfRaises', 'ankleCircles', 'toePoints', 'legStretches'] as const;

export default function AIMobilityCoach() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [data, setData] = useState<MobilityData>(DEFAULT_DATA);
  const [isWalking, setIsWalking] = useState(false);
  const [walkTime, setWalkTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const { toast } = useToast();
  const isInitialized = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = safeParseLocalStorage<MobilityData>('mobilityCoachData', DEFAULT_DATA, isValidData);
    setData(saved);
    const disclaimerShown = localStorage.getItem('mobilityCoach-disclaimer');
    if (disclaimerShown === 'true') setShowDisclaimer(false);
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (!isInitialized.current) return;
    safeSaveToLocalStorage('mobilityCoachData', data);
  }, [data]);

  useEffect(() => {
    if (isWalking) {
      timerRef.current = setInterval(() => {
        setWalkTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWalking]);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('mobilityCoach-disclaimer', 'true');
    setShowDisclaimer(false);
  };

  const startWalk = () => {
    setIsWalking(true);
    setWalkTime(0);
  };

  const stopWalk = () => {
    setIsWalking(false);
    if (walkTime > 60) {
      const estimatedSteps = Math.round((walkTime / 60) * 100);
      const newSession: WalkSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration: walkTime,
        steps: estimatedSteps,
        legExercises: completedExercises.length,
      };
      setData(prev => ({
        ...prev,
        sessions: [newSession, ...prev.sessions].slice(0, 30),
      }));
      toast({ title: t('toolsInternal.mobilityCoach.walkSaved'), description: t('toolsInternal.mobilityCoach.minutesRecorded', { minutes: Math.floor(walkTime / 60) }) });
    }
    setCompletedExercises([]);
  };

  const toggleExercise = (id: string) => {
    setCompletedExercises(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const deleteSession = (id: string) => {
    setData(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== id),
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWeeklyMinutes = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return data.sessions
      .filter(s => new Date(s.date) > oneWeekAgo)
      .reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
  };

  const weeklyProgress = Math.min((getWeeklyMinutes() / data.weeklyGoal) * 100, 100);

  if (showDisclaimer) {
    return <MedicalDisclaimer toolName={t('toolsInternal.mobilityCoach.title')} onAccept={handleAcceptDisclaimer} />;
  }

  return (
    <ToolFrame
      title={t('toolsInternal.mobilityCoach.title')}
      subtitle={t('toolsInternal.mobilityCoach.subtitle')}
      icon={Footprints}
      mood="empowering"
      toolId="ai-mobility-coach"
    >
      <div className="space-y-6">
        {/* Weekly Goal */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                {t('toolsInternal.mobilityCoach.weeklyGoal')}
              </h3>
              <span className="text-lg font-bold text-primary">
                {getWeeklyMinutes()} / {data.weeklyGoal} {t('common.min')}
              </span>
            </div>
            <Progress value={weeklyProgress} className="h-3 mb-3" />
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('toolsInternal.mobilityCoach.adjustGoal')}</label>
              <Slider
                value={[data.weeklyGoal]}
                onValueChange={(v) => setData(prev => ({ ...prev, weeklyGoal: v[0] }))}
                min={15}
                max={120}
                step={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Walk Timer */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-4">
              {formatTime(walkTime)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {isWalking ? t('toolsInternal.mobilityCoach.walkingInProgress') : t('toolsInternal.mobilityCoach.startWalkDesc')}
            </p>
            <Button
              size="lg"
              className="gap-2 rounded-full px-8"
              onClick={isWalking ? stopWalk : startWalk}
            >
              {isWalking ? <><Pause className="w-5 h-5" />{t('toolsInternal.mobilityCoach.stopAndSave')}</> : <><Play className="w-5 h-5" />{t('toolsInternal.mobilityCoach.startWalk')}</>}
            </Button>
          </CardContent>
        </Card>

        {/* Leg Cramp Prevention Exercises */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              {t('toolsInternal.mobilityCoach.legCrampExercises')}
            </h3>
            <div className="space-y-3">
              {legExerciseKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => toggleExercise(key)}
                  className={`w-full text-start p-4 rounded-xl border-2 transition-all ${
                    completedExercises.includes(key)
                      ? 'bg-accent/20 border-primary/40'
                      : 'bg-muted/50 border-transparent hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t(`toolsInternal.mobilityCoach.legExercises.${key}.name`)}</p>
                      <p className="text-sm text-muted-foreground">{t(`toolsInternal.mobilityCoach.legExercises.${key}.desc`)}</p>
                    </div>
                    {completedExercises.includes(key) && (
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {t('toolsInternal.mobilityCoach.completed')}: {completedExercises.length}/{legExerciseKeys.length} {t('toolsInternal.mobilityCoach.exercises')}
            </p>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        {data.sessions.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4">{t('toolsInternal.mobilityCoach.recentSessions')}</h3>
              <div className="space-y-3">
                {data.sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{Math.floor(session.duration / 60)} {t('common.min')} {t('toolsInternal.mobilityCoach.walk')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.date).toLocaleDateString()} • ~{session.steps} {t('toolsInternal.mobilityCoach.steps')}
                        {session.legExercises > 0 && ` • ${session.legExercises} ${t('toolsInternal.mobilityCoach.exercises')}`}
                      </p>
                    </div>
                    <button onClick={() => deleteSession(session.id)} className="text-muted-foreground hover:text-destructive p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-muted/30">
          <CardContent className="p-5">
            <h4 className="font-semibold mb-3">{t('toolsInternal.mobilityCoach.walkingTips')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t('toolsInternal.mobilityCoach.tip1')}</li>
              <li>• {t('toolsInternal.mobilityCoach.tip2')}</li>
              <li>• {t('toolsInternal.mobilityCoach.tip3')}</li>
              <li>• {t('toolsInternal.mobilityCoach.tip4')}</li>
              <li>• {t('toolsInternal.mobilityCoach.tip5')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
