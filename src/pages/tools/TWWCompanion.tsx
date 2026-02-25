import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ChevronDown, Smile } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { FertilityDailyTip } from "@/components/FertilityDailyTip";


const DAY_KEYS = Array.from({ length: 14 }, (_, i) => `day${i + 1}`);

export default function TWWCompanion() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const dir = isRTL ? "rtl" : "ltr";
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  return (
    <ToolFrame title={t('tools.twwCompanion.title')} subtitle={t('tools.twwCompanion.description')} mood="nurturing" toolId="tww-companion">
      <div className="space-y-2" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 shrink-0 text-destructive" />
          <span className="text-xs font-bold text-foreground">{t('toolsInternal.twwCompanion.subtitle')}</span>
        </div>
        {DAY_KEYS.map((key, i) => {
          const isOpen = expandedDay === key;
          return (
            <motion.div key={key} initial={{ opacity: 0, x: isRTL ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02, duration: 0.22 }}>
              <Card className={`border-border/60 transition-all duration-300 cursor-pointer ${isOpen ? "border-destructive/30 bg-destructive/5 shadow-card-hover" : "hover:border-destructive/20"}`} onClick={() => setExpandedDay(isOpen ? null : key)}>
                <CardContent className="p-0">
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 shrink-0 rounded-full bg-destructive/10 flex items-center justify-center text-[10px] font-bold text-destructive">{i + 1}</div>
                        <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.twwCompanion.days.${key}.title`)}</span>
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
                            <p className="whitespace-pre-line text-[11px] leading-relaxed text-muted-foreground">{t(`toolsInternal.twwCompanion.days.${key}.body`)}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-destructive/5 text-[10px] text-destructive font-medium flex items-center gap-1.5">
                            <Smile className="w-3 h-3 shrink-0" />
                            {t(`toolsInternal.twwCompanion.days.${key}.tip`)}
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
      <FertilityDailyTip />
    </ToolFrame>
  );
}
