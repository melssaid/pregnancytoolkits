import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Trophy, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WorkoutProgressRingProps {
  completed: number;
  total: number;
  caloriesBurned: number;
  totalTime: number;
}

export const WorkoutProgressRing: React.FC<WorkoutProgressRingProps> = ({
  completed,
  total,
  caloriesBurned,
  totalTime,
}) => {
  const { t } = useTranslation();
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const isComplete = completed === total && total > 0;

  return (
    <Card className={`border transition-all ${isComplete ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Progress Ring */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
              <circle
                cx="45" cy="45" r="40"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="6"
              />
              <motion.circle
                cx="45" cy="45" r="40"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {isComplete ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                >
                  <Trophy className="w-6 h-6 text-primary" />
                </motion.div>
              ) : (
                <span className="text-lg font-bold text-foreground">
                  {completed}/{total}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="font-semibold text-sm text-foreground break-words">
              {isComplete
                ? t('toolsInternal.fitnessCoach.workoutComplete')
                : t('toolsInternal.fitnessCoach.workoutProgress')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-destructive" />
                <span className="text-xs text-muted-foreground">
                  ~{caloriesBurned} {t('toolsInternal.fitnessCoach.calories')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">
                  ⏱️ {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
            {isComplete && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-primary font-medium"
              >
                {t('toolsInternal.fitnessCoach.greatJob')}
              </motion.p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
