import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, Shield, X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { sendDailyScheduleToSW } from '@/lib/scheduleNotifications';
import { toast } from 'sonner';

/**
 * Smart pre-prompt banner shown on the dashboard when push notifications
 * haven't been enabled yet. Uses a friendly 2-step approach:
 * 1. Show an attractive in-app prompt explaining the benefits
 * 2. Only trigger the browser permission dialog when user clicks "Enable"
 */
export function PushPermissionPrompt() {
  const { t } = useTranslation();
  const { supported, permission, enabled, enablePush } = usePushNotifications();
  const [dismissed, setDismissed] = useState(() => {
    try {
      const raw = localStorage.getItem('pushPromptDismissed');
      if (!raw) return false;
      const data = JSON.parse(raw);
      // Re-show after 7 days
      return Date.now() - data.time < 7 * 24 * 60 * 60 * 1000;
    } catch { return false; }
  });
  const [loading, setLoading] = useState(false);

  // Don't show if already enabled, not supported, denied, or dismissed
  if (!supported || enabled || permission === 'denied' || dismissed) return null;

  const handleEnable = async () => {
    setLoading(true);
    const success = await enablePush();
    setLoading(false);
    if (success) {
      toast.success(t('notificationsPanel.pushEnabledSuccess'));
      sendDailyScheduleToSW();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pushPromptDismissed', JSON.stringify({ time: Date.now() }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-4 shadow-sm"
      >
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 end-2.5 p-1 rounded-lg hover:bg-muted/60 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md flex-shrink-0">
            <BellRing className="w-5 h-5 text-primary-foreground" />
          </div>

          <div className="flex-1 min-w-0 pe-4">
            <h4 className="text-sm font-bold text-foreground leading-tight">
              {t('notificationsPanel.promptTitle')}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {t('notificationsPanel.promptDesc')}
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[
                { icon: Bell, label: t('notificationsPanel.promptBenefit1') },
                { icon: Shield, label: t('notificationsPanel.promptBenefit2') },
                { icon: Sparkles, label: t('notificationsPanel.promptBenefit3') },
              ].map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 text-[10px] font-medium text-primary"
                >
                  <b.icon className="w-2.5 h-2.5" />
                  {b.label}
                </span>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleEnable}
              disabled={loading}
              className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {t('notificationsPanel.promptEnabling')}
                </span>
              ) : (
                t('notificationsPanel.promptEnable')
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
