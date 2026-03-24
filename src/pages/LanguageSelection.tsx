import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { Layout } from '@/components/Layout';
import { SEOHead } from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { Check, Globe, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const languages = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸', greeting: 'Hello!', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', greeting: '!مرحباً', dir: 'rtl' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', greeting: 'Hallo!', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', greeting: 'Merhaba!', dir: 'ltr' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', greeting: 'Bonjour!', dir: 'ltr' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', greeting: '¡Hola!', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', greeting: 'Olá!', dir: 'ltr' },
];

const LanguageSelection: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isChanging } = useLanguage();
  const navigate = useNavigate();

  const handleSelect = async (code: string) => {
    await changeLanguage(code);
  };

  return (
    <Layout showBack>
      <SEOHead title={t('settings.language.sectionTitle')} description="Choose your preferred language" />
      <div className="container py-6 pb-28 max-w-lg mx-auto">
        
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {t('settings.language.sectionTitle', 'Language')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('settings.language.pageSubtitle', 'Choose your preferred language')}
          </p>
        </motion.div>

        {/* Language Cards */}
        <div className={cn("space-y-3", isChanging && "opacity-60 pointer-events-none")}>
          {languages.map((lang, i) => {
            const isActive = currentLanguage === lang.code;
            return (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  "w-full flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200",
                  isActive
                    ? "bg-primary/8 border-primary/40 shadow-md shadow-primary/10 ring-1 ring-primary/20"
                    : "bg-card border-border/60 hover:bg-muted/50 hover:border-border"
                )}
              >
                {/* Flag */}
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                  isActive ? "bg-primary/15" : "bg-muted/60"
                )}>
                  {lang.flag}
                </div>

                {/* Text */}
                <div className="flex-1 text-start min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-base font-semibold",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                      {lang.native}
                    </span>
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-bold uppercase tracking-wider"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {t('settings.language.active', 'Active')}
                      </motion.span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                </div>

                {/* Greeting Preview */}
                <div className="flex-shrink-0 text-end">
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-primary/70" : "text-muted-foreground/50"
                  )} dir={lang.dir}>
                    {lang.greeting}
                  </span>
                </div>

                {/* Check */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[11px] text-muted-foreground/60 mt-6"
        >
          {t('settings.language.autoDetectNote', 'Using your browser language automatically.')}
        </motion.p>
      </div>
    </Layout>
  );
};

export default LanguageSelection;
