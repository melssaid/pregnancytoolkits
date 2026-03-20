import { memo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Baby } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  week: number;
}

export const FetalDevelopmentCard = memo(function FetalDevelopmentCard({ week }: Props) {
  const { t } = useTranslation();

  const items: string[] = [];
  for (let i = 0; i < 5; i++) {
    const key = `weeklyJourney.weeks.w${week}.fetalDev.${i}`;
    const val = t(key, { defaultValue: "" });
    if (val && val !== key) items.push(val);
  }

  if (items.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="border-primary/10 bg-gradient-to-br from-primary/3 to-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Baby className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground">{t("weeklyJourney.sections.fetalDev")}</h3>
          </div>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
});
