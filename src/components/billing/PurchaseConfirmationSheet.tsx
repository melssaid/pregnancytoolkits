import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanType } from "@/lib/googlePlayBilling";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: PlanType;
  priceDisplay: string;
  period: string;
  loading?: boolean;
}

export function PurchaseConfirmationSheet({ open, onClose, onConfirm, plan, priceDisplay, period, loading }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 inset-x-0 z-[111] max-h-[70vh]"
          >
            <div className="bg-card rounded-t-3xl shadow-2xl border-t border-border/50 px-6 pb-8 pt-4">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              <button onClick={onClose} className="absolute top-4 end-4 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="flex flex-col items-center gap-4 mt-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Crown className="w-7 h-7 text-primary-foreground" />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-foreground">
                    {isAr ? "تأكيد الاشتراك" : "Confirm Subscription"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isAr ? "أنتِ على وشك الاشتراك في:" : "You're about to subscribe to:"}
                  </p>
                </div>

                {/* Plan summary */}
                <div className="w-full p-4 rounded-2xl bg-muted/40 border border-border/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {plan === "yearly" ? t("pricing.yearly") : t("pricing.monthly")}
                    </span>
                    <span className="text-lg font-extrabold text-foreground">{priceDisplay}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">/{period}</div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] text-muted-foreground">
                      {isAr ? "يمكنك الإلغاء في أي وقت من Google Play" : "Cancel anytime from Google Play"}
                    </span>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <Button
                    onClick={onConfirm}
                    disabled={loading}
                    className="w-full h-12 rounded-2xl font-bold text-base shadow-lg shadow-primary/25"
                  >
                    <Check className="w-4 h-4 me-2" />
                    {isAr ? "تأكيد والمتابعة" : "Confirm & Continue"}
                  </Button>
                  <button onClick={onClose} className="w-full text-xs text-muted-foreground py-2">
                    {isAr ? "تراجع" : "Go Back"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
