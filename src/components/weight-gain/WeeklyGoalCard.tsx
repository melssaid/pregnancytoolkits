import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Target, ArrowRight } from 'lucide-react';

interface WeeklyGoalCardProps {
  currentWeek: number;
  currentWeight: number;
  prePregnancyWeight: number;
  getExpectedGainForWeek: (week: number) => { min: number; max: number };
  t: TFunction;
}

export function WeeklyGoalCard({ currentWeek, currentWeight, prePregnancyWeight, getExpectedGainForWeek, t }: WeeklyGoalCardProps) {
  const nextWeek = Math.min(currentWeek + 1, 42);
  const expectedNext = getExpectedGainForWeek(nextWeek);
  const targetMinWeight = prePregnancyWeight + expectedNext.min;
  const targetMaxWeight = prePregnancyWeight + expectedNext.max;
  
  const currentGain = currentWeight - prePregnancyWeight;
  const expectedCurrent = getExpectedGainForWeek(currentWeek);
  const midTarget = (expectedCurrent.min + expectedCurrent.max) / 2;
  const isOnTrack = currentGain >= expectedCurrent.min && currentGain <= expectedCurrent.max;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-primary/15">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-[12px] font-bold">{t('toolsInternal.weightGain.weeklyGoalTitle')}</h3>
              <p className="text-[9px] text-muted-foreground">{t('toolsInternal.weightGain.week')} {nextWeek}</p>
            </div>
          </div>

          {/* Target range visual */}
          <div className="bg-muted/40 rounded-2xl p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-[9px] text-muted-foreground font-medium">{t('toolsInternal.weightGain.minRecommended')}</p>
                <p className="text-base font-black text-foreground">{targetMinWeight.toFixed(1)}</p>
                <p className="text-[8px] text-muted-foreground">kg</p>
              </div>
              <div className="flex flex-col items-center px-3">
                <ArrowRight className="w-4 h-4 text-primary/40" />
                <span className="text-[8px] text-primary font-bold mt-0.5">{t('toolsInternal.weightGain.goalRange')}</span>
              </div>
              <div className="text-center flex-1">
                <p className="text-[9px] text-muted-foreground font-medium">{t('toolsInternal.weightGain.maxRecommended')}</p>
                <p className="text-base font-black text-foreground">{targetMaxWeight.toFixed(1)}</p>
                <p className="text-[8px] text-muted-foreground">kg</p>
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <motion.div 
            className={`flex items-center gap-2 p-2 rounded-xl ${isOnTrack ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className={`w-2 h-2 rounded-full ${isOnTrack ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <p className="text-[10px] font-medium text-foreground/80">
              {isOnTrack ? t('toolsInternal.weightGain.onTrackGoal') : t('toolsInternal.weightGain.adjustGoal')}
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
