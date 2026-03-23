import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUserProfile } from "@/hooks/useUserProfile";
import { motion } from "framer-motion";
import { Sun, Moon, Sunrise, Sunset, Baby } from "lucide-react";

const greetings: Record<string, Record<string, string>> = {
  morning:   { ar: "صباح الخير 🌸", en: "Good Morning 🌸", de: "Guten Morgen 🌸", fr: "Bonjour 🌸", es: "Buenos días 🌸", pt: "Bom dia 🌸", tr: "Günaydın 🌸" },
  afternoon: { ar: "مساء النور 🌷", en: "Good Afternoon 🌷", de: "Guten Tag 🌷", fr: "Bon après-midi 🌷", es: "Buenas tardes 🌷", pt: "Boa tarde 🌷", tr: "İyi öğlenler 🌷" },
  evening:   { ar: "مساء الورد 🌙", en: "Good Evening 🌙", de: "Guten Abend 🌙", fr: "Bonsoir 🌙", es: "Buenas noches 🌙", pt: "Boa noite 🌙", tr: "İyi akşamlar 🌙" },
};

const timeIcons = { morning: Sunrise, afternoon: Sun, evening: Moon };

const dailyTips: Record<string, string[]> = {
  ar: [
    "اشربي 8 أكواب ماء يومياً 💧",
    "تناولي وجبات صغيرة ومتكررة 🥗",
    "خذي قسطاً من الراحة عند الحاجة 😴",
    "مارسي المشي الخفيف يومياً 🚶‍♀️",
    "تابعي حركات طفلك بانتظام 👶",
    "تناولي حمض الفوليك يومياً 💊",
    "مارسي تمارين التنفس العميق 🧘‍♀️",
  ],
  en: [
    "Drink 8 glasses of water daily 💧",
    "Eat small, frequent meals 🥗",
    "Rest when your body tells you 😴",
    "Take a gentle walk today 🚶‍♀️",
    "Track your baby's movements 👶",
    "Take your prenatal vitamins 💊",
    "Practice deep breathing exercises 🧘‍♀️",
  ],
};

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

const WelcomeCard = memo(function WelcomeCard() {
  const { i18n } = useTranslation();
  const { profile } = useUserProfile();
  const lang = i18n.language?.split("-")[0] || "en";
  const timeOfDay = useMemo(() => getTimeOfDay(), []);
  const TimeIcon = timeIcons[timeOfDay];

  const greeting = greetings[timeOfDay][lang] || greetings[timeOfDay].en;
  const tips = dailyTips[lang] || dailyTips.en;
  const tipIndex = new Date().getDate() % tips.length;
  const dailyTip = tips[tipIndex];

  const week = profile.isPregnant ? profile.pregnancyWeek : 0;
  const progress = week > 0 ? Math.min(100, (week / 40) * 100) : 0;
  const trimester = week <= 13 ? 1 : week <= 26 ? 2 : 3;

  const circumference = 2 * Math.PI * 28;
  const strokeDash = (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/20 bg-gradient-to-br from-primary/[0.06] via-card to-accent/[0.04] p-4 relative overflow-hidden"
    >
      {/* Decorative blur */}
      <div className="absolute -top-8 -end-8 w-28 h-28 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

      <div className="relative flex items-start gap-3">
        {/* Progress Ring or Time Icon */}
        {week > 0 ? (
          <div className="relative flex-shrink-0 w-16 h-16">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" opacity={0.3} />
              <motion.circle
                cx="32" cy="32" r="28"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - strokeDash }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-primary leading-none" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {week}
              </span>
              <span className="text-[8px] text-muted-foreground font-medium">
                {lang === "ar" ? "أسبوع" : "week"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <TimeIcon className="w-5 h-5 text-primary" strokeWidth={1.8} />
          </div>
        )}

        {/* Text content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h2 className="text-lg font-bold text-foreground leading-tight ar-heading" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            {greeting}
          </h2>
          {week > 0 && (
            <p className="text-[11px] text-primary/80 font-semibold mt-0.5">
              {lang === "ar"
                ? `الثلث ${trimester === 1 ? "الأول" : trimester === 2 ? "الثاني" : "الثالث"} · ${Math.round(progress)}%`
                : `Trimester ${trimester} · ${Math.round(progress)}%`}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{dailyTip}</p>
        </div>
      </div>
    </motion.div>
  );
});

export default WelcomeCard;
