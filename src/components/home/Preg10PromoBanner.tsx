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
      setTimeout(() => {
        const state = getQuotaState();
        setNewBalance(state.remaining);
      }, 200);
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
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {hasClaimedPromo ? (
          <div className="relative flex items-center gap-2.5 rounded-xl border border-primary/15 bg-secondary/60 px-3 py-2 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10">
              <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
            </div>
            <p className="text-[11px] font-bold text-foreground">
              {l.claimed}
            </p>
            <div className="ms-auto shrink-0 rounded-md border border-primary/10 bg-primary/5 px-2 py-0.5 text-center">
              <span className="text-[11px] font-black text-primary">+10</span>
            </div>
          </div>
        ) : (
          <div className="relative flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 px-3 py-2 shadow-[var(--shadow-card)] backdrop-blur-sm">
            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              aria-label="dismiss"
              className="absolute top-1 end-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 hover:bg-muted transition-colors"
            >
              <X className="h-2.5 w-2.5 text-muted-foreground" />
            </button>

            {/* Compact icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Gift className="h-4 w-4 text-primary" />
            </div>

            {/* Compact text + CTA inline */}
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold text-foreground leading-tight truncate">
                  {l.title}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight truncate">
                  {l.desc}
                </p>
              </div>

              {/* Inline code + activate */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 hover:bg-muted transition-all active:scale-95"
                  aria-label={l.copyHint}
                >
                  <span className="font-mono text-[11px] font-bold tracking-wider text-primary">
                    {PROMO_CODE}
                  </span>
                  {copied ? (
                    <Check className="h-3 w-3 text-success" strokeWidth={2.5} />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
                  )}
                </button>

                <motion.button
                  onClick={handleActivate}
                  disabled={redeeming}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-0.5 rounded-lg bg-primary px-2 py-1 text-[10px] font-extrabold text-primary-foreground hover:bg-primary/90 disabled:opacity-70 transition-colors whitespace-nowrap"
                >
                  <Sparkles className="h-3 w-3" strokeWidth={2.5} />
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
