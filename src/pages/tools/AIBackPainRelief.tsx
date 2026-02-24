import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, CheckCircle, Clock, AlertCircle, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AILoadingDots } from '@/components/ai/AILoadingDots';
import { BackPainAnimation } from '@/components/fitness/BackPainAnimation';

interface Exercise {
  id: string;
  nameKey: string;
  descriptionKey: string;
  duration: number;
  targetAreaKey: string;
  stepsKey: string;
  icon: string;
}

const backPainExercises: Exercise[] = [
  { id: 'cat-cow', nameKey: 'exercises.catCow.name', descriptionKey: 'exercises.catCow.description', duration: 60, targetAreaKey: 'targetAreas.lowerUpperBack', stepsKey: 'exercises.catCow.steps', icon: 'spine' },
  { id: 'pelvic-tilt', nameKey: 'exercises.pelvicTilt.name', descriptionKey: 'exercises.pelvicTilt.description', duration: 45, targetAreaKey: 'targetAreas.lowerBackCore', stepsKey: 'exercises.pelvicTilt.steps', icon: 'core' },
  { id: 'child-pose', nameKey: 'exercises.childPose.name', descriptionKey: 'exercises.childPose.description', duration: 60, targetAreaKey: 'targetAreas.fullBack', stepsKey: 'exercises.childPose.steps', icon: 'yoga' },
  { id: 'piriformis', nameKey: 'exercises.piriformis.name', descriptionKey: 'exercises.piriformis.description', duration: 60, targetAreaKey: 'targetAreas.hipsLowerBack', stepsKey: 'exercises.piriformis.steps', icon: 'hips' },
  { id: 'wall-push', nameKey: 'exercises.wallPush.name', descriptionKey: 'exercises.wallPush.description', duration: 45, targetAreaKey: 'targetAreas.upperBackArms', stepsKey: 'exercises.wallPush.steps', icon: 'strength' },
  { id: 'side-stretch', nameKey: 'exercises.sideStretch.name', descriptionKey: 'exercises.sideStretch.description', duration: 45, targetAreaKey: 'targetAreas.sideBody', stepsKey: 'exercises.sideStretch.steps', icon: 'stretch' },
];

