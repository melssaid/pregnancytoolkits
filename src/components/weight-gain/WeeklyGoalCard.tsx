import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

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
  const isOnTrack = currentGain >= expectedCurrent.min && currentGain <= expectedCurrent.max;

  const fmt = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(1);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-primary/15">
        <CardContent className="p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold">{t('toolsInternal.weightGain.weeklyGoalTitle')}</h3>
            <span className="text-[10px] text-muted-foreground ms-auto">{t('toolsInternal.weightGain.week')} {nextWeek}</span>
          </div>
          <p className="text-[10px] text-muted-foreground/70 mb-3 ms-6">
            {t('toolsInternal.weightGain.weeklyGoalDesc', 'Your recommended weight target for next week')}
          </p>

          <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-3 mb-3">
            <div className="flex-1 text-center">
              <p className="text-xl font-black text-foreground">{fmt(targetMinWeight)}</p>
              <p className="text-[9px] text-muted-foreground">{t('toolsInternal.weightGain.minRecommended')}</p>
            </div>
            <div className="text-sm text-primary font-bold">—</div>
            <div className="flex-1 text-center">
              <p className="text-xl font-black text-foreground">{fmt(targetMaxWeight)}</p>
              <p className="text-[9px] text-muted-foreground">{t('toolsInternal.weightGain.maxRecommended')}</p>
            </div>
            <div className="text-[10px] text-muted-foreground/60">kg</div>
          </div>

          <div className={`flex items-center gap-2 p-2 rounded-xl ${isOnTrack ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50'}`}>
            <div className={`w-2 h-2 rounded-full ${isOnTrack ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <p className="text-[10px] font-medium text-foreground/80">
              {isOnTrack ? t('toolsInternal.weightGain.onTrackGoal') : t('toolsInternal.weightGain.adjustGoal')}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
