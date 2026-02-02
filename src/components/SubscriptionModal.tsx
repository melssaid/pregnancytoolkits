import { useState, forwardRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Zap, Brain, Shield, Clock, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { billingService } from '@/services/billingService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal = forwardRef<HTMLDivElement, SubscriptionModalProps>(
  function SubscriptionModal({ isOpen, onClose }, ref) {
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const [prices, setPrices] = useState({ monthly: '$1.99/month', yearly: '$14.99/year' });
    
    const { 
      subscribeMonthly, 
      subscribeYearly, 
      startFreeTrial, 
      restorePurchases,
      isLoading,
      isNativeApp,
      isTrialActive,
      isSubscribed,
    } = useSubscription();

    // Load real prices from Google Play
    useEffect(() => {
      if (isOpen) {
        billingService.getProductPrices().then(setPrices);
      }
    }, [isOpen]);

    const handleSubscribe = async () => {
      if (!isNativeApp) {
        toast.info('الاشتراك عبر التطبيق', {
          description: 'سيتم معالجة الدفع عبر Google Play عند تثبيت التطبيق من المتجر.',
        });
        return;
      }

      const success = selectedPlan === 'monthly' 
        ? await subscribeMonthly()
        : await subscribeYearly();

      if (success) {
        toast.success('تم الاشتراك بنجاح! 🎉', {
          description: 'شكراً لك! استمتع بجميع الميزات المميزة.',
        });
        onClose();
      } else {
        toast.error('تعذر إتمام الاشتراك', {
          description: 'يرجى المحاولة مرة أخرى.',
        });
      }
    };

    const handleStartTrial = () => {
      const started = startFreeTrial();
      
      if (started) {
        toast.success('تم تفعيل الفترة التجريبية! 🎉', {
          description: '3 أيام مجانية للوصول الكامل. استمتع بجميع الميزات!',
        });
        onClose();
      } else {
        toast.info('الفترة التجريبية مستخدمة', {
          description: 'لقد استخدمت الفترة التجريبية مسبقاً.',
        });
      }
    };

    const handleRestore = async () => {
      if (!isNativeApp) {
        toast.info('استعادة المشتريات', {
          description: 'هذه الميزة متاحة فقط في التطبيق الأصلي.',
        });
        return;
      }

      const success = await restorePurchases();
      
      if (success) {
        toast.success('تم استعادة المشتريات! ✓', {
          description: 'تم استعادة اشتراكك بنجاح.',
        });
        onClose();
      } else {
        toast.info('لا توجد مشتريات سابقة', {
          description: 'لم نجد أي اشتراكات سابقة لحسابك.',
        });
      }
    };

    const features = [
      { icon: Brain, text: 'استشارات AI غير محدودة', textEn: 'Unlimited AI Consultations' },
      { icon: Sparkles, text: 'خطط تغذية مخصصة', textEn: 'Personalized Meal Plans' },
      { icon: Shield, text: 'تتبع صحي متقدم', textEn: 'Advanced Health Tracking' },
      { icon: Zap, text: 'دعم أولوي', textEn: 'Priority Support' },
    ];

    // Already subscribed view
    if (isSubscribed) {
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
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm"
              >
                <Card className="border-0 shadow-2xl bg-card overflow-hidden text-center p-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">أنت مشترك! 🎉</h2>
                  <p className="text-muted-foreground mb-4">استمتع بجميع الميزات المميزة</p>
                  <Button onClick={onClose} className="w-full">
                    متابعة
                  </Button>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      );
    }

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
              ref={ref}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm max-h-[90vh] overflow-y-auto"
            >
              <Card className="border-0 shadow-2xl bg-card overflow-hidden">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-primary to-accent p-5 text-white relative">
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider opacity-90">Premium</span>
                  </div>
                  <h2 className="text-lg font-bold">افتح الوصول الكامل</h2>
                  <p className="text-xs opacity-90 mt-1">جميع ميزات AI، استخدام غير محدود</p>
                </div>

                <CardContent className="p-5 space-y-4">
                  {/* Free Trial Banner */}
                  {!isTrialActive && (
                    <div className="bg-accent/20 border border-accent/30 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">3 أيام تجربة مجانية</p>
                        <p className="text-[10px] text-muted-foreground">وصول كامل، إلغاء في أي وقت</p>
                      </div>
                    </div>
                  )}

                  {/* Plan Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Monthly Plan */}
                    <button
                      onClick={() => setSelectedPlan('monthly')}
                      className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                        selectedPlan === 'monthly'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {selectedPlan === 'monthly' && (
                        <div className="absolute top-2 left-2">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">شهري</p>
                      <p className="text-lg font-bold text-foreground">$1.99</p>
                      <p className="text-[10px] text-muted-foreground">/شهر</p>
                    </button>

                    {/* Yearly Plan */}
                    <button
                      onClick={() => setSelectedPlan('yearly')}
                      className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                        selectedPlan === 'yearly'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="absolute -top-2 -right-1 px-2 py-0.5 bg-primary text-primary-foreground text-[8px] font-bold rounded-full uppercase">
                        وفّر 37%
                      </div>
                      {selectedPlan === 'yearly' && (
                        <div className="absolute top-2 left-2">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">سنوي</p>
                      <p className="text-lg font-bold text-foreground">$14.99</p>
                      <p className="text-[10px] text-muted-foreground">/سنة</p>
                    </button>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <feature.icon className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-xs text-foreground">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-2 pt-2">
                    {!isTrialActive && (
                      <Button
                        onClick={handleStartTrial}
                        className="w-full h-11 rounded-xl font-semibold text-sm"
                        disabled={isLoading}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        ابدأ التجربة المجانية (3 أيام)
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleSubscribe}
                      variant={isTrialActive ? "default" : "outline"}
                      className="w-full h-10 rounded-xl text-xs"
                      disabled={isLoading}
                    >
                      {isLoading ? 'جاري المعالجة...' : `اشترك ${selectedPlan === 'monthly' ? '$1.99/شهر' : '$14.99/سنة'}`}
                    </Button>

                    {/* Restore Purchases */}
                    <button
                      onClick={handleRestore}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      <RefreshCw className="w-3 h-3" />
                      استعادة المشتريات السابقة
                    </button>
                  </div>

                  {/* Footer */}
                  <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                    الدفع يتم بأمان عبر Google Play.
                    <br />إلغاء في أي وقت. بدون رسوم مخفية.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

SubscriptionModal.displayName = "SubscriptionModal";

export default SubscriptionModal;
