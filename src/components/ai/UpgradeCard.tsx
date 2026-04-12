import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const labels: Record<string, { title: string; sub: string; cta: string }> = {
  en: { title: 'Unlock Premium AI', sub: '60 smart analyses every month — unlimited access to all tools', cta: 'View Plans' },
  ar: { title: 'اشتركي في بريميوم', sub: '60 تحليل ذكي كل شهر — وصول كامل لجميع الأدوات', cta: 'عرض الباقات' },
  de: { title: 'Premium freischalten', sub: '60 smarte Analysen pro Monat — voller Zugang', cta: 'Pläne ansehen' },
  fr: { title: 'Passer au Premium', sub: '60 analyses intelligentes par mois — accès complet', cta: 'Voir les offres' },
  es: { title: 'Desbloquear Premium', sub: '60 análisis al mes — acceso completo a todo', cta: 'Ver planes' },
  pt: { title: 'Desbloquear Premium', sub: '60 análises por mês — acesso completo', cta: 'Ver planos' },
  tr: { title: 'Premium\'a Geç', sub: 'Ayda 60 akıllı analiz — tüm araçlara erişim', cta: 'Planları Gör' },
};

interface UpgradeCardProps {
  className?: string;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const l = labels[lang] || labels.en;

  return (
    <motion.button
      onClick={(e) => { e.stopPropagation(); navigate('/pricing-demo'); }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-md hover:shadow-lg active:shadow-sm transition-all duration-300 group ${className}`}
    >
      {/* Decorative elements */}
      <div className="absolute -top-5 -end-5 w-16 h-16 rounded-full bg-white/10 blur-sm" />
      <div className="absolute -bottom-3 -start-3 w-12 h-12 rounded-full bg-white/[0.07]" />

      <div className="relative px-4 py-3.5 flex items-center gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Crown className="w-5 h-5 text-white drop-shadow-sm" />
          <Sparkles className="absolute -top-0.5 end-0 w-3 h-3 text-yellow-300 opacity-90" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 text-start">
          <p className="text-sm font-extrabold leading-tight tracking-tight drop-shadow-sm">
            {l.title}
          </p>
          <p className="text-[11px] font-medium opacity-80 mt-0.5 leading-snug">
            {l.sub}
          </p>
        </div>

        {/* CTA arrow */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-white/20 group-hover:bg-white/30 rounded-lg px-3 py-1.5 transition-colors">
          <span className="text-[11px] font-bold text-white whitespace-nowrap">{l.cta}</span>
          <ArrowRight className="w-3.5 h-3.5 text-white rtl-flip" />
        </div>
      </div>
    </motion.button>
  );
};
