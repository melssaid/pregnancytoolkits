import { memo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Apple } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  week: number;
}

export const NutritionFocusCard = memo(function NutritionFocusCard({ week }: Props) {
  const { t } = useTranslation();

  const nutrients: string[] = [];
  for (let i = 0; i < 5; i++) {
    const key = `weeklyJourney.weeks.w${week}.nutrients.${i}`;
    const val = t(key, { defaultValue: "" });
    if (val && val !== key) nutrients.push(val);
  }

  const tipKey = `weeklyJourney.weeks.w${week}.nutritionTip`;
  const tip = t(tipKey, { defaultValue: "" });
  const hasTip = tip && tip !== tipKey;

  if (nutrients.length === 0 && !hasTip) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Apple className="w-4 h-4 text-accent-foreground" />
            </div>
            <h3 className="text-sm font-bold text-foreground">{t("weeklyJourney.sections.nutrition")}</h3>
          </div>

          {nutrients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {nutrients.map((n, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">
                  {n}
                </Badge>
              ))}
            </div>
          )}

          {hasTip && (
            <p className="text-xs text-muted-foreground leading-relaxed bg-accent/5 rounded-xl p-3 border border-accent/10">
              {tip}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});
