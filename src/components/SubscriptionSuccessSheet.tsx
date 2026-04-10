import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, Sparkles, X, Brain, Shield, Heart, Zap, Gift, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import pricingLogo from '@/assets/pricing-logo.webp';

interface SubscriptionSuccessSheetProps {
  open: boolean;
  onClose: () => void;
  planType: 'monthly' | 'yearly' | null;
}

const i18nLabels: Record<string, {
  title: string;
  subtitle: string;
  plan: string;
  monthly: string;
  yearly: string;
  monthlyPrice: string;
  yearlyPrice: string;
  creditsBadge: string;
  perks: string[];
  cta: string;
  enjoy: string;
}> = {
  en: {
    title: 'You\'re Premium Now! 🎉',
    subtitle: 'Everything is unlocked and ready for you',
    plan: 'Your Plan',
    monthly: 'Monthly Premium',
    yearly: 'Yearly Premium',
    monthlyPrice: '$2.99/month',
    yearlyPrice: '$19.99/year',
    creditsBadge: '60 credits granted',
    perks: [
      '60 AI analyses every month',
      'All 36+ smart tools unlocked',
      'Personalized wellness insights',
      'Priority support & updates',
    ],
    cta: 'Start Exploring ✨',
    enjoy: 'Welcome to the full experience — enjoy every feature!',
  },
  ar: {
    title: 'أنتِ بريميوم الآن! 🎉',
    subtitle: 'كل شيء مفتوح وجاهز لكِ',
    plan: 'خطتكِ',
    monthly: 'الاشتراك الشهري',
    yearly: 'الاشتراك السنوي',
    monthlyPrice: '$2.99/شهر',
    yearlyPrice: '$19.99/سنة',
    creditsBadge: 'تم منحكِ 60 نقطة',
    perks: [
      '60 تحليل ذكاء اصطناعي شهرياً',
      'جميع 36+ أداة ذكية مفتوحة',
      'رؤى صحية مخصصة لكِ',
      'دعم وتحديثات بأولوية',
    ],
    cta: 'ابدئي الاستكشاف ✨',
    enjoy: 'مرحباً بكِ في التجربة الكاملة — استمتعي بكل الميزات!',
  },
  de: {
    title: 'Du bist jetzt Premium! 🎉',
    subtitle: 'Alles ist freigeschaltet und bereit für dich',
    plan: 'Dein Plan',
    monthly: 'Monatliches Premium',
    yearly: 'Jährliches Premium',
    monthlyPrice: '2,99 $/Monat',
    yearlyPrice: '19,99 $/Jahr',
    creditsBadge: '60 Credits erhalten',
    perks: [
      '60 KI-Analysen pro Monat',
      'Alle 36+ Smart-Tools freigeschaltet',
      'Personalisierte Wellness-Einblicke',
      'Prioritäts-Support & Updates',
    ],
    cta: 'Jetzt entdecken ✨',
    enjoy: 'Willkommen zum vollen Erlebnis — genieße jede Funktion!',
  },
  fr: {
    title: 'Vous êtes Premium ! 🎉',
    subtitle: 'Tout est débloqué et prêt pour vous',
    plan: 'Votre forfait',
    monthly: 'Premium mensuel',
    yearly: 'Premium annuel',
    monthlyPrice: '2,99 $/mois',
    yearlyPrice: '19,99 $/an',
    creditsBadge: '60 crédits accordés',
    perks: [
      '60 analyses IA par mois',
      'Tous les 36+ outils intelligents débloqués',
      'Conseils bien-être personnalisés',
      'Support & mises à jour prioritaires',
    ],
    cta: 'Commencer à explorer ✨',
    enjoy: 'Bienvenue dans l\'expérience complète — profitez de chaque fonctionnalité !',
  },
  es: {
    title: '¡Ya eres Premium! 🎉',
    subtitle: 'Todo está desbloqueado y listo para ti',
    plan: 'Tu plan',
    monthly: 'Premium mensual',
    yearly: 'Premium anual',
    monthlyPrice: '$2.99/mes',
    yearlyPrice: '$19.99/año',
    creditsBadge: '60 créditos otorgados',
    perks: [
      '60 análisis IA por mes',
      'Todas las 36+ herramientas desbloqueadas',
      'Información de bienestar personalizada',
      'Soporte y actualizaciones prioritarias',
    ],
    cta: 'Empezar a explorar ✨',
    enjoy: '¡Bienvenida a la experiencia completa — disfruta cada función!',
  },
  pt: {
    title: 'Você é Premium agora! 🎉',
    subtitle: 'Tudo está desbloqueado e pronto para você',
    plan: 'Seu plano',
    monthly: 'Premium mensal',
    yearly: 'Premium anual',
    monthlyPrice: '$2.99/mês',
    yearlyPrice: '$19.99/ano',
    creditsBadge: '60 créditos concedidos',
    perks: [
      '60 análises IA por mês',
      'Todas as 36+ ferramentas desbloqueadas',
      'Insights de bem-estar personalizados',
      'Suporte e atualizações prioritárias',
    ],
    cta: 'Começar a explorar ✨',
    enjoy: 'Bem-vinda à experiência completa — aproveite cada recurso!',
  },
  tr: {
    title: 'Artık Premiumsun! 🎉',
    subtitle: 'Her şey açık ve seni bekliyor',
    plan: 'Planınız',
    monthly: 'Aylık Premium',
    yearly: 'Yıllık Premium',
    monthlyPrice: '$2.99/ay',
    yearlyPrice: '$19.99/yıl',
    creditsBadge: '60 kredi verildi',
    perks: [
      'Ayda 60 AI analizi',
      'Tüm 36+ akıllı araç açık',
      'Kişiselleştirilmiş sağlık önerileri',
      'Öncelikli destek ve güncellemeler',
    ],
    cta: 'Keşfetmeye Başla ✨',
    enjoy: 'Tam deneyime hoş geldiniz — her özelliğin tadını çıkarın!',
  },
};

