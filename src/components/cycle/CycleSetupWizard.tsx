import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronRight, ChevronLeft, Droplets } from "lucide-react";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { CycleSetup } from "@/hooks/useCycleData";

interface Props {
  onComplete: (setup: CycleSetup) => void;
}

const CYCLE_OPTIONS = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
const PERIOD_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export function CycleSetupWizard({ onComplete }: Props) {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const [step, setStep] = useState(0);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriodDate, setLastPeriodDate] = useState(format(subDays(new Date(), 14), "yyyy-MM-dd"));
  const [direction, setDirection] = useState(1);

  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  const handleFinish = () => {
    onComplete({ cycleLength, periodLength, lastPeriodDate });
  };

  // Generate last 60 days for date selection
  const recentDates = Array.from({ length: 60 }, (_, i) => subDays(new Date(), i));

  const steps = [
    // Step 0: Cycle length
    {
      title: t('toolsInternal.cycleTracker.setup.cycleLengthTitle', 'How long is your cycle?'),
      desc: t('toolsInternal.cycleTracker.setup.cycleLengthDesc', 'The number of days from the first day of one period to the first day of the next. Most cycles are 21–35 days.'),
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-5xl font-extrabold text-foreground tabular-nums">{cycleLength}</span>
            <span className="text-sm text-muted-foreground ms-1.5 font-medium">
              {t('toolsInternal.cycleTracker.day', 'day')}
            </span>
          </div>
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-3">
            <div className="flex flex-wrap justify-center gap-2.5">
              {CYCLE_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => setCycleLength(n)}
                  className={cn(
                    "w-12 h-12 rounded-xl text-base font-bold transition-all",
                    cycleLength === n
                      ? "bg-primary text-primary-foreground shadow-md scale-110"
                      : "bg-background text-foreground/70 hover:bg-muted active:scale-95 border border-border/40"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground text-center">
            {t('toolsInternal.cycleTracker.setup.dontKnow', "Don't know? 28 days is the average.")}
          </p>
        </div>
      ),
    },
    // Step 1: Period length
    {
      title: t('toolsInternal.cycleTracker.setup.periodLengthTitle', 'How long does your period last?'),
      desc: t('toolsInternal.cycleTracker.setup.periodLengthDesc', 'The number of days you typically bleed. Most periods last 3–7 days.'),
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-5xl font-extrabold text-foreground tabular-nums">{periodLength}</span>
            <span className="text-sm text-muted-foreground ms-1.5 font-medium">
              {t('toolsInternal.cycleTracker.day', 'day')}
            </span>
          </div>
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-3">
            <div className="flex flex-wrap justify-center gap-2.5">
              {PERIOD_OPTIONS.map(n => (
                <button
                  key={n}
                  onClick={() => setPeriodLength(n)}
                  className={cn(
                    "w-12 h-12 rounded-xl text-base font-bold transition-all",
                    periodLength === n
                      ? "bg-rose-500 text-white shadow-md scale-110"
                      : "bg-background text-foreground/70 hover:bg-muted active:scale-95 border border-border/40"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground text-center">
            {t('toolsInternal.cycleTracker.setup.periodHint', "Most women have 4–6 day periods.")}
          </p>
        </div>
      ),
    },
    // Step 2: Last period date
    {
      title: t('toolsInternal.cycleTracker.setup.lastPeriodTitle', 'When did your last period start?'),
      desc: t('toolsInternal.cycleTracker.setup.lastPeriodDesc', 'Select the first day of your most recent period.'),
      content: (
        <div className="space-y-3">
          <div className="text-center mb-2">
            <span className="text-lg font-bold text-foreground">
              {formatLocalized(new Date(lastPeriodDate + "T00:00:00"), "EEEE, d MMMM yyyy", currentLanguage)}
            </span>
          </div>
          <div className="max-h-[240px] overflow-y-auto rounded-2xl border border-border/50 bg-muted/20 p-2 space-y-0.5">
            {recentDates.map(date => {
              const dateStr = format(date, "yyyy-MM-dd");
              const isSelected = dateStr === lastPeriodDate;
              return (
                <button
                  key={dateStr}
                  onClick={() => setLastPeriodDate(dateStr)}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold"
                      : "hover:bg-muted/50 text-foreground/80"
                  )}
                >
                  <span>{formatLocalized(date, "EEEE, d MMMM", currentLanguage)}</span>
                  {isSelected && <Droplets className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="space-y-5 py-2">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/40" : "w-4 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          <div className="text-center space-y-1.5">
            <h2 className="text-base font-bold text-foreground">{currentStep.title}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              {currentStep.desc}
            </p>
          </div>
          {currentStep.content}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={goBack} className="flex-1 h-12 rounded-xl font-bold">
            {isRTL ? <ChevronRight className="w-4 h-4 me-1" /> : <ChevronLeft className="w-4 h-4 me-1" />}
            {t('toolsInternal.cycleTracker.setup.back', 'Back')}
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button onClick={goNext} className="flex-1 h-12 rounded-xl font-bold">
            {t('toolsInternal.cycleTracker.setup.next', 'Next')}
            {isRTL ? <ChevronLeft className="w-4 h-4 ms-1" /> : <ChevronRight className="w-4 h-4 ms-1" />}
          </Button>
        ) : (
          <Button onClick={handleFinish} className="flex-1 h-12 rounded-xl font-bold bg-rose-500 hover:bg-rose-600">
            <Calendar className="w-4 h-4 me-1.5" />
            {t('toolsInternal.cycleTracker.setup.start', 'Start Tracking')}
          </Button>
        )}
      </div>
    </div>
  );
}
