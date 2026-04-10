import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, X, Heart, Baby, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { sendDailyScheduleToSW } from '@/lib/scheduleNotifications';
import { toast } from 'sonner';

const STORAGE_KEY = 'pt_push_onboarding_seen';

/**
 * Full-screen bottom sheet that appears on first app open
 * asking the user to enable push notifications.
 */
export function PushOnboardingSheet() {
  const { t } = useTranslation();
  const { supported, permission, enabled, enablePush } = usePushNotifications();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Don't show if not supported, already enabled, or denied
    if (!supported || enabled || permission === 'denied') return;

    // Don't show if already seen
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (seen) return;
    } catch {}

    // Show after a short delay so the app loads first
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [supported, enabled, permission]);

  const handleEnable = async () => {
    setLoading(true);
    const success = await enablePush();
    setLoading(false);
    if (success) {
      toast.success(t('notificationsPanel.pushEnabledSuccess'));
      sendDailyScheduleToSW();
    }
    dismiss();
  };

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ time: Date.now() }));
    } catch {}
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-[101] bg-card rounded-t-3xl shadow-2xl max-w-lg mx-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 end-4 p-1.5 rounded-full hover:bg-muted/60 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="px-6 pb-8 pt-2 text-center">
              {/* Animated Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-lg"
              >
                <motion.div
                  animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                  transition={{ duration: 1.5, delay: 0.5, repeat: 1 }}
                >
                  <BellRing className="w-9 h-9 text-primary-foreground" />
                </motion.div>
              </motion.div>

              {/* Title */}
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t('pushOnboarding.title', 'لا تفوّتي أي تحديث مهم! 🔔')}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {t('pushOnboarding.desc', 'فعّلي الإشعارات لتصلك نصائح يومية وتذكيرات مهمة لصحتك وصحة طفلك')}
              </p>

              {/* Benefits */}
              <div className="space-y-2.5 mb-6 text-start">
                {[
                  { icon: Heart, text: t('pushOnboarding.benefit1', 'نصائح صحية مخصصة لأسبوع حملك'), color: 'text-pink-500' },
                  { icon: Baby, text: t('pushOnboarding.benefit2', 'تحديثات تطور طفلك أسبوعياً'), color: 'text-blue-500' },
                  { icon: Sparkles, text: t('pushOnboarding.benefit3', 'تذكيرات بالمواعيد والفيتامينات'), color: 'text-amber-500' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-card flex items-center justify-center shadow-sm ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={handleEnable}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60"
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

              {/* Skip */}
              <button
                onClick={dismiss}
                className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('pushOnboarding.skip', 'ليس الآن')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
