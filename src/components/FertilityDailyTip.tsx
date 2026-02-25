import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Stethoscope, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TOTAL_TIPS = 66;

export function FertilityDailyTip() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const dir = isRTL ? "rtl" : "ltr";

  const tipIndex = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return (dayOfYear % TOTAL_TIPS) + 1;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="mb-4"
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-pink-50/30 dark:to-primary/5 overflow-hidden relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-3 ltr:-right-3 rtl:-left-3 opacity-[0.06]"
        >
          <Sparkles className="h-20 w-20 text-primary" />
        </motion.div>

        <CardContent className="p-4 relative z-10" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Stethoscope className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs font-bold text-primary">
              {t("fertilityTip.title")}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-foreground/85 font-medium">
            {t(`fertilityTip.tips.tip${tipIndex}`)}
          </p>
          <p className="text-[9px] text-muted-foreground/50 mt-2">
            {t("fertilityTip.disclaimer")}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default FertilityDailyTip;
