import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sparkles, Check, Zap, Brain, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    // Google Play Billing integration placeholder
    // In production, this will use @anthropic/capacitor-purchases or similar
    try {
      // Simulate subscription process
      toast.info('Google Play Billing', {
        description: 'Payment will be processed via Google Play. This feature requires the native app.',
      });
      
      // For web preview, show coming soon message
      setTimeout(() => {
        toast.success('Thank you for your interest!', {
          description: 'Subscription will be available in the app store version.',
        });
        setIsLoading(false);
        onClose();
      }, 1500);
    } catch (error) {
      toast.error('Unable to process subscription');
      setIsLoading(false);
    }
  };

  const startFreeTrial = () => {
    toast.success('Free Trial Activated!', {
      description: '3 days of full access. Enjoy all premium features!',
    });
    onClose();
  };

  const features = [
    { icon: Brain, text: 'Unlimited AI Consultations' },
    { icon: Sparkles, text: 'Personalized Meal Plans' },
    { icon: Shield, text: 'Advanced Health Tracking' },
    { icon: Zap, text: 'Priority Support' },
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
                <h2 className="text-lg font-bold">Unlock Full Access</h2>
                <p className="text-xs opacity-90 mt-1">All AI features, unlimited use</p>
              </div>

              <CardContent className="p-5 space-y-4">
                {/* Free Trial Banner */}
                <div className="bg-accent/50 border border-accent rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">3 Days Free Trial</p>
                    <p className="text-[10px] text-muted-foreground">Full access, cancel anytime</p>
                  </div>
                </div>

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
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Monthly</p>
                    <p className="text-lg font-bold text-foreground">$1.99</p>
                    <p className="text-[10px] text-muted-foreground">/month</p>
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
                      Save 37%
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Yearly</p>
                    <p className="text-lg font-bold text-foreground">$14.99</p>
                    <p className="text-[10px] text-muted-foreground">/year</p>
                  </button>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs text-foreground">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={startFreeTrial}
                    className="w-full h-11 rounded-xl font-semibold text-sm"
                    disabled={isLoading}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start 3-Day Free Trial
                  </Button>
                  
                  <Button
                    onClick={handleSubscribe}
                    variant="outline"
                    className="w-full h-10 rounded-xl text-xs"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : `Subscribe ${selectedPlan === 'monthly' ? '$1.99/mo' : '$14.99/yr'}`}
                  </Button>
                </div>

                {/* Footer */}
                <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                  Payment processed securely via Google Play.
                  <br />Cancel anytime. No hidden fees.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SubscriptionModal;
