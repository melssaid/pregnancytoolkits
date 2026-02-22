import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Zap, Battery, BatteryLow, Flame, 
  StretchHorizontal, Wind, Dumbbell, 
  Clock, Brain, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EnergyLevel = 'low' | 'medium' | 'high';
type WorkoutGoal = 'backRelief' | 'flexibility' | 'energyBoost' | 'fullBody' | 'relaxation';
type TimeOption = 5 | 10 | 15 | 20;

interface SmartWorkoutGeneratorProps {
  onGenerate: (preferences: {
    energy: EnergyLevel;
    goal: WorkoutGoal;
    time: TimeOption;
  }) => void;
  onRandomGenerate: () => void;
}

const energyOptions: { value: EnergyLevel; icon: React.ReactNode; colorClass: string }[] = [
  { value: 'low', icon: <BatteryLow className="w-4 h-4" />, colorClass: 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40' },
  { value: 'medium', icon: <Battery className="w-4 h-4" />, colorClass: 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40' },
  { value: 'high', icon: <Zap className="w-4 h-4" />, colorClass: 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40' },
];

const goalOptions: { value: WorkoutGoal; icon: React.ReactNode }[] = [
  { value: 'backRelief', icon: <Wind className="w-4 h-4" /> },
  { value: 'flexibility', icon: <StretchHorizontal className="w-4 h-4" /> },
  { value: 'energyBoost', icon: <Zap className="w-4 h-4" /> },
  { value: 'fullBody', icon: <Dumbbell className="w-4 h-4" /> },
  { value: 'relaxation', icon: <Wind className="w-4 h-4" /> },
];

const timeOptions: TimeOption[] = [5, 10, 15, 20];

export const SmartWorkoutGenerator: React.FC<SmartWorkoutGeneratorProps> = ({
  onGenerate,
  onRandomGenerate,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // 0=collapsed, 1=energy, 2=goal, 3=time
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [goal, setGoal] = useState<WorkoutGoal | null>(null);
  const [time, setTime] = useState<TimeOption | null>(null);

  const handleEnergySelect = (e: EnergyLevel) => {
    setEnergy(e);
    setStep(2);
  };

  const handleGoalSelect = (g: WorkoutGoal) => {
    setGoal(g);
    setStep(3);
  };

  const handleTimeSelect = (t: TimeOption) => {
    setTime(t);
    if (energy && goal) {
      onGenerate({ energy, goal, time: t });
      // Reset after generation
      setTimeout(() => {
        setStep(0);
        setEnergy(null);
        setGoal(null);
        setTime(null);
      }, 300);
    }
  };

  const handleStart = () => {
    setStep(1);
    setEnergy(null);
    setGoal(null);
    setTime(null);
  };

  const stepLabels = [
    '', // step 0
    t('toolsInternal.fitnessCoach.smartGen.step1'),
    t('toolsInternal.fitnessCoach.smartGen.step2'),
    t('toolsInternal.fitnessCoach.smartGen.step3'),
  ];

  return (
    <div className="space-y-2">
      {/* Main Smart Generate Button */}
      {step === 0 && (
        <div className="flex gap-2">
          <Button
            onClick={handleStart}
            className="flex-1 gap-2 text-xs h-10"
          >
            <Brain className="w-4 h-4" />
            {t('toolsInternal.fitnessCoach.smartGen.title')}
          </Button>
          <Button
            variant="outline"
            onClick={onRandomGenerate}
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            title={t('toolsInternal.fitnessCoach.smartGen.random')}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step-by-step selection */}
      <AnimatePresence mode="wait">
        {step > 0 && (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-3">
                {/* Progress dots */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-foreground">
                    {stepLabels[step]}
                  </p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(s => (
                      <div
                        key={s}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          s <= step ? 'bg-primary scale-110' : 'bg-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Step 1: Energy */}
                {step === 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {energyOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleEnergySelect(opt.value)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                          'hover:shadow-md active:scale-95',
                          opt.colorClass
                        )}
                      >
                        {opt.icon}
                        <span className="text-[11px] font-medium text-foreground">
                          {t(`toolsInternal.fitnessCoach.smartGen.energy.${opt.value}`)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2: Goal */}
                {step === 2 && (
                  <div className="grid grid-cols-2 gap-2">
                    {goalOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleGoalSelect(opt.value)}
                        className={cn(
                          'flex items-center gap-2 p-2.5 rounded-xl border transition-all text-start',
                          'border-border hover:border-primary/50 hover:bg-primary/5 active:scale-95'
                        )}
                      >
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                          {opt.icon}
                        </div>
                        <span className="text-[11px] font-medium text-foreground leading-tight">
                          {t(`toolsInternal.fitnessCoach.smartGen.goals.${opt.value}`)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 3: Time */}
                {step === 3 && (
                  <div className="grid grid-cols-4 gap-2">
                    {timeOptions.map(mins => (
                      <button
                        key={mins}
                        onClick={() => handleTimeSelect(mins)}
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                          'border-border hover:border-primary/50 hover:bg-primary/5 active:scale-95'
                        )}
                      >
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">{mins}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {t('toolsInternal.fitnessCoach.smartGen.min')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Cancel */}
                <button
                  onClick={() => setStep(0)}
                  className="w-full text-center text-[10px] text-muted-foreground mt-2 hover:text-foreground transition-colors"
                >
                  {t('toolsInternal.fitnessCoach.smartGen.cancel')}
                </button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartWorkoutGenerator;
