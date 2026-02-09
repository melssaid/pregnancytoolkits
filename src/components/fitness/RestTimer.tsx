import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Coffee, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestTimerProps {
  duration: number; // seconds
  onComplete: () => void;
  onSkip: () => void;
  isActive: boolean;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  duration,
  onComplete,
  onSkip,
  isActive,
}) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, isActive]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {t('toolsInternal.fitnessCoach.restTime')}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onSkip}
                className="gap-1 text-xs h-7"
              >
                <SkipForward className="w-3 h-3" />
                {t('toolsInternal.fitnessCoach.skip')}
              </Button>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="text-center">
              <span className="text-lg font-mono font-bold text-primary">
                {timeLeft}
              </span>
              <span className="text-sm text-muted-foreground ms-1">
                {t('toolsInternal.fitnessCoach.seconds')}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
