import { memo } from 'react';
import { motion } from 'framer-motion';
import { Baby, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';

export const BirthCountdownCard = memo(function BirthCountdownCard() {
  const { t } = useTranslation();
  const { profile } = useUserProfile();

  const dueDate = profile.dueDate;
  const week = profile.pregnancyWeek;
  if (!dueDate || week <= 0) return null;

  const daysRemaining = Math.max(0, Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000));
  const weeksLeft = Math.floor(daysRemaining / 7);
  const daysExtra = daysRemaining % 7;
  const progress = Math.min(100, ((40 * 7 - daysRemaining) / (40 * 7)) * 100);

  if (daysRemaining <= 0) return null;

  const circumference = 2 * Math.PI * 54;
  const strokeDash = (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-primary/[0.06] via-card to-pink-50/30 dark:from-primary/10 dark:to-primary/5 border border-primary/15 p-4 relative overflow-hidden"
    >
      <div className="absolute -top-8 -end-8 w-28 h-28 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-4">
        {/* Countdown Ring */}
        <div className="relative flex-shrink-0 w-[100px] h-[100px]">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" opacity={0.2} />
            <motion.circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="url(#countdownGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - strokeDash }}
              transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
            />
            <defs>
              <linearGradient id="countdownGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(340, 60%, 60%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-2xl font-black text-primary leading-none"
            >
              {daysRemaining}
            </motion.span>
            <span className="text-[9px] text-muted-foreground font-semibold mt-0.5">
              {t('countdown.daysLeft', { defaultValue: 'يوم متبقي' })}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Baby className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">
              {t('countdown.title', { defaultValue: 'العد التنازلي للولادة' })}
            </span>
          </div>
          <p className="text-sm font-bold text-foreground">
            {weeksLeft > 0 && `${weeksLeft} ${t('countdown.weeks', { defaultValue: 'أسبوع' })}`}
            {weeksLeft > 0 && daysExtra > 0 && ' '}
            {daysExtra > 0 && `${daysExtra} ${t('countdown.days', { defaultValue: 'أيام' })}`}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {t('countdown.dueDate', { defaultValue: 'موعد الولادة المتوقع' })}: {new Date(dueDate).toLocaleDateString()}
          </p>
          <div className="mt-2 flex items-center gap-1">
            <Heart className="w-3 h-3 text-pink-400" />
            <span className="text-[10px] font-medium text-muted-foreground">
              {Math.round(progress)}% {t('countdown.complete', { defaultValue: 'مكتمل' })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
