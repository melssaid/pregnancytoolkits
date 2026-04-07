import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, Sparkles, X, Brain, Shield, Heart, Zap } from 'lucide-react';
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
  perks: string[];
  cta: string;
  enjoy: string;
}> = {
  en: {
    title: 'Welcome to Premium!',
    subtitle: 'Your subscription is now active',
    plan: 'Your Plan',
    monthly: 'Monthly Premium',
    yearly: 'Yearly Premium',
    monthlyPrice: '$2.99/month',
    yearlyPrice: '$19.99/year',
    perks: ['60 AI analyses per month', 'All 23+ smart tools unlocked', 'Personalized health insights', 'Priority support'],
    cta: 'Start Exploring',
    enjoy: 'Thank you for choosing Pregnancy Toolkits Premium ✨',
  },
  ar: {
    title: 'مرحباً بكِ في بريميوم!',
    subtitle: 'اشتراككِ مفعّل الآن',
    plan: 'خطتكِ',
    monthly: 'الاشتراك الشهري',
    yearly: 'الاشتراك السنوي',
    monthlyPrice: '$2.99/شهر',
    yearlyPrice: '$19.99/سنة',
    perks: ['60 تحليل ذكاء اصطناعي شهرياً', 'جميع 23+ أداة ذكية', 'رؤى صحية مخصصة', 'دعم أولوية'],
    cta: 'ابدئي الاستكشاف',
    enjoy: 'شكراً لاختياركِ Pregnancy Toolkits بريميوم ✨',
  },
  de: {
    title: 'Willkommen bei Premium!',
    subtitle: 'Dein Abo ist jetzt aktiv',
    plan: 'Dein Plan',
    monthly: 'Monatliches Premium',
    yearly: 'Jährliches Premium',
    monthlyPrice: '2,99 $/Monat',
    yearlyPrice: '19,99 $/Jahr',
    perks: ['60 KI-Analysen pro Monat', 'Alle 23+ KI-Tools freigeschaltet', 'Personalisierte Gesundheitseinblicke', 'Prioritäts-Support'],
    cta: 'Jetzt entdecken',
    enjoy: 'Danke, dass du Pregnancy Toolkits Premium gewählt hast ✨',
  },
  fr: {
    title: 'Bienvenue en Premium !',
    subtitle: 'Votre abonnement est maintenant actif',
    plan: 'Votre forfait',
    monthly: 'Premium mensuel',
    yearly: 'Premium annuel',
    monthlyPrice: '2,99 $/mois',
    yearlyPrice: '19,99 $/an',
    perks: ['60 analyses IA par mois', 'Tous les 23+ outils intelligents débloqués', 'Conseils santé personnalisés', 'Support prioritaire'],
    cta: 'Commencer à explorer',
    enjoy: 'Merci d\'avoir choisi Pregnancy Toolkits Premium ✨',
  },
  es: {
    title: '¡Bienvenida a Premium!',
    subtitle: 'Tu suscripción ya está activa',
    plan: 'Tu plan',
    monthly: 'Premium mensual',
    yearly: 'Premium anual',
    monthlyPrice: '$2.99/mes',
    yearlyPrice: '$19.99/año',
    perks: ['60 análisis IA por mes', 'Todas las 23+ herramientas IA', 'Información de salud personalizada', 'Soporte prioritario'],
    cta: 'Empezar a explorar',
    enjoy: 'Gracias por elegir Pregnancy Toolkits Premium ✨',
  },
  pt: {
    title: 'Bem-vinda ao Premium!',
    subtitle: 'Sua assinatura está ativa',
    plan: 'Seu plano',
    monthly: 'Premium mensal',
    yearly: 'Premium anual',
    monthlyPrice: '$2.99/mês',
    yearlyPrice: '$19.99/ano',
    perks: ['60 análises IA por mês', 'Todas as 23+ ferramentas IA', 'Insights de saúde personalizados', 'Suporte prioritário'],
    cta: 'Começar a explorar',
    enjoy: 'Obrigada por escolher Pregnancy Toolkits Premium ✨',
  },
  tr: {
    title: 'Premium\'a Hoş Geldiniz!',
    subtitle: 'Aboneliğiniz artık aktif',
    plan: 'Planınız',
    monthly: 'Aylık Premium',
    yearly: 'Yıllık Premium',
    monthlyPrice: '$2.99/ay',
    yearlyPrice: '$19.99/yıl',
    perks: ['Ayda 60 AI analizi', 'Tüm 23+ akıllı araç açık', 'Kişiselleştirilmiş sağlık önerileri', 'Öncelikli destek'],
    cta: 'Keşfetmeye Başla',
    enjoy: 'Pregnancy Toolkits Premium\'u seçtiğiniz için teşekkürler ✨',
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
                {/* Hero — Animated checkmark + logo */}
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
                    className="relative"
                  >
                    {/* Success ring */}
                    <motion.div
                      className="absolute -inset-3 rounded-full"
                      style={{ background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(330 65% 50%), hsl(270 55% 50%), hsl(var(--primary)))' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                      className="absolute -inset-3 rounded-full"
                      style={{ background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(330 65% 50%), hsl(270 55% 50%), hsl(var(--primary)))' }}
                      animate={{ rotate: 360, opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="relative w-20 h-20 rounded-full bg-card flex items-center justify-center shadow-xl ring-4 ring-card overflow-hidden">
                      <img src={pricingLogo} alt="" className="w-full h-full object-cover" width={80} height={80} />
                    </div>

                    {/* Floating check badge */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
                      className="absolute -bottom-1 -end-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-3 ring-card"
                    >
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </motion.div>
                  </motion.div>

                  {/* Confetti particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute pointer-events-none"
                      style={{
                        top: '15%',
                        left: '50%',
                        width: 6,
                        height: 6,
                        borderRadius: i % 2 === 0 ? '50%' : '2px',
                        background: ['hsl(var(--primary))', 'hsl(330 65% 50%)', 'hsl(45 95% 55%)', 'hsl(160 60% 45%)', 'hsl(270 55% 50%)', 'hsl(0 70% 55%)', 'hsl(200 70% 50%)', 'hsl(30 90% 55%)'][i],
                      }}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: Math.cos((i * Math.PI * 2) / 8) * (60 + Math.random() * 40),
                        y: Math.sin((i * Math.PI * 2) / 8) * (40 + Math.random() * 30) - 20,
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1.5, 1, 0],
                      }}
                      transition={{ duration: 1.2, delay: 0.4 + i * 0.05, ease: 'easeOut' }}
                    />
                  ))}

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

                {/* Perks */}
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
