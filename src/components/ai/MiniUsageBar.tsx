import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { UpgradeCard } from './UpgradeCard';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resolveWeight, type AIToolType, type SmartSection } from '@/services/smartEngine/types';

const usageLabels: Record<string, { costHint0: string; costHint05: string; costHint1: string; costHint2: string; upgradeTitle: string; upgradeSub: string; upgradeCta: string }> = {
  en: { costHint0: 'Free ✨', costHint05: 'Uses ½ credit', costHint1: 'Uses 1 credit', costHint2: 'Uses 2 credits', upgradeTitle: 'Want more analyses?', upgradeSub: 'Get 60 smart analyses every month', upgradeCta: 'View Plans' },
  ar: { costHint0: 'مجاني ✨', costHint05: 'تستهلك نصف نقطة', costHint1: 'تستهلك نقطة واحدة', costHint2: 'تستهلك نقطتين', upgradeTitle: 'تريدين تحليلات أكثر؟', upgradeSub: '60 تحليل ذكي كل شهر', upgradeCta: 'عرض الباقات' },
  de: { costHint0: 'Kostenlos ✨', costHint05: '½ Credit', costHint1: '1 Credit verbraucht', costHint2: '2 Credits verbraucht', upgradeTitle: 'Mehr Analysen gewünscht?', upgradeSub: '60 smarte Analysen pro Monat', upgradeCta: 'Pläne ansehen' },
  fr: { costHint0: 'Gratuit ✨', costHint05: '½ crédit', costHint1: 'Utilise 1 crédit', costHint2: 'Utilise 2 crédits', upgradeTitle: 'Plus d\'analyses ?', upgradeSub: '60 analyses intelligentes par mois', upgradeCta: 'Voir les offres' },
  es: { costHint0: 'Gratis ✨', costHint05: '½ crédito', costHint1: 'Usa 1 crédito', costHint2: 'Usa 2 créditos', upgradeTitle: '¿Más análisis?', upgradeSub: '60 análisis inteligentes al mes', upgradeCta: 'Ver planes' },
  pt: { costHint0: 'Grátis ✨', costHint05: '½ crédito', costHint1: 'Usa 1 crédito', costHint2: 'Usa 2 créditos', upgradeTitle: 'Quer mais análises?', upgradeSub: '60 análises inteligentes por mês', upgradeCta: 'Ver planos' },
  tr: { costHint0: 'Ücretsiz ✨', costHint05: '½ kredi', costHint1: '1 kredi kullanır', costHint2: '2 kredi kullanır', upgradeTitle: 'Daha fazla analiz?', upgradeSub: 'Ayda 60 akıllı analiz', upgradeCta: 'Planları gör' },
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
    <div className={`space-y-2 ${className}`}>
      {/* Usage bar */}
      <div className="flex items-center gap-2.5 px-1">
        
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

      {/* Cost hint */}
      {weight > 0 && (
        <p className="text-[10px] text-muted-foreground/70 text-center font-medium px-1">
          <span className="inline-flex items-center gap-1">
            {weight === 2 ? labels.costHint2 : weight === 0.5 ? labels.costHint05 : labels.costHint1}
          </span>
          </span>
        </p>
      )}
      {weight === 0 && (
        <p className="text-[10px] text-muted-foreground/70 text-center font-medium px-1">
          {labels.costHint0}
        </p>
      )}

      {/* Upgrade CTA card for free users */}
      {isFree && <UpgradeCard />}
    </div>
  );
};