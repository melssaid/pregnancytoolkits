import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resolveWeight, type AIToolType, type SmartSection } from '@/services/smartEngine/types';

const usageLabels: Record<string, { costHint0: string; costHint05: string; costHint1: string; costHint2: string; upgradeHint: string }> = {
  en: { costHint0: 'Free ✨', costHint05: 'Uses ½ credit', costHint1: 'Uses 1 credit', costHint2: 'Uses 2 credits', upgradeHint: 'Get 60/month with Premium →' },
  ar: { costHint0: 'مجاني ✨', costHint05: 'تستهلك نصف نقطة', costHint1: 'تستهلك نقطة واحدة', costHint2: 'تستهلك نقطتين', upgradeHint: 'ترقّي للحصول على 60 تحليل شهرياً ←' },
  de: { costHint0: 'Kostenlos ✨', costHint05: '½ Credit', costHint1: '1 Credit verbraucht', costHint2: '2 Credits verbraucht', upgradeHint: '60/Monat mit Premium erhalten →' },
  fr: { costHint0: 'Gratuit ✨', costHint05: '½ crédit', costHint1: 'Utilise 1 crédit', costHint2: 'Utilise 2 crédits', upgradeHint: 'Obtenez 60/mois avec Premium →' },
  es: { costHint0: 'Gratis ✨', costHint05: '½ crédito', costHint1: 'Usa 1 crédito', costHint2: 'Usa 2 créditos', upgradeHint: 'Obtén 60/mes con Premium →' },
  pt: { costHint0: 'Grátis ✨', costHint05: '½ crédito', costHint1: 'Usa 1 crédito', costHint2: 'Usa 2 créditos', upgradeHint: 'Obtenha 60/mês com Premium →' },
  tr: { costHint0: 'Ücretsiz ✨', costHint05: '½ kredi', costHint1: '1 kredi kullanır', costHint2: '2 kredi kullanır', upgradeHint: 'Premium ile 60/ay alın →' },
};

interface MiniUsageBarProps {
  toolType?: AIToolType;
  section?: SmartSection;
  className?: string;
}

/** Reusable usage bar with cost hints — for tools that don't use AIActionButton */
export const MiniUsageBar: React.FC<MiniUsageBarProps> = ({ toolType, section, className = '' }) => {
  const { remaining, used, limit, isLimitReached, tier } = useAIUsage();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const labels = usageLabels[lang] || usageLabels.en;
  const isFree = tier === 'free';
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const weight = resolveWeight(toolType, section);

  const getBarGradient = () => {
    if (isLimitReached) return 'linear-gradient(90deg, hsl(0 72% 51%), hsl(0 72% 40%))';
    const remainPct = (remaining / limit) * 100;
    if (remainPct <= 15) return 'linear-gradient(90deg, hsl(0 72% 51%), hsl(25 95% 53%))';
    if (remainPct <= 40) return 'linear-gradient(90deg, hsl(38 92% 50%), hsl(25 95% 53%))';
    return 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 65% 50%))';
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-2.5 px-1">
        <Zap className={`w-3 h-3 shrink-0 ${isLimitReached ? 'text-destructive' : 'text-primary'}`} />
        <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden" style={{ boxShadow: 'inset 0 1px 2px hsl(0 0% 0% / 0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: getBarGradient() }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground font-semibold tabular-nums shrink-0">
          {remaining} <span className="opacity-50">/ {limit}</span>
        </span>
      </div>

      {isFree && (
        <p className="text-[10px] text-muted-foreground/60 text-center leading-tight px-1">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60" />
            {weight === 0 ? labels.costHint0 : weight === 2 ? labels.costHint2 : weight === 0.5 ? labels.costHint05 : labels.costHint1}
          </span>
          {' · '}
          <span
            className="text-primary/70 cursor-pointer hover:text-primary hover:underline transition-colors"
            onClick={(e) => { e.stopPropagation(); navigate('/pricing-demo'); }}
          >
            {labels.upgradeHint}
          </span>
        </p>
      )}
    </div>
  );
};
