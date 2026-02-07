import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

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

export const FirstVisitLanguageSelector: React.FC = () => {
  const [show, setShow] = useState(false);
  const { currentLanguage, changeLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(currentLanguage);

  useEffect(() => {
    const hasSelected = localStorage.getItem(FIRST_VISIT_KEY);
    const hasManual = localStorage.getItem('user_selected_language');
    if (!hasSelected && !hasManual) {
      // Small delay so the app renders first
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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="p-3 rounded-full bg-primary/10 mb-3">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Choose your language
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                اختاري لغتك المفضلة
              </p>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200",
                    selectedLang === lang.code
                      ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
                      : "bg-background border-border hover:bg-muted"
                  )}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className={cn(
                    "text-sm font-medium flex-1 text-start",
                    selectedLang === lang.code ? "text-primary" : "text-foreground"
                  )}>
                    {lang.name}
                  </span>
                  {selectedLang === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                    >
                      <Check className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {selectedLang === 'ar' ? 'تأكيد' : 
               selectedLang === 'de' ? 'Bestätigen' :
               selectedLang === 'tr' ? 'Onayla' :
               selectedLang === 'fr' ? 'Confirmer' :
               selectedLang === 'es' ? 'Confirmar' :
               selectedLang === 'pt' ? 'Confirmar' :
               'Continue'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
