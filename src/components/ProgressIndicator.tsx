import { motion } from "framer-motion";
import { Baby, Heart, Sparkles, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProgressIndicatorProps {
  currentWeek: number;
  totalWeeks?: number;
  showMilestones?: boolean;
}

const milestones = [
  { week: 4, label: "Heartbeat Begins", icon: Heart },
  { week: 12, label: "End of 1st Trimester", icon: Star },
  { week: 20, label: "Halfway There", icon: Sparkles },
  { week: 28, label: "3rd Trimester", icon: Baby },
  { week: 40, label: "Due Date", icon: Baby },
];

export function ProgressIndicator({ 
  currentWeek, 
  totalWeeks = 40,
  showMilestones = true 
}: ProgressIndicatorProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const progress = Math.min((currentWeek / totalWeeks) * 100, 100);
  const daysRemaining = Math.max((totalWeeks - currentWeek) * 7, 0);

  return (
    <div className="space-y-4">
      {/* Main Progress Bar */}
      <div className="relative">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{t("progressIndicator.week", "Week {{week}}", { week: currentWeek })}</span>
          <span>{t("progressIndicator.ofJourney", "{{percent}}% of journey", { percent: Math.round(progress) })}</span>
        </div>
        
        <div className="h-4 bg-secondary/50 rounded-full overflow-hidden relative">
          <motion.div
            key={`pi-fill-${isRTL ? 'rtl' : 'ltr'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-primary via-pink-400 to-rose-400 rounded-full absolute top-0"
            style={{
              left: isRTL ? 'auto' : 0,
              right: isRTL ? 0 : 'auto',
            }}
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>

          {/* Baby Icon at Progress Point */}
          <motion.div
            key={`pi-thumb-${isRTL ? 'rtl' : 'ltr'}`}
            initial={{ scale: 0 }}
            animate={
              isRTL
                ? { scale: 1, right: `${Math.min(progress, 95)}%` }
                : { scale: 1, left: `${Math.min(progress, 95)}%` }
            }
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              transform: `translateY(-50%) translateX(${isRTL ? '50%' : '-50%'})`,
            }}
          >
            <div className="p-1 bg-white rounded-full shadow-lg border-2 border-primary">
              <Baby className="h-4 w-4 text-primary" />
            </div>
          </motion.div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{t("progressIndicator.start", "Start")}</span>
          <span>{t("progressIndicator.birth", "Birth")}</span>
        </div>
      </div>

      {/* Days Remaining */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-3 px-4 bg-gradient-to-r from-primary/5 to-pink-50 rounded-xl"
      >
        <p className="text-base font-bold text-primary">{daysRemaining}</p>
        <p className="text-sm text-muted-foreground">{t("progressIndicator.daysUntilBaby", "days until you meet your baby 💕")}</p>
      </motion.div>

      {/* Milestones */}
      {showMilestones && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{t("progressIndicator.keyMilestones", "Key Milestones:")}</p>
          <div className="grid grid-cols-5 gap-1">
            {milestones.map((milestone, index) => {
              const isPassed = currentWeek >= milestone.week;
              const isCurrent = currentWeek >= milestone.week - 2 && currentWeek < milestone.week;
              
              return (
                <motion.div
                  key={milestone.week}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-center p-2 rounded-lg transition-all ${
                    isPassed 
                      ? "bg-primary/10 border border-primary/20" 
                      : isCurrent
                        ? "bg-amber-50 border border-amber-200 animate-pulse"
                        : "bg-secondary/30 border border-transparent"
                  }`}
                >
                  <milestone.icon className={`h-4 w-4 mx-auto mb-1 ${
                    isPassed ? "text-primary" : isCurrent ? "text-amber-500" : "text-muted-foreground/50"
                  }`} />
                  <p className={`text-xs font-medium ${
                    isPassed ? "text-primary" : isCurrent ? "text-amber-600" : "text-muted-foreground/50"
                  }`}>
                    {milestone.week}w
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressIndicator;
