import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Globe, Lock, Sparkles, ChevronLeft, ChevronRight, Check, Baby, Activity, Brain, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const logoImage = "/splash-logo-v2.webp";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

interface Props {
  selectedLang: string;
  onSelectLang: (code: string) => void;
  onNext: () => void;
}

export const OnboardingStep1Welcome: React.FC<Props> = ({ selectedLang, onSelectLang, onNext }) => {
  const { t, i18n } = useTranslation();
  const { changeLanguage } = useLanguage();
  const isRtl = i18n.language === 'ar';
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const handleLangSelect = (code: string) => {
    onSelectLang(code);
    changeLanguage(code);
  };

  const showcaseItems = [
    { icon: Baby, colorClass: 'text-pink-500', bgClass: 'bg-pink-500/10' },
    { icon: Activity, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10' },
    { icon: Brain, colorClass: 'text-violet-500', bgClass: 'bg-violet-500/10' },
    { icon: UtensilsCrossed, colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10' },
  ];

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo & Title */}
      <div className="px-5 pt-3 pb-2 text-center">
        <motion.div
          className="w-16 h-16 mx-auto mb-2.5 rounded-2xl overflow-hidden shadow-lg ring-2 ring-primary/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <img src={logoImage} alt="App Logo" className="w-full h-full object-cover" />
        </motion.div>
        <h2 className="text-base font-bold text-foreground">
          {t('onboarding.title', 'Welcome to Your Journey')}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {t('onboarding.subtitle', 'Your lifestyle & educational companion')}
        </p>
      </div>


      {/* Value props */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { icon: Sparkles, key: 'aiAssistant247' },
            { icon: Globe, key: 'sevenLangs' },
            { icon: Lock, key: 'privacyFirst' },
            { icon: Shield, key: 'transparency' },
          ].map((vp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-muted/40"
            >
              <vp.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-[10px] text-foreground/70 leading-tight">
                {t(`onboarding.${vp.key}`)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Language selector */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-1.5 mb-1.5 px-0.5">
          <Globe className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            {t('onboarding.chooseLang', 'Choose Language')}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-0.5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLangSelect(lang.code)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-2 rounded-lg border transition-colors text-start",
                selectedLang === lang.code
                  ? "bg-primary/8 border-primary/30"
                  : "bg-transparent border-transparent hover:bg-muted/60"
              )}
            >
              <span className="text-sm">{lang.flag}</span>
              <span className={cn("text-[11px] font-medium truncate", selectedLang === lang.code ? "text-primary" : "text-foreground/70")}>
                {lang.name}
              </span>
              {selectedLang === lang.code && <Check className="w-2.5 h-2.5 text-primary ms-auto flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
        >
          {t('onboarding.next', 'Continue')} <NextIcon className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
};
