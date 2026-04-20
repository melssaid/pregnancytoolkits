import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { resolveWeight, type AIToolType, type SmartSection } from '@/services/smartEngine/types';

const labels: Record<string, {
  consumed: string; remaining: string; of: string; thisAction: string;
  point: string; points: string; halfPoint: string; freeAction: string;
  upgradeCta: string; resetsMonthly: string; nearLimit: string;
}> = {
  ar: { consumed: 'استهلكتِ', remaining: 'المتبقي', of: 'من', thisAction: 'هذا التحليل',
        point: 'نقطة', points: 'نقاط', halfPoint: 'نصف نقطة', freeAction: 'تحليل مجاني ✨',
        upgradeCta: 'احصلي على 60 نقطة شهرياً', resetsMonthly: 'يتجدد شهرياً', nearLimit: 'اقتربتِ من نهاية الرصيد' },
  en: { consumed: 'Used', remaining: 'Remaining', of: 'of', thisAction: 'this analysis',
        point: 'point', points: 'points', halfPoint: '½ point', freeAction: 'Free analysis ✨',
        upgradeCta: 'Get 60 points monthly', resetsMonthly: 'Resets monthly', nearLimit: 'Almost out of credits' },
  de: { consumed: 'Verbraucht', remaining: 'Übrig', of: 'von', thisAction: 'diese Analyse',
        point: 'Punkt', points: 'Punkte', halfPoint: '½ Punkt', freeAction: 'Kostenlos ✨',
        upgradeCta: '60 Punkte monatlich', resetsMonthly: 'Monatlich', nearLimit: 'Limit fast erreicht' },
  fr: { consumed: 'Utilisé', remaining: 'Restant', of: 'sur', thisAction: 'cette analyse',
        point: 'point', points: 'points', halfPoint: '½ point', freeAction: 'Gratuit ✨',
        upgradeCta: '60 points par mois', resetsMonthly: 'Mensuel', nearLimit: 'Presque épuisé' },
  es: { consumed: 'Usado', remaining: 'Restante', of: 'de', thisAction: 'este análisis',
        point: 'punto', points: 'puntos', halfPoint: '½ punto', freeAction: 'Gratis ✨',
        upgradeCta: '60 puntos al mes', resetsMonthly: 'Mensual', nearLimit: 'Casi sin créditos' },
  pt: { consumed: 'Usado', remaining: 'Restante', of: 'de', thisAction: 'esta análise',
        point: 'ponto', points: 'pontos', halfPoint: '½ ponto', freeAction: 'Grátis ✨',
        upgradeCta: '60 pontos por mês', resetsMonthly: 'Mensal', nearLimit: 'Quase sem créditos' },
  tr: { consumed: 'Kullanıldı', remaining: 'Kalan', of: '/', thisAction: 'bu analiz',
        point: 'puan', points: 'puan', halfPoint: '½ puan', freeAction: 'Ücretsiz ✨',
        upgradeCta: 'Aylık 60 puan al', resetsMonthly: 'Aylık', nearLimit: 'Limit dolmak üzere' },
};

interface UsagePulseFooterProps {
  toolType?: AIToolType;
  section?: SmartSection;
  /** When true, plays a one-time consumption pulse animation */
  justConsumed?: boolean;
  className?: string;
}

/**
 * UsagePulseFooter — explicit post-analysis usage display.
 * Shows: "Used X point · Remaining Y/Z" with a thick gradient bar and consumption pulse.
 * Replaces ambiguous tiny counters with a clear, final, transparent statement.
 */
