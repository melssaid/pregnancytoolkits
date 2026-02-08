import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Dumbbell, Filter, Heart, PlayCircle, BarChart3 } from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { VideoLibrary, Video } from '@/components/VideoLibrary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeekSlider } from '@/components/WeekSlider';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { WorkoutProgressRing } from '@/components/fitness/WorkoutProgressRing';
import { RestTimer } from '@/components/fitness/RestTimer';
import { TrimesterAlert } from '@/components/fitness/TrimesterAlert';
import { ExerciseCard, Exercise } from '@/components/fitness/ExerciseCard';
import { WarmupCooldownSection } from '@/components/fitness/WarmupCooldownSection';
// AIInsightCard removed - was not user-friendly
import { SmartWorkoutGenerator } from '@/components/fitness/SmartWorkoutGenerator';
import { exerciseDatabase, getVideosByLanguage } from '@/data/fitnessData';

const REST_DURATION = 15; // workout rest interval

type CategoryFilter = 'all' | 'warmup' | 'strength' | 'cardio' | 'flexibility' | 'cooldown';

const AIFitnessCoach: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(12);
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate'>('beginner');
  const [generatedWorkout, setGeneratedWorkout] = useState<Exercise[]>([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  useResetOnLanguageChange(() => {
    generateWorkout();
  });

  const generateWorkout = useCallback((preferences?: {
    energy: 'low' | 'medium' | 'high';
    goal: 'backRelief' | 'flexibility' | 'energyBoost' | 'fullBody' | 'relaxation';
    time: number;
  }) => {
    let exercises = exerciseDatabase.filter(e =>
      fitnessLevel === 'intermediate' ? true : e.difficulty === 'beginner'
    );

    if (currentWeek > 28) {
      exercises = exercises.filter(e => e.category !== 'cardio');
    }

    if (preferences) {
      const goalCategoryMap: Record<string, string[]> = {
        backRelief: ['flexibility', 'cooldown'],
        flexibility: ['flexibility', 'warmup'],
        energyBoost: ['cardio', 'strength'],
        fullBody: ['strength', 'cardio', 'flexibility'],
        relaxation: ['cooldown', 'flexibility', 'warmup'],
      };

      const preferredCategories = goalCategoryMap[preferences.goal] || [];

      exercises = exercises.sort((a, b) => {
        const aPreferred = preferredCategories.includes(a.category) ? 0 : 1;
        const bPreferred = preferredCategories.includes(b.category) ? 0 : 1;
        return aPreferred - bPreferred;
      });

      const energyMultiplier = preferences.energy === 'low' ? 0.6 : preferences.energy === 'high' ? 1.2 : 1;
      const maxExercises = Math.max(3, Math.min(8, Math.round((preferences.time / 3) * energyMultiplier)));

      const warmups = exercises.filter(e => e.category === 'warmup');
      const main = exercises.filter(e => !['warmup', 'cooldown'].includes(e.category));
      const cooldowns = exercises.filter(e => e.category === 'cooldown');

      const mainCount = Math.max(2, maxExercises - 2);
      const selectedMain = main.slice(0, mainCount);
      const selectedWarmup = warmups.length > 0 ? [warmups[0]] : [];
      const selectedCooldown = cooldowns.length > 0 ? [cooldowns[0]] : [];

      setGeneratedWorkout([...selectedWarmup, ...selectedMain, ...selectedCooldown]);
    } else {
      const warmups = exercises.filter(e => e.category === 'warmup');
      const main = exercises.filter(e => !['warmup', 'cooldown'].includes(e.category));
      const cooldowns = exercises.filter(e => e.category === 'cooldown');

      const shuffledMain = [...main].sort(() => 0.5 - Math.random()).slice(0, 4);
      const selectedWarmup = warmups.length > 0 ? [warmups[Math.floor(Math.random() * warmups.length)]] : [];
      const selectedCooldown = cooldowns.length > 0 ? [cooldowns[Math.floor(Math.random() * cooldowns.length)]] : [];

      setGeneratedWorkout([...selectedWarmup, ...shuffledMain, ...selectedCooldown]);
    }

    setActiveExerciseIndex(null);
    setTimer(0);
    setIsPaused(true);
    setCompletedExercises(new Set());
    setShowRestTimer(false);
    setTotalTimeSpent(0);
    setCategoryFilter('all');
  }, [currentWeek, fitnessLevel]);

  useEffect(() => {
    generateWorkout();
  }, [generateWorkout]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && activeExerciseIndex !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
        setTotalTimeSpent((prev) => prev + 1);
      }, 1000);
    } else if (timer === 0 && activeExerciseIndex !== null && !isPaused) {
      const exercise = generatedWorkout[activeExerciseIndex];
      setCompletedExercises(prev => new Set([...prev, exercise.id]));
      setIsPaused(true);
      setActiveExerciseIndex(null);

      if (activeExerciseIndex < generatedWorkout.length - 1) {
        setShowRestTimer(true);
      }
    }
    return () => clearInterval(interval);
  }, [isPaused, timer, activeExerciseIndex, generatedWorkout]);

  const startExercise = (index: number) => {
    setActiveExerciseIndex(index);
    setTimer(generatedWorkout[index].duration);
    setIsPaused(false);
    setShowRestTimer(false);
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
  };

  const caloriesBurned = Math.round(
    generatedWorkout
      .filter(e => completedExercises.has(e.id))
      .reduce((sum, e) => sum + (e.caloriesPerMin * e.duration) / 60, 0)
  );

  const filteredWorkout = categoryFilter === 'all'
    ? generatedWorkout
    : generatedWorkout.filter(e => e.category === categoryFilter);

  const categories: CategoryFilter[] = ['all', 'warmup', 'strength', 'cardio', 'flexibility', 'cooldown'];
  const availableCategories = categories.filter(
    c => c === 'all' || generatedWorkout.some(e => e.category === c)
  );

  const currentVideoIds = getVideosByLanguage(i18n.language);
  const fitnessVideos: Video[] = currentVideoIds.map((v, i) => ({
    id: String(i + 1),
    title: t(`toolsInternal.fitnessCoach.videos.${v.categoryKey}.title`),
    description: t(`toolsInternal.fitnessCoach.videos.${v.categoryKey}.description`),
    youtubeId: v.youtubeId,
    duration: v.duration,
    category: t(`toolsInternal.fitnessCoach.videoCategories.${v.categoryKey}`),
  }));

  const totalExercises = exerciseDatabase.length;
  const totalCategories = new Set(exerciseDatabase.map(e => e.category)).size;

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
      <div className="space-y-5">

        {/* Library Stats Banner */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Dumbbell className="w-3 h-3" />
            {t('toolsInternal.fitnessCoach.libraryStats', { count: totalExercises })}
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1">
            {t('toolsInternal.fitnessCoach.categoriesCount', { count: totalCategories })}
          </Badge>
        </div>

        {/* Week & Level Configuration */}
        <WeekSlider
          week={currentWeek}
          onChange={setCurrentWeek}
          label={t('toolsInternal.fitnessCoach.currentWeek')}
          showTrimester
        />

        <Card>
          <CardContent className="p-3">
            <h2 className="text-sm font-semibold mb-2">
              {t('toolsInternal.fitnessCoach.activityLevel')}
            </h2>
            <div className="flex gap-2">
              {(['beginner', 'intermediate'] as const).map(level => (
                <Button
                  key={level}
                  variant={fitnessLevel === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFitnessLevel(level)}
                  className="flex-1 text-xs"
                >
                  {t(`toolsInternal.fitnessCoach.${level}`)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <TrimesterAlert week={currentWeek} />

        {/* Smart Workout Generator */}
        <SmartWorkoutGenerator
          onGenerate={(prefs) => generateWorkout(prefs)}
          onRandomGenerate={() => generateWorkout()}
        />

        {/* Progress & Today's Workout */}
        <div className="flex items-center gap-2.5 pt-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-foreground">
              {t('toolsInternal.fitnessCoach.sections.analysis')}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {t('toolsInternal.fitnessCoach.sections.analysisDesc')}
            </p>
          </div>
        </div>

        <WorkoutProgressRing
          completed={completedExercises.size}
          total={generatedWorkout.length}
          caloriesBurned={caloriesBurned}
          totalTime={totalTimeSpent}
        />

        {/* Today's Workout */}
        <div className="flex items-center gap-2.5 pt-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <PlayCircle className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-foreground">
              {t('toolsInternal.fitnessCoach.sections.workout')}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {t('toolsInternal.fitnessCoach.sections.workoutDesc')}
            </p>
          </div>
        </div>

        <WarmupCooldownSection type="warmup" />

        {/* Category Filter */}
        {availableCategories.length > 2 && (
          <div className="flex gap-1.5 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground mt-1" />
            {availableCategories.map(cat => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="text-[10px] h-7 px-2.5"
              >
                {cat === 'all'
                  ? t('toolsInternal.fitnessCoach.allCategories')
                  : t(`toolsInternal.fitnessCoach.categories.${cat}`)}
              </Button>
            ))}
          </div>
        )}

        <RestTimer
          duration={REST_DURATION}
          onComplete={handleRestComplete}
          onSkip={handleRestComplete}
          isActive={showRestTimer}
        />

        {/* Exercise Cards */}
        <div className="space-y-3">
          {filteredWorkout.map((exercise) => {
            const realIndex = generatedWorkout.indexOf(exercise);
            return (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={realIndex}
                isActive={activeExerciseIndex === realIndex}
                isCompleted={completedExercises.has(exercise.id)}
                isPaused={isPaused}
                timer={timer}
                onStart={() => startExercise(realIndex)}
                onTogglePause={() => setIsPaused(!isPaused)}
              />
            );
          })}
        </div>

        <WarmupCooldownSection type="cooldown" />

        {/* Daily Tip */}

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex gap-3">
            <Dumbbell className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-foreground mb-1">
                {t('toolsInternal.fitnessCoach.dailyTip')}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(`toolsInternal.fitnessCoach.tips.tip${(currentWeek % 5) + 1}`)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Videos & Safety Section */}
        <div className="flex items-center gap-2.5 pt-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Heart className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-foreground">
              {t('toolsInternal.fitnessCoach.sections.resources')}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {t('toolsInternal.fitnessCoach.sections.resourcesDesc')}
            </p>
          </div>
        </div>

        <VideoLibrary
          videos={fitnessVideos}
          title={t('toolsInternal.fitnessCoach.fitnessVideos')}
          subtitle={t('toolsInternal.fitnessCoach.fitnessVideosSubtitle')}
          accentColor="violet"
        />

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
