import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LifeBuoy, ArrowRight, ArrowLeft } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ProblemItem {
  id: string;
  href: string;
  emoji: string;
  titleAr: string;
  titleEn: string;
}

const problemsByStage: Record<string, ProblemItem[]> = {
  fertility: [
    { id: "cycle", href: "/tools/cycle-tracker", emoji: "🌸", titleAr: "متى أيام الإباضة؟", titleEn: "When is my fertile window?" },
    { id: "preconception", href: "/tools/preconception-checkup", emoji: "✅", titleAr: "هل أنا جاهزة للحمل؟", titleEn: "Am I ready to conceive?" },
    { id: "nutrition", href: "/tools/nutrition-supplements", emoji: "🌿", titleAr: "أي فيتامينات أحتاج؟", titleEn: "Which vitamins do I need?" },
    { id: "fertility-academy", href: "/tools/fertility-academy", emoji: "📚", titleAr: "نصائح لزيادة الخصوبة", titleEn: "Tips to boost fertility" },
  ],
  pregnant: [
    { id: "symptoms", href: "/tools/symptom-analyzer", emoji: "🩺", titleAr: "هذا العَرَض طبيعي؟", titleEn: "Is this symptom normal?" },
    { id: "kicks", href: "/tools/kick-counter", emoji: "👣", titleAr: "حركة الجنين قليلة", titleEn: "Low baby movement" },
    { id: "nutrition", href: "/tools/ai-meal-suggestion", emoji: "🍎", titleAr: "ماذا آكل اليوم؟", titleEn: "What should I eat today?" },
    { id: "comfort", href: "/tools/pregnancy-comfort", emoji: "💤", titleAr: "آلام وراحة النوم", titleEn: "Pain & sleep comfort" },
    { id: "back-pain", href: "/tools/back-pain-relief", emoji: "🧘‍♀️", titleAr: "تخفيف ألم الظهر", titleEn: "Back pain relief" },
    { id: "hospital-bag", href: "/tools/ai-hospital-bag", emoji: "🎒", titleAr: "تجهيز حقيبة الولادة", titleEn: "Hospital bag prep" },
  ],
  postpartum: [
    { id: "cry", href: "/tools/baby-cry-translator", emoji: "👶", titleAr: "لماذا يبكي طفلي؟", titleEn: "Why is my baby crying?" },
    { id: "sleep", href: "/tools/baby-sleep-tracker", emoji: "🌙", titleAr: "نوم الطفل غير منتظم", titleEn: "Baby sleep issues" },
    { id: "recovery", href: "/tools/postpartum-recovery", emoji: "💗", titleAr: "تعافي ما بعد الولادة", titleEn: "Postpartum recovery" },
    { id: "mental", href: "/tools/postpartum-mental-health", emoji: "🧠", titleAr: "مزاجي متعب — أحتاج دعم", titleEn: "Mood support" },
    { id: "lactation", href: "/tools/lactation-prep", emoji: "🤱", titleAr: "مساعدة في الرضاعة", titleEn: "Breastfeeding help" },
    { id: "diaper", href: "/tools/diaper-tracker", emoji: "📊", titleAr: "متابعة الحفاضات", titleEn: "Diaper tracking" },
  ],
};

export const QuickProblemSolver = memo(function QuickProblemSolver() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const isAr = lang === "ar";
  const isRTL = isAr;
  const { profile } = useUserProfile();

  const stage = profile.journeyStage || "pregnant";
  const items = useMemo(() => (problemsByStage[stage] || problemsByStage.pregnant).slice(0, 6), [stage]);

  const heading = isAr ? "حلول سريعة لمشكلتك" : "Quick problem solver";
  const subhead = isAr ? "اضغطي على ما يشغلك الآن" : "Tap what's on your mind";
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="rounded-2xl border border-border bg-card px-4 py-3.5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(340,50%,94%)] text-[hsl(340,65%,52%)] dark:bg-[hsl(340,35%,18%)] dark:text-[hsl(340,55%,65%)]">
          <LifeBuoy className="h-4 w-4" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className={`text-[14px] font-extrabold leading-tight text-foreground ${isAr ? "ar-heading" : ""}`}>
            {heading}
          </h2>
          <p className="text-[11px] text-muted-foreground leading-tight">{subhead}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className="group flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-2.5 py-2 transition-all hover:-translate-y-[1px] hover:border-primary/40 hover:bg-secondary active:scale-[0.97]"
          >
            <span className="text-base leading-none" aria-hidden="true">{item.emoji}</span>
            <span className={`flex-1 text-[11px] font-bold leading-tight text-foreground line-clamp-2 ${isAr ? "ar-heading" : ""}`}>
              {isAr ? item.titleAr : item.titleEn}
            </span>
            <Arrow className="h-3 w-3 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" strokeWidth={2.2} />
          </Link>
        ))}
      </div>
    </section>
  );
});

export default QuickProblemSolver;
