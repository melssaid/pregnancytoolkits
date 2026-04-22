import { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, X, Gift, Zap } from "lucide-react";
import { toast } from "sonner";
import { useActiveCoupon } from "@/hooks/useActiveCoupon";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { getQuotaState } from "@/services/smartEngine";


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
  added: string;        // "+10 added"
  newBalance: string;   // "New balance"
  points: string;       // "points"
  bonusLabel: string;   // "Bonus"
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
    added: "تمت إضافة ١٠ نقاط",
    newBalance: "رصيدكِ الجديد",
    points: "نقطة",
    bonusLabel: "مكافأة",
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
    added: "10 credits added",
    newBalance: "New balance",
    points: "credits",
    bonusLabel: "Bonus",
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
    added: "10 Credits hinzugefügt",
    newBalance: "Neuer Saldo",
    points: "Credits",
    bonusLabel: "Bonus",
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
    added: "10 crédits ajoutés",
    newBalance: "Nouveau solde",
    points: "crédits",
    bonusLabel: "Bonus",
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
    added: "10 créditos añadidos",
    newBalance: "Nuevo saldo",
    points: "créditos",
    bonusLabel: "Bono",
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
    added: "10 créditos adicionados",
    newBalance: "Novo saldo",
    points: "créditos",
    bonusLabel: "Bônus",
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
    added: "10 kredi eklendi",
    newBalance: "Yeni bakiye",
    points: "kredi",
    bonusLabel: "Bonus",
  },
};


interface Props {
  lang: string;
}

const Preg10PromoBanner = memo(function Preg10PromoBanner({ lang }: Props) {
  const l = labels[lang] || labels.en;
  const isAr = lang === "ar";
  const { activeCoupon, isActive, redeemCoupon, redeeming } = useActiveCoupon();
  const { refresh } = useAIUsage();

  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
  });
  const [claimed, setClaimed] = useState(() => {
    try { return localStorage.getItem(CLAIMED_KEY) === "1"; } catch { return false; }
  });
  const [copied, setCopied] = useState(false);
  const [newBalance, setNewBalance] = useState<number | null>(null);

  const hasClaimedPromo = useMemo(
    () => claimed || (isActive && activeCoupon?.code === PROMO_CODE),
    [activeCoupon?.code, claimed, isActive]
  );

  if (dismissed && !hasClaimedPromo) return null;

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
      // التقاط الرصيد الجديد بعد التطبيق لإظهار الإيماءة الاحترافية
      setTimeout(() => {
        const state = getQuotaState();
        setNewBalance(state.remaining);
      }, 200);
      // إيماءة منبثقة احترافية
      toast.success(`✨ ${l.added}`, {
        description: l.claimedDesc,
        duration: 5000,
      });
    } else {
      toast.error(`${l.errorPrefix}: ${result.error || ""}`);
    }
  };


  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {hasClaimedPromo ? (
          <div className="relative overflow-hidden rounded-xl border border-primary/15 bg-secondary/60 px-3 py-2.5 shadow-sm">
            {/* subtle top accent line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="relative flex items-center gap-2.5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                <Check className="w-4 h-4 text-primary" strokeWidth={2.5} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-primary">
                    {isAr ? 'تم الاستخدام' : 'USED'}
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {PROMO_CODE}
                  </span>
                </div>
                <p
                  className="text-[12px] font-extrabold text-foreground leading-tight mt-0.5"
                  style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : undefined }}
                >
                  {l.claimed}
                </p>
              </div>

              <div className="flex-shrink-0 rounded-lg border border-primary/10 bg-primary/5 px-2 py-1 text-center">
                <div className="text-[10px] font-bold text-primary">{l.bonusLabel}</div>
                <div className="text-[13px] font-black text-primary">+10</div>
              </div>
            </div>

            {newBalance !== null && (
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                {l.newBalance}: {newBalance} {l.points}
              </p>
            )}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl border border-primary/15 bg-secondary/40 shadow-sm">
            {/* Primary accent top bar */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              aria-label="dismiss"
              className="absolute top-1.5 end-1.5 z-10 w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>

            <div className="relative px-3 pt-2 pb-2.5">
              {/* Header row: badge + title inline */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-[10px] font-extrabold text-primary">
                  <Zap className="w-3 h-3" strokeWidth={2.5} />
                  {l.badge}
                </span>
                <h3
                  className="text-[13px] font-extrabold text-foreground leading-tight"
                  style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : undefined }}
                >
                  {l.title}
                </h3>
              </div>

              <p className="text-[11px] text-muted-foreground leading-snug mb-2">
                {l.desc}
              </p>

              {/* Code + CTA in one compact row */}
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-background border border-border flex-1 min-w-0"
                >
                  <Gift className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2} />
                  <span
                    className="font-mono font-black text-[15px] tracking-[0.15em] select-all text-primary"
                  >
                    {PROMO_CODE}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/60 hover:bg-muted transition-all active:scale-95"
                    aria-label={l.copyHint}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-success" strokeWidth={2.5} />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                    )}
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {copied ? l.copied : l.copyHint}
                    </span>
                  </button>
                </div>

                <motion.button
                  onClick={handleActivate}
                  disabled={redeeming}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-extrabold shadow-sm disabled:opacity-70 transition-all whitespace-nowrap bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                  {redeeming ? l.applying : l.cta}
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

export default Preg10PromoBanner;
