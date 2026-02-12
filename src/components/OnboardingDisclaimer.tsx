import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Heart, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const ONBOARDING_KEY = 'onboarding_disclaimer_accepted';

export const OnboardingDisclaimer: React.FC = () => {
  const [show, setShow] = useState(false);
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  useEffect(() => {
    const accepted = localStorage.getItem(ONBOARDING_KEY);
    if (!accepted) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-3xl bg-card border border-border/50 shadow-2xl overflow-hidden"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Warm gradient header */}
            <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-secondary px-6 py-8 text-center">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-card/80 backdrop-blur flex items-center justify-center shadow-lg"
              >
                <BookOpen className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-xl font-bold text-foreground mb-1">
                {t('onboarding.title', 'Welcome to Your Journey')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.subtitle', 'Your lifestyle & educational companion')}
              </p>
            </div>

            {/* Disclaimer content */}
            <div className="px-6 py-5 space-y-4">
              {/* Main disclaimer */}
              <div className="bg-secondary/50 rounded-2xl p-4 border border-border/30">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {t('onboarding.disclaimer', 'This app is for informational and educational purposes only. It is not a medical device and does not provide clinical advice or diagnosis.')}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2.5">
                {[
                  { icon: BookOpen, text: t('onboarding.feature1', 'Personal journal & diary tools') },
                  { icon: Heart, text: t('onboarding.feature2', 'Educational wellness content') },
                  { icon: Shield, text: t('onboarding.feature3', 'Your data stays on your device') },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Accept button */}
              <Button
                onClick={handleAccept}
                className="w-full h-12 rounded-2xl text-sm font-semibold gap-2 shadow-lg shadow-primary/20"
              >
                <Check className="w-4 h-4" />
                {t('onboarding.accept', 'I Understand & Continue')}
              </Button>

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                {t('onboarding.consultNote', 'Always consult a qualified healthcare professional for any health concerns.')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
