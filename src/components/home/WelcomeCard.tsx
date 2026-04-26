import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUserProfile } from "@/hooks/useUserProfile";
import { motion } from "framer-motion";
// Time icons removed per design preference — keep only the pregnancy progress ring.

const greetings: Record<string, Record<string, string>> = {
  morning:   { ar: "صباح الخير 🌸", en: "Good Morning 🌸", de: "Guten Morgen 🌸", fr: "Bonjour 🌸", es: "Buenos días 🌸", pt: "Bom dia 🌸", tr: "Günaydın 🌸" },
  afternoon: { ar: "مساء النور 🌷", en: "Good Afternoon 🌷", de: "Guten Tag 🌷", fr: "Bon après-midi 🌷", es: "Buenas tardes 🌷", pt: "Boa tarde 🌷", tr: "İyi öğlenler 🌷" },
  evening:   { ar: "مساء الورد 🌙", en: "Good Evening 🌙", de: "Guten Abend 🌙", fr: "Bonsoir 🌙", es: "Buenas noches 🌙", pt: "Boa noite 🌙", tr: "İyi akşamlar 🌙" },
};



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
  de: [
    "Trinke täglich 8 Gläser Wasser 💧",
    "Iss kleine, häufige Mahlzeiten 🥗",
    "Ruhe dich aus, wenn dein Körper es braucht 😴",
    "Mache heute einen sanften Spaziergang 🚶‍♀️",
    "Beobachte die Bewegungen deines Babys 👶",
    "Nimm deine Schwangerschaftsvitamine 💊",
    "Übe tiefe Atemübungen 🧘‍♀️",
  ],
  tr: [
    "Günde 8 bardak su için 💧",
    "Küçük ve sık öğünler yiyin 🥗",
    "Vücudunuz söylediğinde dinlenin 😴",
    "Bugün hafif bir yürüyüş yapın 🚶‍♀️",
    "Bebeğinizin hareketlerini takip edin 👶",
    "Doğum öncesi vitaminlerinizi alın 💊",
    "Derin nefes egzersizleri yapın 🧘‍♀️",
  ],
  fr: [
    "Buvez 8 verres d'eau par jour 💧",
    "Mangez des repas légers et fréquents 🥗",
    "Reposez-vous quand votre corps le demande 😴",
    "Faites une promenade douce aujourd'hui 🚶‍♀️",
    "Suivez les mouvements de votre bébé 👶",
    "Prenez vos vitamines prénatales 💊",
    "Pratiquez des exercices de respiration 🧘‍♀️",
  ],
  es: [
    "Bebe 8 vasos de agua al día 💧",
    "Come comidas pequeñas y frecuentes 🥗",
    "Descansa cuando tu cuerpo lo pida 😴",
    "Da un paseo suave hoy 🚶‍♀️",
    "Sigue los movimientos de tu bebé 👶",
    "Toma tus vitaminas prenatales 💊",
    "Practica ejercicios de respiración 🧘‍♀️",
  ],
  pt: [
    "Beba 8 copos de água por dia 💧",
    "Faça refeições pequenas e frequentes 🥗",
    "Descanse quando seu corpo pedir 😴",
    "Faça uma caminhada leve hoje 🚶‍♀️",
    "Acompanhe os movimentos do seu bebê 👶",
    "Tome suas vitaminas pré-natais 💊",
    "Pratique exercícios de respiração 🧘‍♀️",
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
                {({ ar: "أسبوع", de: "Woche", tr: "hafta", fr: "sem.", es: "sem.", pt: "sem." })[lang] || "week"}
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
              {(() => {
                const trimLabels: Record<string, [string, string, string]> = {
                  ar: ["الثلث الأول", "الثلث الثاني", "الثلث الثالث"],
                  de: ["1. Trimester", "2. Trimester", "3. Trimester"],
                  tr: ["1. Trimester", "2. Trimester", "3. Trimester"],
                  fr: ["1er trimestre", "2e trimestre", "3e trimestre"],
                  es: ["1er trimestre", "2do trimestre", "3er trimestre"],
                  pt: ["1º trimestre", "2º trimestre", "3º trimestre"],
                };
                const labels = trimLabels[lang];
                const label = labels ? labels[trimester - 1] : `Trimester ${trimester}`;
                return `${label} · ${Math.round(progress)}%`;
              })()}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{dailyTip}</p>
        </div>
      </div>
    </motion.div>
  );
});

export default WelcomeCard;
