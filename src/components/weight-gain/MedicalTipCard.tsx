import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface MedicalTipCardProps {
  trimester: string;
  t: TFunction;
}

export function MedicalTipCard({ trimester, t }: MedicalTipCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-amber-200/30 dark:border-amber-800/30 overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-amber-300/50 via-amber-400 to-amber-300/50" />
        <CardContent className="p-3 flex items-start gap-2.5">
          <motion.div 
            className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Lightbulb className="w-4 h-4 text-amber-600" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400">
                {t('toolsInternal.weightGain.tipTitle')}
              </p>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70 leading-relaxed">
              {t(`toolsInternal.weightGain.tips.${trimester}`)}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
