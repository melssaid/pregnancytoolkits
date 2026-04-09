import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { fetalSizeData } from "@/data/weeklyJourneyData";
import { openWhatsApp } from "@/lib/whatsappShare";

interface BabySizeShareCardProps {
  week: number;
}

const fruitEmojis: Record<string, string> = {
  "Poppy seed": "🌿", "Sesame seed": "🫘", "Lentil": "🫘", "Blueberry": "🫐",
  "Raspberry": "🍇", "Cherry": "🍒", "Strawberry": "🍓", "Fig": "🫒",
  "Lime": "🍋", "Plum": "🍑", "Lemon": "🍋", "Peach": "🍑",
  "Apple": "🍎", "Avocado": "🥑", "Pear": "🍐", "Orange": "🍊",
  "Mango": "🥭", "Pomegranate": "🍎", "Banana": "🍌", "Papaya": "🍈",
  "Corn": "🌽", "Coconut": "🥥", "Cantaloupe": "🍈", "Cauliflower": "🥦",
  "Lettuce": "🥬", "Cabbage": "🥬", "Butternut squash": "🎃",
  "Pineapple": "🍍", "Honeydew melon": "🍈", "Watermelon": "🍉",
};

export function BabySizeShareCard({ week }: BabySizeShareCardProps) {
  const { t, i18n } = useTranslation();
  const data = fetalSizeData[week];
  if (!data) return null;

  const isAr = i18n.language === "ar";
  const sizeName = isAr ? data.sizeAr : data.sizeEn;
  const emoji = fruitEmojis[data.sizeEn] || "👶";

  const handleShare = () => {
    const msg = `${emoji} *${t("babySizeCard.shareTitle", { week, defaultValue: "My baby at week {{week}}!" })}*

🍎 ${t("babySizeCard.size", "Size")}: *${sizeName}*
📏 ${t("babySizeCard.length", "Length")}: *${data.lengthCm} cm*
⚖️ ${t("babySizeCard.weight", "Weight")}: *${data.weightG} g*

━━━━━━━━━━━━━━━━━━━━
🤰 _Pregnancy Toolkits_`;

    openWhatsApp(msg);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-pink-50/50 to-primary/5 dark:from-primary/20 dark:via-primary/10 dark:to-primary/5 border border-primary/20 p-5"
    >
      {/* Decorative */}
      <div className="absolute -top-4 -end-4 text-6xl opacity-20">{emoji}</div>

      <div className="relative">
        <div className="text-[10px] uppercase tracking-wider text-primary/70 font-bold mb-1">
          {t("babySizeCard.weekLabel", { week, defaultValue: "Week {{week}}" })}
        </div>
        <div className="text-lg font-bold text-foreground mb-0.5">
          {t("babySizeCard.babyIs", "Your baby is the size of a")}
        </div>
        <div className="text-2xl font-black text-primary flex items-center gap-2">
          {emoji} {sizeName}
        </div>

        <div className="flex gap-4 mt-3 text-xs text-foreground/70">
          <span>📏 {data.lengthCm} cm</span>
          <span>⚖️ {data.weightG} g</span>
        </div>

        <button
          onClick={handleShare}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold hover:opacity-90 transition-opacity"
        >
          <Share2 className="h-3.5 w-3.5" />
          {t("babySizeCard.share", "Share on WhatsApp")}
        </button>
      </div>
    </motion.div>
  );
}
