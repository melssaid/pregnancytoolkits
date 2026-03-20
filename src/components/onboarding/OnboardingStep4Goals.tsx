import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Target, ChevronLeft, ChevronRight, Bell, Droplets, Pill, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

const GOALS = [
  'nutrition',
  'fitness',
  'sleep',
  'mentalHealth',
  'weightTracking',
  'babyCare',
] as const;

interface Props {
  goals: string[];
  onGoalsChange: (goals: string[]) => void;
  notifVitamins: boolean;
  onNotifVitaminsChange: (v: boolean) => void;
  notifWater: boolean;
  onNotifWaterChange: (v: boolean) => void;
  notifAppointments: boolean;
  onNotifAppointmentsChange: (v: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

export const OnboardingStep4Goals: React.FC<Props> = ({
  goals, onGoalsChange,
  notifVitamins, onNotifVitaminsChange,
  notifWater, onNotifWaterChange,
  notifAppointments, onNotifAppointmentsChange,
  onNext, onBack,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;

  const toggleGoal = (g: string) => {
    if (goals.includes(g)) {
      onGoalsChange(goals.filter(x => x !== g));
    } else {
      onGoalsChange([...goals, g]);
    }
  };

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-5 pt-3 pb-2 text-center">
        <div className="w-9 h-9 mx-auto mb-1.5 rounded-lg bg-primary/10 flex items-center justify-center">
          <Target className="w-4.5 h-4.5 text-primary" />
        </div>
        <h2 className="text-sm font-bold text-foreground">
          {t('onboarding.step4.title', 'What matters most to you?')}
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {t('onboarding.step4.subtitle', 'Select your priorities')}
        </p>
      </div>

      <div className="px-4 pb-3 space-y-3">
        {/* Goals chips */}
        <div className="flex flex-wrap gap-1.5">
          {GOALS.map((g) => {
            const isSelected = goals.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggleGoal(g)}
                className={cn(
                  "px-3 py-2 rounded-xl border text-xs font-medium transition-all",
                  isSelected
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-transparent border-border/40 text-foreground/60 hover:bg-muted/40"
                )}
              >
                {t(`onboarding.step4.goal.${g}`)}
              </button>
            );
          })}
        </div>

        {/* Notification prefs */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground block mb-1.5">
            <Bell className="w-3 h-3 inline me-1" />
            {t('onboarding.step4.notifications', 'Reminders')}
          </label>

          <div className="space-y-1.5">
            {[
              { icon: Pill, label: 'onboarding.step4.notifVitamins', value: notifVitamins, onChange: onNotifVitaminsChange },
              { icon: Droplets, label: 'onboarding.step4.notifWater', value: notifWater, onChange: onNotifWaterChange },
              { icon: CalendarCheck, label: 'onboarding.step4.notifAppointments', value: notifAppointments, onChange: onNotifAppointmentsChange },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border/20">
                <div className="flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-foreground/80">{t(item.label)}</span>
                </div>
                <Switch checked={item.value} onCheckedChange={item.onChange} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-4 flex gap-2">
        <button onClick={onBack} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-medium flex items-center justify-center gap-1 hover:bg-muted/40 transition-colors">
          <BackIcon className="w-3.5 h-3.5" /> {t('onboarding.back', 'Back')}
        </button>
        <button onClick={onNext} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
          {t('onboarding.next', 'Continue')} <NextIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
