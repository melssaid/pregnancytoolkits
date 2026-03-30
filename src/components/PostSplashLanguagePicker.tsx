import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const logoImage = '/splash-logo-v2.webp';

const languages = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
];

const LANG_PICKED_KEY = 'pt_post_splash_lang_picked';

interface Props {
  onComplete: () => void;
}

export const PostSplashLanguagePicker: React.FC<Props> = ({ onComplete }) => {
  const { changeLanguage, currentLanguage } = useLanguage();
  const detected = currentLanguage || navigator.language?.split('-')[0] || 'en';
  const validDetected = languages.find(l => l.code === detected)?.code || 'en';
  const [selected, setSelected] = useState(validDetected);

  const handleContinue = () => {
    changeLanguage(selected);
    localStorage.setItem(LANG_PICKED_KEY, 'true');
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[400] flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 200 }}
        className="mb-4"
      >
        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-lg shadow-primary/20">
          <img src={logoImage} alt="" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-xl font-bold text-foreground mb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        Choose Your Language
      </motion.h1>
      <motion.p
        className="text-xs text-muted-foreground mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        اختر لغتك المفضلة
      </motion.p>

      {/* Language grid */}
      <motion.div
        className="w-full max-w-xs px-4 space-y-1.5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        {languages.map((lang, i) => (
          <motion.button
            key={lang.code}
            onClick={() => setSelected(lang.code)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.04, duration: 0.3 }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200',
              selected === lang.code
                ? 'bg-white/90 border-primary shadow-md shadow-primary/10 scale-[1.02]'
                : 'bg-white/50 border-transparent hover:bg-white/70'
            )}
          >
            <span className="text-2xl">{lang.flag}</span>
            <div className="flex flex-col items-start">
              <span className={cn(
                'text-sm font-semibold',
                selected === lang.code ? 'text-primary' : 'text-foreground/80'
              )}>
                {lang.native}
              </span>
            </div>
            {selected === lang.code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Continue button */}
      <motion.button
        onClick={handleContinue}
        className="mt-6 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        whileTap={{ scale: 0.97 }}
      >
        Continue
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};

export const shouldShowPostSplashLangPicker = (): boolean => {
  return !localStorage.getItem(LANG_PICKED_KEY);
};
