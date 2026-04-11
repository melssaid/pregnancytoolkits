import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Share2, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.pregnancytoolkits.android';

export const ShareAppCard = memo(function ShareAppCard() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const handleShare = useCallback(async () => {
    const shareText = isAr
      ? `🤰 جربي تطبيق "أدوات الحمل الذكية" — أكثر من 30 أداة ذكية مجانية لمتابعة الحمل وحاسبة الولادة ونصائح يومية مخصصة!\n\n📲 ${PLAY_STORE_URL}`
      : `🤰 Try "Pregnancy Toolkits" — 30+ free smart tools for pregnancy tracking, due date calculator & personalized daily tips!\n\n📲 ${PLAY_STORE_URL}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: isAr ? 'أدوات الحمل الذكية' : 'Pregnancy Toolkits',
          text: shareText,
        });
      } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
      } catch {}
    }
  }, [isAr]);

  return (
    <motion.button
      onClick={handleShare}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-primary/[0.08] to-pink-500/[0.04] border border-primary/15 hover:border-primary/25 transition-all group"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
        <Share2 className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0 text-start">
        <p className="text-xs font-bold text-foreground">
          {t('shareApp.title', { defaultValue: isAr ? 'شاركي التطبيق مع صديقاتك' : 'Share with expecting friends' })}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {t('shareApp.subtitle', { defaultValue: isAr ? 'ساعدي أمهات أخريات في رحلة الحمل 💕' : 'Help other moms on their journey 💕' })}
        </p>
      </div>
      <Heart className="w-4 h-4 text-primary/40 group-hover:text-primary/60 transition-colors" />
    </motion.button>
  );
});
