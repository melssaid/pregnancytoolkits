import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  onFinish: () => void;
  onBack: () => void;
}

export const OnboardingStep5Privacy: React.FC<Props> = ({ onFinish, onBack }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;

  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-5 pt-4 pb-3 text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-base font-bold text-foreground">
          {t('onboarding.step5.disclaimerTitle', 'Medical Disclaimer')}
        </h2>
      </div>

      <div className="px-5 pb-4">
        <div className="rounded-xl bg-muted/40 border border-border/30 p-4">
          <p className="text-xs text-foreground/70 leading-relaxed text-center font-medium">
            {t('onboarding.disclaimer')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-4 flex gap-2">
        <button onClick={onBack} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-medium flex items-center justify-center gap-1 hover:bg-muted/40 transition-colors">
          <BackIcon className="w-3.5 h-3.5" /> {t('onboarding.back', 'Back')}
        </button>
        <button
          onClick={onFinish}
          className="flex-[2] py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
        >
          {t('onboarding.step5.startJourney', 'Start Your Journey')}
        </button>
      </div>
    </motion.div>
  );
};
