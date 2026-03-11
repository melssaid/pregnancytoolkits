import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface MedicalTipCardProps {
  trimester: string;
  t: TFunction;
}

export function MedicalTipCard({ trimester, t }: MedicalTipCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-amber-200/50 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-3.5 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 mb-0.5">
              {t('toolsInternal.weightGain.tipTitle')}
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70 leading-relaxed">
              {t(`toolsInternal.weightGain.tips.${trimester}`)}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
