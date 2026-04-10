import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Star, Quote, Send, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Testimonial {
  nameKey: string;
  defaultName: string;
  textKey: string;
  defaultText: string;
  stars: number;
  weekOrContext: string;
}

interface UserReview {
  name: string;
  stars: number;
  comment: string;
  date: string;
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

const REVIEWS_KEY = "pt_user_reviews";

export default function Testimonials() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [userReviews, setUserReviews] = useState<UserReview[]>(() => {
    try {
      const stored = localStorage.getItem(REVIEWS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [name, setName] = useState("");
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || stars === 0 || !comment.trim()) {
      toast.error(t("testimonials.form.fillAll", "يرجى ملء جميع الحقول واختيار التقييم"));
      return;
    }
    if (name.trim().length > 50 || comment.trim().length > 500) {
      toast.error(t("testimonials.form.tooLong", "النص طويل جداً"));
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const review: UserReview = {
        name: name.trim(),
        stars,
        comment: comment.trim(),
        date: new Date().toISOString(),
      };
      const updated = [review, ...userReviews].slice(0, 20);
      setUserReviews(updated);
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
      setName("");
      setStars(0);
      setComment("");
      setSubmitting(false);
      toast.success(t("testimonials.form.success", "شكراً لتقييمك! 💕"));
    }, 500);
  };

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

        {/* User reviews */}
        {userReviews.length > 0 && (
          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-bold text-foreground">{t("testimonials.yourReviews", "تقييماتكم")}</h2>
            {userReviews.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-card border border-primary/20 relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{r.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(r.date).toLocaleDateString(i18n.language)}
                    </div>
                  </div>
                  <div className="ms-auto flex gap-0.5">
                    {Array.from({ length: r.stars }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed" dir="auto">{r.comment}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add review form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-8 p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-sm font-bold text-foreground text-center">
            {t("testimonials.form.title", "شاركينا تجربتك ⭐")}
          </h2>

          {/* Star rating */}
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStars(s)}
                onMouseEnter={() => setHoverStars(s)}
                onMouseLeave={() => setHoverStars(0)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    s <= (hoverStars || stars)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("testimonials.form.name", "اسمك (مثال: سارة م.)")}
            className="h-10 text-sm"
            maxLength={50}
            dir="auto"
          />

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("testimonials.form.comment", "اكتبي تجربتك مع التطبيق...")}
            className="text-sm min-h-[80px] resize-none"
            maxLength={500}
            dir="auto"
          />
          <p className="text-[10px] text-muted-foreground text-end">{comment.length}/500</p>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !name.trim() || stars === 0 || !comment.trim()}
            className="w-full"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {t("testimonials.form.sending", "جاري الإرسال...")}</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> {t("testimonials.form.submit", "إرسال التقييم")}</>
            )}
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
}