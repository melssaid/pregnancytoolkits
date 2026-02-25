import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Pill, CheckCircle } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";

const VITAMIN_KEYS = [
  "folicAcid", "iron", "vitaminD", "omega3DHA",
  "calcium", "iodine", "zinc", "vitaminB12",
  "vitaminC", "vitaminE", "coq10", "probiotics",
];

export default function PrenatalVitamins() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checkedVitamins, setCheckedVitamins] = useState<string[]>([]);

  const toggleCheck = (key: string) => {
    setCheckedVitamins(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <ToolFrame title={t('tools.prenatalVitamins.title')} subtitle={t('tools.prenatalVitamins.description')} mood="empowering" toolId="prenatal-vitamins">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-foreground">{t('toolsInternal.prenatalVitamins.supplementsCount', { count: VITAMIN_KEYS.length })}</span>
          </div>
          <span className="text-[10px] text-primary font-medium">{checkedVitamins.length}/{VITAMIN_KEYS.length}</span>
        </div>
        {VITAMIN_KEYS.map((key, i) => {
          const isOpen = expanded === key;
          const isChecked = checkedVitamins.includes(key);
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`border-border/50 transition-colors cursor-pointer ${isChecked ? 'border-primary/30 bg-primary/5' : 'hover:border-amber-200/50'}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between" onClick={() => setExpanded(isOpen ? null : key)}>
                    <div className="flex items-center gap-2">
                      <button onClick={e => { e.stopPropagation(); toggleCheck(key); }} className="flex-shrink-0">
                        <CheckCircle className={`w-4 h-4 transition-colors ${isChecked ? 'text-primary' : 'text-muted-foreground/30'}`} />
                      </button>
                      <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.prenatalVitamins.vitamins.${key}.title`)}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-border/40 space-y-2">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{t(`toolsInternal.prenatalVitamins.vitamins.${key}.description`)}</p>
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                        {t(`toolsInternal.prenatalVitamins.vitamins.${key}.dosage`)}
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
