import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";

export function UrgencyBanner() {
  const { isSubscribed, isTrialActive, trialDaysLeft } = useSubscription();
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isSubscribed) return null;

  const handleSubscribe = () => {
    console.log("Trigger Google Play In-App Billing");
  };

  // Show different banners based on trial status
  if (isTrialActive) {
    // User is in trial - show trial countdown, NOT discount offer
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary via-accent to-primary text-white py-3 px-4"
      >
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              <span className="font-bold text-sm sm:text-base">
                🎉 أنتِ في الفترة التجريبية المجانية!
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                متبقي {trialDaysLeft} {trialDaysLeft === 1 ? 'يوم' : 'أيام'}
              </span>
            </div>
          </div>
          
          {trialDaysLeft <= 1 && (
            <div className="mt-2 text-center text-xs font-medium animate-pulse">
              ⚠️ تنتهي التجربة اليوم! اشتركي الآن للحفاظ على بياناتك
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Trial expired - show urgency offer
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-3 px-4"
    >
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Urgency Message */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 animate-pulse" />
              <span className="font-bold text-sm sm:text-base">
                🔥 عرض خاص: خصم 60% على الشهر الأول!
              </span>
            </div>
          </div>

          {/* Center: Countdown */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">ينتهي العرض خلال:</span>
            <div className="flex gap-1">
              <span className="bg-white/20 rounded px-2 py-0.5 font-mono font-bold text-sm">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="font-bold">:</span>
              <span className="bg-white/20 rounded px-2 py-0.5 font-mono font-bold text-sm">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="font-bold">:</span>
              <span className="bg-white/20 rounded px-2 py-0.5 font-mono font-bold text-sm">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Right: CTA */}
          <Button
            onClick={handleSubscribe}
            size="sm"
            className="bg-white text-orange-600 hover:bg-white/90 font-bold shadow-lg"
          >
            <Gift className="h-4 w-4 mr-1" />
            اشتركي بـ $0.79/شهر
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default UrgencyBanner;
