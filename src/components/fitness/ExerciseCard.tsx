import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, Check, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
            ? 'ring-2 ring-primary shadow-lg border-primary/50'
            : 'border-border'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2 gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Number/Check circle */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0 ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-foreground break-words">
                  {t(`toolsInternal.fitnessCoach.exerciseNames.${exercise.nameKey}`)}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
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

            {isActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl font-mono font-bold text-primary flex-shrink-0"
              >
                00:{timer.toString().padStart(2, '0')}
              </motion.span>
            )}
          </div>

          <p className="text-muted-foreground text-xs mb-3 ms-12 leading-relaxed break-words">
            {t(`toolsInternal.fitnessCoach.exerciseDescs.${exercise.descriptionKey}`)}
          </p>

          {/* Muscle group */}
          <p className="text-[10px] text-muted-foreground ms-12 mb-2">
            💪 {t(`toolsInternal.fitnessCoach.muscleGroups.${exercise.muscleGroupKey}`)}
          </p>

          <div className="ms-12 flex gap-2">
            {isCompleted ? (
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                ✓ {t('toolsInternal.fitnessCoach.completed')}
              </Badge>
            ) : isActive ? (
              <Button
                size="sm"
                variant={isPaused ? 'default' : 'outline'}
                onClick={onTogglePause}
                className="gap-1.5 text-xs"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                {isPaused
                  ? t('toolsInternal.fitnessCoach.resume')
                  : t('toolsInternal.fitnessCoach.pause')}
              </Button>
            ) : (
              <Button size="sm" onClick={onStart} className="gap-1.5 text-xs">
                <Play className="w-3.5 h-3.5" /> {t('common.start')} ({exercise.duration}s)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
