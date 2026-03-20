import { memo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  week: number;
}

export const MentalWellnessCard = memo(function MentalWellnessCard({ week }: Props) {
  const { t } = useTranslation();

  const affirmationKey = `weeklyJourney.weeks.w${week}.mentalAffirmation`;
  const tipKey = `weeklyJourney.weeks.w${week}.mentalTip`;
  const affirmation = t(affirmationKey, { defaultValue: "" });
  const tip = t(tipKey, { defaultValue: "" });

  const hasAffirmation = affirmation && affirmation !== affirmationKey;
  const hasTip = tip && tip !== tipKey;

  if (!hasAffirmation && !hasTip) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <Card className="border-purple-200/30 dark:border-purple-800/30 bg-gradient-to-br from-purple-50/50 to-card dark:from-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-bold text-foreground">{t("weeklyJourney.sections.mentalWellness")}</h3>
          </div>

          {hasAffirmation && (
            <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-xl p-3 border border-purple-200/20 dark:border-purple-800/20 mb-2">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 italic text-center leading-relaxed">
                "{affirmation}"
              </p>
            </div>
          )}

          {hasTip && (
            <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