export const UsagePulseFooter: React.FC<UsagePulseFooterProps> = ({
  toolType,
  section,
  justConsumed = false,
  className = '',
}) => {
  const { remaining, used, limit, isLimitReached, tier } = useAIUsage();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language?.split('-')[0] || 'en';
  const L = labels[lang] || labels.en;

  const weight = resolveWeight(toolType, section);
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const remainPct = limit > 0 ? (remaining / limit) * 100 : 0;
  const isFree = tier === 'free';
  const isNearLimit = remainPct <= 20 && !isLimitReached;

  // Cost label
  const costLabel = weight === 0
    ? L.freeAction
    : weight === 0.5
      ? L.halfPoint
      : weight === 2
        ? `2 ${L.points}`
        : `1 ${L.point}`;

  // Bar gradient by remaining
  const barGradient = isLimitReached
    ? 'linear-gradient(90deg, hsl(0 72% 51%), hsl(0 72% 40%))'
    : remainPct <= 15
      ? 'linear-gradient(90deg, hsl(0 72% 51%), hsl(25 95% 53%))'
      : remainPct <= 40
        ? 'linear-gradient(90deg, hsl(38 92% 50%), hsl(25 95% 53%))'
        : 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 65% 50%))';

  // Trigger pulse animation when justConsumed flips to true
  const [showPulse, setShowPulse] = useState(false);
  useEffect(() => {
    if (justConsumed && weight > 0) {
      setShowPulse(true);
      const t = setTimeout(() => setShowPulse(false), 1800);
      return () => clearTimeout(t);
    }
  }, [justConsumed, weight]);

  return (
    <div className={`mt-4 pt-3 border-t border-primary/10 ${className}`}>
      {/* Headline: Used + Remaining */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <motion.div
            animate={showPulse ? { scale: [1, 1.4, 1], rotate: [0, -10, 0] } : {}}
            transition={{ duration: 0.6 }}
          >
            <Zap className={`w-3.5 h-3.5 shrink-0 ${weight === 0 ? 'text-emerald-500' : 'text-primary'}`} fill="currentColor" />
          </motion.div>
          <span className="text-[11.5px] font-semibold text-foreground truncate">
            {weight === 0 ? L.freeAction : `${L.consumed} ${costLabel}`}
          </span>
          <AnimatePresence>
            {showPulse && weight > 0 && (
              <motion.span
                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                animate={{ opacity: [0, 1, 1, 0], y: -14, scale: 1.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="text-[10px] font-bold text-destructive tabular-nums shrink-0"
              >
                −{weight}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <span className="text-[11.5px] font-bold tabular-nums shrink-0 text-foreground/85">
          <span className="text-muted-foreground font-medium">{L.remaining}: </span>
          <span className={isLimitReached ? 'text-destructive' : isNearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}>
            {remaining}
          </span>
          <span className="text-foreground/40 font-semibold">/{limit}</span>
        </span>
      </div>

      {/* Thick usage bar */}
      <div className="relative h-3.5 rounded-full bg-muted/40 overflow-hidden" style={{ boxShadow: 'inset 0 1px 3px hsl(0 0% 0% / 0.12)' }}>
        <motion.div
          className="h-full rounded-full relative"
          style={{ background: barGradient }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          {/* Shimmer near limit */}
          {isNearLimit && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2 }}
            />
          )}
          {/* Consumption pulse: bright tip dot */}
          <AnimatePresence>
            {showPulse && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 2.2, 0.5] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4 }}
                className="absolute top-1/2 -translate-y-1/2 right-0 rtl:right-auto rtl:left-0 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_2px_hsl(0_0%_100%_/_0.8)]"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Sub-line: nudge or reset hint */}
      <div className="flex items-center justify-between gap-2 mt-2 px-1">
        <span className="text-[10px] text-muted-foreground/80 font-medium">
          {isLimitReached ? L.nearLimit : L.resetsMonthly}
        </span>
        {isFree && (isNearLimit || isLimitReached) && (
          <button
            onClick={() => navigate('/pricing-demo')}
            className="flex items-center gap-1 text-[10.5px] font-bold text-primary hover:text-primary/80 transition-colors"
          >
            <Crown className="w-3 h-3" fill="currentColor" />
            <span>{L.upgradeCta}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UsagePulseFooter;
