import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, Flower2, Heart, CalendarDays, Dumbbell, Apple, Activity, BookOpen, Stethoscope, Moon, Droplets } from 'lucide-react';
import type { JourneyStage } from '@/hooks/useUserProfile';

interface Props {
  stage: JourneyStage;
}

interface ToolRec {
  icon: React.ElementType;
  labelKey: string;
  fallback: string;
}

const pregnantTools: ToolRec[] = [
  { icon: CalendarDays, labelKey: 'journey.rec.dueDate', fallback: 'Due Date Calculator' },
  { icon: Baby, labelKey: 'journey.rec.fetalGrowth', fallback: 'Fetal Growth Tracker' },
  { icon: Dumbbell, labelKey: 'journey.rec.exercises', fallback: 'Safe Exercises' },
  { icon: Apple, labelKey: 'journey.rec.nutrition', fallback: 'Nutrition Guide' },
  { icon: Activity, labelKey: 'journey.rec.kickCounter', fallback: 'Kick Counter' },
  { icon: Stethoscope, labelKey: 'journey.rec.symptoms', fallback: 'Symptom Analyzer' },
];

const fertilityTools: ToolRec[] = [
  { icon: Activity, labelKey: 'journey.rec.cycleTracker', fallback: 'Cycle & Ovulation Tracker' },
  { icon: Stethoscope, labelKey: 'journey.rec.preconception', fallback: 'Preconception Checkup' },
  { icon: BookOpen, labelKey: 'journey.rec.fertilityAcademy', fallback: 'Fertility Academy' },
  { icon: Apple, labelKey: 'journey.rec.supplements', fallback: 'Supplements Guide' },
];

const postpartumTools: ToolRec[] = [
  { icon: Baby, labelKey: 'journey.rec.babySleep', fallback: 'Baby Sleep Tracker' },
  { icon: Heart, labelKey: 'journey.rec.mentalHealth', fallback: 'Postpartum Mental Health' },
  { icon: Droplets, labelKey: 'journey.rec.diaper', fallback: 'Diaper Tracker' },
  { icon: Moon, labelKey: 'journey.rec.recovery', fallback: 'Recovery Guide' },
  { icon: Apple, labelKey: 'journey.rec.lactation', fallback: 'Lactation Support' },
];

const stageConfig: Record<JourneyStage, { tools: ToolRec[]; titleKey: string; titleFallback: string; color: string }> = {
  pregnant: {
    tools: pregnantTools,
    titleKey: 'journey.rec.pregnantTitle',
    titleFallback: 'Essential tools for your pregnancy',
    color: 'primary',
  },
  fertility: {
    tools: fertilityTools,
    titleKey: 'journey.rec.fertilityTitle',
    titleFallback: 'Tools to help you conceive',
    color: 'pink-500',
  },
  postpartum: {
    tools: postpartumTools,
    titleKey: 'journey.rec.postpartumTitle',
    titleFallback: 'Tools for you & your baby',
    color: 'violet-500',
  },
};

export const JourneyRecommendations: React.FC<Props> = ({ stage }) => {
  const { t } = useTranslation();
  const config = stageConfig[stage];
  if (!config) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl border border-primary/15 bg-primary/[0.04] p-3"
      >
        <p className="text-[11px] font-bold text-primary mb-2">
          {t(config.titleKey, config.titleFallback)}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {config.tools.map(({ icon: Icon, labelKey, fallback }, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-background/80 border border-border/40 text-[10px] font-semibold text-foreground/80"
            >
              <Icon className="w-3 h-3 text-primary/70 flex-shrink-0" strokeWidth={2} />
              {t(labelKey, fallback)}
            </span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
