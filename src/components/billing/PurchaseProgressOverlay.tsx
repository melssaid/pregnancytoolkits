import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Loader2, Check } from "lucide-react";

export type PurchaseStep = "connecting" | "payment" | "activating" | "done" | null;

const STEPS_AR = ["جارٍ الاتصال", "تأكيد الدفع", "تفعيل الاشتراك", "مكتمل ✅"];
const STEPS_EN = ["Connecting", "Confirming Payment", "Activating", "Complete ✅"];

function stepIndex(step: PurchaseStep): number {
  if (!step) return -1;
  return ["connecting", "payment", "activating", "done"].indexOf(step);
}

export function PurchaseProgressOverlay({ step }: { step: PurchaseStep }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const labels = isAr ? STEPS_AR : STEPS_EN;
  const currentIdx = stepIndex(step);

  return (
    <AnimatePresence>
      {step && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-background/85 backdrop-blur-md"
        >
          <div className="flex flex-col items-center gap-6 max-w-[260px] w-full">
            {step !== "done" && <Loader2 className="w-10 h-10 text-primary animate-spin" />}
            {step === "done" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center"
              >
                <Check className="w-7 h-7 text-white" strokeWidth={3} />
              </motion.div>
            )}

            <div className="w-full space-y-3">
              {labels.map((label, i) => {
                const isActive = i === currentIdx;
                const isDone = i < currentIdx;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                      isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                      isActive ? "border-primary bg-primary/10 text-primary" :
                      "border-muted-foreground/20 text-muted-foreground/40"
                    }`}>
                      {isDone ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      isDone ? "text-emerald-600 dark:text-emerald-400" :
                      isActive ? "text-foreground" :
                      "text-muted-foreground/40"
                    }`}>
                      {label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
