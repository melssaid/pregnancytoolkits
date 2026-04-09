import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Share2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';
import { openWhatsApp } from '@/lib/whatsappShare';

export const WeekCertificateCard = memo(function WeekCertificateCard() {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const week = profile.pregnancyWeek;

  const [dismissed, setDismissed] = useState(false);
  const [lastSeenWeek, setLastSeenWeek] = useState<number>(0);

  useEffect(() => {
    try {
      const seen = parseInt(localStorage.getItem('pt_cert_last_week') || '0', 10);
      setLastSeenWeek(seen);
    } catch {}
  }, []);

  if (week <= 0 || week <= lastSeenWeek || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('pt_cert_last_week', String(week));
    } catch {}
  };

  const handleShare = () => {
    const msg = `🏆 *${t('certificate.shareTitle', { week, defaultValue: `أكملت الأسبوع ${week} من رحلة حملي!` })}* 🎉

✨ ${t('certificate.shareBody', { defaultValue: 'كل أسبوع هو إنجاز جديد في رحلة الأمومة' })}

━━━━━━━━━━━━━━━━━━━━
🤰 _Pregnancy Toolkits_`;
    openWhatsApp(msg);
    handleDismiss();
  };

  const milestoneEmoji = week === 12 ? '🎊' : week === 20 ? '🎉' : week === 28 ? '🌟' : week === 37 ? '👶' : '🏆';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-card to-primary/5 border border-amber-500/20 p-4 relative overflow-hidden"
      >
        <button onClick={handleDismiss} className="absolute top-2 end-2 p-1 rounded-full hover:bg-muted/50">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
            <span className="text-2xl">{milestoneEmoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-foreground">
                {t('certificate.title', { week, defaultValue: `أكملتِ الأسبوع ${week}!` })}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {t('certificate.subtitle', { defaultValue: 'إنجاز رائع في رحلة حملك 💪' })}
            </p>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:opacity-90 transition-opacity"
        >
          <Share2 className="h-3.5 w-3.5" />
          {t('certificate.share', { defaultValue: 'شاركي إنجازك' })}
        </button>
      </motion.div>
    </AnimatePresence>
  );
});
