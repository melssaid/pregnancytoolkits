import React from 'react';
import { motion } from 'framer-motion';
import { UpgradeCard } from './UpgradeCard';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resolveWeight, type AIToolType, type SmartSection } from '@/services/smartEngine/types';

const usageLabels: Record<string, {
  costFree: string; costFmt: (n: number) => string;
  upgradeTitle: string; upgradeSub: string; upgradeCta: string;
  explanation: string; nearLimitNudge: string;
}> = {
  en: { costFree: 'Free ✨', costFmt: (n) => `Uses ${n} ${n === 1 ? 'credit' : 'credits'}`, upgradeTitle: 'Want more analyses?', upgradeSub: 'Get 75 smart analyses every month', upgradeCta: 'View Plans', explanation: 'Each smart analysis uses 1 point from your monthly balance', nearLimitNudge: 'Subscribe for 75 analyses/month' },
  ar: { costFree: 'مجاني ✨', costFmt: (n) => n === 1 ? 'تستهلك نقطة واحدة' : n === 2 ? 'تستهلك نقطتين' : `تستهلك ${n} نقاط`, upgradeTitle: 'تريدين تحليلات أكثر؟', upgradeSub: '75 تحليل ذكي كل شهر', upgradeCta: 'عرض الباقات', explanation: 'كل تحليل ذكي يستهلك نقطة واحدة من رصيدك الشهري', nearLimitNudge: 'اشتركي للحصول على 75 تحليل/شهر' },
  de: { costFree: 'Kostenlos ✨', costFmt: (n) => `Verbraucht ${n} ${n === 1 ? 'Credit' : 'Credits'}`, upgradeTitle: 'Mehr Analysen gewünscht?', upgradeSub: '75 smarte Analysen pro Monat', upgradeCta: 'Pläne ansehen', explanation: 'Jede Analyse verbraucht 1 Punkt Ihres monatlichen Guthabens', nearLimitNudge: 'Abonnieren für 75 Analysen/Monat' },
  fr: { costFree: 'Gratuit ✨', costFmt: (n) => `Utilise ${n} ${n === 1 ? 'crédit' : 'crédits'}`, upgradeTitle: 'Plus d\'analyses ?', upgradeSub: '75 analyses intelligentes par mois', upgradeCta: 'Voir les offres', explanation: 'Chaque analyse utilise 1 point de votre solde mensuel', nearLimitNudge: 'Abonnez-vous pour 75 analyses/mois' },
  es: { costFree: 'Gratis ✨', costFmt: (n) => `Usa ${n} ${n === 1 ? 'crédito' : 'créditos'}`, upgradeTitle: '¿Más análisis?', upgradeSub: '75 análisis inteligentes al mes', upgradeCta: 'Ver planes', explanation: 'Cada análisis usa 1 punto de tu saldo mensual', nearLimitNudge: 'Suscríbete para 75 análisis/mes' },
  pt: { costFree: 'Grátis ✨', costFmt: (n) => `Usa ${n} ${n === 1 ? 'crédito' : 'créditos'}`, upgradeTitle: 'Quer mais análises?', upgradeSub: '75 análises inteligentes por mês', upgradeCta: 'Ver planos', explanation: 'Cada análise usa 1 ponto do seu saldo mensal', nearLimitNudge: 'Assine para 75 análises/mês' },
  tr: { costFree: 'Ücretsiz ✨', costFmt: (n) => `${n} kredi kullanır`, upgradeTitle: 'Daha fazla analiz?', upgradeSub: 'Ayda 75 akıllı analiz', upgradeCta: 'Planları gör', explanation: 'Her analiz aylık bakiyenizden 1 puan kullanır', nearLimitNudge: '75 analiz/ay için abone olun' },
};

interface MiniUsageBarProps {
  toolType?: AIToolType;
  section?: SmartSection;
  className?: string;
  hideHint?: boolean;
}

/** Reusable usage bar with cost hints — for tools that don't use AIActionButton */
export const MiniUsageBar: React.FC<MiniUsageBarProps> = ({ toolType, section, className = '', hideHint = false }) => {
  const { remaining, used, limit, isLimitReached, tier } = useAIUsage();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const labels = usageLabels[lang] || usageLabels.en;
  const isFree = tier === 'free';
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const weight = resolveWeight(toolType, section);
  const isNearLimit = pct >= 70;

  const getBarColor = () => {
    if (isLimitReached) return 'hsl(0, 72%, 51%)';
    if (pct >= 80) return 'hsl(38, 92%, 50%)';
    return 'hsl(var(--primary))';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Usage bar — thicker and clearer */}
      <div className="flex items-center gap-2.5 px-1">
        <div className="flex-1 h-3.5 rounded-full bg-muted/40 overflow-hidden" style={{ boxShadow: 'inset 0 1px 3px hsl(0 0% 0% / 0.12)' }}>
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{ backgroundColor: getBarColor() }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Shimmer effect when near limit */}
            {isNearLimit && !isLimitReached && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              />
            )}
          </motion.div>
        </div>
        <span className="text-[12px] text-foreground/70 font-bold tabular-nums shrink-0">
          {remaining}<span className="text-foreground/40 font-semibold">/{limit}</span>
        </span>
      </div>

      {/* Explanation text */}
      {!hideHint && (
        <p className="text-[10px] text-muted-foreground/80 text-center font-medium px-1">
          {weight === 0 ? labels.costFree : weight === 1 ? labels.explanation : labels.costFmt(weight)}
        </p>
      )}

      {/* Near-limit nudge */}
      {isFree && isNearLimit && !isLimitReached && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/pricing-demo')}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-[hsl(45,85%,55%)] to-[hsl(35,75%,45%)] text-white text-[11px] font-bold text-center shadow-sm"
        >
          {labels.nearLimitNudge}
        </motion.button>
      )}

      {/* Upgrade CTA card for free users */}
      {isFree && <UpgradeCard />}
    </div>
  );
};
