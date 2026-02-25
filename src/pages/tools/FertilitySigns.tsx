import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Eye } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { FertilityDailyTip } from "@/components/FertilityDailyTip";

const SIGN_KEYS = [
  "cervicalMucus", "basalTemp", "cervicalPosition", "ovulationPain",
  "breastTenderness", "libidoChanges", "moodShifts", "bloating",
  "lightSpotting", "heightenedSenses",
];

export default function FertilitySigns() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const dir = isRTL ? "rtl" : "ltr";
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ToolFrame title={t('tools.fertilitySigns.title')} subtitle={t('tools.fertilitySigns.description')} mood="nurturing" toolId="fertility-signs">
      <div className="space-y-2" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>
        <FertilityDailyTip />
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 shrink-0 text-primary" />
          <span className="text-xs font-bold text-foreground">{t('toolsInternal.fertilitySigns.signsCount', { count: SIGN_KEYS.length })}</span>
        </div>
        {SIGN_KEYS.map((key, i) => {
          const isOpen = expanded === key;
          return (
            <motion.div key={key} initial={{ opacity: 0, x: isRTL ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.22 }}>
              <Card className={`border-border/60 transition-all duration-300 cursor-pointer ${isOpen ? "border-primary/40 bg-primary/5 shadow-card-hover" : "hover:border-primary/25"}`} onClick={() => setExpanded(isOpen ? null : key)}>
                <CardContent className="p-0">
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.fertilitySigns.signs.${key}.title`)}</span>
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
                            <p className="whitespace-pre-line text-[11px] leading-relaxed text-muted-foreground">{t(`toolsInternal.fertilitySigns.signs.${key}.description`)}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-primary/5 text-[10px] text-primary font-medium">
                            {t(`toolsInternal.fertilitySigns.signs.${key}.tip`)}
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
