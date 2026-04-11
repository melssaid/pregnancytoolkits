import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getToolsByJourney } from '@/lib/tools-data';
import type { JourneyStage } from '@/hooks/useUserProfile';

interface Props {
  stage: JourneyStage;
}

const stageToJourney: Record<JourneyStage, import('@/lib/tools-data').JourneyKey> = {
  fertility: 'planning',
  pregnant: 'pregnant',
  postpartum: 'postpartum',
};

const stageHeader: Record<JourneyStage, { titleKey: string; fallback: string }> = {
  fertility: { titleKey: 'journey.rec.fertilityTitle', fallback: 'We have professional tools for you' },
  pregnant: { titleKey: 'journey.rec.pregnantTitle', fallback: 'We have professional tools for you' },
  postpartum: { titleKey: 'journey.rec.postpartumTitle', fallback: 'We have professional tools for you' },
};

export const JourneyRecommendations: React.FC<Props> = ({ stage }) => {
  const { t } = useTranslation();
  const journeyKey = stageToJourney[stage];
  const tools = getToolsByJourney(journeyKey);
  const header = stageHeader[stage];

  if (!tools.length) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] to-transparent p-3.5 mt-1"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
            {t(header.titleKey, header.fallback)}
          </p>
          <span className="text-[9px] font-bold text-amber-600/60 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
            {tools.length}
          </span>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {tools.map((tool, i) => {
            const hasPng = !!tool.pngIcon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-background/70 border border-border/30"
              >
                {hasPng ? (
                  <img src={tool.pngIcon} alt="" className="w-4 h-4 object-contain opacity-75 flex-shrink-0" />
                ) : (
                  <tool.icon className="w-4 h-4 text-primary/60 flex-shrink-0" strokeWidth={1.8} />
                )}
                <span className="text-[10px] font-semibold text-foreground/75 leading-tight line-clamp-2">
                  {t(tool.titleKey)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
