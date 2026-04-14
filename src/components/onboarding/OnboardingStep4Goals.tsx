import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Target, ChevronLeft, ChevronRight, Bell, Droplets, Pill, CalendarCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const notifications = [
    { icon: Pill, label: 'onboarding.step4.notifVitamins', value: notifVitamins, onChange: onNotifVitaminsChange, accent: 'from-emerald-500/15 to-emerald-500/5', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { icon: Droplets, label: 'onboarding.step4.notifWater', value: notifWater, onChange: onNotifWaterChange, accent: 'from-blue-500/15 to-blue-500/5', iconColor: 'text-blue-600 dark:text-blue-400' },
    { icon: CalendarCheck, label: 'onboarding.step4.notifAppointments', value: notifAppointments, onChange: onNotifAppointmentsChange, accent: 'from-amber-500/15 to-amber-500/5', iconColor: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-5 pt-4 pb-2 text-center">
        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-lg font-black text-foreground">
          {t('onboarding.step4.title', 'What matters most to you?')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('onboarding.step4.subtitle', 'Select your priorities')}
        </p>
      </div>

      <div className="px-4 pb-3 space-y-4">
        {/* Goals chips */}
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g, i) => {
            const isSelected = goals.includes(g);
            return (
              <motion.button
                key={g}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggleGoal(g)}
                className={cn(
                  "relative flex items-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                  isSelected
                    ? "bg-primary/10 border-primary/30 text-primary shadow-sm shadow-primary/10"
                    : "bg-card border-border/30 text-foreground/70 hover:bg-muted/40 hover:border-border/50"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 border border-border/40"
                )}>
                  {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </div>
                <span className="truncate">{t(`onboarding.step4.goal.${g}`)}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Notification prefs */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {t('onboarding.step4.notifications', 'Reminders')}
            </span>
          </div>

          {notifications.map((item, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              onClick={() => item.onChange(!item.value)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200",
                item.value
                  ? `bg-gradient-to-r ${item.accent} border-primary/20 shadow-sm`
                  : "bg-card border-border/20 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                  item.value ? "bg-background/80 shadow-sm" : "bg-muted/40"
                )}>
                  <item.icon className={cn("w-4.5 h-4.5", item.value ? item.iconColor : "text-muted-foreground")} strokeWidth={1.75} />
                </div>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  item.value ? "text-foreground" : "text-foreground/60"
                )}>
                  {t(item.label)}
                </span>
              </div>
              
              <div className={cn(
                "w-11 h-6 rounded-full p-[2px] transition-all duration-300",
                item.value ? "bg-primary" : "bg-muted-foreground/20"
              )}>
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-sm"
                  animate={{ x: item.value ? (isRtl ? 0 : 20) : (isRtl ? 20 : 0) }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-4 flex gap-2.5">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl border border-border/40 bg-card text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-muted/40 transition-all duration-200 text-foreground/70 shadow-sm"
        >
          <BackIcon className="w-4 h-4" /> {t('onboarding.back', 'Back')}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="flex-[1.5] py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/20"
        >
          {t('onboarding.next', 'Continue')} <NextIcon className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};