export default function AIBackPainRelief() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [showAIAdvice, setShowAIAdvice] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [painLocation, setPainLocation] = useState<string>('lower back');

  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiResponse('');
    setShowAIAdvice(false);
  });

  const painLocations = [
    { key: 'lower back', label: t('toolsInternal.backPainRelief.lowerBack') },
    { key: 'upper back', label: t('toolsInternal.backPainRelief.upperBack') },
    { key: 'full back', label: t('toolsInternal.backPainRelief.fullBack') },
    { key: 'hips & sciatic', label: t('toolsInternal.backPainRelief.hipsSciatica') },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('backPainCompletedToday');
    const savedDate = localStorage.getItem('backPainLastDate');
    const today = new Date().toDateString();
    if (savedDate === today && saved) {
      setCompletedExercises(JSON.parse(saved));
    } else {
      localStorage.setItem('backPainLastDate', today);
      localStorage.setItem('backPainCompletedToday', '[]');
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && selectedExercise && isActive) {
      completeExercise();
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, selectedExercise]);

  const completeExercise = () => {
    if (selectedExercise && !completedExercises.includes(selectedExercise.id)) {
      const updated = [...completedExercises, selectedExercise.id];
      setCompletedExercises(updated);
      localStorage.setItem('backPainCompletedToday', JSON.stringify(updated));
    }
    setIsActive(false);
  };

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setTimeRemaining(exercise.duration);
    setIsActive(true);
  };

  const getAIReliefAdvice = async () => {
    setShowAIAdvice(true);
    setAiResponse('');
    const completedNames = completedExercises.map(id => {
      const ex = backPainExercises.find(e => e.id === id);
      return ex ? t(`toolsInternal.backPainRelief.${ex.nameKey}`) : null;
    }).filter(Boolean);
    await streamChat({
      type: 'back-pain-relief' as any,
      messages: [{
        role: 'user',
        content: `I'm pregnant and experiencing ${painLocation} pain. I've completed these exercises today: ${completedNames.join(', ') || 'none yet'}. Please give me personalized back pain relief advice and additional exercises I should try.`,
      }],
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {},
    });
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('toolsInternal.backPainRelief.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  const progressPercent = Math.round((completedExercises.length / backPainExercises.length) * 100);

  return (
    <ToolFrame
      title={t('toolsInternal.backPainRelief.title')}
      subtitle={t('toolsInternal.backPainRelief.subtitle')}
      customIcon="pregnant-woman"
      mood="calm"
      toolId="ai-back-pain-relief"
    >
      <div className="space-y-4">
        {/* Pain Location + Progress */}
        <Card>
          <CardContent className="p-3 space-y-3">
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-2">
                {t('toolsInternal.backPainRelief.whereHurts')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {painLocations.map((loc) => (
                  <button
                    key={loc.key}
                    onClick={() => setPainLocation(loc.key)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all ${
                      painLocation === loc.key
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-muted-foreground">
                  {t('toolsInternal.backPainRelief.exercisesCompleted', {
                    completed: completedExercises.length,
                    total: backPainExercises.length,
                  })}
                </span>
                <span className="text-xs font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* AI Button */}
            <motion.button
              onClick={getAIReliefAdvice}
              disabled={isLoading}
              whileTap={{ scale: 0.95 }}
              className="w-full relative overflow-hidden rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="w-full flex items-center justify-center gap-2 px-4 h-10 font-semibold text-white text-[13px] rounded-xl bg-primary" style={{ boxShadow: '0 4px 16px -4px hsl(var(--primary) / 0.4)' }}>
                {isLoading ? (
                  <AILoadingDots text={t('toolsInternal.backPainRelief.analyzing')} />
                ) : (
                  <>
                    <Brain className="w-4 h-4 shrink-0" />
                    <span>{t('toolsInternal.backPainRelief.getAIAdvice')}</span>
                  </>
                )}
              </div>
            </motion.button>
          </CardContent>
        </Card>

        {/* AI Response */}
        {showAIAdvice && aiResponse && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">{t('toolsInternal.backPainRelief.aiCoach')}</h3>
              </div>
              <MarkdownRenderer content={aiResponse} />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-3 text-destructive text-xs">{error}</CardContent>
          </Card>
        )}

        {/* Active Exercise — Full screen card */}
        <AnimatePresence>
          {selectedExercise && isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-2 border-primary">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    {/* Large animation */}
                    <div className="w-24 h-24 rounded-2xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center mb-3">
                      <BackPainAnimation
                        exerciseId={selectedExercise.id}
                        isActive={true}
                        className="w-20 h-20"
                      />
                    </div>

                    <h3 className="text-sm font-bold mb-1">
                      {t(`toolsInternal.backPainRelief.${selectedExercise.nameKey}`)}
                    </h3>

                    <div className="text-2xl font-mono font-bold text-primary my-3">
                      0:{timeRemaining.toString().padStart(2, '0')}
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg text-start w-full mb-3">
                      <h4 className="text-xs font-semibold mb-1.5">{t('toolsInternal.backPainRelief.steps')}:</h4>
                      {(t(`toolsInternal.backPainRelief.${selectedExercise.stepsKey}`, { returnObjects: true }) as string[]).map((step, i) => (
                        <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                          {i + 1}. {step}
                        </p>
                      ))}
                    </div>

                    <Button variant="outline" onClick={() => setIsActive(false)} className="gap-2">
                      <Pause className="w-4 h-4" />
                      {t('toolsInternal.backPainRelief.stop')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise List */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            {t('toolsInternal.backPainRelief.exerciseList')}
          </h3>
          {backPainExercises.map((exercise, index) => {
            const isCompleted = completedExercises.includes(exercise.id);
            const isCurrentlyActive = selectedExercise?.id === exercise.id && isActive;

            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`transition-all ${
                  isCompleted
                    ? 'opacity-60 border-primary/30 bg-primary/5'
                    : isCurrentlyActive
                    ? 'ring-2 ring-primary shadow-lg border-primary/50'
                    : 'border-border'
                }`}>
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      {/* Animated illustration */}
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                        isCompleted
                          ? 'bg-primary/5 border-primary/20'
                          : isCurrentlyActive
                          ? 'bg-background border-primary/40 shadow-md shadow-primary/10'
                          : 'bg-muted/30 border-border/40'
                      }`}>
                        {isCompleted ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
                            <CheckCircle className="w-7 h-7 text-primary" />
                          </motion.div>
                        ) : (
                          <BackPainAnimation
                            exerciseId={exercise.id}
                            isActive={isCurrentlyActive}
                            className="w-12 h-12"
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm text-foreground leading-tight">
                              {t(`toolsInternal.backPainRelief.${exercise.nameKey}`)}
                            </h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                              {t(`toolsInternal.backPainRelief.${exercise.descriptionKey}`)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={isCompleted ? 'outline' : 'default'}
                            onClick={() => startExercise(exercise)}
                            disabled={isActive}
                            className="gap-1 text-[11px] h-7 px-2.5 flex-shrink-0"
                          >
                            <Play className="w-3 h-3" />
                            {exercise.duration}s
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                            {t(`toolsInternal.backPainRelief.${exercise.targetAreaKey}`)}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {exercise.duration}s
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Safety Warning */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-3">
            <div className="flex gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-destructive">
                  {t('toolsInternal.backPainRelief.safetyNotice')}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('toolsInternal.backPainRelief.safetyText')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
