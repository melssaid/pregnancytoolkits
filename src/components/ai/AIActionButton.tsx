import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, Sparkles, Crown, Zap } from 'lucide-react';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { resolveWeight, type AIToolType, type SmartSection } from '@/services/smartEngine/types';

interface AIActionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  label: string;
  loadingLabel?: string;
  disabled?: boolean;
  icon?: React.ElementType;
  className?: string;
  variant?: 'default' | 'compact';
  /** Set false to hide the usage indicator below the button */
  showUsage?: boolean;
  /** Tool type to show point cost hint */
  toolType?: AIToolType;
  /** Section to resolve tool type from if toolType not provided */
  section?: SmartSection;
}

const usageLabels: Record<string, { remaining: string; of: string; free: string; pro: string; upgrade: string; limitReached: string; resetsMonthly: string; unlockMore: string; costHint1: string; costHint2: string; upgradeHint: string }> = {
  en: { remaining: 'remaining', of: 'of', free: 'Free', pro: 'PRO', upgrade: 'Upgrade for 40 monthly', limitReached: 'Monthly limit reached', resetsMonthly: 'Resets monthly', unlockMore: 'Unlock more insights', costHint1: 'Uses 1 of your free credits', costHint2: 'Uses 2 of your free credits', upgradeHint: 'Upgrade for 40 monthly analyses →' },
  ar: { remaining: 'متبقي', of: 'من', free: 'مجاني', pro: 'PRO', upgrade: 'ترقية لـ 40 شهرياً', limitReached: 'تم استنفاد الحد الشهري', resetsMonthly: 'يتجدد شهرياً', unlockMore: 'افتحي المزيد من التحليلات', costHint1: 'تستهلك نقطة واحدة من رصيدك المجاني', costHint2: 'تستهلك نقطتين من رصيدك المجاني', upgradeHint: 'اشتركي للحصول على 40 تحليل شهرياً ←' },
  de: { remaining: 'übrig', of: 'von', free: 'Gratis', pro: 'PRO', upgrade: 'Upgrade für 40 monatlich', limitReached: 'Monatslimit erreicht', resetsMonthly: 'Monatlich zurückgesetzt', unlockMore: 'Mehr Einblicke freischalten', costHint1: 'Verbraucht 1 Ihrer Gratis-Credits', costHint2: 'Verbraucht 2 Ihrer Gratis-Credits', upgradeHint: 'Upgrade für 40 monatliche Analysen →' },
  fr: { remaining: 'restants', of: 'sur', free: 'Gratuit', pro: 'PRO', upgrade: 'Passer à 40 par mois', limitReached: 'Limite mensuelle atteinte', resetsMonthly: 'Réinitialisation mensuelle', unlockMore: 'Débloquer plus d\'analyses', costHint1: 'Utilise 1 de vos crédits gratuits', costHint2: 'Utilise 2 de vos crédits gratuits', upgradeHint: 'Passez à 40 analyses mensuelles →' },
  es: { remaining: 'restantes', of: 'de', free: 'Gratis', pro: 'PRO', upgrade: 'Mejora a 40 mensuales', limitReached: 'Límite mensual alcanzado', resetsMonthly: 'Se renueva mensualmente', unlockMore: 'Desbloquear más análisis', costHint1: 'Usa 1 de tus créditos gratuitos', costHint2: 'Usa 2 de tus créditos gratuitos', upgradeHint: 'Actualiza a 40 análisis mensuales →' },
  pt: { remaining: 'restantes', of: 'de', free: 'Grátis', pro: 'PRO', upgrade: 'Upgrade para 40 mensais', limitReached: 'Limite mensal atingido', resetsMonthly: 'Renova mensalmente', unlockMore: 'Desbloquear mais análises', costHint1: 'Usa 1 dos seus créditos gratuitos', costHint2: 'Usa 2 dos seus créditos gratuitos', upgradeHint: 'Atualize para 40 análises mensais →' },
  tr: { remaining: 'kalan', of: '/', free: 'Ücretsiz', pro: 'PRO', upgrade: '40 aylık için yükseltin', limitReached: 'Aylık limit doldu', resetsMonthly: 'Aylık sıfırlanır', unlockMore: 'Daha fazla analiz aç', costHint1: 'Ücretsiz kredinizden 1 kullanır', costHint2: 'Ücretsiz kredinizden 2 kullanır', upgradeHint: '40 aylık analiz için yükseltin →' },
};

/**
 * Unified AI action button with integrated usage counter.
 * When quota is exhausted, transforms into a premium upgrade CTA.
 */
