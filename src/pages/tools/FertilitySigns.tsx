import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";

const SIGN_KEYS = [
  "cervicalMucus", "basalTemp", "cervicalPosition", "ovulationPain",
  "breastTenderness", "libidoChanges", "moodShifts", "bloating",
  "lightSpotting", "heightenedSenses",
];

export default function FertilitySigns() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ToolFrame title={t('tools.fertilitySigns.title')} subtitle={t('tools.fertilitySigns.description')} mood="nurturing" toolId="fertility-signs">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">{t('toolsInternal.fertilitySigns.signsCount', { count: SIGN_KEYS.length })}</span>
        </div>
        {SIGN_KEYS.map((key, i) => {
          const isOpen = expanded === key;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border-border/50 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => setExpanded(isOpen ? null : key)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.fertilitySigns.signs.${key}.title`)}</span>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-border/40 space-y-2">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{t(`toolsInternal.fertilitySigns.signs.${key}.description`)}</p>
                      <div className="p-2 rounded-lg bg-primary/5 text-[10px] text-primary font-medium">
                        {t(`toolsInternal.fertilitySigns.signs.${key}.tip`)}
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
