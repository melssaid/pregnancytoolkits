import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Play, Pause, Flower2, Wind, Sun, Moon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface RelaxationExercise {
  id: string;
  nameKey: string;
  descKey: string;
  duration: number;
  type: 'breathing' | 'visualization' | 'grounding';
  stepsKey: string;
}

const exercises: RelaxationExercise[] = [
  {
    id: 'box-breathing',
    nameKey: 'toolsInternal.stressRelief.exercises.boxBreathing.name',
    descKey: 'toolsInternal.stressRelief.exercises.boxBreathing.desc',
    duration: 240,
    type: 'breathing',
    stepsKey: 'toolsInternal.stressRelief.exercises.boxBreathing.steps'
  },
  {
    id: 'safe-place',
    nameKey: 'toolsInternal.stressRelief.exercises.safePlace.name',
    descKey: 'toolsInternal.stressRelief.exercises.safePlace.desc',
    duration: 300,
    type: 'visualization',
    stepsKey: 'toolsInternal.stressRelief.exercises.safePlace.steps'
  },
  {
    id: '5-4-3-2-1',
    nameKey: 'toolsInternal.stressRelief.exercises.grounding54321.name',
    descKey: 'toolsInternal.stressRelief.exercises.grounding54321.desc',
    duration: 180,
    type: 'grounding',
    stepsKey: 'toolsInternal.stressRelief.exercises.grounding54321.steps'
  },
  {
    id: 'progressive-relaxation',
    nameKey: 'toolsInternal.stressRelief.exercises.progressiveRelaxation.name',
    descKey: 'toolsInternal.stressRelief.exercises.progressiveRelaxation.desc',
    duration: 420,
    type: 'breathing',
    stepsKey: 'toolsInternal.stressRelief.exercises.progressiveRelaxation.steps'
  }
];

export default function AIStressReliefCoach() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<RelaxationExercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(1);

  const affirmationKeys = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && selectedExercise) {
      const steps = t(selectedExercise.stepsKey, { returnObjects: true }) as string[];
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev >= selectedExercise.duration) {
            setIsPlaying(false);
            return 0;
          }
          
          // Change step periodically
          const stepDuration = selectedExercise.duration / steps.length;
          const newStep = Math.floor(prev / stepDuration);
          if (newStep !== currentStep && newStep < steps.length) {
            setCurrentStep(newStep);
          }
          
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedExercise, currentStep, t]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAffirmationIndex(affirmationKeys[Math.floor(Math.random() * affirmationKeys.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const startExercise = (exercise: RelaxationExercise) => {
    setSelectedExercise(exercise);
    setCurrentStep(0);
    setTimer(0);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'breathing': return Wind;
      case 'visualization': return Sparkles;
      case 'grounding': return Flower2;
      default: return Heart;
    }
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('toolsInternal.stressRelief.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  const currentAffirmation = t(`toolsInternal.stressRelief.affirmations.${currentAffirmationIndex}`);

  return (
    <ToolFrame
      title={t('toolsInternal.stressRelief.title')}
      subtitle={t('toolsInternal.stressRelief.subtitle')}
      mood="calm"
      toolId="stress-relief"
      icon={Heart}
    >
      <div className="space-y-4">
        {/* Daily Affirmation */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">{t('toolsInternal.stressRelief.todaysAffirmation')}</span>
            </div>
            <motion.p 
              key={currentAffirmationIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-foreground italic"
            >
              "{currentAffirmation}"
            </motion.p>
          </CardContent>
        </Card>

        {/* Active Exercise */}
        {selectedExercise && isPlaying && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="text-xs font-bold mb-2">{t(selectedExercise.nameKey)}</h3>
                <div className="text-base font-bold text-primary mb-3">
                  {formatTime(timer)}
                </div>
                
                {(() => {
                  const steps = t(selectedExercise.stepsKey, { returnObjects: true }) as string[];
                  return (
                    <>
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-background rounded-xl p-4 mb-3"
                      >
                        <p className="text-sm font-medium">
                          {steps[currentStep]}
                        </p>
                      </motion.div>

                      <div className="flex justify-center gap-2 mb-4">
                        {steps.map((_, i) => (
                          <div 
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i === currentStep ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  );
                })()}

                <Button
                  variant="outline"
                  onClick={() => setIsPlaying(false)}
                >
                  <Pause className="w-4 h-4 me-2" />
                  {t('common.pause')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise List */}
        {(!selectedExercise || !isPlaying) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('toolsInternal.stressRelief.relaxationExercises')}</h3>
            {exercises.map(exercise => {
              const TypeIcon = getTypeIcon(exercise.type);
              return (
                <Card key={exercise.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <TypeIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold">{t(exercise.nameKey)}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t(exercise.descKey)}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            {Math.floor(exercise.duration / 60)} {t('common.min')}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                            {t(`toolsInternal.stressRelief.types.${exercise.type}`)}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => startExercise(exercise)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Tips */}
        <Card>
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
              <Moon className="w-4 h-4 text-primary" />
              {t('toolsInternal.stressRelief.quickTips')}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t('toolsInternal.stressRelief.tip1')}</li>
              <li>• {t('toolsInternal.stressRelief.tip2')}</li>
              <li>• {t('toolsInternal.stressRelief.tip3')}</li>
              <li>• {t('toolsInternal.stressRelief.tip4')}</li>
              <li>• {t('toolsInternal.stressRelief.tip5')}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            ⚠️ {t('toolsInternal.stressRelief.disclaimer')}
          </p>
        </div>
      </div>
    </ToolFrame>
  );
}
