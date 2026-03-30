import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const SPLASH_SEEN_KEY = 'pt_video_splash_seen';
const logoImage = '/splash-logo-v2.webp';

const languages = [
  { code: 'en', native: 'English', flag: '🇺🇸' },
  { code: 'ar', native: 'العربية', flag: '🇸🇦' },
  { code: 'de', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', native: 'Türkçe', flag: '🇹🇷' },
  { code: 'fr', native: 'Français', flag: '🇫🇷' },
  { code: 'es', native: 'Español', flag: '🇪🇸' },
  { code: 'pt', native: 'Português', flag: '🇵🇹' },
];

type Phase = 'loading' | 'video' | 'language';

interface Props {
  onComplete: () => void;
}

export const VideoSplash: React.FC<Props> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const endedRef = useRef(false);

  const { changeLanguage, currentLanguage } = useLanguage();
  const detected = currentLanguage || navigator.language?.split('-')[0] || 'en';
  const validDetected = languages.find(l => l.code === detected)?.code || 'en';
  const [selected, setSelected] = useState(validDetected);

  // Move to language picker phase
  const goToLangPicker = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setPhase('language');
  }, []);

  // Safety timeout
  useEffect(() => {
    const timer = setTimeout(goToLangPicker, 6000);
    return () => clearTimeout(timer);
  }, [goToLangPicker]);

  // Autoplay video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      setPhase('video');
      video.play().catch(goToLangPicker);
    };

    if (video.readyState >= 3) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
    }

    return () => video.removeEventListener('canplay', tryPlay);
  }, [goToLangPicker]);

  const handleVideoEnd = () => goToLangPicker();

  const handleContinue = () => {
    changeLanguage(selected);
    localStorage.setItem(SPLASH_SEEN_KEY, 'true');
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-[500] overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)' }}
    >
      {/* Phase 1: Branded loader */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-5"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={logoImage}
              alt=""
              width={72}
              height={72}
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            />
            <div className="flex gap-2">
              {[0, 0.2, 0.4].map((d, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: '#d4608a',
                    animation: `dotBounce 1.4s ease-in-out ${d}s infinite`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Video plays */}
      <motion.video
        ref={videoRef}
        src="/splash-video.mp4"
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
        onError={goToLangPicker}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ pointerEvents: 'none' }}
        animate={{ opacity: phase === 'video' ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Phase 3: Language picker slides up */}
      <AnimatePresence>
        {phase === 'language' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 180 }}
              className="mb-4"
            >
              <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-lg" style={{ boxShadow: '0 8px 30px rgba(212,96,138,0.25)' }}>
                <img src={logoImage} alt="" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-xl font-bold text-foreground mb-0.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Choose Your Language
            </motion.h1>
            <motion.p
              className="text-xs text-muted-foreground mb-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              اختر لغتك المفضلة
            </motion.p>

            {/* Language list */}
            <motion.div
              className="w-full max-w-xs space-y-1.5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              {languages.map((lang, i) => (
                <motion.button
                  key={lang.code}
                  onClick={() => setSelected(lang.code)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 transition-all duration-200',
                    selected === lang.code
                      ? 'bg-white/90 border-primary shadow-md scale-[1.02]'
                      : 'bg-white/50 border-transparent hover:bg-white/70'
                  )}
                  style={selected === lang.code ? { boxShadow: '0 4px 15px rgba(212,96,138,0.12)' } : undefined}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={cn(
                    'text-sm font-semibold',
                    selected === lang.code ? 'text-primary' : 'text-foreground/80'
                  )}>
                    {lang.native}
                  </span>
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

            {/* Continue */}
            <motion.button
              onClick={handleContinue}
              className="mt-5 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ boxShadow: '0 6px 20px rgba(212,96,138,0.3)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileTap={{ scale: 0.97 }}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const shouldShowVideoSplash = (): boolean => {
  return !localStorage.getItem(SPLASH_SEEN_KEY);
};
