import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface WeeklySummaryHeroProps {
  currentWeek: number;
  latestWeight: number | null;
  previousWeight: number | null;
  totalGain: number;
  targetMin: number;
  targetMax: number;
  status: 'below' | 'above' | 'normal' | null;
  t: TFunction;
}

export function WeeklySummaryHero({ currentWeek, latestWeight, previousWeight, totalGain, targetMin, targetMax, status, t }: WeeklySummaryHeroProps) {
  const delta = latestWeight && previousWeight ? latestWeight - previousWeight : null;
  const midTarget = (targetMin + targetMax) / 2;
  const progress = Math.min(Math.round((totalGain / midTarget) * 100), 100);

  const statusIcon = delta === null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const statusColor = status === 'normal' ? 'text-emerald-400' : status === 'above' ? 'text-red-400' : 'text-amber-400';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden border-0 shadow-xl">
        {/* Gradient background */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -end-8 w-32 h-32 rounded-full bg-primary-foreground/5" />
          <div className="absolute -bottom-4 -start-4 w-20 h-20 rounded-full bg-primary-foreground/5" />
          
          <CardContent className="p-4 relative z-10">
            {/* Top row: Week badge + Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <motion.div 
                  className="px-3 py-1 rounded-full bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <span className="text-[11px] font-bold">{t('toolsInternal.weightGain.week')} {currentWeek}</span>
                </motion.div>
                {status && (
                  <motion.div 
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-foreground/10`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {React.createElement(statusIcon, { className: `w-3 h-3 ${statusColor}` })}
                    <span className="text-[9px] font-semibold">{t(`toolsInternal.weightGain.statusMessages.${status}.message`)}</span>
                  </motion.div>
                )}
              </div>
              <Zap className="w-4 h-4 opacity-30" />
            </div>

            {/* Main stats */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {/* Total Gain */}
              <div className="text-center">
                <p className="text-[8px] uppercase tracking-wider opacity-60 font-medium">{t('toolsInternal.weightGain.totalWeightGainLabel')}</p>
                <motion.p 
                  className="text-2xl font-black mt-0.5"
                  key={totalGain}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  {totalGain >= 0 ? '+' : ''}{totalGain.toFixed(1)}
                </motion.p>
                <p className="text-[9px] opacity-50">kg</p>
              </div>
              
              {/* Latest Weight */}
              <div className="text-center border-x border-primary-foreground/10">
                <p className="text-[8px] uppercase tracking-wider opacity-60 font-medium">{t('toolsInternal.weightGain.currentWeight')}</p>
                <p className="text-2xl font-black mt-0.5">{latestWeight?.toFixed(1) ?? '—'}</p>
                <p className="text-[9px] opacity-50">kg</p>
              </div>

              {/* Delta */}
              <div className="text-center">
                <p className="text-[8px] uppercase tracking-wider opacity-60 font-medium">{t('toolsInternal.weightGain.weeklyDelta')}</p>
                <motion.p 
                  className={`text-2xl font-black mt-0.5 ${statusColor}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {delta !== null ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}` : '—'}
                </motion.p>
                <p className="text-[9px] opacity-50">kg</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1 opacity-70">
                  <Target className="w-3 h-3" />
                  {t('toolsInternal.weightGain.progressToGoal')}
                </span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-primary-foreground/15 overflow-hidden">
                <motion.div 
                  className="h-full rounded-full bg-primary-foreground/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                />
              </div>
              <div className="flex justify-between text-[8px] opacity-50">
                <span>0 kg</span>
                <span>{targetMin}–{targetMax} kg</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
