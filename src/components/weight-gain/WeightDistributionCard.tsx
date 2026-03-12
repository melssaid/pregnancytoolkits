import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface WeightDistributionCardProps {
  t: TFunction;
}

const items = [
  { key: 'baby', weight: 3.4, color: 'bg-pink-400' },
  { key: 'placenta', weight: 0.7, color: 'bg-red-400' },
  { key: 'fluid', weight: 0.8, color: 'bg-sky-400' },
  { key: 'uterus', weight: 0.9, color: 'bg-purple-400' },
  { key: 'breast', weight: 0.9, color: 'bg-rose-400' },
  { key: 'blood', weight: 1.8, color: 'bg-red-500' },
  { key: 'fat', weight: 3.2, color: 'bg-amber-400' },
];

const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);

export function WeightDistributionCard({ t }: WeightDistributionCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/40 overflow-hidden">
        {/* Stacked bar */}
        <div className="h-2 flex">
          {items.map((item, i) => (
            <motion.div
              key={item.key}
              className={`h-full ${item.color}`}
              initial={{ width: 0 }}
              animate={{ width: `${(item.weight / totalWeight) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
            />
          ))}
        </div>

        <CardContent className="p-3">
          <h3 className="text-[12px] font-bold mb-2">
            {t('toolsInternal.weightGain.weightDistribution')}
          </h3>

          <div className="space-y-1">
            {items.map((item, i) => (
              <motion.div
                key={item.key}
                className="flex items-center gap-2 py-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.03 }}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                <span className="text-[10px] text-foreground/80 flex-1 truncate">
                  {t(`toolsInternal.weightGain.distribution.${item.key}`)}
                </span>
                <span className="text-[10px] font-bold text-foreground/70 shrink-0">{item.weight} kg</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-border/30 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">{t('toolsInternal.weightGain.totalDistribution', 'Total')}</span>
            <span className="text-[12px] font-extrabold text-primary">{totalWeight.toFixed(1)} kg</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
