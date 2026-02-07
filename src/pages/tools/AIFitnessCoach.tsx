import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, RotateCcw, Info, Loader2 } from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { VideoLibrary, Video } from '@/components/VideoLibrary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeekSlider } from '@/components/WeekSlider';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';

interface Exercise {
  id: string;
  nameKey: string;
  duration: number;
  descriptionKey: string;
  category: 'strength' | 'cardio' | 'flexibility';
  difficulty: 'beginner' | 'intermediate';
}

const exerciseDatabase: Exercise[] = [
  { id: 'squat', nameKey: 'prenatalSquats', duration: 45, descriptionKey: 'prenatalSquatsDesc', category: 'strength', difficulty: 'beginner' },
  { id: 'bird-dog', nameKey: 'birdDog', duration: 30, descriptionKey: 'birdDogDesc', category: 'strength', difficulty: 'intermediate' },
  { id: 'pelvic-tilt', nameKey: 'pelvicTilts', duration: 60, descriptionKey: 'pelvicTiltsDesc', category: 'flexibility', difficulty: 'beginner' },
  { id: 'wall-pushup', nameKey: 'wallPushups', duration: 45, descriptionKey: 'wallPushupsDesc', category: 'strength', difficulty: 'beginner' },
  { id: 'butterfly', nameKey: 'butterflyStretch', duration: 60, descriptionKey: 'butterflyStretchDesc', category: 'flexibility', difficulty: 'beginner' },
  { id: 'marching', nameKey: 'seatedMarching', duration: 60, descriptionKey: 'seatedMarchingDesc', category: 'cardio', difficulty: 'beginner' },
];

const fitnessVideoIds = [
  { youtubeId: "f7KnXTEpf5M", duration: "10:00", categoryKey: "core" },
  { youtubeId: "DeaayKWssak", duration: "20:00", categoryKey: "cardio" },
  { youtubeId: "vEcZD8Js2Ws", duration: "25:00", categoryKey: "yoga" },
  { youtubeId: "pCSjhbVOdYQ", duration: "60:00", categoryKey: "relaxation" },
];

const AIFitnessCoach: React.FC = () => {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(12);
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate'>('beginner');
  const [generatedWorkout, setGeneratedWorkout] = useState<Exercise[]>([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  useResetOnLanguageChange(() => {
    // Reset workout on language change to refresh translated content
    generateWorkout();
  });

  const generateWorkout = () => {
    let exercises = exerciseDatabase.filter(e => 
      fitnessLevel === 'intermediate' ? true : e.difficulty === 'beginner'
    );
    
    if (currentWeek > 28) {
      exercises = exercises.filter(e => e.category !== 'cardio');
    }

    const shuffled = [...exercises].sort(() => 0.5 - Math.random());
    setGeneratedWorkout(shuffled.slice(0, 4));
    setActiveExerciseIndex(null);
    setTimer(0);
    setIsPaused(true);
  };

  useEffect(() => {
    generateWorkout();
  }, [currentWeek, fitnessLevel]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && activeExerciseIndex !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && activeExerciseIndex !== null && !isPaused) {
      setIsPaused(true);
    }
    return () => clearInterval(interval);
  }, [isPaused, timer, activeExerciseIndex]);

  const startExercise = (index: number) => {
    setActiveExerciseIndex(index);
    setTimer(generatedWorkout[index].duration);
    setIsPaused(false);
  };

  // Build translated video list
  const fitnessVideos: Video[] = fitnessVideoIds.map((v, i) => ({
    id: String(i + 1),
    title: t(`toolsInternal.fitnessCoach.videos.${v.categoryKey}.title`),
    description: t(`toolsInternal.fitnessCoach.videos.${v.categoryKey}.description`),
    youtubeId: v.youtubeId,
    duration: v.duration,
    category: t(`toolsInternal.fitnessCoach.videoCategories.${v.categoryKey}`),
  }));

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('toolsInternal.fitnessCoach.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.fitnessCoach.title')}
      subtitle={t('toolsInternal.fitnessCoach.subtitle')}
      mood="empowering"
      toolId="ai-fitness-coach"
    >
      <div className="space-y-6">
        {/* Week Selector */}
        <WeekSlider
          week={currentWeek}
          onChange={(week) => {
            setCurrentWeek(week);
          }}
          label={t('toolsInternal.fitnessCoach.currentWeek')}
          showTrimester
        />

        {/* Activity Level */}
        <Card>
          <CardContent className="p-3">
            <h2 className="text-sm font-semibold mb-2">{t('toolsInternal.fitnessCoach.activityLevel')}</h2>
            <div className="flex gap-2">
              {(['beginner', 'intermediate'] as const).map(level => (
                <Button
                  key={level}
                  variant={fitnessLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFitnessLevel(level)}
                  className="flex-1 capitalize text-xs"
                >
                  {t(`toolsInternal.fitnessCoach.${level}`)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workout List */}
        <div className="space-y-3">
          {generatedWorkout.map((exercise, index) => {
            const isActive = activeExerciseIndex === index;

            return (
              <Card 
                key={exercise.id}
                className={`transition-all ${isActive ? 'ring-2 ring-primary shadow-md' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">
                          {t(`toolsInternal.fitnessCoach.exerciseNames.${exercise.nameKey}`)}
                        </h3>
                        <Badge variant="secondary" className="text-[10px] mt-0.5">
                          {t(`toolsInternal.fitnessCoach.categories.${exercise.category}`)}
                        </Badge>
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-2xl font-mono font-bold text-primary">
                        00:{timer.toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-xs mb-3 ms-11">
                    {t(`toolsInternal.fitnessCoach.exerciseDescs.${exercise.descriptionKey}`)}
                  </p>
                  
                  <div className="ms-11 flex gap-2">
                    {isActive ? (
                      <Button
                        size="sm"
                        variant={isPaused ? 'default' : 'outline'}
                        onClick={() => setIsPaused(!isPaused)}
                        className="gap-1.5 text-xs"
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                        {isPaused ? t('toolsInternal.fitnessCoach.resume') : t('toolsInternal.fitnessCoach.pause')}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => startExercise(index)}
                        className="gap-1.5 text-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> {t('common.start')} ({exercise.duration}s)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Generate New Button */}
        <Button
          variant="outline"
          onClick={generateWorkout}
          className="w-full gap-2 text-xs"
        >
          <RotateCcw className="w-4 h-4" /> {t('toolsInternal.fitnessCoach.generatePlan')}
        </Button>

        {/* Educational Videos */}
        <VideoLibrary
          videos={fitnessVideos}
          title={t('toolsInternal.fitnessCoach.fitnessVideos')}
          subtitle={t('toolsInternal.fitnessCoach.fitnessVideosSubtitle')}
          accentColor="violet"
        />

        {/* Safety Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong>{t('toolsInternal.fitnessCoach.safetyFirst')}:</strong>{' '}
              {t('toolsInternal.fitnessCoach.safetyText')}
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default AIFitnessCoach;
