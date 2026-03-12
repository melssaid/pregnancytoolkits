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
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-amber-200/40 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/60 to-amber-50/30 dark:from-amber-950/20 dark:to-amber-950/10 overflow-hidden">
        <CardContent className="p-3 flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
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
