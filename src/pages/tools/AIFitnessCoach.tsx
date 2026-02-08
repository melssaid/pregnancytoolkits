import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Dumbbell, Filter, Activity, Settings2, Heart, PlayCircle, BarChart3 } from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { VideoLibrary, Video } from '@/components/VideoLibrary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WeekSlider } from '@/components/WeekSlider';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { WorkoutProgressRing } from '@/components/fitness/WorkoutProgressRing';
import { RestTimer } from '@/components/fitness/RestTimer';
import { TrimesterAlert } from '@/components/fitness/TrimesterAlert';
import { ExerciseCard, Exercise } from '@/components/fitness/ExerciseCard';
import { WarmupCooldownSection } from '@/components/fitness/WarmupCooldownSection';
import { AIInsightCard } from '@/components/ai/AIInsightCard';
import { SmartWorkoutGenerator } from '@/components/fitness/SmartWorkoutGenerator';
import { exerciseDatabase, fitnessVideosByLang, getVideosByLanguage } from '@/data/fitnessData';

const REST_DURATION = 15;

type CategoryFilter = 'all' | 'warmup' | 'strength' | 'cardio' | 'flexibility' | 'cooldown';

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-2.5 pt-2">
    <div className="p-1.5 rounded-lg bg-primary/10">
      {icon}
    </div>
    <div>
      <h2 className="font-semibold text-sm text-foreground">{title}</h2>
      {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
    </div>
  </div>
);

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

    // Smart filtering based on preferences
    if (preferences) {
      const goalCategoryMap: Record<string, string[]> = {
        backRelief: ['flexibility', 'cooldown'],
        flexibility: ['flexibility', 'warmup'],
        energyBoost: ['cardio', 'strength'],
        fullBody: ['strength', 'cardio', 'flexibility'],
        relaxation: ['cooldown', 'flexibility', 'warmup'],
      };

      const preferredCategories = goalCategoryMap[preferences.goal] || [];

      // Sort exercises: preferred categories first
      exercises = exercises.sort((a, b) => {
        const aPreferred = preferredCategories.includes(a.category) ? 0 : 1;
        const bPreferred = preferredCategories.includes(b.category) ? 0 : 1;
        return aPreferred - bPreferred;
      });

      // Adjust count based on time & energy
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
      // Random generation (original behavior)
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

        {/* ══════════════════════════════════════════════════════════════
            SECTION 1: Setup & Configuration
        ══════════════════════════════════════════════════════════════ */}
        <SectionHeader
          icon={<Settings2 className="w-4 h-4 text-primary" />}
          title={t('toolsInternal.fitnessCoach.sections.setup')}
          subtitle={t('toolsInternal.fitnessCoach.sections.setupDesc')}
        />

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

        <SmartWorkoutGenerator
          onGenerate={(prefs) => generateWorkout(prefs)}
          onRandomGenerate={() => generateWorkout()}
        />

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2: Today's Workout
        ══════════════════════════════════════════════════════════════ */}
        <SectionHeader
          icon={<PlayCircle className="w-4 h-4 text-primary" />}
          title={t('toolsInternal.fitnessCoach.sections.workout')}
          subtitle={t('toolsInternal.fitnessCoach.sections.workoutDesc')}
        />

        <WorkoutProgressRing
          completed={completedExercises.size}
          total={generatedWorkout.length}
          caloriesBurned={caloriesBurned}
          totalTime={totalTimeSpent}
        />

        <WarmupCooldownSection type="warmup" />

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

        {/* ══════════════════════════════════════════════════════════════
            SECTION 3: Analysis & Tips
        ══════════════════════════════════════════════════════════════ */}
        <SectionHeader
          icon={<BarChart3 className="w-4 h-4 text-primary" />}
          title={t('toolsInternal.fitnessCoach.sections.analysis')}
          subtitle={t('toolsInternal.fitnessCoach.sections.analysisDesc')}
        />

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

        {/* ══════════════════════════════════════════════════════════════
            SECTION 4: Videos & Safety
        ══════════════════════════════════════════════════════════════ */}
        <SectionHeader
          icon={<Heart className="w-4 h-4 text-primary" />}
          title={t('toolsInternal.fitnessCoach.sections.resources')}
          subtitle={t('toolsInternal.fitnessCoach.sections.resourcesDesc')}
        />

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
