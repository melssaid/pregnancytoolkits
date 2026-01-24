import { motion } from "framer-motion";
import { Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useSubscription from "@/hooks/useSubscription";

interface PremiumGateProps {
  children: React.ReactNode;
  isPremium?: boolean;
  toolName?: string;
}

export const PremiumGate = ({ children, isPremium, toolName }: PremiumGateProps) => {
  const { hasAccess } = useSubscription();

  // If tool is not premium or user has access, show the content
  if (!isPremium || hasAccess(isPremium)) {
    return <>{children}</>;
  }

  const handleSubscribe = () => {
    // This will trigger Google Play In-App Billing
    console.log("Trigger Google Play In-App Billing for $1.99/month subscription");
  };

  return (
    <div className="container max-w-md py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              Premium Feature
            </h2>
            
            {toolName && (
              <p className="mb-4 text-lg text-muted-foreground">
                {toolName}
              </p>
            )}
            
            <p className="mb-6 text-muted-foreground">
              Subscribe to unlock this tool
            </p>

            <div className="mb-6 rounded-lg bg-card p-4 text-start">
              <p className="mb-2 text-sm font-medium text-foreground">
                Unlock all 52 tools
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  31 premium tools
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  Only $0.79/month
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleSubscribe}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Crown className="h-5 w-5 me-2" />
              Get Premium - $0.79/mo
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PremiumGate;
