import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, ChevronLeft, ChevronRight, X } from "lucide-react";
import { canClaimBonus, claimBonus, isPromoActive } from "@/services/smartEngine";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { toast } from "sonner";

const labels: Record<string, { badge: string; title: string; desc: string; cta: string; claimed: string; claimedDesc: string }> = {
  ar: { badge: "عرض محدود", title: "احصلي على 5 نقاط ذكاء اصطناعي مجاناً!", desc: "جرّبي أدوات التحليل الذكي بدون تكلفة", cta: "احصلي عليها الآن", claimed: "تم الحصول على النقاط! 🎉", claimedDesc: "تمت إضافة 5 نقاط إلى رصيدك" },
  en: { badge: "Limited Offer", title: "Get 5 Free AI Credits!", desc: "Try our smart analysis tools at no cost", cta: "Claim Now", claimed: "Credits Claimed! 🎉", claimedDesc: "5 bonus credits added to your balance" },
  de: { badge: "Begrenztes Angebot", title: "5 kostenlose KI-Credits!", desc: "Testen Sie unsere smarten Analysetools kostenlos", cta: "Jetzt sichern", claimed: "Credits erhalten! 🎉", claimedDesc: "5 Bonuspunkte wurden hinzugefügt" },
  fr: { badge: "Offre limitée", title: "5 crédits IA gratuits !", desc: "Essayez nos outils d'analyse sans frais", cta: "Récupérer", claimed: "Crédits récupérés ! 🎉", claimedDesc: "5 crédits bonus ajoutés" },
  es: { badge: "Oferta limitada", title: "¡5 créditos IA gratis!", desc: "Prueba nuestras herramientas de análisis sin costo", cta: "Reclamar ahora", claimed: "¡Créditos obtenidos! 🎉", claimedDesc: "5 créditos bonus añadidos" },
  pt: { badge: "Oferta limitada", title: "5 créditos IA grátis!", desc: "Experimente nossas ferramentas de análise sem custo", cta: "Resgatar agora", claimed: "Créditos resgatados! 🎉", claimedDesc: "5 créditos bônus adicionados" },
  tr: { badge: "Sınırlı Teklif", title: "5 Ücretsiz AI Kredisi!", desc: "Akıllı analiz araçlarımızı ücretsiz deneyin", cta: "Şimdi Al", claimed: "Krediler alındı! 🎉", claimedDesc: "5 bonus kredi eklendi" },
};

const BonusPromoBanner = memo(function BonusPromoBanner({ lang }: { lang: string }) {
  const navigate = useNavigate();
  const { refresh } = useAIUsage();
  const [dismissed, setDismissed] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const promoActive = isPromoActive();
  const bonusAvailable = canClaimBonus();

  if (!promoActive || dismissed) return null;

  const l = labels[lang] || labels.en;
  const isAr = lang === "ar";
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!bonusAvailable) {
      navigate("/pricing-demo");
      return;
    }
    const result = claimBonus();
    if (result.success) {
      setClaimed(true);
      refresh();
      toast.success(`🎉 +5 ${l.claimed}`);
    }
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative rounded-2xl overflow-hidden border border-amber-400/20 dark:border-amber-500/15 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-yellow-50/60 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/25 shadow-sm">
            {/* Shimmer bar */}
            <div className="h-[2px] bg-gradient-to-r from-amber-400/30 via-orange-400 to-amber-400/30 relative overflow-hidden">
              <motion.div
                className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
              />
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-2 end-2 z-10 w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>

            <div className="px-3.5 py-3.5">
              {/* Badge */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  {l.badge}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Gift icon */}
                <motion.div
                  className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/15 dark:from-amber-500/20 dark:to-orange-500/15 flex items-center justify-center border border-amber-300/30 dark:border-amber-500/20"
                  animate={{ rotate: [0, -5, 5, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                >
                  <Gift className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-extrabold text-foreground leading-snug" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    {claimed ? l.claimed : l.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    {claimed ? l.claimedDesc : l.desc}
                  </p>

                  {!claimed && (
                    <motion.button
                      onClick={handleClaim}
                      whileTap={{ scale: 0.97 }}
                      className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] font-bold shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Gift className="w-3 h-3" />
                      {bonusAvailable ? l.cta : l.cta}
                      <ChevronIcon className="w-3 h-3" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default BonusPromoBanner;
