import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, ChevronLeft, ChevronRight } from "lucide-react";
import { canClaimBonus, claimBonus, isPromoActive } from "@/services/smartEngine";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { toast } from "sonner";

const labels: Record<string, { title: string; cta: string; claimed: string }> = {
  ar: { title: "هدية حصرية: 5 نقاط ذكاء اصطناعي مجاناً", cta: "احصل عليها", claimed: "تمت الإضافة!" },
  en: { title: "Exclusive Gift: 5 Free AI Credits", cta: "Claim", claimed: "Added!" },
  de: { title: "Exklusiv: 5 KI-Credits geschenkt", cta: "Sichern", claimed: "Hinzugefügt!" },
  fr: { title: "Cadeau exclusif : 5 crédits IA gratuits", cta: "Récupérer", claimed: "Ajoutés !" },
  es: { title: "Regalo exclusivo: 5 créditos IA gratis", cta: "Reclamar", claimed: "¡Añadidos!" },
  pt: { title: "Presente exclusivo: 5 créditos IA grátis", cta: "Resgatar", claimed: "Adicionados!" },
  tr: { title: "Özel Hediye: 5 Ücretsiz AI Kredisi", cta: "Al", claimed: "Eklendi!" },
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 px-3 py-2.5 shadow-[var(--shadow-card)] backdrop-blur-sm">
            {/* Tiny dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-1.5 end-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 hover:bg-muted transition-colors"
            >
              <X className="h-2.5 w-2.5 text-muted-foreground" />
            </button>

            {/* Compact gift icon */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Gift className="h-4 w-4 text-primary" />
            </div>

            {/* Text + CTA inline */}
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <p className="text-[11px] font-semibold text-foreground leading-tight truncate">
                {claimed ? l.claimed : l.title}
              </p>

              {!claimed && (
                <motion.button
                  onClick={handleClaim}
                  whileTap={{ scale: 0.96 }}
                  className="shrink-0 inline-flex items-center gap-0.5 rounded-lg bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {bonusAvailable ? l.cta : l.cta}
                  <ChevronIcon className="h-3 w-3" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default BonusPromoBanner;
