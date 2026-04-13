import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Baby, Heart, Flower2, CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatLocalized } from '@/lib/dateLocale';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { JourneyStage } from '@/hooks/useUserProfile';

interface Props {
  journeyStage: JourneyStage;
  onJourneyChange: (stage: JourneyStage) => void;
  week: string;
  onWeekChange: (w: string) => void;
  lmpDate: Date | undefined;
  onLmpChange: (d: Date | undefined) => void;
  onNext: () => void;
  onBack: () => void;
}

export const OnboardingStep2Journey: React.FC<Props> = ({
  journeyStage, onJourneyChange, week, onWeekChange, lmpDate, onLmpChange, onNext, onBack,
}) => {
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isRtl = i18n.language === 'ar';
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;
  const [lmpOpen, setLmpOpen] = useState(false);

  const stages: { key: JourneyStage; icon: React.ElementType; labelKey: string; gradient: string; shadow: string }[] = [
    { key: 'fertility', icon: Flower2, labelKey: 'onboarding.step2.fertility', gradient: 'from-[hsl(15,70%,55%)] to-[hsl(30,80%,60%)]', shadow: 'shadow-[0_4px_20px_-4px_hsl(15,70%,55%,0.35)]' },
    { key: 'pregnant', icon: Baby, labelKey: 'onboarding.step2.pregnant', gradient: 'from-[hsl(340,65%,52%)] to-[hsl(320,50%,58%)]', shadow: 'shadow-[0_4px_20px_-4px_hsl(340,65%,52%,0.35)]' },
    { key: 'postpartum', icon: Heart, labelKey: 'onboarding.step2.postpartum', gradient: 'from-[hsl(290,35%,52%)] to-[hsl(270,40%,58%)]', shadow: 'shadow-[0_4px_20px_-4px_hsl(290,35%,52%,0.35)]' },
  ];

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-5 pt-4 pb-2 text-center">
        <h2 className="text-lg font-black text-foreground">
          {t('onboarding.step2.title', 'Where are you in your journey?')}
        </h2>
      </div>

      <div className="px-4 pb-3 space-y-2">
        {/* Journey stage cards */}
        <div className="space-y-2">
          {stages.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => onJourneyChange(key)}
              className={cn(
                "w-full py-3 px-4 rounded-xl border-2 transition-all text-center",
                journeyStage === key
                  ? "bg-primary/10 border-primary shadow-sm"
                  : "bg-transparent border-border/30 hover:bg-muted/40 hover:border-border/50"
              )}
            >
              <p className={cn("text-base font-bold", journeyStage === key ? "text-primary" : "text-foreground")}>
                {t(labelKey)}
              </p>
            </button>
          ))}
        </div>

        {/* Pregnant-specific fields */}
        {journeyStage === 'pregnant' && (
          <div className="space-y-2 pt-1">
            <div>
              <label className="text-xs font-semibold text-foreground/70 block mb-1">
                {t('onboarding.pregnancyWeek', 'Week')} (1–42)
              </label>
              <input
                type="number"
                min={1} max={42}
                value={week}
                onChange={e => onWeekChange(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/70 block mb-1">
                <CalendarIcon className="w-3 h-3 inline me-1" />
                {t('onboarding.lastPeriod', 'Last Period')} ({t('onboarding.optional', 'optional')})
              </label>
              <div className="flex gap-1.5">
                <Popover open={lmpOpen} onOpenChange={setLmpOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("flex-1 justify-start text-left font-normal h-9 text-sm", !lmpDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="me-2 h-3.5 w-3.5 text-primary shrink-0" />
                      {lmpDate ? formatLocalized(lmpDate, "PPP", currentLanguage) : t('onboarding.selectDate', 'Pick a date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[400]" align="start">
                    <Calendar
                      mode="single"
                      selected={lmpDate}
                      onSelect={(d) => { onLmpChange(d); setLmpOpen(false); }}
                      disabled={(d) => d > new Date() || d < new Date("2020-01-01")}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {lmpDate && (
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => onLmpChange(undefined)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 pb-4 flex gap-2">
        <button onClick={onBack} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-1 hover:bg-muted/40 transition-colors">
          <BackIcon className="w-3.5 h-3.5" /> {t('onboarding.back', 'Back')}
        </button>
        <button onClick={onNext} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
          {t('onboarding.next', 'Continue')} <NextIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
