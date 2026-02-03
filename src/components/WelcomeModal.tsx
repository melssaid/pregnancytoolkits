import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/logo.png';

export const WelcomeModal: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeModal');
    if (!hasSeenWelcome) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('hasSeenWelcomeModal', 'true');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleAccept()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Decorative Header */}
            <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-6 pt-8 pb-12">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              
              <div className="relative flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-4"
                >
                  <img 
                    src={logoImage} 
                    alt="Logo" 
                    className="w-20 h-20 rounded-full shadow-lg border-4 border-white/30"
                  />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-primary-foreground mb-1"
                >
                  {t('welcome.title', 'Welcome to Pregnancy Toolkits')}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-primary-foreground/80"
                >
                  {t('welcome.subtitle', 'Your complete pregnancy companion')}
                </motion.p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 -mt-6 relative">
              <div className="bg-card rounded-xl border border-border shadow-sm p-4 mb-4">
                {/* Features */}
                <div className="space-y-3 mb-5">
                  <motion.div 
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground">
                      {t('welcome.feature1', '40+ AI-powered pregnancy tools')}
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="text-sm text-foreground">
                      {t('welcome.feature2', 'Personalized health tracking')}
                    </p>
                  </motion.div>
                </div>

                {/* Disclaimer */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="relative rounded-lg overflow-hidden"
                >
                  <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-900/50 dark:to-slate-800/30 p-3 ps-4 border border-border/50">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                          {t('welcome.disclaimerTitle', 'Medical Disclaimer')}
                        </p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          {t('welcome.disclaimerText', 'This app provides general information only and is not a substitute for professional medical advice. Always consult your healthcare provider for any health concerns.')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Accept Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button 
                  onClick={handleAccept}
                  className="w-full h-12 text-base font-semibold gap-2 rounded-xl shadow-lg"
                >
                  {t('welcome.getStarted', 'Get Started')}
                  <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                </Button>
              </motion.div>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                {t('welcome.agreement', 'By continuing, you agree to our Terms of Service')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
