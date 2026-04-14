import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Info, Dumbbell, PlayCircle, Sparkles, Settings2,
  ChevronRight, Zap, Video, Heart, ArrowRight, Bookmark
} from 'lucide-react';
import { useSavedResults } from '@/hooks/useSavedResults';
import { SavedResultsViewer } from '@/components/ai/SavedResultsViewer';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { VideoLibrary, Video as VideoType } from '@/components/VideoLibrary';
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
import { SmartWorkoutGenerator } from '@/components/fitness/SmartWorkoutGenerator';
import { exerciseDatabase, getVideosByLanguage } from '@/data/fitnessData';
import { motion, AnimatePresence } from 'framer-motion';
import { ToolHubNav, WELLNESS_HUB_TABS } from '@/components/ToolHubNav';
import { cn } from '@/lib/utils';

const REST_DURATION = 15;

type ActiveTab = 'setup' | 'workout' | 'resources';

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
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('setup');
  const [workoutReady, setWorkoutReady] = useState(false);

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
      setGeneratedWorkout([
        ...(warmups.length > 0 ? [warmups[0]] : []),
        ...main.slice(0, mainCount),
        ...(cooldowns.length > 0 ? [cooldowns[0]] : []),
      ]);
    } else {
      const warmups = exercises.filter(e => e.category === 'warmup');
      const main = exercises.filter(e => !['warmup', 'cooldown'].includes(e.category));
      const cooldowns = exercises.filter(e => e.category === 'cooldown');
      const shuffledMain = [...main].sort(() => 0.5 - Math.random()).slice(0, 4);
      setGeneratedWorkout([
        ...(warmups.length > 0 ? [warmups[Math.floor(Math.random() * warmups.length)]] : []),
        ...shuffledMain,
        ...(cooldowns.length > 0 ? [cooldowns[Math.floor(Math.random() * cooldowns.length)]] : []),
      ]);
    }
    setActiveExerciseIndex(null);
    setTimer(0);
    setIsPaused(true);
    setCompletedExercises(new Set());
    setShowRestTimer(false);
    setTotalTimeSpent(0);
    setWorkoutReady(true);
    setActiveTab('workout');
  }, [currentWeek, fitnessLevel]);

  useEffect(() => { generateWorkout(); }, [generateWorkout]);

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

  const handleRestComplete = () => setShowRestTimer(false);

  const caloriesBurned = Math.round(
    generatedWorkout
      .filter(e => completedExercises.has(e.id))
      .reduce((sum, e) => sum + (e.caloriesPerMin * e.duration) / 60, 0)
  );

  const currentVideoIds = getVideosByLanguage(i18n.language);
  const fitnessVideos: VideoType[] = currentVideoIds.map((v, i) => ({
    id: String(i + 1),
    title: t(`toolsInternal.fitnessCoach.videos.${v.categoryKey}.title`),
    description: t(`toolsInternal.fitnessCoach.videos.${v.categoryKey}.description`),
    youtubeId: v.youtubeId,
    duration: v.duration,
    category: t(`toolsInternal.fitnessCoach.videoCategories.${v.categoryKey}`),
  }));

  const tabs: { id: ActiveTab; icon: React.ReactNode; labelKey: string }[] = [
    { id: 'setup', icon: <Settings2 className="w-4 h-4" />, labelKey: 'toolsInternal.fitnessCoach.tabs.setup' },
    { id: 'workout', icon: <Dumbbell className="w-4 h-4" />, labelKey: 'toolsInternal.fitnessCoach.tabs.workout' },
    { id: 'resources', icon: <Video className="w-4 h-4" />, labelKey: 'toolsInternal.fitnessCoach.tabs.resources' },
  ];

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
      <ToolHubNav tabs={WELLNESS_HUB_TABS} />
      <div className="space-y-4">

        {/* ── Tab Navigation ── */}
        <div className="flex gap-1 p-1 rounded-2xl bg-muted/50 border border-border">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              <span className="flex items-center gap-1">
                <span className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                  activeTab === tab.id ? 'bg-primary-foreground/20' : 'bg-muted'
                )}>
                  {idx + 1}
                </span>
              </span>
              {tab.icon}
              <span className="hidden xs:inline">{t(tab.labelKey)}</span>
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          {/* ═══ SETUP TAB ═══ */}
          {activeTab === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Hero Setup Card */}
              <Card className="overflow-hidden border-primary/20">
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 pb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-primary/15 text-primary">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-foreground">
                        {t('toolsInternal.fitnessCoach.sections.setup')}
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        {t('toolsInternal.fitnessCoach.setupDesc')}
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  <WeekSlider
                    week={currentWeek}
                    onChange={setCurrentWeek}
                    label={t('toolsInternal.fitnessCoach.currentWeek')}
                    showTrimester
                  />

                  <div>
                    <h3 className="text-xs font-semibold mb-2 text-foreground">
                      {t('toolsInternal.fitnessCoach.activityLevel')}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(['beginner', 'intermediate'] as const).map(level => (
                        <button
                          key={level}
                          onClick={() => setFitnessLevel(level)}
                          className={cn(
                            'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-start',
                            fitnessLevel === level
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/30'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            fitnessLevel === level ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          )}>
                            {level === 'beginner' ? '🌱' : '💪'}
                          </div>
                          <span className={cn(
                            'text-xs font-semibold',
                            fitnessLevel === level ? 'text-primary' : 'text-foreground'
                          )}>
                            {t(`toolsInternal.fitnessCoach.${level}`)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <TrimesterAlert week={currentWeek} />
                </CardContent>
              </Card>

              {/* Smart Workout Generator */}
              <Card className="border-primary/20 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/8 to-accent/8 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-primary/15 text-primary">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-foreground">
                        {t('toolsInternal.fitnessCoach.smartGen.title')}
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        {t('toolsInternal.fitnessCoach.smartGen.subtitle')}
                      </p>
                    </div>
                  </div>
                  <SmartWorkoutGenerator
                    onGenerate={(prefs) => generateWorkout(prefs)}
                    onRandomGenerate={() => generateWorkout()}
                  />
                </div>
              </Card>

              {/* Go to workout button */}
              {workoutReady && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={() => setActiveTab('workout')}
                    className="w-full gap-2 h-12 text-sm font-bold rounded-xl"
                  >
                    <PlayCircle className="w-5 h-5" />
                    {t('toolsInternal.fitnessCoach.goToWorkout')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══ WORKOUT TAB ═══ */}
          {activeTab === 'workout' && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Progress Ring */}
              <WorkoutProgressRing
                completed={completedExercises.size}
                total={generatedWorkout.length}
                caloriesBurned={caloriesBurned}
                totalTime={totalTimeSpent}
              />

              {/* Warmup tip */}
              <WarmupCooldownSection type="warmup" />

              {/* Rest Timer */}
              <RestTimer
                duration={REST_DURATION}
                onComplete={handleRestComplete}
                onSkip={handleRestComplete}
                isActive={showRestTimer}
              />

              {/* Workout header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-sm text-foreground">
                    {t('toolsInternal.fitnessCoach.sections.workout')}
                  </h2>
                </div>
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Dumbbell className="w-3 h-3" />
                  {completedExercises.size}/{generatedWorkout.length}
                </Badge>
              </div>

              {/* Exercise Cards */}
              <div className="space-y-2.5">
                {generatedWorkout.map((exercise, realIndex) => (
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
                ))}
              </div>

              {/* Cooldown tip */}
              <WarmupCooldownSection type="cooldown" />

              {/* Regenerate */}
              <Button
                variant="outline"
                onClick={() => { setActiveTab('setup'); }}
                className="w-full gap-2 text-xs"
              >
                <Settings2 className="w-4 h-4" />
                {t('toolsInternal.fitnessCoach.changeSettings')}
              </Button>
            </motion.div>
          )}

          {/* ═══ RESOURCES TAB ═══ */}
          {activeTab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Daily Tip */}
              <Card className="border-primary/20 overflow-hidden">
                <div className="bg-gradient-to-br from-primary/8 to-accent/8 p-4">
                  <div className="flex gap-3">
                    <div className="p-2 rounded-xl bg-primary/15 text-primary flex-shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground mb-1">
                        {t('toolsInternal.fitnessCoach.dailyTip')}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t(`toolsInternal.fitnessCoach.tips.tip${(currentWeek % 5) + 1}`)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Videos */}
              <VideoLibrary
                videos={fitnessVideos}
                title={t('toolsInternal.fitnessCoach.fitnessVideos')}
                subtitle={t('toolsInternal.fitnessCoach.fitnessVideosSubtitle')}
                accentColor="violet"
              />

              {/* Safety */}
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4 flex gap-3">
                  <div className="p-2 rounded-xl bg-destructive/10 text-destructive flex-shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground mb-1">
                      {t('toolsInternal.fitnessCoach.safetyFirst')}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {t('toolsInternal.fitnessCoach.safetyText')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolFrame>
  );
};

export default AIFitnessCoach;