const perkIcons = [Brain, Zap, Heart, Shield];

export const SubscriptionSuccessSheet: React.FC<SubscriptionSuccessSheetProps> = ({
  open,
  onClose,
  planType,
}) => {
  const { i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const lang = i18n.language?.split('-')[0] || 'en';
  const labels = i18nLabels[lang] || i18nLabels.en;
  const isYearly = planType === 'yearly';

  // Haptic feedback on open (if available)
  useEffect(() => {
    if (open && navigator.vibrate) {
      navigator.vibrate([50, 30, 80]);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-[201] max-h-[92vh] overflow-y-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="bg-card rounded-t-3xl shadow-2xl border-t border-border/50 overflow-hidden">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-3 end-4 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors z-10"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="px-6 pb-8 pt-2 space-y-5">
                {/* Hero — Animated logo with success ring */}
                <div className="flex flex-col items-center gap-3 relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
                    className="relative"
                  >
                    {/* Animated gradient ring */}
                    <motion.div
                      className="absolute -inset-3 rounded-full"
                      style={{ background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(45 95% 55%), hsl(330 65% 50%), hsl(160 60% 45%), hsl(var(--primary)))' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="relative w-20 h-20 rounded-full bg-card flex items-center justify-center shadow-xl ring-4 ring-card overflow-hidden">
                      <img src={pricingLogo} alt="" className="w-full h-full object-cover" width={80} height={80} />
                    </div>

                    {/* Success badge */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
                      className="absolute -bottom-1 -end-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-3 ring-card"
                    >
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </motion.div>
                  </motion.div>

                  {/* Confetti burst */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute pointer-events-none"
                      style={{
                        top: '18%',
                        left: '50%',
                        width: i % 3 === 0 ? 8 : 5,
                        height: i % 3 === 0 ? 8 : 5,
                        borderRadius: i % 2 === 0 ? '50%' : '2px',
                        background: [
                          'hsl(var(--primary))', 'hsl(45 95% 55%)', 'hsl(330 65% 50%)',
                          'hsl(160 60% 45%)', 'hsl(270 55% 50%)', 'hsl(0 70% 55%)',
                          'hsl(200 70% 50%)', 'hsl(30 90% 55%)', 'hsl(120 60% 50%)',
                          'hsl(var(--primary))', 'hsl(45 95% 55%)', 'hsl(330 65% 50%)',
                        ][i],
                      }}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: Math.cos((i * Math.PI * 2) / 12) * (70 + Math.random() * 50),
                        y: Math.sin((i * Math.PI * 2) / 12) * (50 + Math.random() * 35) - 20,
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1.5, 1, 0],
                        rotate: [0, 180 + Math.random() * 180],
                      }}
                      transition={{ duration: 1.4, delay: 0.3 + i * 0.04, ease: 'easeOut' }}
                    />
                  ))}

                  {/* Title & subtitle */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-center space-y-1"
                  >
                    <h2 className="text-xl font-extrabold text-foreground flex items-center justify-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      {labels.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
                  </motion.div>
                </div>

                {/* Credits badge — the "wow" moment */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                  className="mx-auto w-fit"
                >
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 border-primary/30 shadow-md"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(45 95% 55% / 0.08))' }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -5, 0] }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                    >
                      <Gift className="w-5 h-5 text-primary" />
                    </motion.div>
                    <span className="text-sm font-bold text-foreground">{labels.creditsBadge}</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                    >
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Plan card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 }}
                  className="rounded-2xl border-2 border-primary/20 overflow-hidden"
                >
                  <div
                    className="px-4 py-3 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(330 65% 50% / 0.06))' }}
                  >
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">{labels.plan}</p>
                      <p className="text-sm font-bold text-foreground">
                        {isYearly ? labels.yearly : labels.monthly}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-extrabold text-foreground tabular-nums" style={{ fontFamily: "'Cairo', sans-serif" }}>
                        {isYearly ? '$19.99' : '$2.99'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {isYearly ? labels.yearlyPrice.split('/')[1] : labels.monthlyPrice.split('/')[1]}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Perks list */}
                <div className="space-y-2">
                  {labels.perks.map((perk, i) => {
                    const Icon = perkIcons[i] || Sparkles;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: isRTL ? 16 : -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{perk}</span>
                        <Check className="w-4 h-4 text-emerald-500 ms-auto flex-shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                  className="space-y-3 pt-1"
                >
                  <motion.button
                    onClick={onClose}
                    whileTap={{ scale: 0.97 }}
                    className="w-full h-12 rounded-2xl font-bold text-sm text-white shadow-lg shadow-primary/25"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(330 65% 50%) 50%, hsl(270 55% 50%) 100%)',
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {labels.cta}
                    </span>
                  </motion.button>

                  <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                    {labels.enjoy}
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionSuccessSheet;