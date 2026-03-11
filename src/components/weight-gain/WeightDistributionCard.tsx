import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Baby, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeightDistributionCardProps {
  t: TFunction;
}

const items = [
  { key: 'baby', emoji: '👶' },
  { key: 'placenta', emoji: '🫀' },
  { key: 'fluid', emoji: '💧' },
  { key: 'uterus', emoji: '🏠' },
  { key: 'breast', emoji: '🤱' },
  { key: 'blood', emoji: '🩸' },
  { key: 'fat', emoji: '⚡' },
];

export function WeightDistributionCard({ t }: WeightDistributionCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-primary" />
            {t('toolsInternal.weightGain.weightDistribution')}
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {items.map(item => (
              <div key={item.key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <span className="text-sm">{item.emoji}</span>
                <span className="text-[11px] text-foreground/80">
                  {t(`toolsInternal.weightGain.distribution.${item.key}`)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
