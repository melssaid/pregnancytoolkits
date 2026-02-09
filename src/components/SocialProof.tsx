import { motion } from "framer-motion";
import { Star, Baby, Heart, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SocialProof() {
  const { t } = useTranslation();

  const features = [
    { icon: Baby, labelKey: "socialProof.tools", descKey: "socialProof.toolsDesc" },
    { icon: Heart, labelKey: "socialProof.trackEverything", descKey: "socialProof.trackDesc" },
    { icon: Sparkles, labelKey: "socialProof.exportReports", descKey: "socialProof.exportDesc" },
    { icon: Star, labelKey: "socialProof.noAds", descKey: "socialProof.noAdsDesc" },
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
      <div className="container">
        {/* Features */}
        <div className="text-center mb-8">
          <h2 className="text-base font-bold text-foreground mb-2">
            {t('socialProof.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('socialProof.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.labelKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-2xl bg-card shadow-card border border-border"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-base font-bold text-foreground mb-1">
                {t(feature.labelKey)}
              </div>
              <div className="text-xs text-muted-foreground">
                {t(feature.descKey)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SocialProof;
