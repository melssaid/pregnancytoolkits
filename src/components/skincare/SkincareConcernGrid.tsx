import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";

const CONCERN_KEYS = [
  "acne", "melasma", "stretchMarks", "dryness",
  "oiliness", "sensitivity", "itching", "glow",
] as const;

interface SkincareConcernGridProps {
  concerns: string[];
  onToggle: (id: string) => void;
}

export const SkincareConcernGrid = ({ concerns, onToggle }: SkincareConcernGridProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <span className="text-xs text-muted-foreground font-medium">
        {t('toolsInternal.skincare.skinConcerns')}
      </span>
      <div className="grid grid-cols-2 gap-2">
        {CONCERN_KEYS.map((key) => {
          const isSelected = concerns.includes(key);
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(key)}
              className={`relative flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-200 text-start ${
                isSelected
                  ? "bg-primary/10 border-primary/30 shadow-sm"
                  : "bg-card border-border/50 hover:bg-muted/50"
              }`}
            >
              <Checkbox checked={isSelected} className="shrink-0 pointer-events-none" />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm shrink-0">
                  {t(`toolsInternal.skincare.concerns.${key}.icon`)}
                </span>
                <span className="text-[11px] leading-snug truncate">
                  {t(`toolsInternal.skincare.concerns.${key}.label`)}
                </span>
              </div>
              {/* Selection ripple */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-primary/5"
                    initial={{ opacity: 0.5, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
