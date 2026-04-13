import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.pregnancytoolkits.android';

const shareTexts: Record<string, { title: string; text: string; btnLabel: string; btnSub: string; copied: string }> = {
  ar: {
    title: 'أدوات الحمل الذكية',
    text: `جربي تطبيق "أدوات الحمل الذكية" — أكثر من 30 أداة ذكية مجانية لمتابعة الحمل وحاسبة الولادة ونصائح يومية مخصصة!\n\n${PLAY_STORE_URL}`,
    btnLabel: 'شاركي التطبيق مع صديقاتك',
    btnSub: 'عبر واتساب وتيليجرام وغيرها',
    copied: 'تم نسخ رابط التطبيق',
  },
  en: {
    title: 'Pregnancy Toolkits',
    text: `Try "Pregnancy Toolkits" — 30+ free smart tools for pregnancy tracking, due date calculator & personalized daily tips!\n\n${PLAY_STORE_URL}`,
    btnLabel: 'Share with expecting friends',
    btnSub: 'Via WhatsApp, Telegram & more',
    copied: 'App link copied!',
  },
  de: {
    title: 'Schwangerschafts-Toolkit',
    text: `Probiere "Schwangerschafts-Toolkit" — 30+ kostenlose Tools für Schwangerschafts-Tracking, Geburtsterminrechner & tägliche Tipps!\n\n${PLAY_STORE_URL}`,
    btnLabel: 'Mit Freundinnen teilen',
    btnSub: 'Über WhatsApp, Telegram & mehr',
    copied: 'App-Link kopiert!',
  },
  fr: {
    title: 'Outils de Grossesse',
    text: `Essayez "Outils de Grossesse" — 30+ outils gratuits pour le suivi de grossesse, calculateur de date & conseils quotidiens!\n\n${PLAY_STORE_URL}`,
    btnLabel: 'Partager avec des amies',
    btnSub: 'Via WhatsApp, Telegram et plus',
    copied: 'Lien copié !',
  },
  es: {
    title: 'Herramientas de Embarazo',
    text: `Prueba "Herramientas de Embarazo" — 30+ herramientas gratuitas para seguimiento del embarazo y consejos diarios!\n\n${PLAY_STORE_URL}`,
    btnLabel: 'Comparte con amigas',
    btnSub: 'Por WhatsApp, Telegram y más',
    copied: '¡Enlace copiado!',
  },
  pt: {
    title: 'Ferramentas de Gravidez',
    text: `Experimente "Ferramentas de Gravidez" — 30+ ferramentas gratuitas para acompanhamento da gravidez e dicas diárias!\n\n${PLAY_STORE_URL}`,
    btnLabel: 'Compartilhe com amigas',
    btnSub: 'Via WhatsApp, Telegram e mais',
    copied: 'Link copiado!',
  },
  tr: {
    title: 'Gebelik Araçları',
    text: `"Gebelik Araçları" uygulamasını deneyin — 30+ ücretsiz akıllı hamilelik takip aracı ve günlük ipuçları!\n\n${PLAY_STORE_URL}`,
    btnLabel: 'Arkadaşlarınla paylaş',
    btnSub: 'WhatsApp, Telegram ve diğerleri',
    copied: 'Bağlantı kopyalandı!',
  },
};

export const ShareAppCard = memo(function ShareAppCard() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const labels = shareTexts[lang] || shareTexts.en;

  const handleShare = useCallback(async () => {
    // Use native share API (opens all social apps: WhatsApp, Telegram, Twitter, etc.)
    if (navigator.share) {
      try {
        await navigator.share({
          title: labels.title,
          text: labels.text,
          url: PLAY_STORE_URL,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(labels.text);
      toast.success(labels.copied);
    } catch {
      // Last resort: manual copy
      const textarea = document.createElement('textarea');
      textarea.value = labels.text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success(labels.copied);
    }
  }, [labels]);

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
        <p className="text-xs font-bold text-foreground">{labels.btnLabel}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{labels.btnSub}</p>
      </div>
    </motion.button>
  );
});
