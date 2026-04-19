import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, X, Gift, Zap } from "lucide-react";
import { toast } from "sonner";
import { useActiveCoupon } from "@/hooks/useActiveCoupon";
import { useAIUsage } from "@/contexts/AIUsageContext";

const PROMO_CODE = "PREG10";
const DISMISS_KEY = "preg10_banner_dismissed_v1";
const CLAIMED_KEY = "preg10_banner_claimed_v1";

const labels: Record<string, {
  badge: string;
  title: string;
  desc: string;
  cta: string;
  copyHint: string;
  copied: string;
  claimed: string;
  claimedDesc: string;
  applying: string;
  errorPrefix: string;
}> = {
  ar: {
    badge: "هدية حصرية",
    title: "١٠ نقاط ذكاء اصطناعي مجاناً 🎁",
    desc: "استخدمي الكود التالي لتفعيل تحليلاتك الذكية فوراً",
    cta: "تفعيل الكود الآن",
    copyHint: "نسخ",
    copied: "تم النسخ ✓",
    claimed: "تم التفعيل بنجاح! 🎉",
    claimedDesc: "أُضيفت ١٠ نقاط إلى رصيدكِ — استمتعي بالتحليلات الذكية",
    applying: "جارٍ التفعيل...",
    errorPrefix: "تعذّر التفعيل",
  },
  en: {
    badge: "Exclusive Gift",
    title: "10 Free AI Credits 🎁",
    desc: "Use this code to instantly unlock smart analyses",
    cta: "Activate Code Now",
    copyHint: "Copy",
    copied: "Copied ✓",
    claimed: "Activated successfully! 🎉",
    claimedDesc: "10 credits added to your balance — enjoy smart insights",
    applying: "Activating...",
    errorPrefix: "Could not activate",
  },
  de: {
    badge: "Exklusives Geschenk",
    title: "10 kostenlose KI-Credits 🎁",
    desc: "Code verwenden, um smarte Analysen sofort freizuschalten",
    cta: "Code jetzt aktivieren",
    copyHint: "Kopieren",
    copied: "Kopiert ✓",
    claimed: "Erfolgreich aktiviert! 🎉",
    claimedDesc: "10 Credits hinzugefügt — viel Spaß",
    applying: "Aktiviere...",
    errorPrefix: "Aktivierung fehlgeschlagen",
  },
  fr: {
    badge: "Cadeau exclusif",
    title: "10 crédits IA gratuits 🎁",
    desc: "Utilisez ce code pour débloquer des analyses intelligentes",
    cta: "Activer le code",
    copyHint: "Copier",
    copied: "Copié ✓",
    claimed: "Activé avec succès ! 🎉",
    claimedDesc: "10 crédits ajoutés à votre solde",
    applying: "Activation...",
    errorPrefix: "Échec de l'activation",
  },
  es: {
    badge: "Regalo exclusivo",
    title: "10 créditos IA gratis 🎁",
    desc: "Usa este código para desbloquear análisis inteligentes",
    cta: "Activar código",
    copyHint: "Copiar",
    copied: "Copiado ✓",
    claimed: "¡Activado con éxito! 🎉",
    claimedDesc: "10 créditos añadidos a tu saldo",
    applying: "Activando...",
    errorPrefix: "No se pudo activar",
  },
  pt: {
    badge: "Presente exclusivo",
    title: "10 créditos IA grátis 🎁",
    desc: "Use este código para desbloquear análises inteligentes",
    cta: "Ativar código",
    copyHint: "Copiar",
    copied: "Copiado ✓",
    claimed: "Ativado com sucesso! 🎉",
    claimedDesc: "10 créditos adicionados ao seu saldo",
    applying: "Ativando...",
    errorPrefix: "Falha na ativação",
  },
  tr: {
    badge: "Özel Hediye",
    title: "10 Ücretsiz AI Kredisi 🎁",
    desc: "Akıllı analizleri hemen açmak için kodu kullan",
    cta: "Kodu Şimdi Etkinleştir",
    copyHint: "Kopyala",
    copied: "Kopyalandı ✓",
    claimed: "Başarıyla etkinleştirildi! 🎉",
    claimedDesc: "Bakiyene 10 kredi eklendi",
    applying: "Etkinleştiriliyor...",
    errorPrefix: "Etkinleştirilemedi",
  },
};

interface Props {
  lang: string;
}

