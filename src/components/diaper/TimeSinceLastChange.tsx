import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface TimeSinceLastChangeProps {
  lastChangeTime: string | null;
}

export const TimeSinceLastChange = ({ lastChangeTime }: TimeSinceLastChangeProps) => {
  const { t } = useTranslation();
  const [elapsed, setElapsed] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!lastChangeTime) return;

    const update = () => {
      const diff = Date.now() - new Date(lastChangeTime).getTime();
      const totalSeconds = Math.floor(diff / 1000);
      setElapsed({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lastChangeTime]);

  if (!lastChangeTime) {
    return (
      <Card className="overflow-hidden border-dashed border-2 border-muted-foreground/20">
        <CardContent className="py-4 text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{t('diaperPage.noChangesYet')}</p>
        </CardContent>
      </Card>
    );
  }

  const isUrgent = elapsed.hours >= 3;
  const isWarning = elapsed.hours >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`overflow-hidden transition-colors ${
        isUrgent 
          ? 'border-destructive/50 bg-destructive/5' 
          : isWarning 
            ? 'border-orange-400/50 bg-orange-50 dark:bg-orange-950/20' 
            : 'border-primary/20 bg-primary/5'
      }`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`p-2 rounded-full ${
                isUrgent ? 'bg-destructive/10' : isWarning ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-primary/10'
              }`}>
                <Clock className={`h-5 w-5 ${
                  isUrgent ? 'text-destructive' : isWarning ? 'text-orange-500' : 'text-primary'
                }`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {t('diaperPage.timeSinceLastChange')}
                </p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 font-mono shrink-0">
              <TimeUnit value={elapsed.hours} label={t('diaperPage.h')} isUrgent={isUrgent} />
              <span className="text-muted-foreground text-lg">:</span>
              <TimeUnit value={elapsed.minutes} label={t('diaperPage.m')} isUrgent={isUrgent} />
              <span className="text-muted-foreground text-lg">:</span>
              <TimeUnit value={elapsed.seconds} label={t('diaperPage.s')} isUrgent={isUrgent} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TimeUnit = ({ value, label, isUrgent }: { value: number; label: string; isUrgent: boolean }) => (
  <div className="text-center">
    <span className={`text-base font-bold tabular-nums ${
      isUrgent ? 'text-destructive' : 'text-foreground'
    }`}>
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-[9px] text-muted-foreground block -mt-1">{label}</span>
  </div>
);
