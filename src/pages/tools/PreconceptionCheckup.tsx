import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CheckSquare, CheckCircle } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { FertilityDailyTip } from "@/components/FertilityDailyTip";

const CHECK_KEYS = [
  "generalCheckup", "bloodWork", "pap", "thyroid",
  "rubella", "hepatitis", "hiv", "dental",
  "geneticScreening", "mentalHealth", "medications", "vaccinations",
];

export default function PreconceptionCheckup() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const dir = isRTL ? "rtl" : "ltr";
  const [completed, setCompleted] = useState<string[]>([]);

  const toggle = (key: string) => {
    setCompleted(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const progress = Math.round((completed.length / CHECK_KEYS.length) * 100);

  return (
    <ToolFrame title={t('tools.preconceptionCheckup.title')} subtitle={t('tools.preconceptionCheckup.description')} mood="empowering" toolId="preconception-checkup">
      <div className="space-y-3" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>
        <FertilityDailyTip />
        {/* Progress */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 shrink-0 text-warning" />
            <span className="text-xs font-bold text-foreground">{completed.length}/{CHECK_KEYS.length}</span>
          </div>
          <span className="text-[10px] font-medium text-primary">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-1.5 mt-2">
          {CHECK_KEYS.map((key, i) => {
            const isDone = completed.includes(key);
            return (
              <motion.div key={key} initial={{ opacity: 0, x: isRTL ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.22 }}>
                <Card
                  className={`border-border/60 transition-all duration-300 cursor-pointer ${isDone ? 'border-primary/30 bg-primary/5' : 'hover:border-warning/25'}`}
                  onClick={() => toggle(key)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <CheckCircle className={`w-4 h-4 shrink-0 transition-colors ${isDone ? 'text-primary' : 'text-muted-foreground/25'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {t(`toolsInternal.preconceptionCheckup.checks.${key}.title`)}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t(`toolsInternal.preconceptionCheckup.checks.${key}.description`)}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ToolFrame>
  );
}
