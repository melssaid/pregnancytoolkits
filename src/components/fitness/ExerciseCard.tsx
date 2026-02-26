import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, Check, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExerciseAnimation } from './ExerciseAnimation';

export interface Exercise {
  id: string;
  nameKey: string;
  duration: number;
  descriptionKey: string;
  category: 'warmup' | 'strength' | 'cardio' | 'flexibility' | 'cooldown';
  difficulty: 'beginner' | 'intermediate';
  caloriesPerMin: number;
  muscleGroupKey: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isPaused: boolean;
  timer: number;
  onStart: () => void;
  onTogglePause: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  isActive,
  isCompleted,
  isPaused,
  timer,
  onStart,
  onTogglePause,
}) => {
  const { t } = useTranslation();

  const categoryColors: Record<string, string> = {
    warmup: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    strength: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    cardio: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    flexibility: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    cooldown: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`transition-all ${
          isCompleted
            ? 'opacity-60 border-primary/30 bg-primary/5'
            : isActive
            ? 'ring-2 ring-primary shadow-xl border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-transparent'
            : 'border-border'
        }`}
      >
        <CardContent className="p-3">
          {/* Active label banner */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mb-2 py-1.5 -mx-3 -mt-3 rounded-t-lg bg-primary text-primary-foreground"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold">
                {t('toolsInternal.fitnessCoach.exerciseInProgress', 'Exercise in progress')}
              </span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-lg font-mono font-bold"
              >
                00:{timer.toString().padStart(2, '0')}
              </motion.span>
            </motion.div>
          )}

          <div className="flex gap-3">
            {/* Animated exercise illustration */}
            <div
              className={`rounded-xl flex items-center justify-center transition-all flex-shrink-0 border-2 ${
                isCompleted
                  ? 'w-20 h-20 bg-primary/5 border-primary/20'
                  : isActive
                  ? 'w-24 h-24 bg-background border-primary shadow-lg shadow-primary/20'
                  : 'w-20 h-20 bg-muted/30 border-border/40'
              }`}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                >
                  <Check className="w-8 h-8 text-primary" />
                </motion.div>
              ) : (
                <ExerciseAnimation
                  exerciseId={exercise.id}
                  isActive={isActive}
                  className={isActive ? 'w-20 h-20' : 'w-16 h-16'}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className={`font-semibold text-foreground break-words leading-tight ${isActive ? 'text-base text-primary' : 'text-sm'}`}>
                    {t(`toolsInternal.fitnessCoach.exerciseNames.${exercise.nameKey}`)}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] border-0 ${categoryColors[exercise.category] || ''}`}
                    >
                      {t(`toolsInternal.fitnessCoach.categories.${exercise.category}`)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Timer className="w-2.5 h-2.5" />
                      {exercise.duration}s
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-[11px] mt-1.5 leading-relaxed break-words line-clamp-2">
                {t(`toolsInternal.fitnessCoach.exerciseDescs.${exercise.descriptionKey}`)}
              </p>

              {/* Muscle group + Action */}
              <div className="flex items-center justify-between mt-2 gap-2">
                <span className="text-[10px] text-muted-foreground">
                  💪 {t(`toolsInternal.fitnessCoach.muscleGroups.${exercise.muscleGroupKey}`)}
                </span>

                {isCompleted ? (
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary px-2 py-0">
                    ✓ {t('toolsInternal.fitnessCoach.completed')}
                  </Badge>
                ) : isActive ? (
                  <Button
                    size="sm"
                    variant={isPaused ? 'default' : 'outline'}
                    onClick={onTogglePause}
                    className="gap-1 text-[11px] h-8 px-3 font-bold"
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    {isPaused
                      ? t('toolsInternal.fitnessCoach.resume')
                      : t('toolsInternal.fitnessCoach.pause')}
                  </Button>
                ) : (
                  <Button size="sm" onClick={onStart} className="gap-1 text-[11px] h-7 px-2.5">
                    <Play className="w-3 h-3" /> {exercise.duration}s
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
