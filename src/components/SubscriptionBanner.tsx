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

  // During trial - show benefits reminder (not urgency)
  if (isTrialActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 bg-gradient-to-r from-success/10 via-success/5 to-success/10 border-2 border-success/20"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <Gift className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">
                ✨ استمتعي بجميع المميزات مجاناً!
              </h3>
              <p className="text-sm text-muted-foreground">
                متبقي {trialDaysLeft} {trialDaysLeft === 1 ? 'يوم' : 'أيام'} من التجربة المجانية
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleSubscribe}
            className="rounded-full font-bold px-6 gradient-premium text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Crown className="h-4 w-4 mr-2" />
            اشتركي للحفاظ على الوصول
          </Button>
        </div>
      </motion.div>
    );
  }

  // Trial expired - show urgency
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-premium rounded-2xl p-4"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              ⏰ انتهت الفترة التجريبية
            </h3>
            <p className="text-sm text-white/80">
              اشتركي الآن لاستعادة الوصول الكامل
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleSubscribe}
          className="rounded-full font-bold px-6 bg-white text-primary hover:bg-white/90 shadow-lg transition-all duration-300"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          فقط $0.79/شهر
        </Button>
      </div>
    </motion.div>
  );
};

export default SubscriptionBanner;
