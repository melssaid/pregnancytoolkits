import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Heart, Baby } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TOUR_DONE_KEY = 'pt_guided_tour_done';

export function GuidedTour() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show tour only after onboarding is complete and tour hasn't been seen
    const onboardingDone = localStorage.getItem('onboarding_disclaimer_v3') === 'accepted';
    const tourDone = localStorage.getItem(TOUR_DONE_KEY);
    if (onboardingDone && !tourDone) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  const steps = [
    {
      icon: Sparkles,
      emoji: '🤖',
      title: t('tour.step1Title', { defaultValue: '33+ أداة ذكية' }),
      desc: t('tour.step1Desc', { defaultValue: 'أدوات مدعومة بالذكاء الاصطناعي لكل مرحلة من مراحل حملك' }),
      gradient: 'from-primary/20 to-pink-500/10',
    },
    {
      icon: Heart,
      emoji: '📊',
      title: t('tour.step2Title', { defaultValue: 'لوحة تحكم ذكية' }),
      desc: t('tour.step2Desc', { defaultValue: 'تتبعي وزنك، ركلات طفلك، ومواعيدك الطبية في مكان واحد' }),
      gradient: 'from-rose-500/15 to-primary/10',
    },
    {
      icon: Baby,
      emoji: '👶',
      title: t('tour.step3Title', { defaultValue: 'رحلة أسبوعية' }),
      desc: t('tour.step3Desc', { defaultValue: 'اكتشفي تطور طفلك كل أسبوع مع نصائح مخصصة لك' }),
      gradient: 'from-violet-500/15 to-primary/10',
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  const handleClose = () => {
    setShow(false);
    try { localStorage.setItem(TOUR_DONE_KEY, '1'); } catch {}
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      handleClose();
    }
  };

  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={handleClose}
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25 }}
          className="w-full max-w-sm bg-card rounded-3xl border border-border/50 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`bg-gradient-to-br ${current.gradient} p-8 text-center relative`}>
            <button onClick={handleClose} className="absolute top-3 end-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20">
              <X className="w-4 h-4 text-foreground/60" />
            </button>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-5xl block mb-3"
            >
              {current.emoji}
            </motion.span>
            <div className="w-10 h-10 rounded-full bg-primary/10 mx-auto mb-2 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="p-5 text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">{current.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{current.desc}</p>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition"
            >
              {step < steps.length - 1
                ? t('tour.next', { defaultValue: 'التالي' })
                : t('tour.start', { defaultValue: 'ابدأي الآن' })
              }
              <NextIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default GuidedTour;
