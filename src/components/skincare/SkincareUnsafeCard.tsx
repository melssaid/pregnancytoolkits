import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const UNSAFE_INGREDIENT_KEYS = [
  "retinol", "salicylic", "hydroquinone",
  "formaldehyde", "chemicalSunscreens", "essentialOils",
] as const;

export const SkincareUnsafeCard = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden border-destructive/15">
      <CardContent className="p-0">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-xs font-semibold text-destructive">
              {t('toolsInternal.skincare.ingredientsToAvoid')}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 space-y-1">
                {UNSAFE_INGREDIENT_KEYS.map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 py-1.5 text-xs border-b border-border/30 last:border-0"
                  >
                    <span className="w-1 h-1 rounded-full bg-destructive/60 shrink-0" />
                    <span className="leading-snug text-foreground/80">
                      {t(`toolsInternal.skincare.unsafeIngredients.${key}.name`)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
