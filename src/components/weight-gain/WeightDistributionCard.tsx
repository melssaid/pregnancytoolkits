import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Baby, Droplets, Heart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeightDistributionCardProps {
  t: TFunction;
}

const items = [
  { key: 'baby', icon: Baby, weight: 3.4, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30' },
  { key: 'placenta', icon: Heart, weight: 0.7, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
  { key: 'fluid', icon: Droplets, weight: 0.8, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/30' },
  { key: 'uterus', icon: Heart, weight: 0.9, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  { key: 'breast', icon: Heart, weight: 0.9, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  { key: 'blood', icon: Droplets, weight: 1.8, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
  { key: 'fat', icon: Zap, weight: 3.2, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
];

const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);

export function WeightDistributionCard({ t }: WeightDistributionCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/40 overflow-hidden">
        {/* Stacked bar visual */}
        <div className="h-2 flex">
          {items.map((item, i) => (
            <motion.div
              key={item.key}
              className={`h-full ${item.bg} ${item.color.replace('text-', 'bg-').replace('500', '400').replace('600', '500')}`}
              initial={{ width: 0 }}
              animate={{ width: `${(item.weight / totalWeight) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
            />
          ))}
        </div>
        
        <CardContent className="p-3">
          <h3 className="text-[12px] font-bold mb-2.5">
            {t('toolsInternal.weightGain.weightDistribution')}
          </h3>
          
          <div className="grid grid-cols-2 gap-1.5">
            {items.map((item, i) => {
              const Icon = item.icon;
              const pct = Math.round((item.weight / totalWeight) * 100);
              return (
                <motion.div
                  key={item.key}
                  className={`flex items-center gap-2 p-2 rounded-xl ${item.bg} border border-border/20`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-foreground/80 truncate">
                      {t(`toolsInternal.weightGain.distribution.${item.key}`)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-foreground/70 shrink-0">{item.weight}kg</span>
                </motion.div>
              );
            })}
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
