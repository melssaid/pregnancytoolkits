import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Pill, CheckCircle } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { FertilityDailyTip } from "@/components/FertilityDailyTip";

const VITAMIN_KEYS = [
  "folicAcid", "iron", "vitaminD", "omega3DHA",
  "calcium", "iodine", "zinc", "vitaminB12",
  "vitaminC", "vitaminE", "coq10", "probiotics",
];

export default function PrenatalVitamins() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const dir = isRTL ? "rtl" : "ltr";
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checkedVitamins, setCheckedVitamins] = useState<string[]>([]);

  const toggleCheck = (key: string) => {
    setCheckedVitamins(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <ToolFrame title={t('tools.prenatalVitamins.title')} subtitle={t('tools.prenatalVitamins.description')} mood="empowering" toolId="prenatal-vitamins">
      <div className="space-y-2" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>
        <FertilityDailyTip />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 shrink-0 text-warning" />
            <span className="text-xs font-bold text-foreground">{t('toolsInternal.prenatalVitamins.supplementsCount', { count: VITAMIN_KEYS.length })}</span>
          </div>
          <span className="text-[10px] text-primary font-medium">{checkedVitamins.length}/{VITAMIN_KEYS.length}</span>
        </div>
        {VITAMIN_KEYS.map((key, i) => {
          const isOpen = expanded === key;
          const isChecked = checkedVitamins.includes(key);
          return (
            <motion.div key={key} initial={{ opacity: 0, x: isRTL ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.22 }}>
              <Card className={`border-border/60 transition-all duration-300 cursor-pointer ${isChecked ? 'border-primary/30 bg-primary/5' : isOpen ? 'border-warning/40 bg-warning/5 shadow-card-hover' : 'hover:border-warning/25'}`}>
                <CardContent className="p-0">
                  <div className="p-3" onClick={() => setExpanded(isOpen ? null : key)}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button onClick={e => { e.stopPropagation(); toggleCheck(key); }} className="shrink-0" type="button">
                          <CheckCircle className={`w-4 h-4 transition-colors ${isChecked ? 'text-primary' : 'text-muted-foreground/30'}`} />
                        </button>
                        <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.prenatalVitamins.vitamins.${key}.title`)}</span>
                      </div>
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
                            <p className="whitespace-pre-line text-[11px] leading-relaxed text-muted-foreground">{t(`toolsInternal.prenatalVitamins.vitamins.${key}.description`)}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-warning/10 text-[10px] text-foreground font-medium">
                            {t(`toolsInternal.prenatalVitamins.vitamins.${key}.dosage`)}
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
