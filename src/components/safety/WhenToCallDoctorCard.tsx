import { memo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Phone, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

type Context = "kickCounter" | "contraction" | "symptoms" | "preeclampsia" | "gestationalDiabetes" | "weightGain" | "postpartum" | "general";

interface WhenToCallDoctorCardProps {
  context: Context;
  showEmergency?: boolean;
  className?: string;
}

const itemCounts: Record<Context, number> = {
  kickCounter: 4,
  contraction: 4,
  symptoms: 5,
  preeclampsia: 5,
  gestationalDiabetes: 4,
  weightGain: 4,
  general: 5,
};

export const WhenToCallDoctorCard = memo(function WhenToCallDoctorCard({
  context,
  showEmergency = true,
  className,
}: WhenToCallDoctorCardProps) {
  const { t } = useTranslation();
  const count = itemCounts[context];
  const items: string[] = [];

  for (let i = 0; i < count; i++) {
    const val = t(`safety.whenToCall.${context}.items.${i}`, "");
    if (val) items.push(val);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={cn(
        "rounded-2xl border border-border/30 bg-muted/20 p-4 space-y-3",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-sm font-bold text-foreground">
          {t("safety.whenToCall.title")}
        </h4>
      </div>

      {/* Items */}
      <ul className="space-y-2 ps-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 mt-1.5 flex-shrink-0" />
            <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      {/* Emergency section */}
      {showEmergency && (
        <div className="rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/30 dark:border-rose-800/30 px-3.5 py-2.5 flex items-start gap-2.5">
          <Phone className="w-4 h-4 text-rose-500 dark:text-rose-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
            {t("safety.emergency")}
          </p>
        </div>
      )}
    </motion.div>
  );
});
