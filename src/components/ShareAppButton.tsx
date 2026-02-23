import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const APP_URL = 'https://pregnancytoolkits.lovable.app';

export function ShareAppButton() {
  const { t } = useTranslation();

  const shareText = t('layout.share.message', '🤰 Check out Pregnancy Toolkits — 42+ free wellness tools for your pregnancy journey!');
  const shareTitle = t('layout.share.title', 'Pregnancy Toolkits');

  const handleShare = async () => {
    // Try native Web Share API first (works great in WebView/mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: APP_URL,
        });
        return;
      } catch (err) {
        // User cancelled or error — fall through to clipboard
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n${APP_URL}`);
      toast.success(t('layout.share.copied', 'Link copied! Share it with your friends 💕'));
    } catch {
      toast.error(t('layout.share.failed', 'Could not share'));
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all active:scale-[0.98]"
    >
      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
        <Share2 className="w-4 h-4 text-primary" />
      </div>
      <div className="text-start flex-1">
        <p className="text-xs font-semibold text-foreground">{t('layout.share.buttonTitle', 'Share with Friends')}</p>
        <p className="text-[10px] text-muted-foreground">{t('layout.share.buttonSubtitle', 'Invite a friend via WhatsApp, SMS & more')}</p>
      </div>
      <Share2 className="w-3.5 h-3.5 text-muted-foreground/40" />
    </button>
  );
}
