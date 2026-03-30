import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

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

  const StatusIcon = delta === null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const statusColor = status === 'normal' ? 'text-emerald-400' : status === 'above' ? 'text-red-400' : 'text-amber-400';

  // Format numbers: show integer if whole, one decimal otherwise
  const fmt = (n: number) => Number.isInteger(n) ? n.toString() : n.toFixed(1);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground relative overflow-hidden">
          <div className="absolute -top-8 -end-8 w-32 h-32 rounded-full bg-primary-foreground/5" />

          <CardContent className="p-4 relative z-10">
            {/* Week badge */}
            <div className="flex items-center justify-between mb-4">
              <motion.div
                className="px-3 py-1 rounded-full bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <span className="text-[11px] font-bold">{t('toolsInternal.weightGain.week')} {currentWeek}</span>
              </motion.div>
              {status && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-foreground/10">
                  <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                  <span className="text-[9px] font-semibold">{t(`toolsInternal.weightGain.statusMessages.${status}.message`)}</span>
                </div>
              )}
            </div>

            {/* Two main stats — big and clear, NO decimals */}
            <div className="flex items-end justify-around mb-4">
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-wider opacity-60 mb-1">{t('toolsInternal.weightGain.totalWeightGainLabel')}</p>
                <motion.p className="text-3xl font-black leading-none" key={totalGain} initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  {totalGain >= 0 ? '+' : ''}{fmt(totalGain)}
                </motion.p>
                <p className="text-[9px] opacity-50 mt-0.5">kg</p>
              </div>

              <div className="w-px h-10 bg-primary-foreground/15" />

              <div className="text-center">
                <p className="text-[9px] uppercase tracking-wider opacity-60 mb-1">{t('toolsInternal.weightGain.currentWeight')}</p>
                <p className="text-3xl font-black leading-none">{latestWeight ? fmt(latestWeight) : '—'}</p>
                <p className="text-[9px] opacity-50 mt-0.5">kg</p>
              </div>
            </div>

            {/* Progress bar — clean numbers */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1 opacity-70">
                  <Target className="w-3 h-3" />
                  {progress}%
                </span>
                <span className="opacity-50">{Math.round(targetMin)}–{Math.round(targetMax)} kg</span>
              </div>
              <div className="h-2 rounded-full bg-primary-foreground/15 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary-foreground/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
