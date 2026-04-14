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
      className="flex h-full flex-col"
      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-5 pt-5 pb-3 text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-black text-foreground">
          {t('onboarding.step5.disclaimerTitle', 'Medical Disclaimer')}
        </h2>
      </div>

      <div className="px-5 pb-4">
        <div className="rounded-2xl bg-muted/40 border border-border/30 p-5">
          <p className="text-sm text-foreground/70 leading-relaxed text-center font-medium">
            {t('onboarding.disclaimer')}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-5 flex gap-2.5">
        <motion.button whileTap={{ scale: 0.95 }} onClick={onBack} className="flex-1 py-3.5 rounded-2xl border border-border/40 bg-card text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-muted/40 transition-colors text-foreground/70 shadow-sm">
          <BackIcon className="w-4 h-4" /> {t('onboarding.back', 'Back')}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onFinish}
          className="flex-[2] py-3.5 rounded-2xl bg-primary text-primary-foreground text-base font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          {t('onboarding.step5.startJourney', 'Start Your Journey')}
        </motion.button>
      </div>
    </motion.div>
  );
};
