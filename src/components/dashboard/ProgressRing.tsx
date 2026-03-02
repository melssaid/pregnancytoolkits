import { motion } from "framer-motion";
import { Baby } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProgressRingProps {
  currentWeek: number;
  totalWeeks?: number;
  dueDate?: Date;
}

export function ProgressRing({ currentWeek, totalWeeks = 40, dueDate }: ProgressRingProps) {
  const { t } = useTranslation();
  const progress = Math.min((currentWeek / totalWeeks) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const daysRemaining = dueDate 
    ? Math.max(0, Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : (totalWeeks - currentWeek) * 7;

  const trimester = currentWeek <= 12 ? 1 : currentWeek <= 26 ? 2 : 3;
  const trimesterKey = trimester === 1 ? "firstTrimester" : trimester === 2 ? "secondTrimester" : "thirdTrimester";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted/30"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(350, 55%, 60%)" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-1"
          >
            <Baby className="w-6 h-6 text-primary-foreground" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base font-bold text-foreground"
          >
            {t('progressRing.week', { week: currentWeek })}
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-muted-foreground"
          >
            {t(`progressRing.${trimesterKey}`)}
          </motion.span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 flex gap-6"
      >
        <div className="text-center">
          <span className="text-lg font-bold text-foreground">{daysRemaining}</span>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('progressRing.daysLeft')}</p>
        </div>
        <div className="w-px bg-border" />
        <div className="text-center">
          <span className="text-lg font-bold text-foreground">{Math.round(progress)}%</span>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('progressRing.complete')}</p>
        </div>
      </motion.div>
    </div>
  );
}
