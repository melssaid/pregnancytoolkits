import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { motion } from "framer-motion";

const WEEK_SYMPTOMS: Record<number, string[]> = {
  4: ["fatigue", "nausea", "breastTenderness"],
  5: ["nausea", "fatigue", "frequentUrination"],
  6: ["morningSickness", "moodSwings", "fatigue"],
  7: ["morningSickness", "foodAversions", "bloating"],
  8: ["nausea", "fatigue", "cramping"],
  9: ["morningSickness", "fatigue", "moodSwings"],
  10: ["nausea", "roundLigamentPain", "headaches"],
  11: ["nausea", "bloating", "fatigue"],
  12: ["lessNausea", "increasedEnergy", "headaches"],
  13: ["lessNausea", "increasedAppetite", "skinChanges"],
  14: ["increasedEnergy", "lessNausea", "nasal"],
  15: ["increasedEnergy", "nosebleeds", "bodyAches"],
  16: ["backPain", "constipation", "growingBelly"],
  17: ["sciatic", "balance", "stretchMarks"],
  18: ["babyMovement", "backPain", "legCramps"],
  19: ["dizziness", "hipPain", "skinChanges"],
  20: ["backPain", "swelling", "heartburn"],
  21: ["stretchMarks", "heartburn", "braxton"],
  22: ["stretchMarks", "backPain", "swelling"],
  23: ["swelling", "backPain", "carpelTunnel"],
  24: ["backPain", "legCramps", "braxton"],
  25: ["heartburn", "constipation", "hemorrhoids"],
  26: ["insomnia", "backPain", "braxtonHicks"],
  27: ["legCramps", "swelling", "shortness"],
  28: ["shortness", "heartburn", "braxtonHicks"],
  29: ["heartburn", "backPain", "frequentUrination"],
  30: ["fatigue", "shortness", "insomnia"],
  31: ["braxtonHicks", "backPain", "leaking"],
  32: ["heartburn", "shortness", "fatigue"],
  33: ["fatigue", "pressure", "insomnia"],
  34: ["fatigue", "braxtonHicks", "pelvicPressure"],
  35: ["frequentUrination", "pelvicPressure", "nesting"],
  36: ["pelvicPressure", "braxtonHicks", "fatigue"],
  37: ["mucusPlug", "nesting", "pelvicPressure"],
  38: ["nesting", "braxtonHicks", "cervicalChanges"],
  39: ["braxtonHicks", "nesting", "anxiety"],
  40: ["impatience", "braxtonHicks", "nesting"],
};

export function ContextualSymptomsCard() {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const week = profile.pregnancyWeek;

  const symptoms = WEEK_SYMPTOMS[week] || WEEK_SYMPTOMS[20] || [];
  if (week < 4) return null;

  return (
    <Card className="p-4 bg-card border-border/50">
      <h3 className="text-sm font-extrabold text-foreground mb-1">{t("contextSymptoms.title")}</h3>
      <p className="text-[10px] text-muted-foreground mb-3">{t("contextSymptoms.subtitle", { week })}</p>
      <div className="space-y-2">
        {symptoms.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-2"
          >
            <span className="text-xs mt-0.5">•</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">{t(`contextSymptoms.symptoms.${s}`)}</p>
              <p className="text-[10px] text-muted-foreground">{t(`contextSymptoms.tips.${s}`)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
