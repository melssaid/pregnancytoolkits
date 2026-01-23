import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";

interface SubscriptionBannerProps {
  onSubscribe?: () => void;
}

export const SubscriptionBanner = ({ onSubscribe }: SubscriptionBannerProps) => {
  const { isSubscribed } = useSubscription();

  // Don't show if subscribed
  if (isSubscribed) return null;

  const handleSubscribe = () => {
    // This will trigger Google Play In-App Billing
    if (onSubscribe) {
      onSubscribe();
    } else {
      console.log("Trigger Google Play In-App Billing for $0.79/month subscription");
    }
  };

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
              🌟 Unlock All Premium Tools
            </h3>
            <p className="text-sm text-white/80">
              Get access to 52 tools for your pregnancy journey
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleSubscribe}
          className="rounded-full font-bold px-6 bg-white text-primary hover:bg-white/90 shadow-lg transition-all duration-300"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          $1.99/mo
        </Button>
      </div>
    </motion.div>
  );
};

export default SubscriptionBanner;
