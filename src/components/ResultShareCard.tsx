import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Share2, Download, Baby } from "lucide-react";
import { openWhatsApp } from "@/lib/whatsappShare";
import { cn } from "@/lib/utils";

interface ResultShareCardProps {
  toolName: string;
  toolId: string;
  resultSummary: string;
  details?: { label: string; value: string }[];
  emoji?: string;
}

export function ResultShareCard({ toolName, toolId, resultSummary, details, emoji = "🤰" }: ResultShareCardProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const handleWhatsAppShare = () => {
    let msg = `${emoji} *${toolName}*\n\n`;
    msg += `📋 ${resultSummary}\n`;
    
    if (details?.length) {
      msg += '\n';
      details.forEach(d => {
        msg += `• ${d.label}: *${d.value}*\n`;
      });
    }
    
    msg += `\n━━━━━━━━━━━━━━━━━━━━\n🤰 _Pregnancy Toolkits_\n📲 https://play.google.com/store/apps/details?id=app.pregnancytoolkits.android`;
    openWhatsApp(msg);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      handleWhatsAppShare();
      return;
    }

    let text = `${emoji} ${toolName}\n\n${resultSummary}`;
    if (details?.length) {
      text += '\n\n' + details.map(d => `${d.label}: ${d.value}`).join('\n');
    }
    text += '\n\n🤰 Pregnancy Toolkits';

    try {
      await navigator.share({ title: toolName, text });
    } catch { /* user cancelled */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/8"
    >
      {/* Header band */}
      <div className="bg-gradient-to-r from-primary/15 to-pink-500/10 px-4 py-2.5 flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-primary/70 font-bold">
            {t('resultShare.yourResult', 'Your Result')}
          </p>
          <p className="text-xs font-bold text-foreground truncate">{toolName}</p>
        </div>
        <Baby className="w-5 h-5 text-primary/40" />
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm font-semibold text-foreground mb-2">{resultSummary}</p>
        
        {details && details.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {details.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-bold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Share buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366] text-white text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <Share2 className="h-3.5 w-3.5" />
            WhatsApp
          </button>
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted border border-border text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            {t('resultShare.share', 'Share')}
          </button>
        </div>
      </div>

      {/* Brand footer */}
      <div className="px-4 py-1.5 bg-muted/30 border-t border-border/30 text-center">
        <span className="text-[9px] text-muted-foreground/60 font-medium">
          🤰 Pregnancy Toolkits
        </span>
      </div>
    </motion.div>
  );
}

export default ResultShareCard;
