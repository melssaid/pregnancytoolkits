import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";

const LESSON_KEYS = [
  "menstrualCycle", "ovulationProcess", "fertilizationBasics", "hormonesRole",
  "ageAndFertility", "lifestyleFactors", "commonMyths", "whenToSeekHelp",
  "maleFertility", "emotionalWellbeing", "trackingMethods", "optimizingTiming",
];

export default function FertilityAcademy() {
  const { t } = useTranslation();
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  return (
    <ToolFrame title={t('tools.fertilityAcademy.title')} subtitle={t('tools.fertilityAcademy.description')} mood="calm" toolId="fertility-academy">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">{t('toolsInternal.fertilityAcademy.lessonsCount', { count: LESSON_KEYS.length })}</span>
        </div>
        {LESSON_KEYS.map((key, i) => {
          const isOpen = expandedLesson === key;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border-border/50 hover:border-primary/20 transition-colors cursor-pointer" onClick={() => setExpandedLesson(isOpen ? null : key)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</div>
                      <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.fertilityAcademy.lessons.${key}.title`)}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-border/40">
                      <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">
                        {t(`toolsInternal.fertilityAcademy.lessons.${key}.content`)}
                      </p>
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
