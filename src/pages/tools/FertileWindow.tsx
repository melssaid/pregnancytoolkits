import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Calendar, Info, Sparkles } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FertileWindow() {
  const { t } = useTranslation();
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriod, setLastPeriod] = useState("");
  const [result, setResult] = useState<{ ovulation: string; windowStart: string; windowEnd: string } | null>(null);

  const calculate = () => {
    if (!lastPeriod) return;
    const lmp = new Date(lastPeriod);
    const ovDay = new Date(lmp);
    ovDay.setDate(lmp.getDate() + cycleLength - 14);
    const start = new Date(ovDay);
    start.setDate(ovDay.getDate() - 5);
    const end = new Date(ovDay);
    end.setDate(ovDay.getDate() + 1);
    setResult({
      ovulation: ovDay.toLocaleDateString(),
      windowStart: start.toLocaleDateString(),
      windowEnd: end.toLocaleDateString(),
    });
  };

  return (
    <ToolFrame title={t('tools.fertileWindow.title')} subtitle={t('tools.fertileWindow.description')} mood="nurturing" toolId="fertile-window">
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium">{t('toolsInternal.fertileWindow.lastPeriod')}</Label>
            <Input type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs font-medium">{t('toolsInternal.fertileWindow.cycleLength')}</Label>
            <Input type="number" min={21} max={40} value={cycleLength} onChange={e => setCycleLength(Number(e.target.value))} className="mt-1" />
          </div>
          <Button onClick={calculate} className="w-full" disabled={!lastPeriod}>
            {t('toolsInternal.fertileWindow.calculate')}
          </Button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-bold">{t('toolsInternal.fertileWindow.yourWindow')}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-white/5">
                    <p className="text-muted-foreground">{t('toolsInternal.fertileWindow.windowStart')}</p>
                    <p className="font-bold text-foreground">{result.windowStart}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/80 dark:bg-white/5">
                    <p className="text-muted-foreground">{t('toolsInternal.fertileWindow.windowEnd')}</p>
                    <p className="font-bold text-foreground">{result.windowEnd}</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/80 dark:bg-white/5 text-xs">
                  <p className="text-muted-foreground">{t('toolsInternal.fertileWindow.estimatedOvulation')}</p>
                  <p className="font-bold text-foreground">{result.ovulation}</p>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3 flex-shrink-0" />
                  {t('toolsInternal.fertileWindow.disclaimer')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </ToolFrame>
  );
}
