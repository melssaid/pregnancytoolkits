import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bell, BellRing, Heart, Baby, Sparkles, ChevronLeft, ChevronRight, Pill, Droplets, CalendarCheck } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { sendDailyScheduleToSW } from '@/lib/scheduleNotifications';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  notifVitamins: boolean;
  onNotifVitaminsChange: (v: boolean) => void;
  notifWater: boolean;
  onNotifWaterChange: (v: boolean) => void;
  notifAppointments: boolean;
  onNotifAppointmentsChange: (v: boolean) => void;
  onFinish: () => void;
  onBack: () => void;
}

export const OnboardingStep5Notifications: React.FC<Props> = ({
  notifVitamins, onNotifVitaminsChange,
  notifWater, onNotifWaterChange,
  notifAppointments, onNotifAppointmentsChange,
  onFinish, onBack,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { supported, permission, enablePush } = usePushNotifications();
  const [loading, setLoading] = useState(false);

  const canEnable = supported && permission !== 'denied';

  const handleEnable = async () => {
    setLoading(true);
    const success = await enablePush();
    setLoading(false);
    if (success) {
      toast.success(t('notificationsPanel.pushEnabledSuccess', 'تم تفعيل الإشعارات بنجاح!'));
      sendDailyScheduleToSW();
    }
    try { localStorage.setItem('pt_push_onboarding_seen', JSON.stringify({ time: Date.now() })); } catch {}
    onFinish();
  };

  const handleSkip = () => {
    try { localStorage.setItem('pt_push_onboarding_seen', JSON.stringify({ time: Date.now() })); } catch {}
    onFinish();
  };

  const inAppReminders = [
    { icon: Pill, label: 'onboarding.step4.notifVitamins', value: notifVitamins, onChange: onNotifVitaminsChange, accent: 'from-emerald-500/15 to-emerald-500/5', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { icon: Droplets, label: 'onboarding.step4.notifWater', value: notifWater, onChange: onNotifWaterChange, accent: 'from-blue-500/15 to-blue-500/5', iconColor: 'text-blue-600 dark:text-blue-400' },
    { icon: CalendarCheck, label: 'onboarding.step4.notifAppointments', value: notifAppointments, onChange: onNotifAppointmentsChange, accent: 'from-amber-500/15 to-amber-500/5', iconColor: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <motion.div
      key="step5-notif"
      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="px-5 pt-2 pb-1.5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground leading-tight">
            {t('onboarding.notifications.title', 'Notifications & Reminders')}
          </h2>
          <p className="text-[10px] text-muted-foreground leading-snug">
            {t('onboarding.notifications.subtitle', 'Stay on track with helpful reminders')}
          </p>
        </div>
      </div>

      <div className="px-4 pb-2.5 space-y-3">
        {/* In-app reminders section */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
            {t('onboarding.notifications.inApp', 'In-App Reminders')}
          </p>
          <div className="space-y-1">
            {inAppReminders.map((item, idx) => (
              <button
                key={idx}
                onClick={() => item.onChange(!item.value)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all",
                  item.value
                    ? `bg-gradient-to-r ${item.accent} border-primary/20`
                    : "bg-card border-border/20 hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center",
                    item.value ? "bg-background/80 shadow-sm" : "bg-muted/40"
                  )}>
                    <item.icon className={cn("w-3.5 h-3.5", item.value ? item.iconColor : "text-muted-foreground")} strokeWidth={1.75} />
                  </div>
                  <span className={cn("text-[11px] font-medium", item.value ? "text-foreground" : "text-foreground/60")}>
                    {t(item.label)}
                  </span>
                </div>
                <div className={cn(
                  "w-9 h-[20px] rounded-full p-[2px] transition-all duration-300",
                  item.value ? "bg-primary" : "bg-muted-foreground/20"
                )}>
                  <motion.div
                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                    animate={{ x: item.value ? (isRtl ? 0 : 16) : (isRtl ? 16 : 0) }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Push notifications section */}
        {canEnable && (
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
              {t('onboarding.notifications.push', 'Push Notifications')}
            </p>
            <div className="rounded-xl bg-gradient-to-br from-primary/[0.06] to-transparent border border-primary/15 p-3">
              <div className="flex items-center gap-2.5 mb-2">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                >
                  <BellRing className="w-5 h-5 text-primary" />
                </motion.div>
                <div>
                  <p className="text-[11px] font-bold text-foreground">
                    {t('pushOnboarding.title', 'Don\'t miss important updates! 🔔')}
                  </p>
                  <p className="text-[9px] text-muted-foreground leading-snug">
                    {t('pushOnboarding.descShort', 'Daily tips & weekly baby updates')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleEnable}
                disabled={loading}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {t('pushOnboarding.enabling', 'Enabling...')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <Bell className="w-3.5 h-3.5" />
                    {t('pushOnboarding.enable', 'Enable Notifications')}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 pb-3 flex gap-2">
        <button onClick={onBack} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-medium flex items-center justify-center gap-1 hover:bg-muted/40 transition-colors">
          {isRtl ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          {t('onboarding.back', 'Back')}
        </button>
        <button
          onClick={handleSkip}
          className="flex-[2] py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {t('onboarding.notifications.continue', 'Continue')}
        </button>
      </div>
    </motion.div>
  );
};
