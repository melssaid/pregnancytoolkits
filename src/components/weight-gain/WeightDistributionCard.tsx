import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeightDistributionCardProps {
  t: TFunction;
}

const items = [
  { key: 'baby', emoji: '👶', weight: '3.4' },
  { key: 'placenta', emoji: '🫀', weight: '0.7' },
  { key: 'fluid', emoji: '💧', weight: '0.8' },
  { key: 'uterus', emoji: '🏠', weight: '0.9' },
  { key: 'breast', emoji: '🤱', weight: '0.9' },
  { key: 'blood', emoji: '🩸', weight: '1.8' },
  { key: 'fat', emoji: '⚡', weight: '3.2' },
];

const maxWeight = 3.4;

export function WeightDistributionCard({ t }: WeightDistributionCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/40">
        <CardContent className="p-3.5">
          <h3 className="text-[12px] font-bold flex items-center gap-2 mb-3">
            <Info className="w-3.5 h-3.5 text-primary" />
            {t('toolsInternal.weightGain.weightDistribution')}
          </h3>
          <div className="space-y-2">
            {items.map((item, i) => {
              const pct = (parseFloat(item.weight) / maxWeight) * 100;
              return (
                <motion.div 
                  key={item.key} 
                  className="flex items-center gap-2.5"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="text-sm w-6 text-center">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-foreground/80 font-medium">
                        {t(`toolsInternal.weightGain.distribution.${item.key}`)}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground">{item.weight} kg</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary/40"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
