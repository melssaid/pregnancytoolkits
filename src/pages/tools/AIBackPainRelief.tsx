import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, CheckCircle, Clock, AlertCircle, Brain, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ExerciseIcon } from '@/components/ExerciseIcon';

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
  {
    id: 'cat-cow',
    nameKey: 'exercises.catCow.name',
    descriptionKey: 'exercises.catCow.description',
    duration: 60,
    targetAreaKey: 'targetAreas.lowerUpperBack',
    stepsKey: 'exercises.catCow.steps',
    icon: 'spine'
  },
  {
    id: 'pelvic-tilt',
    nameKey: 'exercises.pelvicTilt.name',
    descriptionKey: 'exercises.pelvicTilt.description',
    duration: 45,
    targetAreaKey: 'targetAreas.lowerBackCore',
    stepsKey: 'exercises.pelvicTilt.steps',
    icon: 'core'
  },
  {
    id: 'child-pose',
    nameKey: 'exercises.childPose.name',
    descriptionKey: 'exercises.childPose.description',
    duration: 60,
    targetAreaKey: 'targetAreas.fullBack',
    stepsKey: 'exercises.childPose.steps',
    icon: 'yoga'
  },
  {
    id: 'piriformis',
    nameKey: 'exercises.piriformis.name',
    descriptionKey: 'exercises.piriformis.description',
    duration: 60,
    targetAreaKey: 'targetAreas.hipsLowerBack',
    stepsKey: 'exercises.piriformis.steps',
    icon: 'hips'
  },
  {
    id: 'wall-push',
    nameKey: 'exercises.wallPush.name',
    descriptionKey: 'exercises.wallPush.description',
    duration: 45,
    targetAreaKey: 'targetAreas.upperBackArms',
    stepsKey: 'exercises.wallPush.steps',
    icon: 'strength'
  },
  {
    id: 'side-stretch',
    nameKey: 'exercises.sideStretch.name',
    descriptionKey: 'exercises.sideStretch.description',
    duration: 45,
    targetAreaKey: 'targetAreas.sideBody',
    stepsKey: 'exercises.sideStretch.steps',
    icon: 'stretch'
  }
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

  const painLocations = [
    { key: 'lower back', label: t('toolsInternal.backPainRelief.lowerBack') },
    { key: 'upper back', label: t('toolsInternal.backPainRelief.upperBack') },
    { key: 'full back', label: t('toolsInternal.backPainRelief.fullBack') },
    { key: 'hips & sciatic', label: t('toolsInternal.backPainRelief.hipsSciatica') }
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
      messages: [
        {
          role: 'user',
          content: `I'm pregnant and experiencing ${painLocation} pain. I've completed these exercises today: ${completedNames.join(', ') || 'none yet'}. Please give me personalized back pain relief advice and additional exercises I should try.`
        }
      ],
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {}
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

  return (
    <ToolFrame
      title={t('toolsInternal.backPainRelief.title')}
      subtitle={t('toolsInternal.backPainRelief.subtitle')}
      customIcon="pregnant-woman"
      mood="calm"
      toolId="ai-back-pain-relief"
    >
      <div className="space-y-6">
        {/* Pain Location Selector */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {t('toolsInternal.backPainRelief.whereHurts')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {painLocations.map((loc) => (
                <button
                  key={loc.key}
                  onClick={() => setPainLocation(loc.key)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    painLocation === loc.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{t('toolsInternal.backPainRelief.todaysRoutine')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('toolsInternal.backPainRelief.exercisesCompleted', {
                    completed: completedExercises.length,
                    total: backPainExercises.length
                  })}
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">
                {Math.round((completedExercises.length / backPainExercises.length) * 100)}%
              </div>
            </div>
            <Button 
              onClick={getAIReliefAdvice} 
              disabled={isLoading}
              className="w-full gap-2"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              {t('toolsInternal.backPainRelief.getAIAdvice')}
            </Button>
          </CardContent>
        </Card>

        {/* AI Response */}
        {showAIAdvice && aiResponse && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{t('toolsInternal.backPainRelief.aiCoach')}</h3>
              </div>
              <MarkdownRenderer content={aiResponse} />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-destructive text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Active Exercise */}
        {selectedExercise && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-2 border-primary">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <ExerciseIcon type={selectedExercise.icon} className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {t(`toolsInternal.backPainRelief.${selectedExercise.nameKey}`)}
                </h3>
                
                <div className="text-5xl font-bold text-primary my-6">
                  {timeRemaining}s
                </div>

                <div className="bg-muted/50 p-4 rounded-lg text-start mb-4">
                  <h4 className="font-semibold mb-2">{t('toolsInternal.backPainRelief.steps')}:</h4>
                  {(t(`toolsInternal.backPainRelief.${selectedExercise.stepsKey}`, { returnObjects: true }) as string[]).map((step, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      {i + 1}. {step}
                    </p>
                  ))}
                </div>

                <Button variant="outline" onClick={() => setIsActive(false)}>
                  <Pause className="w-4 h-4 me-2" />
                  {t('toolsInternal.backPainRelief.stop')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Exercise List */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">{t('toolsInternal.backPainRelief.exerciseList')}</h3>
            <div className="space-y-3">
              {backPainExercises.map((exercise) => {
                const isCompleted = completedExercises.includes(exercise.id);
                return (
                  <div
                    key={exercise.id}
                    className={`p-4 rounded-lg transition-all ${
                      isCompleted 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ExerciseIcon type={exercise.icon} className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {t(`toolsInternal.backPainRelief.${exercise.nameKey}`)}
                          </span>
                          {isCompleted && <CheckCircle className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t(`toolsInternal.backPainRelief.${exercise.descriptionKey}`)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            {t(`toolsInternal.backPainRelief.${exercise.targetAreaKey}`)}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-muted rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {exercise.duration}s
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isCompleted ? 'outline' : 'default'}
                        onClick={() => startExercise(exercise)}
                        disabled={isActive}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-destructive">
                  {t('toolsInternal.backPainRelief.safetyNotice')}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
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
