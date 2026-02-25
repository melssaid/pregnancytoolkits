import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Leaf } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { FertilityDailyTip } from "@/components/FertilityDailyTip";

const CATEGORY_KEYS = [
  "folateRich", "ironSources", "omega3", "antioxidants",
  "zinc", "vitaminD", "calcium", "protein",
  "hydration", "avoidList",
];

export default function PreconceptionNutrition() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const dir = isRTL ? "rtl" : "ltr";
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ToolFrame title={t('tools.preconceptionNutrition.title')} subtitle={t('tools.preconceptionNutrition.description')} mood="joyful" toolId="preconception-nutrition">
      <div className="space-y-2" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>
        <FertilityDailyTip />
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-4 h-4 shrink-0 text-accent" />
          <span className="text-xs font-bold text-foreground">{t('toolsInternal.preconceptionNutrition.categoriesCount', { count: CATEGORY_KEYS.length })}</span>
        </div>
        {CATEGORY_KEYS.map((key, i) => {
          const isOpen = expanded === key;
          return (
            <motion.div key={key} initial={{ opacity: 0, x: isRTL ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.22 }}>
              <Card className={`border-border/60 transition-all duration-300 cursor-pointer ${isOpen ? "border-accent/40 bg-accent/5 shadow-card-hover" : "hover:border-accent/25"}`} onClick={() => setExpanded(isOpen ? null : key)}>
                <CardContent className="p-0">
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.preconceptionNutrition.categories.${key}.title`)}</span>
                      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/70">
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </motion.span>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="overflow-hidden">
                        <div className="mx-3 mb-3 space-y-2">
                          <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                            <p className="whitespace-pre-line text-[11px] leading-relaxed text-muted-foreground">{t(`toolsInternal.preconceptionNutrition.categories.${key}.description`)}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-accent/10 text-[10px] text-accent-foreground dark:text-accent font-medium">
                            {t(`toolsInternal.preconceptionNutrition.categories.${key}.foods`)}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </ToolFrame>
  );
}
