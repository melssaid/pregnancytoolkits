import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";

const BABY_SIZE_DATA: Record<number, { emoji: string; weightG: number; lengthCm: number }> = {
  4: { emoji: "🌰", weightG: 1, lengthCm: 0.1 },
  5: { emoji: "🫘", weightG: 1, lengthCm: 0.2 },
  6: { emoji: "🫐", weightG: 1, lengthCm: 0.4 },
  7: { emoji: "🫐", weightG: 1, lengthCm: 1 },
  8: { emoji: "🍇", weightG: 1, lengthCm: 1.6 },
  9: { emoji: "🫒", weightG: 2, lengthCm: 2.3 },
  10: { emoji: "🍊", weightG: 4, lengthCm: 3.1 },
  11: { emoji: "🍋", weightG: 7, lengthCm: 4.1 },
  12: { emoji: "🍑", weightG: 14, lengthCm: 5.4 },
  13: { emoji: "🍋", weightG: 23, lengthCm: 7.4 },
  14: { emoji: "🍋", weightG: 43, lengthCm: 8.7 },
  15: { emoji: "🍎", weightG: 70, lengthCm: 10 },
  16: { emoji: "🥑", weightG: 100, lengthCm: 11.6 },
  17: { emoji: "🥕", weightG: 140, lengthCm: 13 },
  18: { emoji: "🫑", weightG: 190, lengthCm: 14.2 },
  19: { emoji: "🥭", weightG: 240, lengthCm: 15.3 },
  20: { emoji: "🍌", weightG: 300, lengthCm: 16.4 },
  21: { emoji: "🥥", weightG: 360, lengthCm: 26.7 },
  22: { emoji: "🌽", weightG: 430, lengthCm: 27.8 },
  23: { emoji: "🍆", weightG: 501, lengthCm: 28.9 },
  24: { emoji: "🌽", weightG: 600, lengthCm: 30 },
  25: { emoji: "🥦", weightG: 660, lengthCm: 34.6 },
  26: { emoji: "🥬", weightG: 760, lengthCm: 35.6 },
  27: { emoji: "🥬", weightG: 875, lengthCm: 36.6 },
  28: { emoji: "🍆", weightG: 1005, lengthCm: 37.6 },
  29: { emoji: "🎃", weightG: 1153, lengthCm: 38.6 },
  30: { emoji: "🥥", weightG: 1319, lengthCm: 39.9 },
  31: { emoji: "🥥", weightG: 1502, lengthCm: 41.1 },
  32: { emoji: "🍍", weightG: 1702, lengthCm: 42.4 },
  33: { emoji: "🍍", weightG: 1918, lengthCm: 43.7 },
  34: { emoji: "🍈", weightG: 2146, lengthCm: 45 },
  35: { emoji: "🍈", weightG: 2383, lengthCm: 46.2 },
  36: { emoji: "🍉", weightG: 2622, lengthCm: 47.4 },
  37: { emoji: "🍉", weightG: 2859, lengthCm: 48.6 },
  38: { emoji: "🍉", weightG: 3083, lengthCm: 49.8 },
  39: { emoji: "🍉", weightG: 3288, lengthCm: 50.7 },
  40: { emoji: "🎃", weightG: 3462, lengthCm: 51.2 },
  41: { emoji: "🎃", weightG: 3597, lengthCm: 51.7 },
  42: { emoji: "🎃", weightG: 3685, lengthCm: 51.7 },
};

export function BabySizeCard() {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const week = profile.pregnancyWeek;

  const data = BABY_SIZE_DATA[week] || BABY_SIZE_DATA[20];
  const prevData = BABY_SIZE_DATA[Math.max(4, week - 1)];

  if (week < 4) return null;

  return (
    <Card className="p-4 bg-card border-border/50 overflow-hidden">
      <h3 className="text-base font-bold text-foreground mb-2">{t("babySize.title")}</h3>
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-5xl flex-shrink-0"
        >
          {data.emoji}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{t("babySize.weekLabel", { week })}</p>
          <div className="flex gap-4 mt-1.5">
            <div>
              <p className="text-lg font-black text-foreground">{data.weightG >= 1000 ? `${(data.weightG / 1000).toFixed(1)} kg` : `${data.weightG} g`}</p>
              <p className="text-[10px] text-muted-foreground">{t("babySize.weight")}</p>
            </div>
            <div className="w-px bg-border/50" />
            <div>
              <p className="text-lg font-black text-foreground">{data.lengthCm} cm</p>
              <p className="text-[10px] text-muted-foreground">{t("babySize.length")}</p>
            </div>
          </div>
          {prevData && (
            <p className="text-[10px] text-green-500 mt-1">
              +{data.weightG - prevData.weightG}g {t("babySize.sinceLastWeek")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
