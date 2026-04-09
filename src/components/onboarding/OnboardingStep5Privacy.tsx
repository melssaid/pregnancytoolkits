import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, Check, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onFinish: () => void;
  onBack: () => void;
}

export const OnboardingStep5Privacy: React.FC<Props> = ({ onFinish, onBack }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;

  const privacyPoints = [
    { icon: Server, key: 'onboarding.step5.localData' },
    { icon: Eye, key: 'onboarding.step5.noThirdParty' },
    { icon: Lock, key: 'onboarding.step5.fullControl' },
  ];

  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-5 pt-3 pb-2 text-center">
        <div className="w-9 h-9 mx-auto mb-1.5 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-4.5 h-4.5 text-primary" />
        </div>
        <h2 className="text-sm font-bold text-foreground">
          {t('onboarding.step5.title', 'Your Privacy First')}
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {t('onboarding.step5.subtitle', 'We take your privacy seriously')}
        </p>
      </div>

      <div className="px-4 pb-3 space-y-3">
        {/* Privacy assurances */}
        <div className="space-y-1.5">
          {privacyPoints.map(({ icon: Icon, key }, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-accent/5 border border-accent/15">
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-accent-foreground" />
              </div>
              <span className="text-xs text-foreground/80">{t(key)}</span>
              <Check className="w-3.5 h-3.5 text-accent-foreground ms-auto flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Medical disclaimer */}
        <div className="rounded-xl bg-muted/30 border border-border/30 p-3">
          <div className="flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-foreground/70 mb-1">
                {t('onboarding.step5.disclaimerTitle', 'Medical Disclaimer')}
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {t('onboarding.disclaimer')}
              </p>
            </div>
          </div>
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
          <Sparkles className="w-4 h-4" />
          {t('onboarding.step5.startJourney', 'Start Your Journey')}
        </button>
      </div>
    </motion.div>
  );
};
