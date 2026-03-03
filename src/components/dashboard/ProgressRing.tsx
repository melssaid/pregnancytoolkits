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
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const daysRemaining = dueDate 
    ? Math.max(0, Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : (totalWeeks - currentWeek) * 7;

  const trimester = currentWeek <= 12 ? 1 : currentWeek <= 26 ? 2 : 3;
  const trimesterKey = trimester === 1 ? "firstTrimester" : trimester === 2 ? "secondTrimester" : "thirdTrimester";

  return (
    <div className="flex items-center gap-4">
      {/* Compact ring */}
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r="38" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/30" />
          <motion.circle
            cx="42" cy="42" r="38" fill="none"
            stroke="url(#pgRing)" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="pgRing" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(350, 55%, 60%)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center"
          >
            <Baby className="w-4 h-4 text-primary-foreground" />
          </motion.div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg font-extrabold text-foreground leading-tight"
        >
          {t('progressRing.week', { week: currentWeek })}
        </motion.p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {t(`progressRing.${trimesterKey}`)}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <div>
            <span className="text-sm font-bold text-foreground">{daysRemaining}</span>
            <span className="text-[10px] text-muted-foreground ms-1">{t('progressRing.daysLeft')}</span>
          </div>
          <div className="w-px h-4 bg-border/60" />
          <div>
            <span className="text-sm font-bold text-foreground">{Math.round(progress)}%</span>
            <span className="text-[10px] text-muted-foreground ms-1">{t('progressRing.complete')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}