export const AIActionButton: React.FC<AIActionButtonProps> = ({
  onClick,
  isLoading,
  label,
  loadingLabel,
  disabled,
  icon: CustomIcon,
  className = '',
  variant = 'default',
  showUsage = true,
  toolType,
  section,
}) => {
  const Icon = CustomIcon || Brain;
  const navigate = useNavigate();
  const isCompact = variant === 'compact';
  const { remaining, used, limit, isLimitReached, tier } = useAIUsage();
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const labels = usageLabels[lang] || usageLabels.en;
  const isFree = tier === 'free';
  const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
  const weight = resolveWeight(toolType, section);

  // Color based on remaining percentage
  const getBarColor = () => {
    if (isLimitReached) return 'bg-destructive';
    const remainPct = (remaining / limit) * 100;
    if (remainPct <= 15) return 'bg-destructive';
    if (remainPct <= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  // When exhausted, show upgrade button instead of dead state
  if (isLimitReached) {
    return (
      <div className="space-y-2">
        <motion.button
          onClick={() => navigate('/pricing-demo')}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          className={`relative w-full overflow-hidden rounded-xl group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${className}`}
        >
          <div
            className={`w-full flex items-center justify-center gap-2 font-semibold text-white transition-all duration-300 ${isCompact ? 'px-4 h-10 text-xs rounded-xl' : 'px-5 h-[52px] text-sm rounded-xl'}`}
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(340 55% 50%) 50%, hsl(280 45% 45%) 100%)',
              boxShadow: '0 4px 16px -2px hsl(var(--primary) / 0.25)',
            }}
          >
            <Crown className={`shrink-0 ${isCompact ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]'}`} />
            <span className="min-w-0 whitespace-normal text-center leading-tight">{labels.unlockMore}</span>
          </div>
          <span
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full rtl:translate-x-full rtl:group-hover:-translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            aria-hidden
          />
        </motion.button>

        {showUsage && (
          <div className="flex items-center gap-2 px-1">
            <Zap className="w-2.5 h-2.5 shrink-0 text-destructive" />
            <div className="flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
              <div className="h-full rounded-full bg-destructive w-full" />
            </div>
            <span className="text-[9px] text-muted-foreground font-medium tabular-nums shrink-0">
              0 <span className="opacity-60">/ {limit}</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  const effectiveDisabled = disabled || isLoading;

  return (
    <div className="space-y-2">
      <motion.button
        onClick={onClick}
        disabled={effectiveDisabled}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        className={`
          relative w-full overflow-hidden rounded-xl
          disabled:opacity-50 disabled:cursor-not-allowed
          group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2
          ${className}
        `}
      >
        {/* Background gradient */}
        <div
          className={`
            w-full flex items-center justify-center gap-2
            font-semibold text-white
            transition-all duration-300
            ${isCompact ? 'px-4 h-10 text-xs rounded-xl' : 'px-5 h-[52px] text-sm rounded-xl'}
          `}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(330 65% 50%) 50%, hsl(270 55% 50%) 100%)',
            boxShadow: isLoading
              ? 'none'
              : '0 4px 16px -2px hsl(var(--primary) / 0.35), 0 1px 4px hsl(var(--primary) / 0.2)',
          }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2.5">
              <Loader2 className={`animate-spin shrink-0 ${isCompact ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]'}`} />
              <span className="min-w-0 whitespace-normal text-center leading-tight">{loadingLabel || label}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <Icon className={`${isCompact ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]'}`} />
                <Sparkles className={`absolute -top-1 -end-1.5 text-yellow-300 opacity-80 ${isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5'}`} />
              </div>
              <span className="min-w-0 whitespace-normal text-center leading-tight">{label}</span>
            </div>
          )}
        </div>

        {/* Shimmer sweep on hover */}
        <span
          className="absolute inset-0 -translate-x-full group-hover:translate-x-full rtl:translate-x-full rtl:group-hover:-translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          aria-hidden
        />
      </motion.button>

      {/* Usage indicator — minimal single line */}
      {showUsage && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-1">
            <Zap className="w-2.5 h-2.5 shrink-0 text-primary" />
            <div className="flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getBarColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pct, 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground font-medium tabular-nums shrink-0">
              {remaining} <span className="opacity-60">/ {limit}</span>
            </span>
          </div>

          {/* Cost hint for free users */}
          {isFree && (
            <p className="text-[9px] text-muted-foreground/70 text-center leading-tight px-1">
              {weight === 2 ? labels.costHint2 : labels.costHint1}
              {' · '}
              <span
                className="text-primary/80 cursor-pointer hover:underline"
                onClick={(e) => { e.stopPropagation(); navigate('/pricing-demo'); }}
              >
                {labels.upgradeHint}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AIActionButton;
