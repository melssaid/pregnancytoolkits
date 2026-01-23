import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";

export function UrgencyBanner() {
  const { isSubscribed } = useSubscription();

  if (isSubscribed) return null;

  const handleSubscribe = () => {
    console.log("Trigger Google Play In-App Billing");
  };

  return (
    <div className="bg-gradient-to-r from-primary to-accent text-white py-2.5 px-4">
      <div className="container">
        <div className="flex items-center justify-center gap-3">
          <Crown className="h-4 w-4" />
          <span className="font-semibold text-sm">
            Get Premium Access — $1.99/month
          </span>
          <Button
            onClick={handleSubscribe}
            size="sm"
            variant="secondary"
            className="h-7 px-3 text-xs font-bold"
          >
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UrgencyBanner;
