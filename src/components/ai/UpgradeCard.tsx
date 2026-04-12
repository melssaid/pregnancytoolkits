import React from 'react';
import { motion } from 'framer-motion';
import { Crown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const labels: Record<string, { title: string; sub: string; cta: string }> = {
  en: { title: 'Unlock Premium', sub: '60 analyses/month + all tools', cta: 'View Plans' },
  ar: { title: 'اشتركي في بريميوم', sub: '60 تحليل شهرياً + جميع الأدوات', cta: 'عرض الباقات' },
  de: { title: 'Premium freischalten', sub: '60 Analysen/Monat + alle Tools', cta: 'Pläne' },
  fr: { title: 'Passer au Premium', sub: '60 analyses/mois + tous les outils', cta: 'Voir offres' },
  es: { title: 'Desbloquear Premium', sub: '60 análisis/mes + todas las herramientas', cta: 'Ver planes' },
  pt: { title: 'Desbloquear Premium', sub: '60 análises/mês + todas as ferramentas', cta: 'Ver planos' },
  tr: { title: 'Premium\'a Geç', sub: 'Ayda 60 analiz + tüm araçlar', cta: 'Planlar' },
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
