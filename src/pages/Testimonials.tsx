import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Star, Quote, Send, Loader2, ChevronLeft, ChevronRight, Languages } from "lucide-react";
import { useState, useCallback } from "react";
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
  { nameKey: "testimonials.t1.name", defaultName: "Sarah M.", textKey: "testimonials.t1.text", defaultText: "This app has been my daily companion since week 8, the kick counter and weekly summaries are incredibly helpful — I love that everything is in one place!", stars: 5, weekOrContext: "Week 32" },
  { nameKey: "testimonials.t2.name", defaultName: "Fatima A.", textKey: "testimonials.t2.text", defaultText: "أفضل تطبيق حمل استخدمته، الذكاء الاصطناعي يعطيني نصائح مخصصة كل أسبوع وأشعر بالاطمئنان — شكراً لكم!", stars: 5, weekOrContext: "Week 28" },
  { nameKey: "testimonials.t3.name", defaultName: "Emma L.", textKey: "testimonials.t3.text", defaultText: "The contraction timer was a lifesaver during labor! Super easy to use even when I was stressed — the whole app is beautifully designed", stars: 5, weekOrContext: "Postpartum" },
  { nameKey: "testimonials.t4.name", defaultName: "Ayşe K.", textKey: "testimonials.t4.text", defaultText: "Türkçe desteği harika! Hamileliğim boyunca her gün kullandım, beslenme önerileri ve vitamin takibi çok faydalı", stars: 5, weekOrContext: "Week 36" },
  { nameKey: "testimonials.t5.name", defaultName: "Marie D.", textKey: "testimonials.t5.text", defaultText: "J'adore l'assistant IA ! Il répond à toutes mes questions sur la grossesse instantanément — l'application est gratuite et sans publicité, c'est rare", stars: 5, weekOrContext: "Week 20" },
  { nameKey: "testimonials.t6.name", defaultName: "Lisa R.", textKey: "testimonials.t6.text", defaultText: "The AI meal planner changed how I eat during pregnancy — no more guessing what's safe, it suggests delicious meals for each trimester", stars: 4, weekOrContext: "Week 24" },
  { nameKey: "testimonials.t7.name", defaultName: "Nour H.", textKey: "testimonials.t7.text", defaultText: "ميزة تتبع الوزن مع التوصيات المبنية على مؤشر كتلة الجسم ممتازة، أشعر بالتحكم في صحتي وصحة طفلي", stars: 5, weekOrContext: "Week 30" },
  { nameKey: "testimonials.t8.name", defaultName: "Ana P.", textKey: "testimonials.t8.text", defaultText: "O rastreador de ciclo me ajudou a engravidar! Depois usei todas as ferramentas de gravidez — aplicativo incrível e 100% gratuito", stars: 5, weekOrContext: "TTC → Week 16" },
  { nameKey: "testimonials.t9.name", defaultName: "Julia S.", textKey: "testimonials.t9.text", defaultText: "Die App funktioniert sogar offline! Ich benutze den Vitamin-Tracker und den Wochenplaner täglich — sehr durchdacht und wunderschön gestaltet", stars: 5, weekOrContext: "Week 18" },
  { nameKey: "testimonials.t10.name", defaultName: "Carmen V.", textKey: "testimonials.t10.text", defaultText: "Mi herramienta favorita es el planificador de comidas con IA, recomienda recetas seguras para cada trimestre — ¡es como tener una nutricionista personal!", stars: 5, weekOrContext: "Week 26" },
  { nameKey: "testimonials.t11.name", defaultName: "Hana B.", textKey: "testimonials.t11.text", defaultText: "التطبيق ساعدني كثيراً في فترة ما بعد الولادة، دليل الأم الجديدة ومتتبع نوم الطفل أدوات لا غنى عنها!", stars: 5, weekOrContext: "Postpartum" },
  { nameKey: "testimonials.t12.name", defaultName: "Sophie W.", textKey: "testimonials.t12.text", defaultText: "I've tried 5 pregnancy apps before this one — none of them had AI-powered insights this good, the symptom analyzer is incredibly accurate", stars: 5, weekOrContext: "Week 22" },
  { nameKey: "testimonials.t13.name", defaultName: "Leila M.", textKey: "testimonials.t13.text", defaultText: "أحب ميزة صور البطن! أتابع تطور حملي بصرياً كل أسبوع، الذكاء الاصطناعي يحلل الصور ويعطيني ملاحظات رائعة", stars: 5, weekOrContext: "Week 34" },
  { nameKey: "testimonials.t14.name", defaultName: "Marta G.", textKey: "testimonials.t14.text", defaultText: "La lista de compras inteligente me ahorra mucho tiempo, genera exactamente lo que necesito según mi semana de embarazo", stars: 4, weekOrContext: "Week 19" },
  { nameKey: "testimonials.t15.name", defaultName: "Yuki T.", textKey: "testimonials.t15.text", defaultText: "The fitness coach adapts workouts to my trimester — I feel safe exercising knowing the AI considers my pregnancy stage", stars: 5, weekOrContext: "Week 27" },
  { nameKey: "testimonials.t16.name", defaultName: "Amira S.", textKey: "testimonials.t16.text", defaultText: "خاصية حاسبة موعد الولادة دقيقة جداً! والملخص الأسبوعي يخبرني بكل ما أحتاج معرفته عن تطور طفلي", stars: 5, weekOrContext: "Week 14" },
  { nameKey: "testimonials.t17.name", defaultName: "Elena R.", textKey: "testimonials.t17.text", defaultText: "L'application est magnifique et intuitive, le suivi du poids avec les recommandations personnalisées est exactement ce dont j'avais besoin", stars: 5, weekOrContext: "Week 25" },
  { nameKey: "testimonials.t18.name", defaultName: "Priya K.", textKey: "testimonials.t18.text", defaultText: "The hospital bag checklist was so thorough! I didn't forget a single thing — this app thinks of everything a mom needs", stars: 5, weekOrContext: "Week 38" },
  { nameKey: "testimonials.t19.name", defaultName: "Zeynep A.", textKey: "testimonials.t19.text", defaultText: "Bebek ağlama çeviricisi inanılmaz! Bebeğimin ne istediğini anlamama yardımcı oluyor, teknoloji harikası bir uygulama", stars: 5, weekOrContext: "Postpartum" },
  { nameKey: "testimonials.t20.name", defaultName: "Laura B.", textKey: "testimonials.t20.text", defaultText: "O guia de parceiro é fantástico! Meu marido usa todos os dias para entender melhor o que estou passando — muito útil!", stars: 5, weekOrContext: "Week 31" },
  { nameKey: "testimonials.t21.name", defaultName: "Rania F.", textKey: "testimonials.t21.text", defaultText: "مؤقت الانقباضات أنقذني! سهل الاستخدام حتى في أصعب اللحظات، التطبيق بأكمله مصمم بعناية فائقة", stars: 5, weekOrContext: "Week 40" },
  { nameKey: "testimonials.t22.name", defaultName: "Clara H.", textKey: "testimonials.t22.text", defaultText: "Der KI-Ernährungsberater ist großartig! Er schlägt sichere Rezepte für jedes Trimester vor — wie eine persönliche Ernährungsberaterin", stars: 5, weekOrContext: "Week 21" },
  { nameKey: "testimonials.t23.name", defaultName: "Isabella C.", textKey: "testimonials.t23.text", defaultText: "El rastreador de vitaminas me recuerda tomar mis suplementos — simple pero muy útil, ¡5 estrellas sin duda!", stars: 5, weekOrContext: "Week 12" },
  { nameKey: "testimonials.t24.name", defaultName: "Dina A.", textKey: "testimonials.t24.text", defaultText: "التطبيق يدعم 7 لغات! أستخدمه بالعربية وصديقتي تستخدمه بالفرنسية، الترجمة ممتازة ودقيقة", stars: 5, weekOrContext: "Week 29" },
  { nameKey: "testimonials.t25.name", defaultName: "Michelle T.", textKey: "testimonials.t25.text", defaultText: "The skincare analyzer helped me avoid unsafe products during pregnancy — I had no idea some of my favorites contained retinol!", stars: 4, weekOrContext: "Week 15" },
  { nameKey: "testimonials.t26.name", defaultName: "Aisha K.", textKey: "testimonials.t26.text", defaultText: "أداة تتبع الدورة ساعدتني في التخطيط للحمل، بعدها استخدمت كل أدوات الحمل — تطبيق شامل ومجاني!", stars: 5, weekOrContext: "TTC → Week 10" },
  { nameKey: "testimonials.t27.name", defaultName: "Hannah P.", textKey: "testimonials.t27.text", defaultText: "Best pregnancy app I've ever used — the daily insights keep me informed and the AI assistant answers all my questions instantly", stars: 5, weekOrContext: "Week 33" },
  { nameKey: "testimonials.t28.name", defaultName: "Lina M.", textKey: "testimonials.t28.text", defaultText: "ميزة الراحة أثناء الحمل رائعة! تمارين التنفس والاسترخاء تساعدني على النوم بشكل أفضل كل ليلة", stars: 5, weekOrContext: "Week 35" },
  { nameKey: "testimonials.t29.name", defaultName: "Olivia J.", textKey: "testimonials.t29.text", defaultText: "The diaper tracker is a game changer for new moms! I can track patterns and know when something is off — so smart!", stars: 5, weekOrContext: "Postpartum" },
  { nameKey: "testimonials.t30.name", defaultName: "Selin D.", textKey: "testimonials.t30.text", defaultText: "Haftalık başarılar ve sertifikalar çok motivasyonlu! Her hafta ilerlemeimi görmek beni mutlu ediyor, harika bir uygulama!", stars: 5, weekOrContext: "Week 23" },
];