const Preg10PromoBanner = memo(function Preg10PromoBanner({ lang }: Props) {
  const l = labels[lang] || labels.en;
  const isAr = lang === "ar";
  const { redeemCoupon, redeeming } = useActiveCoupon();
  const { refresh } = useAIUsage();

  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
  });
  const [claimed, setClaimed] = useState(() => {
    try { return localStorage.getItem(CLAIMED_KEY) === "1"; } catch { return false; }
  });
  const [copied, setCopied] = useState(false);

  if (dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch {}
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      toast.success(l.copied);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const handleActivate = async () => {
    if (claimed || redeeming) return;
    const result = await redeemCoupon(PROMO_CODE);
    if (result.success) {
      setClaimed(true);
      try { localStorage.setItem(CLAIMED_KEY, "1"); } catch {}
      refresh();
      toast.success(l.claimed);
    } else {
      toast.error(`${l.errorPrefix}: ${result.error || ""}`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {/* Premium gradient card — deep royal contrast */}
        <div
          className="relative rounded-2xl overflow-hidden border border-amber-300/25"
          style={{
            background: 'linear-gradient(135deg, hsl(248 55% 18%) 0%, hsl(258 50% 22%) 45%, hsl(280 45% 26%) 100%)',
            boxShadow: '0 12px 36px -10px hsl(250 60% 15% / 0.55), 0 2px 10px -2px hsl(280 40% 20% / 0.35), inset 0 1px 0 hsl(45 90% 70% / 0.18)',
          }}
        >
          {/* Subtle radial glow */}
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{ background: 'radial-gradient(circle at 85% 0%, hsl(45 95% 60% / 0.18) 0%, transparent 55%)' }}
          />

          {/* Animated shimmer top bar — gold */}
          <div className="h-[3px] bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 relative overflow-hidden">
            <motion.div
              className="absolute h-full w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: "linear" }}
            />
          </div>

          {/* Floating sparkles decoration */}
          <motion.div
            className="absolute top-2 end-10 text-amber-400/40"
            animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
          </motion.div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            aria-label="dismiss"
            className="absolute top-2 end-2 z-10 w-6 h-6 rounded-full bg-white/60 dark:bg-black/20 flex items-center justify-center hover:bg-white/90 dark:hover:bg-black/30 backdrop-blur-sm transition-colors"
          >
            <X className="w-3 h-3 text-foreground/60" />
          </button>

          <div className="px-4 pt-3.5 pb-4">
            {/* Badge */}
            <div className="flex items-center gap-1.5 mb-2.5">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10px] font-extrabold shadow-md"
                style={{
                  background: 'linear-gradient(90deg, hsl(25 90% 55%) 0%, hsl(340 75% 58%) 100%)',
                  boxShadow: '0 2px 8px -2px hsl(25 80% 50% / 0.5)',
                }}
              >
                <Zap className="w-2.5 h-2.5 fill-white" strokeWidth={3} />
                {l.badge}
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-[15px] font-extrabold text-foreground leading-tight mb-1"
              style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : undefined }}
            >
              {claimed ? l.claimed : l.title}
            </h3>
            <p className="text-[11px] text-foreground/65 leading-snug mb-3">
              {claimed ? l.claimedDesc : l.desc}
            </p>

            {!claimed && (
              <>
                {/* Code display row */}
                <div
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-amber-300/40 dark:border-amber-500/25 mb-2.5 backdrop-blur-sm"
                  style={{ boxShadow: 'inset 0 1px 2px hsl(25 50% 40% / 0.08)' }}
                >
                  <Gift className="w-4 h-4 text-orange-500 flex-shrink-0" strokeWidth={2.2} />
                  <span
                    className="flex-1 font-mono font-black text-[18px] tracking-[0.2em] text-foreground select-all"
                    style={{
                      background: 'linear-gradient(90deg, hsl(25 85% 45%), hsl(340 70% 50%))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {PROMO_CODE}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 active:scale-95 transition-all"
                    aria-label={l.copyHint}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-foreground/70" strokeWidth={2.2} />
                    )}
                    <span className="text-[10px] font-bold text-foreground/70">
                      {copied ? l.copied : l.copyHint}
                    </span>
                  </button>
                </div>

                {/* Activate CTA */}
                <motion.button
                  onClick={handleActivate}
                  disabled={redeeming}
                  whileTap={{ scale: 0.97 }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-[13px] font-extrabold shadow-lg disabled:opacity-70 transition-all"
                  style={{
                    background: 'linear-gradient(90deg, hsl(25 90% 55%) 0%, hsl(340 75% 58%) 100%)',
                    boxShadow: '0 6px 16px -4px hsl(25 80% 50% / 0.5), 0 2px 4px -1px hsl(340 60% 50% / 0.3)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
                  {redeeming ? l.applying : l.cta}
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

export default Preg10PromoBanner;
