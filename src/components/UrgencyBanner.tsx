import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";

export function UrgencyBanner() {
  const { isSubscribed } = useSubscription();
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
                🔥 Special Offer: 60% OFF First Month!
              </span>
            </div>
          </div>

          {/* Center: Countdown */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Offer ends in:</span>
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
            Get Premium $0.79/mo
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default UrgencyBanner;
