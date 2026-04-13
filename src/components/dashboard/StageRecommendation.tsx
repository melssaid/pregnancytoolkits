import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Link } from 'react-router-dom';

interface ToolRec { href: string; titleKey: string; emoji: string }

const weeklyRecommendations: Record<number, ToolRec> = {
  4: { href: '/tools/due-date-calculator', titleKey: 'tools.dueDateCalc.title', emoji: '📅' },
  6: { href: '/tools/wellness-diary', titleKey: 'tools.wellnessDiary.title', emoji: '📝' },
  8: { href: '/tools/ai-meal-suggestion', titleKey: 'tools.mealSuggestion.title', emoji: '🥗' },
  10: { href: '/tools/vitamin-tracker', titleKey: 'tools.vitaminTracker.title', emoji: '💊' },
  12: { href: '/tools/fetal-growth', titleKey: 'tools.fetalDevelopment.title', emoji: '👶' },
  16: { href: '/tools/kick-counter', titleKey: 'tools.kickCounter.title', emoji: '🦶' },
  20: { href: '/tools/ai-fitness-coach', titleKey: 'tools.fitnessCoach.title', emoji: '🏃‍♀️' },
  24: { href: '/tools/weight-gain', titleKey: 'tools.weightGain.title', emoji: '⚖️' },
  28: { href: '/tools/ai-hospital-bag', titleKey: 'tools.hospitalBag.title', emoji: '🧳' },
  32: { href: '/tools/ai-birth-plan', titleKey: 'tools.birthPlan.title', emoji: '📋' },
  36: { href: '/tools/contraction-timer', titleKey: 'tools.contractionTimer.title', emoji: '⏱️' },
  38: { href: '/tools/ai-birth-position', titleKey: 'tools.birthPosition.title', emoji: '🤱' },
};

function getRecommendation(week: number): ToolRec | null {
  // Find closest week <= current week
  const keys = Object.keys(weeklyRecommendations).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (week >= k) return weeklyRecommendations[k];
  }
  return weeklyRecommendations[4];
}

export const StageRecommendation = memo(function StageRecommendation() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { profile } = useUserProfile();
  const week = profile.pregnancyWeek;

  const rec = useMemo(() => getRecommendation(week), [week]);

  if (!rec || week <= 0) return null;

  const dismissKey = `pt_stage_rec_${week}`;
  if (typeof window !== 'undefined' && localStorage.getItem(dismissKey)) return null;

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <motion.div initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}>
      <Link
        to={rec.href}
        onClick={() => { try { localStorage.setItem(dismissKey, '1'); } catch {} }}
        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/[0.06] to-transparent border border-primary/10 hover:border-primary/20 transition-all group"
      >
        <span className="text-xl">{rec.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              {t('stageRec.suggested', { defaultValue: 'مقترح لك' })}
            </span>
          </div>
          <p className="text-sm font-extrabold text-foreground mt-0.5 truncate">{t(rec.titleKey)}</p>
        </div>
        <ChevronIcon className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </Link>
    </motion.div>
  );
});