const REVIEWS_KEY = "pt_user_reviews";
const PAGE_SIZE = 30;

function TranslateButton({ text, defaultText }: { text: string; defaultText: string }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleTranslate = useCallback(async () => {
    if (translatedText) {
      setTranslatedText(null);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      // Auto-detect source language from text content
      const hasArabic = /[\u0600-\u06FF]/.test(text);
      const hasTurkish = /[İıĞğÜüŞşÖöÇç]/.test(text);
      const hasGerman = /[äöüßÄÖÜ]/.test(text);
      const hasFrench = /[àâéèêëïîôùûüÿçœæÀÂÉÈ]/.test(text);
      const hasSpanish = /[ñáéíóúüÑÁÉÍÓÚÜ¿¡]/.test(text);
      const hasPortuguese = /[ãõçÃÕÇàáâéêíóôú]/.test(text);

      let sourceLang = 'en'; // default fallback
      if (hasArabic) sourceLang = 'ar';
      else if (hasTurkish) sourceLang = 'tr';
      else if (hasGerman) sourceLang = 'de';
      else if (hasFrench) sourceLang = 'fr';
      else if (hasSpanish) sourceLang = 'es';
      else if (hasPortuguese) sourceLang = 'pt';

      // Target = user's current UI language
      const currentLang = i18n.language?.split('-')[0] || 'en';
      let targetLang = currentLang;

      // If source matches target, flip to a useful alternative
      if (sourceLang === targetLang) {
        targetLang = sourceLang === 'en' ? 'ar' : 'en';
      }

      const from = sourceLang;
      const to = targetLang;

      if (from === to) {
        // No translation needed — show the default text as fallback
        setTranslatedText(defaultText !== text ? defaultText : text);
        return;
      }

      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${from}|${to}`
      );
      
      if (!res.ok) throw new Error('API error');
      
      const data = await res.json();
      const result = data?.responseData?.translatedText;
      
      if (result && result !== text && !result.includes('MYMEMORY WARNING') && data?.responseStatus === 200) {
        setTranslatedText(result);
      } else {
        // Fallback: show the default English/Arabic text
        if (defaultText && defaultText !== text) {
          setTranslatedText(defaultText);
        } else {
          setError(true);
        }
      }
    } catch {
      // Fallback to default text if available
      if (defaultText && defaultText !== text) {
        setTranslatedText(defaultText);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [text, defaultText, i18n.language, translatedText]);

  return (
    <>
      {translatedText && (
        <p className="text-xs text-primary/80 leading-relaxed mt-2 pt-2 border-t border-border/30" dir="auto">
          {translatedText}
        </p>
      )}
      {error && (
        <p className="text-[10px] text-destructive/60 mt-1">
          {t("testimonials.translateError", "تعذرت الترجمة حالياً")}
        </p>
      )}
      <button
        onClick={handleTranslate}
        disabled={loading}
        className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary transition-colors mt-2 disabled:opacity-40"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
        {translatedText
          ? t("testimonials.showOriginal", "عرض الأصل")
          : t("testimonials.translate", "ترجمة")}
      </button>
    </>
  );
}

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
  const [page, setPage] = useState(1);

  const allItems = [
    ...userReviews.map((r) => ({
      type: "user" as const,
      ...r,
    })),
    ...testimonials.map((t, i) => ({
      type: "static" as const,
      index: i,
      ...t,
    })),
  ];

  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = allItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
      const updated = [review, ...userReviews];
      setUserReviews(updated);
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
      setName("");
      setStars(0);
      setComment("");
      setSubmitting(false);
      setPage(1);
      toast.success(t("testimonials.form.success", "شكراً لتقييمك! 💕"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 500);
  };

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <span className="text-sm font-bold text-foreground ms-2">4.9</span>
            <span className="text-xs text-muted-foreground ms-1">({allItems.length.toLocaleString()}+)</span>
          </div>
        </motion.div>

        <div className="space-y-4">
          {pageItems.map((item, i) => {
            if (item.type === "user") {
              const r = item as UserReview & { type: "user" };
              return (
                <motion.div key={`user-${r.date}-${i}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-5 rounded-2xl bg-card border border-primary/20 relative">
                  <Quote className="absolute top-4 end-4 h-5 w-5 text-primary/20" />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
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
                  <TranslateButton text={r.comment} defaultText={r.comment} />
                </motion.div>
              );
            }

            const t2 = item as Testimonial & { type: "static"; index: number };
            const reviewText = t(t2.textKey, t2.defaultText);
            return (
              <motion.div key={`static-${t2.index}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-5 rounded-2xl bg-card border border-border relative">
                <Quote className="absolute top-4 end-4 h-5 w-5 text-primary/20" />
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {t2.defaultName[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{t(t2.nameKey, t2.defaultName)}</div>
                    <div className="text-[10px] text-muted-foreground">{t2.weekOrContext}</div>
                  </div>
                  <div className="ms-auto flex gap-0.5">
                    {Array.from({ length: t2.stars }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed" dir={/[\u0600-\u06FF]/.test(t2.defaultText) ? "rtl" : "ltr"}>
                  {reviewText}
                </p>
                <TranslateButton text={reviewText} defaultText={t2.defaultText} />
              </motion.div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-9 w-9 p-0 rounded-xl"
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(p)}
                className={`h-9 w-9 p-0 rounded-xl text-xs font-bold ${
                  p === currentPage ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                {p}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-9 w-9 p-0 rounded-xl"
            >
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-8 p-5 rounded-2xl bg-card border border-border space-y-4">
          <h2 className="text-sm font-bold text-foreground text-center">
            {t("testimonials.form.title", "شاركينا تجربتك ⭐")}
          </h2>

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
