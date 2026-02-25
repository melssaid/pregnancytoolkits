import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Droplet, Circle, Target } from "lucide-react";

interface DailyGoalProgressProps {
  wet: number;
  dirty: number;
  total: number;
  goal?: number;
}

export const DailyGoalProgress = ({ wet, dirty, total, goal = 8 }: DailyGoalProgressProps) => {
  const { t } = useTranslation();
  const progress = Math.min((total / goal) * 100, 100);
  const isComplete = total >= goal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-semibold">{t('diaperPage.todayStats')}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {total}/{goal} {t('diaperPage.dailyGoal')}
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 rounded-full bg-secondary overflow-hidden mb-4">
            <motion.div
              className={`h-full rounded-full ${
                isComplete 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-primary/70 to-primary'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            {/* Goal marker */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-foreground/30"
              style={{ left: '100%' }}
            />
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-2">
            <StatBox
              icon={<Droplet className="h-5 w-5 text-blue-500" />}
              value={wet}
              label={t('diaperPage.wet')}
              bgClass="bg-blue-50 dark:bg-blue-950/30"
              valueClass="text-blue-600"
            />
            <StatBox
              icon={<Circle className="h-5 w-5 text-amber-600 fill-amber-600" />}
              value={dirty}
              label={t('diaperPage.dirty')}
              bgClass="bg-amber-50 dark:bg-amber-950/30"
              valueClass="text-amber-600"
            />
            <StatBox
              icon={isComplete 
                ? <span className="text-lg">✓</span>
                : <span className="text-lg font-bold text-primary">#</span>
              }
              value={total}
              label={t('diaperPage.total')}
              bgClass={isComplete ? "bg-green-50 dark:bg-green-950/30" : "bg-secondary"}
              valueClass={isComplete ? "text-green-600" : "text-primary"}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StatBox = ({ 
  icon, value, label, bgClass, valueClass 
}: { 
  icon: React.ReactNode; 
  value: number; 
  label: string; 
  bgClass: string; 
  valueClass: string;
}) => (
  <div className={`rounded-xl ${bgClass} p-2.5 text-center overflow-hidden`}>
    <div className="flex justify-center mb-0.5 shrink-0">{icon}</div>
    <p className={`text-base font-bold ${valueClass}`}>{value}</p>
    <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
  </div>
);
