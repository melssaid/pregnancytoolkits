import React from 'react';
import { motion } from 'framer-motion';
import { Crown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAIUsage } from '@/contexts/AIUsageContext';
import { useActiveCoupon } from '@/hooks/useActiveCoupon';

// `sub` is the default subtitle (paid premium · monthly renewal).
// `couponSub` is shown to free users with an active one-time coupon
// to avoid implying an automatic monthly renewal. Wording is aligned
// with UsagePulseFooter ("Coupon points · one-time" / "نقاط الكوبون لمرة واحدة").
const labels: Record<string, { title: string; sub: string; couponSub: string; cta: string }> = {
  en: { title: 'Unlock Premium', sub: '60 analyses/month + all tools', couponSub: 'Coupon points · one-time. Subscribe for monthly renewal', cta: 'View Plans' },
  ar: { title: 'اشتركي في بريميوم', sub: '60 تحليل شهرياً + جميع الأدوات', couponSub: 'نقاط الكوبون لمرة واحدة · اشتركي للتجديد الشهري', cta: 'عرض الباقات' },
  de: { title: 'Premium freischalten', sub: '60 Analysen/Monat + alle Tools', couponSub: 'Gutschein · einmalig. Abonniere für monatliche Erneuerung', cta: 'Pläne' },
  fr: { title: 'Passer au Premium', sub: '60 analyses/mois + tous les outils', couponSub: 'Points coupon · unique. Abonnez-vous pour le renouvellement mensuel', cta: 'Voir offres' },
  es: { title: 'Desbloquear Premium', sub: '60 análisis/mes + todas las herramientas', couponSub: 'Cupón · un solo uso. Suscríbete para renovación mensual', cta: 'Ver planes' },
  pt: { title: 'Desbloquear Premium', sub: '60 análises/mês + todas as ferramentas', couponSub: 'Cupom · uso único. Assine para renovação mensal', cta: 'Ver planos' },
  tr: { title: 'Premium\'a Geç', sub: 'Ayda 60 analiz + tüm araçlar', couponSub: 'Kupon · tek seferlik. Aylık yenileme için abone ol', cta: 'Planlar' },
};

interface UpgradeCardProps {
  className?: string;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { tier } = useAIUsage();
  const { activeCoupon } = useActiveCoupon();
  const lang = i18n.language?.split('-')[0] || 'en';
  const l = labels[lang] || labels.en;
  // Free user with an active coupon → bonus is one-time, not auto-renewed.
  const hasOneTimeCoupon = tier === 'free' && !!activeCoupon;
  const subtitle = hasOneTimeCoupon ? l.couponSub : l.sub;

  return (
    <motion.button
      onClick={(e) => { e.stopPropagation(); navigate('/pricing-demo'); }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-sm hover:shadow-md active:shadow-none transition-all duration-200 group ${className}`}
    >
      <div className="px-3.5 py-2.5 flex items-center gap-2.5">
        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Crown className="w-4 h-4 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 text-start">
          <p className="text-xs font-bold leading-tight">{l.title}</p>
          <p className="text-[11px] opacity-75 mt-px leading-tight">{l.sub}</p>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 flex items-center gap-1 bg-white/20 group-hover:bg-white/30 rounded-lg px-2.5 py-1 transition-colors">
          <span className="text-[11px] font-bold whitespace-nowrap">{l.cta}</span>
          <ChevronRight className="w-3 h-3 rtl-flip" />
        </div>
      </div>
    </motion.button>
  );
};
