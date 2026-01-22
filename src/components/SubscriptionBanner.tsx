import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Crown, Sparkles, Gift } from "lucide-react";
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
    if (onSubscribe) {
      onSubscribe();
    } else {
      console.log("Trigger Google Play In-App Billing for $1.99/month subscription");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 ${
        isTrialActive 
          ? "bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/20" 
          : "gradient-premium"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            isTrialActive ? "gradient-primary shadow-lg" : "bg-white/20"
          }`}>
            {isTrialActive ? (
              <Gift className="h-6 w-6 text-white" />
            ) : (
              <Crown className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h3 className={`font-bold text-base ${isTrialActive ? "text-foreground" : "text-white"}`}>
              {isTrialActive ? t('subscription.trialActive') : t('subscription.trialExpired')}
            </h3>
            <p className={`text-sm ${isTrialActive ? "text-muted-foreground" : "text-white/80"}`}>
              {isTrialActive 
                ? t('subscription.trialDaysLeft', { days: trialDaysLeft })
                : t('subscription.unlockAccess')
              }
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleSubscribe}
          className={`rounded-full font-bold px-6 transition-all duration-300 ${
            isTrialActive 
              ? "gradient-premium text-white shadow-lg hover:shadow-xl hover:scale-105" 
              : "bg-white text-primary hover:bg-white/90 shadow-lg"
          }`}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {t('subscription.subscribeNow')}
        </Button>
      </div>
    </motion.div>
  );
};

export default SubscriptionBanner;
