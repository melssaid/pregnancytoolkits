import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";

interface SubscriptionBannerProps {
  onSubscribe?: () => void;
}

export const SubscriptionBanner = ({ onSubscribe }: SubscriptionBannerProps) => {
  const { t } = useTranslation();
  const { isTrialActive, trialDaysLeft, isSubscribed } = useSubscription();

  // Don't show if subscribed
  if (isSubscribed) return null;

  const handleSubscribe = () => {
    // This will trigger Google Play In-App Billing
    // For now, we'll just show a message
    if (onSubscribe) {
      onSubscribe();
    } else {
      // Placeholder for Google Play billing
      console.log("Trigger Google Play In-App Billing for $1.99/month subscription");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-4 ${
        isTrialActive 
          ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20" 
          : "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
      }`}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {isTrialActive ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">
              {isTrialActive 
                ? t('subscription.trialActive') 
                : t('subscription.trialExpired')}
            </p>
            <p className="text-sm text-muted-foreground">
              {isTrialActive 
                ? t('subscription.trialDaysLeft', { days: trialDaysLeft })
                : t('subscription.unlockAccess')}
            </p>
          </div>
        </div>
        
        {!isTrialActive && (
          <Button 
            onClick={handleSubscribe}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <Crown className="h-4 w-4 me-2" />
            {t('subscription.subscribeNow')}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default SubscriptionBanner;