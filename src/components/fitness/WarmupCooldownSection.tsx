import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Flame, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface WarmupCooldownSectionProps {
  type: 'warmup' | 'cooldown';
}

export const WarmupCooldownSection: React.FC<WarmupCooldownSectionProps> = ({ type }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const Icon = type === 'warmup' ? Flame : Wind;
  const steps = [1, 2, 3, 4] as const;

  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 text-start"
        >
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${type === 'warmup' ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
              <Icon className={`w-4 h-4 ${type === 'warmup' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                {t(`toolsInternal.fitnessCoach.${type}.title`)}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {t(`toolsInternal.fitnessCoach.${type}.duration`)}
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-2">
                {steps.map((step) => (
                  <div key={step} className="flex items-start gap-2 ps-2">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0 mt-0.5">
                      {step}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t(`toolsInternal.fitnessCoach.${type}.step${step}`)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
