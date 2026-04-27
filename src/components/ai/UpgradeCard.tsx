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
// `sub` is the default subtitle (paid premium · monthly renewal).
// `couponSub` is shown to free users with an active one-time coupon
// to avoid implying an automatic monthly renewal. Wording is aligned
// with UsagePulseFooter ("Coupon points · one-time" / "نقاط الكوبون لمرة واحدة").
// `tier5` / `tier7` formally explain the heavy-weight tools so the user
// understands exactly what 5- and 7-point analyses cover within this same plan.
const labels: Record<string, { title: string; sub: string; couponSub: string; cta: string; tier5: string; tier7: string }> = {
  en: {
    title: 'Unlock Premium',
    sub: '75 analyses/month · all tools included',
    couponSub: 'Coupon points · one-time. Subscribe for monthly renewal',
    cta: 'View Plans',
    tier5: '5 pts · Bump photo review & live web search',
    tier7: '7 pts · Holistic dashboard analysis (full data review)',
  },
  ar: {
    title: 'اشتركي في الباقة المميّزة',
    sub: '٧٥ تحليلاً شهرياً · جميع الأدوات متاحة',
    couponSub: 'نقاط الكوبون لمرة واحدة · يُرجى الاشتراك للتجديد الشهري',
    cta: 'عرض الباقات',
    tier5: '٥ نقاط · تحليل صور البطن والبحث المباشر على الويب',
    tier7: '٧ نقاط · التحليل الشامل للوحة المعلومات (مراجعة كاملة لبياناتك)',
  },
  de: {
    title: 'Premium freischalten',
    sub: '75 Analysen/Monat · alle Tools inklusive',
    couponSub: 'Gutschein · einmalig. Abonnieren Sie für monatliche Erneuerung',
    cta: 'Pläne',
    tier5: '5 Pkt. · Bauchfoto-Auswertung & Live-Websuche',
    tier7: '7 Pkt. · Ganzheitliche Dashboard-Analyse (vollständige Datenprüfung)',
  },
  fr: {
    title: 'Passer au Premium',
    sub: '75 analyses/mois · tous les outils inclus',
    couponSub: 'Points coupon · usage unique. Abonnez-vous pour le renouvellement mensuel',
    cta: 'Voir offres',
    tier5: '5 pts · Analyse photo baby bump & recherche web en direct',
    tier7: '7 pts · Analyse globale du tableau de bord (revue complète)',
  },
  es: {
    title: 'Desbloquear Premium',
    sub: '75 análisis/mes · todas las herramientas incluidas',
    couponSub: 'Cupón · uso único. Suscríbase para renovación mensual',
    cta: 'Ver planes',
    tier5: '5 pts · Análisis de fotos del embarazo y búsqueda web en vivo',
    tier7: '7 pts · Análisis integral del panel (revisión completa de datos)',
  },
  pt: {
    title: 'Desbloquear Premium',
    sub: '75 análises/mês · todas as ferramentas incluídas',
    couponSub: 'Cupom · uso único. Assine para renovação mensal',
    cta: 'Ver planos',
    tier5: '5 pts · Análise de fotos da barriga e pesquisa web ao vivo',
    tier7: '7 pts · Análise integral do painel (revisão completa de dados)',
  },
  tr: {
    title: 'Premium\'a Geçin',
    sub: 'Ayda 75 analiz · tüm araçlar dahil',
    couponSub: 'Kupon · tek seferlik. Aylık yenileme için abone olun',
    cta: 'Planlar',
    tier5: '5 puan · Karın fotoğrafı incelemesi ve canlı web araması',
    tier7: '7 puan · Bütünsel panel analizi (tüm veri incelemesi)',
  },
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
      <div className="px-3.5 py-2.5 flex items-start gap-2.5">
        {/* Icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mt-0.5">
          <Crown className="w-4 h-4 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 text-start">
          <p className="text-xs font-bold leading-tight">{l.title}</p>
          <p className="text-[11px] opacity-80 mt-px leading-tight">{subtitle}</p>

          {/* Formal weight legend — only for the default (non-coupon) subtitle */}
          {!hasOneTimeCoupon && (
            <div className="mt-1.5 pt-1.5 border-t border-white/15 space-y-0.5">
              <p className="text-[10px] opacity-75 leading-snug">{l.tier5}</p>
              <p className="text-[10px] opacity-75 leading-snug">{l.tier7}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 self-center flex items-center gap-1 bg-white/20 group-hover:bg-white/30 rounded-lg px-2.5 py-1 transition-colors">
          <span className="text-[11px] font-bold whitespace-nowrap">{l.cta}</span>
          <ChevronRight className="w-3 h-3 rtl-flip" />
        </div>
      </div>
    </motion.button>
  );
};
