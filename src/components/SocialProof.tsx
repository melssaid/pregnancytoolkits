import { motion } from "framer-motion";
import { Star, Baby, Heart, Sparkles } from "lucide-react";

const features = [
  { icon: Baby, label: "52 Tools", description: "For your journey" },
  { icon: Heart, label: "Track Everything", description: "Kick counts, contractions & more" },
  { icon: Sparkles, label: "Export Reports", description: "Share with your doctor" },
  { icon: Star, label: "No Ads", description: "Premium experience" },
];

export function SocialProof() {
  return (
    <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
      <div className="container">
        {/* Features */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Everything You Need 💕
          </h2>
          <p className="text-muted-foreground">
            Your complete pregnancy companion
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-2xl bg-card shadow-card border border-border"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-base font-bold text-foreground mb-1">
                {feature.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {feature.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SocialProof;
