import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const ONBOARDING_KEY = 'onboarding_disclaimer_accepted';
const FIRST_VISIT_KEY = 'language_selected_first_visit';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

export const OnboardingDisclaimer: React.FC = () => {
  const [show, setShow] = useState(false);
  const { t, i18n } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(currentLanguage);
  const isRtl = i18n.dir() === 'rtl';

  useEffect(() => {
    const accepted = localStorage.getItem(ONBOARDING_KEY);
    if (!accepted) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    changeLanguage(selectedLang);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
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
            className="w-full max-w-[300px] rounded-2xl bg-card border border-border/50 shadow-2xl overflow-hidden"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Gradient top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

            {/* Compact header */}
            <div className="px-4 pt-4 pb-2 text-center">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-11 h-11 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <Shield className="w-5 h-5 text-primary" />
              </motion.div>
              <h1 className="text-sm font-bold text-foreground">
                {t('onboarding.title', 'Welcome to Your Journey')}
              </h1>
            </div>

            {/* Disclaimer - compact */}
            <div className="px-4 pb-2">
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                {t('onboarding.disclaimer', 'This app is for informational and educational purposes only. It is not a medical device and does not provide clinical advice or diagnosis.')}
              </p>
            </div>

            {/* Language selector */}
            <div className="px-3 pb-2">
              <div className="flex items-center gap-1.5 px-1 mb-1.5">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground">
                  {t('onboarding.chooseLang', 'Choose Language')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {languages.map((lang, i) => (
                  <motion.button
                    key={lang.code}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.15 }}
                    onClick={() => {
                      setSelectedLang(lang.code);
                      changeLanguage(lang.code);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all duration-200 text-start",
                      selectedLang === lang.code
                        ? "bg-primary/10 border-primary/40"
                        : "bg-background/60 border-transparent hover:bg-muted/80"
                    )}
                  >
                    <span className="text-sm leading-none">{lang.flag}</span>
                    <span className={cn(
                      "text-[11px] font-medium truncate",
                      selectedLang === lang.code ? "text-primary" : "text-foreground"
                    )}>
                      {lang.name}
                    </span>
                    {selectedLang === lang.code && (
                      <Check className="w-2.5 h-2.5 text-primary ms-auto" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Accept button */}
            <div className="px-3 pb-3 pt-1">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAccept}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs transition-all hover:opacity-90 shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {t('onboarding.accept', 'I Understand & Continue')}
              </motion.button>
              <p className="text-[9px] text-muted-foreground/60 text-center mt-1.5">
                {t('onboarding.consultNote', 'Always consult a qualified healthcare professional for any health concerns.')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
