import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const FIRST_VISIT_KEY = 'language_selected_first_visit';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', short: 'ع' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', short: 'DE' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', short: 'TR' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', short: 'FR' },
  { code: 'es', name: 'Español', flag: '🇪🇸', short: 'ES' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', short: 'PT' },
];

export const FirstVisitLanguageSelector: React.FC = () => {
  const [show, setShow] = useState(false);
  const { currentLanguage, changeLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(currentLanguage);

  useEffect(() => {
    const hasSelected = localStorage.getItem(FIRST_VISIT_KEY);
    const hasManual = localStorage.getItem('user_selected_language');
    if (!hasSelected && !hasManual) {
      const timer = setTimeout(() => setShow(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelect = (code: string) => {
    setSelectedLang(code);
  };

  const handleConfirm = () => {
    changeLanguage(selectedLang);
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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          onClick={() => {
            localStorage.setItem(FIRST_VISIT_KEY, 'true');
            setShow(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[280px] rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Decorative top gradient bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

            {/* Header - compact */}
            <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="p-1.5 rounded-lg bg-primary/10"
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-sm font-bold text-foreground leading-tight">
                  Choose Language
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  اختاري لغتك المفضلة
                </p>
              </div>
            </div>

            {/* Language Grid - compact */}
            <div className="px-3 pb-3 pt-1">
              <div className="grid grid-cols-2 gap-1.5">
                {languages.map((lang, i) => (
                  <motion.button
                    key={lang.code}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.2 }}
                    onClick={() => handleSelect(lang.code)}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all duration-200 text-start",
                      selectedLang === lang.code
                        ? "bg-primary/10 border-primary/40 shadow-sm shadow-primary/10"
                        : "bg-background/60 border-transparent hover:bg-muted/80"
                    )}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className={cn(
                      "text-xs font-medium flex-1 truncate",
                      selectedLang === lang.code ? "text-primary" : "text-foreground"
                    )}>
                      {lang.name}
                    </span>
                    {selectedLang === lang.code && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                      >
                        <Check className="w-3 h-3 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Confirm Button */}
            <div className="px-3 pb-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirm}
                className="w-full py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs transition-all hover:opacity-90 shadow-md shadow-primary/20"
              >
                {selectedLang === 'ar' ? 'تأكيد ✨' : 
                 selectedLang === 'de' ? 'Bestätigen ✨' :
                 selectedLang === 'tr' ? 'Onayla ✨' :
                 selectedLang === 'fr' ? 'Confirmer ✨' :
                 selectedLang === 'es' ? 'Confirmar ✨' :
                 selectedLang === 'pt' ? 'Confirmar ✨' :
                 'Continue ✨'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
