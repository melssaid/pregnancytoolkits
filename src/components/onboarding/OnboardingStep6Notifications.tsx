import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bell, BellRing, Heart, Baby, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { sendDailyScheduleToSW } from '@/lib/scheduleNotifications';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  onFinish: () => void;
  onBack: () => void;
}

export const OnboardingStep6Notifications: React.FC<Props> = ({ onFinish, onBack }) => {
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
    // Mark as seen so standalone sheet won't show
    try { localStorage.setItem('pt_push_onboarding_seen', JSON.stringify({ time: Date.now() })); } catch {}
    onFinish();
  };

  const handleSkip = () => {
    try { localStorage.setItem('pt_push_onboarding_seen', JSON.stringify({ time: Date.now() })); } catch {}
    onFinish();
  };

  const benefits = [
    { icon: Heart, text: t('pushOnboarding.benefit1', 'نصائح صحية مخصصة لأسبوع حملك'), color: 'text-pink-500' },
    { icon: Baby, text: t('pushOnboarding.benefit2', 'تحديثات تطور طفلك أسبوعياً'), color: 'text-blue-500' },
    { icon: Sparkles, text: t('pushOnboarding.benefit3', 'تذكيرات بالمواعيد والفيتامينات'), color: 'text-amber-500' },
  ];

  return (
    <motion.div
      key="step6"
      initial={{ opacity: 0, x: isRtl ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? 40 : -40 }}
      transition={{ duration: 0.25 }}
      className="px-5 py-4 space-y-4"
    >
      {/* Icon */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg"
        >
          <motion.div
            animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
            transition={{ duration: 1.5, delay: 0.3, repeat: 1 }}
          >
            <BellRing className="w-7 h-7 text-primary-foreground" />
          </motion.div>
        </motion.div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-foreground">
          {t('pushOnboarding.title', 'لا تفوّتي أي تحديث مهم! 🔔')}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {t('pushOnboarding.desc', 'فعّلي الإشعارات لتصلك نصائح يومية وتذكيرات مهمة لصحتك وصحة طفلك')}
        </p>
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        {benefits.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40"
          >
            <div className={cn("w-8 h-8 rounded-lg bg-card flex items-center justify-center shadow-sm", item.color)}>
              <item.icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-foreground">{item.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        {canEnable && (
          <button
            onClick={handleEnable}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t('pushOnboarding.enabling', 'جاري التفعيل...')}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Bell className="w-4 h-4" />
                {t('pushOnboarding.enable', 'تفعيل الإشعارات')}
              </span>
            )}
          </button>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-1"
          >
            {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {t('onboarding.back', 'رجوع')}
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 py-2.5 rounded-xl bg-muted/60 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            {canEnable
              ? t('pushOnboarding.skip', 'ليس الآن')
              : t('onboarding.finish', 'إنهاء')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
