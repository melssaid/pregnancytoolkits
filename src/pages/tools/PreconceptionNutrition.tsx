import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Utensils, Leaf } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORY_KEYS = [
  "folateRich", "ironSources", "omega3", "antioxidants",
  "zinc", "vitaminD", "calcium", "protein",
  "hydration", "avoidList",
];

export default function PreconceptionNutrition() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ToolFrame title={t('tools.preconceptionNutrition.title')} subtitle={t('tools.preconceptionNutrition.description')} mood="joyful" toolId="preconception-nutrition">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-foreground">{t('toolsInternal.preconceptionNutrition.categoriesCount', { count: CATEGORY_KEYS.length })}</span>
        </div>
        {CATEGORY_KEYS.map((key, i) => {
          const isOpen = expanded === key;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border-border/50 hover:border-emerald-200/50 transition-colors cursor-pointer" onClick={() => setExpanded(isOpen ? null : key)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.preconceptionNutrition.categories.${key}.title`)}</span>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-border/40 space-y-2">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{t(`toolsInternal.preconceptionNutrition.categories.${key}.description`)}</p>
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                        {t(`toolsInternal.preconceptionNutrition.categories.${key}.foods`)}
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
