import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, Globe, Baby, CalendarIcon, ChevronRight, ChevronLeft, Sparkles, Heart, Brain, Flower2, Lock, Languages, Eye, X, Ruler, Weight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { formatLocalized } from '@/lib/dateLocale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/logo.png';

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

type Step = 'welcome' | 'profile';

export const OnboardingDisclaimer: React.FC = () => {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<Step>('welcome');
  const { t, i18n } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { profile, updateProfile, setLastPeriodDate } = useUserProfile();
  const [selectedLang, setSelectedLang] = useState(currentLanguage);
  const [isPregnant, setIsPregnant] = useState(true);
  const [week, setWeek] = useState<string>(String(profile.pregnancyWeek ?? 20));
  const [weight, setWeight] = useState<string>(profile.weight ? String(profile.weight) : '');
  const [height, setHeight] = useState<string>(profile.height ? String(profile.height) : '');
  const [lmpDate, setLmpDate] = useState<Date | undefined>(
    profile.lastPeriodDate ? new Date(profile.lastPeriodDate + "T00:00:00") : undefined
  );
  const [lmpPopoverOpen, setLmpPopoverOpen] = useState(false);
  const isRtl = i18n.dir() === 'rtl';

  useEffect(() => {
    const accepted = localStorage.getItem(ONBOARDING_KEY);
    if (!accepted) setShow(true);
  }, []);

  const handleFinish = () => {
    const updates: Record<string, unknown> = { isPregnant };

    if (isPregnant) {
      const weekNum = parseInt(week);
      if (!isNaN(weekNum) && weekNum >= 1 && weekNum <= 42) {
        updates.pregnancyWeek = weekNum;
      }
      if (lmpDate) {
        setLastPeriodDate(format(lmpDate, 'yyyy-MM-dd'));
      }
    }

    const w = parseFloat(weight);
    if (!isNaN(w) && w > 0 && w < 300) updates.weight = w;

    const h = parseFloat(height);
    if (!isNaN(h) && h > 0 && h < 300) updates.height = h;

    if (Object.keys(updates).length > 0) updateProfile(updates);

    changeLanguage(selectedLang);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    setShow(false);
  };

  const stepIndex = step === 'welcome' ? 0 : 1;

  // RTL-aware chevron icons
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;

  if (!show) return null;

  const highlights = [
    { icon: Brain, colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10', key: 'feature1' },
    { icon: Heart, colorClass: 'text-pink-500', bgClass: 'bg-pink-500/10', key: 'feature2' },
    { icon: Flower2, colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', key: 'feature3' },
  ];

  const valueProps = [
    { icon: Sparkles, key: 'aiAssistant247' },
    { icon: Languages, key: 'sevenLangs' },
    { icon: Lock, key: 'privacyFirst' },
    { icon: Eye, key: 'transparency' },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-[380px] max-h-[90vh] rounded-2xl bg-card border border-border/50 shadow-2xl overflow-y-auto"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Progress bar */}
            <div className="h-1 w-full bg-muted sticky top-0 z-10">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                animate={{ width: `${((stepIndex + 1) / 2) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Step dots */}
            <div className="flex justify-center gap-2 pt-3 pb-1">
              {[0, 1].map(i => (
                <div key={i} className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === stepIndex ? "bg-primary w-4" : i < stepIndex ? "bg-primary/40" : "bg-muted"
                )} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: Welcome + Language */}
              {step === 'welcome' && (
                <motion.div key="welcome" initial={{ opacity: 0, x: isRtl ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRtl ? 20 : -20 }}>
                  {/* Logo & App Name */}
                  <div className="px-5 pt-3 pb-2 text-center">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-16 h-16 mx-auto mb-3 rounded-full shadow-lg overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                    >
                      <img src={logoImage} alt="App Logo" className="w-full h-full object-cover" />
                    </motion.div>
                    <h2 className="text-lg font-bold text-foreground">
                      {t('app.name', 'Pregnancy Toolkits')}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('app.tagline', 'Your Complete Pregnancy Companion')}
                    </p>
                  </div>

                  {/* Feature highlights */}
                  <div className="px-5 pb-3">
                    <div className="flex justify-center gap-4">
                      {highlights.map((f, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="flex flex-col items-center gap-1.5"
                        >
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", f.bgClass)}>
                            <f.icon className={cn("w-5 h-5", f.colorClass)} />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {t(`onboarding.${f.key}`)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Value Proposition */}
                  <div className="px-4 pb-3">
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-3 border border-primary/10 space-y-1.5">
                      {valueProps.map((vp, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.08 }}
                          className="flex items-center gap-2"
                        >
                          <vp.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="text-[10px] text-foreground/80">
                            {t(`onboarding.${vp.key}`)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Language selector */}
                  <div className="px-4 pb-2">
                    <div className="flex items-center gap-1.5 mb-1.5 px-1">
                      <Globe className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {t('onboarding.chooseLang', 'Choose Language')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setSelectedLang(lang.code); changeLanguage(lang.code); }}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all text-start",
                            selectedLang === lang.code
                              ? "bg-primary/10 border-primary/40"
                              : "bg-background/60 border-transparent hover:bg-muted/80"
                          )}
                        >
                          <span className="text-sm">{lang.flag}</span>
                          <span className={cn("text-[11px] font-medium truncate", selectedLang === lang.code ? "text-primary" : "text-foreground")}>
                            {lang.name}
                          </span>
                          {selectedLang === lang.code && <Check className="w-2.5 h-2.5 text-primary ms-auto flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <button
                      onClick={() => setStep('profile')}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      {t('onboarding.next', 'Continue')} <NextIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Profile + Disclaimer */}
              {step === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, x: isRtl ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRtl ? 20 : -20 }}>
                  <div className="px-4 pt-2 pb-2 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Baby className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-sm font-bold text-foreground">
                      {t('onboarding.profileTitle', 'Your Pregnancy Info')}
                    </h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {t('onboarding.profileSubtitle', 'Helps all tools work instantly for you')}
                    </p>
                  </div>

                  <div className="px-4 pb-3 space-y-3">
                    {/* Pregnant / Not Pregnant Toggle */}
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                        {t('onboarding.pregnancyStatus', 'Pregnancy Status')}
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setIsPregnant(true)}
                          className={cn(
                            "py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                            isPregnant
                              ? "bg-primary/10 border-primary/40 text-primary"
                              : "bg-background/60 border-border text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          <Baby className="w-3.5 h-3.5" />
                          {t('onboarding.pregnant', 'Pregnant')}
                        </button>
                        <button
                          onClick={() => setIsPregnant(false)}
                          className={cn(
                            "py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                            !isPregnant
                              ? "bg-primary/10 border-primary/40 text-primary"
                              : "bg-background/60 border-border text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {t('onboarding.notPregnant', 'Not Pregnant')}
                        </button>
                      </div>
                    </div>

                    {/* Pregnancy Week - only when pregnant */}
                    {isPregnant && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                            {t('onboarding.pregnancyWeek', 'Current Pregnancy Week')} (1–42)
                          </label>
                          <input
                            type="number"
                            min={1} max={42}
                            value={week}
                            onChange={e => setWeek(e.target.value)}
                            className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="20"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                            <CalendarIcon className="w-3 h-3 inline me-1" />
                            {t('onboarding.lastPeriod', 'Last Period Date')} ({t('onboarding.optional', 'optional')})
                          </label>
                          <div className="flex gap-1.5">
                            <Popover open={lmpPopoverOpen} onOpenChange={setLmpPopoverOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "flex-1 justify-start text-left font-normal h-9 text-sm",
                                    !lmpDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="me-2 h-3.5 w-3.5 text-primary shrink-0" />
                                  {lmpDate ? formatLocalized(lmpDate, "PPP", currentLanguage) : <span>{t('toolsInternal.dueDate.pickDate', 'Pick a date')}</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-[400]" align="start">
                                <Calendar
                                  mode="single"
                                  selected={lmpDate}
                                  onSelect={(date) => { setLmpDate(date); setLmpPopoverOpen(false); }}
                                  disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            {lmpDate && (
                              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => setLmpDate(undefined)}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Weight & Height */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                          <Weight className="w-3 h-3 inline me-1" />
                          {t('onboarding.weight', 'Weight')} (kg)
                        </label>
                        <input
                          type="number"
                          min={30} max={200}
                          value={weight}
                          onChange={e => setWeight(e.target.value)}
                          className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="65"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                          <Ruler className="w-3 h-3 inline me-1" />
                          {t('onboarding.height', 'Height')} (cm)
                        </label>
                        <input
                          type="number"
                          min={100} max={220}
                          value={height}
                          onChange={e => setHeight(e.target.value)}
                          className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="165"
                        />
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                      <Shield className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {t('onboarding.disclaimer')}
                      </p>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStep('welcome')}
                        className="flex-1 py-2 rounded-xl border border-border text-xs font-medium flex items-center justify-center gap-1 hover:bg-muted/50 transition-colors"
                      >
                        <BackIcon className="w-3.5 h-3.5" />
                        {t('onboarding.back', 'Back')}
                      </button>
                      <button
                        onClick={handleFinish}
                        className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-md shadow-primary/20"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {t('onboarding.accept', 'I Understand & Continue')}
                      </button>
                    </div>

                    <p className="text-[9px] text-muted-foreground/60 text-center">
                      {t('onboarding.consultNote')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
