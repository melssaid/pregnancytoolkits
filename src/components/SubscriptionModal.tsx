import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Zap, Brain, Shield, Clock, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import useSubscription from '@/hooks/useSubscription';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal = forwardRef<HTMLDivElement, SubscriptionModalProps>(
  function SubscriptionModal({ isOpen, onClose }, ref) {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const { subscribeMonthly, subscribeYearly, restorePurchases, trialDaysLeft, isTrialActive } = useSubscription();

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      if (selectedPlan === 'monthly') {
        subscribeMonthly();
      } else {
        subscribeYearly();
      }
      toast.info(t('subscriptionModal.processingPurchase', 'Processing purchase...'));
      setTimeout(() => setIsLoading(false), 2000);
    } catch (error) {
      toast.error(t('subscriptionModal.errorProcessing'));
      setIsLoading(false);
    }
  };

  const handleRestore = () => {
    restorePurchases();
    toast.info(t('subscriptionModal.restoringPurchases', 'Restoring purchases...'));
  };

  const features = [
    { icon: Brain, textKey: 'subscriptionModal.unlimitedAI' },
    { icon: Sparkles, textKey: 'subscriptionModal.personalizedMeals' },
    { icon: Shield, textKey: 'subscriptionModal.advancedHealth' },
    { icon: Zap, textKey: 'subscriptionModal.prioritySupport' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm"
          >
            <Card className="border-0 shadow-2xl bg-card overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent p-5 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider opacity-90">{t('subscriptionModal.premium')}</span>
                </div>
                <h2 className="text-lg font-bold">{t('subscriptionModal.unlockFullAccess')}</h2>
                <p className="text-xs opacity-90 mt-1">{t('subscriptionModal.allAIFeatures')}</p>
              </div>

              <CardContent className="p-5 space-y-4">
                {/* Trial banner */}
                <div className="bg-accent/50 border border-accent rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    {isTrialActive ? (
                      <>
                        <p className="text-sm font-bold text-foreground">
                          {t('subscriptionModal.trialRemaining', '{{days}} days remaining', { days: trialDaysLeft })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{t('subscriptionModal.fullAccessCancel')}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-foreground">
                          {t('subscriptionModal.trialEnded', 'Free trial ended')}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {t('subscriptionModal.subscribeToUnlock', 'Subscribe to unlock all premium tools')}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Plan selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedPlan('monthly')}
                    className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                      selectedPlan === 'monthly'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('subscriptionModal.monthly')}</p>
                    <p className="text-lg font-bold text-foreground">$2.99</p>
                    <p className="text-[10px] text-muted-foreground">{t('subscriptionModal.perMonth')}</p>
                  </button>

                  <button
                    onClick={() => setSelectedPlan('yearly')}
                    className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                      selectedPlan === 'yearly'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="absolute -top-2 -right-1 px-2 py-0.5 bg-primary text-primary-foreground text-[8px] font-bold rounded-full uppercase">
                      {t('subscriptionModal.save', 'Save 44%')}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t('subscriptionModal.yearly')}</p>
                    <p className="text-lg font-bold text-foreground">$19.99</p>
                    <p className="text-[10px] text-muted-foreground">{t('subscriptionModal.perYear')}</p>
                  </button>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs text-foreground">{t(feature.textKey)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={handleSubscribe}
                    className="w-full h-11 rounded-xl font-semibold text-sm"
                    disabled={isLoading}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isLoading
                      ? t('subscriptionModal.processing')
                      : `${t('subscriptionModal.subscribe', 'Subscribe')} - ${selectedPlan === 'monthly' ? '$2.99/' + t('subscriptionModal.perMonth', 'mo') : '$19.99/' + t('subscriptionModal.perYear', 'yr')}`
                    }
                  </Button>

                  <Button
                    onClick={handleRestore}
                    variant="outline"
                    className="w-full h-10 rounded-xl text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-2" />
                    {t('subscriptionModal.restorePurchases', 'Restore Purchases')}
                  </Button>
                </div>

                <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                  {t('subscriptionModal.paymentSecure')}
                  <br />{t('subscriptionModal.cancelAnytime')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

SubscriptionModal.displayName = "SubscriptionModal";

export default SubscriptionModal;
