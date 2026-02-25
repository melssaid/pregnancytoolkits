import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Heart, ChevronDown, ChevronUp, Smile } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";

const DAY_KEYS = Array.from({ length: 14 }, (_, i) => `day${i + 1}`);

export default function TWWCompanion() {
  const { t } = useTranslation();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  return (
    <ToolFrame title={t('tools.twwCompanion.title')} subtitle={t('tools.twwCompanion.description')} mood="nurturing" toolId="tww-companion">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-bold text-foreground">{t('toolsInternal.twwCompanion.subtitle')}</span>
        </div>
        {DAY_KEYS.map((key, i) => {
          const isOpen = expandedDay === key;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card className="border-border/50 hover:border-rose-200/50 transition-colors cursor-pointer" onClick={() => setExpandedDay(isOpen ? null : key)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-[10px] font-bold text-rose-600 dark:text-rose-400">{i + 1}</div>
                      <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.twwCompanion.days.${key}.title`)}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-border/40 space-y-2">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{t(`toolsInternal.twwCompanion.days.${key}.body`)}</p>
                      <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-[10px] text-rose-700 dark:text-rose-300 font-medium flex items-center gap-1.5">
                        <Smile className="w-3 h-3 flex-shrink-0" />
                        {t(`toolsInternal.twwCompanion.days.${key}.tip`)}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </ToolFrame>
  );
}
