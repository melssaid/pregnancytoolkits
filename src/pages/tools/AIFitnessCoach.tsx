import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Info, Dumbbell, Filter, Activity } from 'lucide-react';
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
import { AIInsightCard } from '@/components/ai/AIInsightCard';

const REST_DURATION = 15;

const exerciseDatabase: Exercise[] = [
  // Warmup
  { id: 'neck-rolls', nameKey: 'neckRolls', duration: 30, descriptionKey: 'neckRollsDesc', category: 'warmup', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'neck' },
  { id: 'arm-circles', nameKey: 'armCircles', duration: 30, descriptionKey: 'armCirclesDesc', category: 'warmup', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'shoulders' },
  // Strength
  { id: 'squat', nameKey: 'prenatalSquats', duration: 45, descriptionKey: 'prenatalSquatsDesc', category: 'strength', difficulty: 'beginner', caloriesPerMin: 5, muscleGroupKey: 'legs' },
  { id: 'bird-dog', nameKey: 'birdDog', duration: 30, descriptionKey: 'birdDogDesc', category: 'strength', difficulty: 'intermediate', caloriesPerMin: 4, muscleGroupKey: 'core' },
  { id: 'wall-pushup', nameKey: 'wallPushups', duration: 45, descriptionKey: 'wallPushupsDesc', category: 'strength', difficulty: 'beginner', caloriesPerMin: 4, muscleGroupKey: 'arms' },
  { id: 'glute-bridge', nameKey: 'gluteBridge', duration: 40, descriptionKey: 'gluteBridgeDesc', category: 'strength', difficulty: 'beginner', caloriesPerMin: 4, muscleGroupKey: 'glutes' },
  { id: 'side-lying-leg', nameKey: 'sideLyingLeg', duration: 35, descriptionKey: 'sideLyingLegDesc', category: 'strength', difficulty: 'intermediate', caloriesPerMin: 3, muscleGroupKey: 'hips' },
  // Cardio
  { id: 'marching', nameKey: 'seatedMarching', duration: 60, descriptionKey: 'seatedMarchingDesc', category: 'cardio', difficulty: 'beginner', caloriesPerMin: 5, muscleGroupKey: 'legs' },
  { id: 'step-touch', nameKey: 'stepTouch', duration: 45, descriptionKey: 'stepTouchDesc', category: 'cardio', difficulty: 'beginner', caloriesPerMin: 4, muscleGroupKey: 'fullBody' },
  // Flexibility
  { id: 'pelvic-tilt', nameKey: 'pelvicTilts', duration: 60, descriptionKey: 'pelvicTiltsDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'pelvis' },
  { id: 'butterfly', nameKey: 'butterflyStretch', duration: 60, descriptionKey: 'butterflyStretchDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'hips' },
  { id: 'cat-cow', nameKey: 'catCow', duration: 45, descriptionKey: 'catCowDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'spine' },
  { id: 'side-stretch', nameKey: 'sideStretch', duration: 30, descriptionKey: 'sideStretchDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'obliques' },
  // Cooldown
  { id: 'child-pose', nameKey: 'childPose', duration: 45, descriptionKey: 'childPoseDesc', category: 'cooldown', difficulty: 'beginner', caloriesPerMin: 1, muscleGroupKey: 'back' },
  { id: 'deep-breathing', nameKey: 'deepBreathing', duration: 60, descriptionKey: 'deepBreathingDesc', category: 'cooldown', difficulty: 'beginner', caloriesPerMin: 1, muscleGroupKey: 'diaphragm' },
];

// Language-specific video sets for cultural relevance
const fitnessVideosByLang: Record<string, { youtubeId: string; duration: string; categoryKey: string }[]> = {
  ar: [
    { youtubeId: "pHzsNfr2NCQ", duration: "15:00", categoryKey: "yoga" },
    { youtubeId: "qa7RY4V6ihM", duration: "10:00", categoryKey: "fullBody" },
    { youtubeId: "Vy6jonW1lFg", duration: "12:00", categoryKey: "strength" },
    { youtubeId: "jvY_KDCy7E4", duration: "8:00", categoryKey: "birthPrep" },
    { youtubeId: "oBY_25mR2WU", duration: "15:00", categoryKey: "stretching" },
    { youtubeId: "pCSjhbVOdYQ", duration: "60:00", categoryKey: "relaxation" },
  ],
  default: [
    { youtubeId: "Mcic8Z-8pxY", duration: "30:00", categoryKey: "fullBody" },
    { youtubeId: "M4IoSwHGezg", duration: "30:00", categoryKey: "strength" },
    { youtubeId: "gb8ZF-8i160", duration: "15:00", categoryKey: "stretching" },
    { youtubeId: "vEcZD8Js2Ws", duration: "25:00", categoryKey: "yoga" },
    { youtubeId: "pCSjhbVOdYQ", duration: "60:00", categoryKey: "relaxation" },
    { youtubeId: "f7KnXTEpf5M", duration: "10:00", categoryKey: "core" },
    { youtubeId: "zk5eFlXUbCs", duration: "12:00", categoryKey: "birthPrep" },
  ],
};

const getVideosByLanguage = (lang: string) => {
  return fitnessVideosByLang[lang] || fitnessVideosByLang.default;
};

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

  const generateWorkout = useCallback(() => {
    let exercises = exerciseDatabase.filter(e =>
      fitnessLevel === 'intermediate' ? true : e.difficulty === 'beginner'
    );

    if (currentWeek > 28) {
      exercises = exercises.filter(e => e.category !== 'cardio');
    }

    // Build structured workout: warmup + main + cooldown
    const warmups = exercises.filter(e => e.category === 'warmup');
    const main = exercises.filter(e => !['warmup', 'cooldown'].includes(e.category));
    const cooldowns = exercises.filter(e => e.category === 'cooldown');

    const shuffledMain = [...main].sort(() => 0.5 - Math.random()).slice(0, 4);
    const selectedWarmup = warmups.length > 0 ? [warmups[Math.floor(Math.random() * warmups.length)]] : [];
    const selectedCooldown = cooldowns.length > 0 ? [cooldowns[Math.floor(Math.random() * cooldowns.length)]] : [];

    setGeneratedWorkout([...selectedWarmup, ...shuffledMain, ...selectedCooldown]);
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
      // Exercise complete
      const exercise = generatedWorkout[activeExerciseIndex];
      setCompletedExercises(prev => new Set([...prev, exercise.id]));
      setIsPaused(true);
      setActiveExerciseIndex(null);

      // Show rest timer if not the last exercise
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
        {/* Week Selector */}
        <WeekSlider
          week={currentWeek}
          onChange={setCurrentWeek}
          label={t('toolsInternal.fitnessCoach.currentWeek')}
          showTrimester
        />

        {/* Activity Level */}
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

        {/* Trimester Safety Alert */}
        <TrimesterAlert week={currentWeek} />

        {/* Workout Progress */}
        <WorkoutProgressRing
          completed={completedExercises.size}
          total={generatedWorkout.length}
          caloriesBurned={caloriesBurned}
          totalTime={totalTimeSpent}
        />

        {/* Warmup Guide */}
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

        {/* Rest Timer */}
        <RestTimer
          duration={REST_DURATION}
          onComplete={handleRestComplete}
          onSkip={handleRestComplete}
          isActive={showRestTimer}
        />

        {/* Exercise List */}
        <div className="space-y-3">
          {filteredWorkout.map((exercise, index) => {
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

        {/* Cooldown Guide */}
        <WarmupCooldownSection type="cooldown" />

        {/* AI Workout Analysis */}
        <AIInsightCard
          title={t('toolsInternal.fitnessCoach.aiWorkoutAnalysis')}
          prompt={`I am ${currentWeek} weeks pregnant with a ${fitnessLevel} fitness level. I just completed ${completedExercises.size} out of ${generatedWorkout.length} exercises, burning approximately ${caloriesBurned} calories in ${Math.round(totalTimeSpent / 60)} minutes.

My workout included: ${generatedWorkout.map(e => t(`toolsInternal.fitnessCoach.exerciseNames.${e.nameKey}`)).join(', ')}.

Please provide a comprehensive personalized fitness analysis:

## Weekly Fitness Assessment
Evaluate my workout performance for week ${currentWeek} and ${fitnessLevel} level

## Muscle Balance Analysis
Which muscle groups were well-targeted and which need more attention

## Progressive Overload Recommendations
How to safely increase intensity over the coming weeks

## Recovery & Nutrition Tips
Post-workout recovery and nutrition specific to week ${currentWeek}

## Next Workout Suggestions
3-4 specific exercises to add or swap for my next session

## Safety Reminders
Trimester-specific precautions for my current stage`}
          context={{ week: currentWeek }}
          buttonText={t('toolsInternal.fitnessCoach.aiWorkoutButton')}
          icon={<Activity className="w-4 h-4 text-white" />}
          variant="default"
        />

        {/* Generate New Workout */}
        <Button
          variant="outline"
          onClick={generateWorkout}
          className="w-full gap-2 text-xs"
        >
          <RotateCcw className="w-4 h-4" /> {t('toolsInternal.fitnessCoach.generatePlan')}
        </Button>

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

        {/* Videos */}
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
