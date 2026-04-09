import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  nameKey: string;
  defaultName: string;
  textKey: string;
  defaultText: string;
  stars: number;
  weekOrContext: string;
}

const testimonials: Testimonial[] = [
  { nameKey: "testimonials.t1.name", defaultName: "Sarah M.", textKey: "testimonials.t1.text", defaultText: "This app has been my daily companion since week 8. The kick counter and weekly summaries are incredibly helpful. I love that everything is in one place!", stars: 5, weekOrContext: "Week 32" },
  { nameKey: "testimonials.t2.name", defaultName: "Fatima A.", textKey: "testimonials.t2.text", defaultText: "أفضل تطبيق حمل استخدمته. الذكاء الاصطناعي يعطيني نصائح مخصصة كل أسبوع وأشعر بالاطمئنان. شكراً لكم!", stars: 5, weekOrContext: "Week 28" },
  { nameKey: "testimonials.t3.name", defaultName: "Emma L.", textKey: "testimonials.t3.text", defaultText: "The contraction timer was a lifesaver during labor! Super easy to use even when I was stressed. The whole app is beautifully designed.", stars: 5, weekOrContext: "Postpartum" },
  { nameKey: "testimonials.t4.name", defaultName: "Ayşe K.", textKey: "testimonials.t4.text", defaultText: "Türkçe desteği harika! Hamileliğim boyunca her gün kullandım. Beslenme önerileri ve vitamin takibi çok faydalı.", stars: 5, weekOrContext: "Week 36" },
  { nameKey: "testimonials.t5.name", defaultName: "Marie D.", textKey: "testimonials.t5.text", defaultText: "J'adore l'assistant IA ! Il répond à toutes mes questions sur la grossesse instantanément. L'application est gratuite et sans publicité, c'est rare.", stars: 5, weekOrContext: "Week 20" },
  { nameKey: "testimonials.t6.name", defaultName: "Lisa R.", textKey: "testimonials.t6.text", defaultText: "The AI meal planner changed how I eat during pregnancy. No more guessing what's safe — it suggests delicious meals for each trimester.", stars: 4, weekOrContext: "Week 24" },
  { nameKey: "testimonials.t7.name", defaultName: "Nour H.", textKey: "testimonials.t7.text", defaultText: "ميزة تتبع الوزن مع التوصيات المبنية على مؤشر كتلة الجسم ممتازة. أشعر بالتحكم في صحتي وصحة طفلي.", stars: 5, weekOrContext: "Week 30" },
  { nameKey: "testimonials.t8.name", defaultName: "Ana P.", textKey: "testimonials.t8.text", defaultText: "O rastreador de ciclo me ajudou a engravidar! Depois, usei todas as ferramentas de gravidez. Aplicativo incrível e 100% gratuito.", stars: 5, weekOrContext: "TTC → Week 16" },
  { nameKey: "testimonials.t9.name", defaultName: "Julia S.", textKey: "testimonials.t9.text", defaultText: "Die App funktioniert sogar offline! Ich benutze den Vitamin-Tracker und den Wochenplaner täglich. Sehr durchdacht und wunderschön gestaltet.", stars: 5, weekOrContext: "Week 18" },
  { nameKey: "testimonials.t10.name", defaultName: "Carmen V.", textKey: "testimonials.t10.text", defaultText: "Mi herramienta favorita es el planificador de comidas con IA. Recomienda recetas seguras para cada trimestre. ¡Es como tener una nutricionista personal!", stars: 5, weekOrContext: "Week 26" },
];

export default function Testimonials() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <Layout showBack>
      <SEOHead
        title="Pregnancy Toolkits Reviews — What Moms Say"
        description="Real reviews from moms using Pregnancy Toolkits. See why thousands trust our free pregnancy app for tracking, nutrition, and AI-powered guidance."
        keywords="pregnancy app reviews, pregnancy toolkits reviews, best pregnancy tracker reviews"
      />
      <div className="container max-w-2xl pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t("testimonials.title", "What Moms Say")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("testimonials.subtitle", "Real stories from real moms around the world")}
          </p>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
            <span className="text-sm font-bold text-foreground ms-2">4.8</span>
            <span className="text-xs text-muted-foreground ms-1">(3,200+)</span>
          </div>
        </motion.div>

        <div className="space-y-4">
          {testimonials.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-card border border-border relative">
              <Quote className="absolute top-4 end-4 h-5 w-5 text-primary/20" />
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {item.defaultName[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{t(item.nameKey, item.defaultName)}</div>
                  <div className="text-[10px] text-muted-foreground">{item.weekOrContext}</div>
                </div>
                <div className="ms-auto flex gap-0.5">
                  {Array.from({ length: item.stars }).map((_, j) => (
                    <Star key={j} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed" dir={/[\u0600-\u06FF]/.test(item.defaultText) ? "rtl" : "ltr"}>
                {t(item.textKey, item.defaultText)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
