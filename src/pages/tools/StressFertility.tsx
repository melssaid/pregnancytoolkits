import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Brain, ChevronDown, ChevronUp, Leaf } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";

const TOPIC_KEYS = [
  "stressHormones", "cortisol", "mindfulness", "breathing",
  "journaling", "sleep", "exercise", "socialSupport",
  "professionalHelp", "acceptance",
];

export default function StressFertility() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ToolFrame title={t('tools.stressFertility.title')} subtitle={t('tools.stressFertility.description')} mood="calm" toolId="stress-fertility">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-bold text-foreground">{t('toolsInternal.stressFertility.topicsCount', { count: TOPIC_KEYS.length })}</span>
        </div>
        {TOPIC_KEYS.map((key, i) => {
          const isOpen = expanded === key;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border-border/50 hover:border-sky-200/50 transition-colors cursor-pointer" onClick={() => setExpanded(isOpen ? null : key)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.stressFertility.topics.${key}.title`)}</span>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3 border-t border-border/40 space-y-2">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{t(`toolsInternal.stressFertility.topics.${key}.content`)}</p>
                      <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-[10px] text-sky-700 dark:text-sky-300 font-medium">
                        {t(`toolsInternal.stressFertility.topics.${key}.practice`)}
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
