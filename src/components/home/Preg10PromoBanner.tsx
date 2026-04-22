import { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, X, Gift, Zap, Plus, TrendingUp } from "lucide-react";
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
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        {hasClaimedPromo ? (
          <div
            className="relative overflow-hidden rounded-2xl border border-emerald-300/25 px-3.5 py-3"
            style={{
              background: 'linear-gradient(135deg, hsl(156 42% 18%) 0%, hsl(164 36% 22%) 55%, hsl(178 30% 24%) 100%)',
              boxShadow: '0 10px 28px -12px hsl(160 70% 12% / 0.55), inset 0 1px 0 hsl(155 80% 65% / 0.18)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-70"
              style={{ background: 'radial-gradient(circle at 15% 50%, hsl(150 90% 65% / 0.16) 0%, transparent 48%)' }}
            />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-emerald-200/25 bg-emerald-300/10">
                <Check className="w-4.5 h-4.5 text-emerald-200" strokeWidth={3} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="inline-flex items-center rounded-full bg-emerald-300/14 px-2 py-0.5 text-[9px] font-extrabold tracking-[0.18em] text-emerald-100/95">
                    {isAr ? 'تم الاستخدام' : 'USED'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-100/70">
                    {PROMO_CODE}
                  </span>
                </div>
                <p className="text-[13px] font-extrabold text-white leading-tight" style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : undefined }}>
                  {l.claimed}
                </p>
                <p className="text-[11px] text-emerald-50/74 leading-snug mt-0.5">
                  {newBalance !== null
                    ? `${l.newBalance}: ${newBalance} ${l.points}`
                    : l.claimedDesc}
                </p>
              </div>

              <div className="flex-shrink-0 rounded-xl border border-emerald-200/15 bg-white/5 px-2.5 py-1.5 text-center backdrop-blur-sm">
                <div className="text-[9px] font-bold text-emerald-100/70">{l.bonusLabel}</div>
                <div className="text-[14px] font-black text-white">+10</div>
              </div>
            </div>
          </div>
        ) : (
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


          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            aria-label="dismiss"
            className="absolute top-2 end-2 z-10 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 backdrop-blur-sm transition-colors"
          >
            <X className="w-3 h-3 text-white/80" />
          </button>

          <div className="relative px-4 pt-3.5 pb-4">
            {/* Badge */}
            <div className="flex items-center gap-1.5 mb-2.5">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md"
                style={{
                  background: 'linear-gradient(90deg, hsl(45 95% 60%) 0%, hsl(38 92% 55%) 100%)',
                  color: 'hsl(250 60% 18%)',
                  boxShadow: '0 2px 10px -2px hsl(45 90% 50% / 0.55)',
                }}
              >
                <Zap className="w-2.5 h-2.5 fill-current" strokeWidth={3} />
                {l.badge}
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-[15px] font-extrabold text-white leading-tight mb-1"
              style={{ fontFamily: isAr ? "'Tajawal', sans-serif" : undefined }}
            >
              {l.title}
            </h3>
            <p className="text-[11px] text-white/70 leading-snug mb-3">
              {l.desc}
            </p>

            {
              <>
                {/* Code display row */}
                <div
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/8 border border-amber-300/30 mb-2.5 backdrop-blur-sm"
                  style={{ boxShadow: 'inset 0 1px 2px hsl(0 0% 0% / 0.25)' }}
                >
                  <Gift className="w-4 h-4 text-amber-300 flex-shrink-0" strokeWidth={2.2} />
                  <span
                    className="flex-1 font-mono font-black text-[18px] tracking-[0.2em] select-all"
                    style={{
                      background: 'linear-gradient(90deg, hsl(45 95% 70%), hsl(38 92% 60%))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {PROMO_CODE}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 active:scale-95 transition-all"
                    aria-label={l.copyHint}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-300" strokeWidth={2.5} />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-white/80" strokeWidth={2.2} />
                    )}
                    <span className="text-[10px] font-bold text-white/85">
                      {copied ? l.copied : l.copyHint}
                    </span>
                  </button>
                </div>

                {/* Activate CTA — gold for max contrast */}
                <motion.button
                  onClick={handleActivate}
                  disabled={redeeming}
                  whileTap={{ scale: 0.97 }}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-extrabold shadow-lg disabled:opacity-70 transition-all"
                  style={{
                    background: 'linear-gradient(90deg, hsl(45 95% 60%) 0%, hsl(38 92% 55%) 100%)',
                    color: 'hsl(250 60% 18%)',
                    boxShadow: '0 8px 20px -6px hsl(45 90% 45% / 0.55), 0 2px 6px -1px hsl(38 80% 45% / 0.35)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" strokeWidth={2.8} />
                  {redeeming ? l.applying : l.cta}
                </motion.button>
              </>
            }

          </div>
        </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

export default Preg10PromoBanner;
