import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionModal } from '@/components/SubscriptionModal';

interface PaywallGateProps {
  children: ReactNode;
  isPremium?: boolean;
  fallback?: ReactNode;
  showPreview?: boolean;
}

/**
 * PaywallGate - Protects premium content behind subscription
 * 
 * Usage:
 * <PaywallGate isPremium={tool.isPremium}>
 *   <YourPremiumComponent />
 * </PaywallGate>
 */
export function PaywallGate({ 
  children, 
  isPremium = false, 
  fallback,
  showPreview = true,
}: PaywallGateProps) {
  const { hasAccess, isTrialActive, trialDaysLeft } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  // Free tools or user has access - show content
  if (!isPremium || hasAccess(isPremium)) {
    return <>{children}</>;
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default paywall UI
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex items-center justify-center p-4"
      >
        <div className="max-w-sm w-full text-center space-y-6">
          {/* Lock Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              محتوى مميز
            </h2>
            <p className="text-muted-foreground text-sm">
              هذه الأداة متاحة للمشتركين فقط
            </p>
          </div>

          {/* Trial Badge */}
          {!isTrialActive && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">جرّب مجاناً لمدة 3 أيام</span>
            </div>
          )}

          {/* Benefits */}
          <div className="space-y-3 text-left bg-card rounded-xl p-4 border border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              مميزات الاشتراك:
            </p>
            <ul className="space-y-2">
              {[
                'وصول غير محدود لجميع الأدوات',
                'استشارات AI شخصية',
                'تحليلات صحية متقدمة',
                'بدون إعلانات',
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Crown className="w-3 h-3 text-primary" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => setShowModal(true)}
            size="lg"
            className="w-full h-12 rounded-xl font-semibold"
          >
            <Crown className="w-5 h-5 mr-2" />
            فتح الوصول الكامل
          </Button>

          {/* Price hint */}
          <p className="text-xs text-muted-foreground">
            يبدأ من $1.99/شهر • إلغاء في أي وقت
          </p>
        </div>
      </motion.div>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}

/**
 * Premium Badge Component - Shows on tool cards
 */
export function PremiumBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-white text-[10px] font-bold uppercase tracking-wide ${className}`}>
      <Crown className="w-3 h-3" />
      <span>Premium</span>
    </div>
  );
}

/**
 * Trial Badge Component - Shows remaining trial days
 */
export function TrialBadge() {
  const { isTrialActive, trialDaysLeft } = useSubscription();

  if (!isTrialActive) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/30">
      <Sparkles className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-medium text-foreground">
        {trialDaysLeft} {trialDaysLeft === 1 ? 'يوم' : 'أيام'} متبقية
      </span>
    </div>
  );
}

export default PaywallGate;
