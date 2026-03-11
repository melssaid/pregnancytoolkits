import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, Sparkles, Crown, Zap } from 'lucide-react';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
}

const usageLabels: Record<string, { remaining: string; of: string; free: string; pro: string; upgrade: string; limitReached: string; resetsDaily: string }> = {
  en: { remaining: 'remaining', of: 'of', free: 'Free', pro: 'PRO', upgrade: 'Upgrade for 30 daily', limitReached: 'Daily limit reached', resetsDaily: 'Resets daily' },
  ar: { remaining: 'متبقي', of: 'من', free: 'مجاني', pro: 'PRO', upgrade: 'ترقية لـ 30 يومياً', limitReached: 'تم استنفاد الحد اليومي', resetsDaily: 'يتجدد يومياً' },
  de: { remaining: 'übrig', of: 'von', free: 'Gratis', pro: 'PRO', upgrade: 'Upgrade für 30 täglich', limitReached: 'Tageslimit erreicht', resetsDaily: 'Täglich zurückgesetzt' },
  fr: { remaining: 'restants', of: 'sur', free: 'Gratuit', pro: 'PRO', upgrade: 'Passer à 30 par jour', limitReached: 'Limite quotidienne atteinte', resetsDaily: 'Réinitialisation quotidienne' },
  es: { remaining: 'restantes', of: 'de', free: 'Gratis', pro: 'PRO', upgrade: 'Mejora a 30 diarios', limitReached: 'Límite diario alcanzado', resetsDaily: 'Se renueva diariamente' },
  pt: { remaining: 'restantes', of: 'de', free: 'Grátis', pro: 'PRO', upgrade: 'Upgrade para 30 diários', limitReached: 'Limite diário atingido', resetsDaily: 'Renova diariamente' },
  tr: { remaining: 'kalan', of: '/', free: 'Ücretsiz', pro: 'PRO', upgrade: '30 günlük için yükseltin', limitReached: 'Günlük limit doldu', resetsDaily: 'Günlük sıfırlanır' },
};

/**
 * Unified AI action button with integrated usage counter.
 * Connected to global AIUsageContext for consistent tracking across all tools.
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

  // Color based on remaining percentage
  const getBarColor = () => {
    if (isLimitReached) return 'bg-destructive';
    const remainPct = (remaining / limit) * 100;
    if (remainPct <= 15) return 'bg-destructive';
    if (remainPct <= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const effectiveDisabled = disabled || isLoading || isLimitReached;

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
            background: isLimitReached
              ? 'linear-gradient(135deg, hsl(var(--muted-foreground)) 0%, hsl(var(--muted-foreground)) 100%)'
              : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(330 65% 50%) 50%, hsl(270 55% 50%) 100%)',
            boxShadow: isLoading || isLimitReached
              ? 'none'
              : '0 4px 16px -2px hsl(var(--primary) / 0.35), 0 1px 4px hsl(var(--primary) / 0.2)',
          }}
        >
          {isLoading ? (
            <div className="flex items-center gap-2.5">
              <Loader2 className={`animate-spin shrink-0 ${isCompact ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]'}`} />
              <span className="truncate">{loadingLabel || label}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <Icon className={`${isCompact ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]'}`} />
                <Sparkles className={`absolute -top-1 -end-1.5 text-yellow-300 opacity-80 ${isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5'}`} />
              </div>
              <span className="truncate">{label}</span>
            </div>
          )}
        </div>

        {/* Shimmer sweep on hover */}
        {!isLimitReached && (
          <span
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full rtl:translate-x-full rtl:group-hover:-translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            aria-hidden
          />
        )}
      </motion.button>

      {/* Usage indicator — minimal single line */}
      {showUsage && (
        <div className="flex items-center gap-2 px-1">
          <Zap className={`w-2.5 h-2.5 shrink-0 ${isLimitReached ? 'text-destructive' : 'text-primary'}`} />
          <div className="flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getBarColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground font-medium tabular-nums shrink-0">
            {remaining}/{limit}
          </span>
          {isFree && (
            <button onClick={() => navigate('/pricing-demo')} className="shrink-0">
              <Crown className="w-2.5 h-2.5 text-primary" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AIActionButton;
