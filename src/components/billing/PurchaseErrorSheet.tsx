import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { X, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  errorMessage: string;
}

export function PurchaseErrorSheet({ open, onClose, onRetry, errorMessage }: Props) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const isPlayStoreIssue = errorMessage.includes("Google Play") || errorMessage.includes("clientAppUnavailable");

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
            className="fixed bottom-0 inset-x-0 z-[111] max-h-[75vh]"
          >
            <div className="bg-card rounded-t-3xl shadow-2xl border-t border-border/50 px-6 pb-8 pt-4">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              <button onClick={onClose} className="absolute top-4 end-4 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="flex flex-col items-center gap-4 mt-2">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-destructive" />
                </div>

                <div className="text-center space-y-1.5">
                  <h3 className="text-base font-bold text-foreground">
                    {isAr ? "تعذّر إتمام الشراء" : "Purchase Failed"}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
                    {errorMessage}
                  </p>
                </div>

                <div className="w-full space-y-2.5 mt-2">
                  <Button
                    onClick={() => { onClose(); onRetry(); }}
                    className="w-full h-12 rounded-2xl font-bold"
                  >
                    <RefreshCw className="w-4 h-4 me-2" />
                    {isAr ? "إعادة المحاولة" : "Try Again"}
                  </Button>

                  {isPlayStoreIssue && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.open("https://play.google.com/store/apps/details?id=com.google.android.gms", "_blank");
                      }}
                      className="w-full h-11 rounded-2xl"
                    >
                      <ExternalLink className="w-4 h-4 me-2" />
                      {isAr ? "تحديث خدمات Google Play" : "Update Google Play Services"}
                    </Button>
                  )}

                  <button onClick={onClose} className="w-full text-xs text-muted-foreground py-2">
                    {isAr ? "إغلاق" : "Close"}
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
