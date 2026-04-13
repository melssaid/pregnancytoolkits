import { memo } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useStreaks } from '@/hooks/useStreaks';
import { useTranslation } from 'react-i18next';

export const StreakBadge = memo(function StreakBadge() {
  const { currentStreak } = useStreaks();
  const { t } = useTranslation();

  if (currentStreak < 2) return null;

  const milestoneColors: Record<number, string> = {
    7: 'from-amber-500 to-orange-500',
    14: 'from-orange-500 to-red-500',
    30: 'from-red-500 to-pink-500',
    60: 'from-pink-500 to-purple-500',
    90: 'from-purple-500 to-indigo-500',
  };

  let gradient = 'from-primary to-primary/80';
  for (const [threshold, g] of Object.entries(milestoneColors)) {
    if (currentStreak >= Number(threshold)) gradient = g;
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${gradient} text-white shadow-md`}
    >
      <Flame className="w-4.5 h-4.5" />
      <span className="text-sm font-bold tabular-nums">{currentStreak}</span>
      <span className="text-xs font-medium opacity-90">
        {t('streak.days', { defaultValue: 'يوم متتالي', count: currentStreak })}
      </span>
    </motion.div>
  );
});
