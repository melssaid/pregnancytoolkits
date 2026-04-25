import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AbbrItem {
  abbr: string;
  ar: { name: string; desc: string };
  en: { name: string; desc: string };
}

const ITEMS: AbbrItem[] = [
  {
    abbr: "BPD",
    ar: {
      name: "القطر الجداري ثنائي الرأس (Biparietal Diameter)",
      desc: "قياس عرض رأس الجنين بين العظمتين الجداريتين. يُستخدم لتقدير عمر الحمل ومتابعة نمو الدماغ.",
    },
    en: {
      name: "Biparietal Diameter",
      desc: "The width of the baby's head between the two parietal bones. Used to estimate gestational age and track brain growth.",
    },
  },
  {
    abbr: "FL",
    ar: {
      name: "طول عظمة الفخذ (Femur Length)",
      desc: "قياس طول أطول عظمة في جسم الجنين. مؤشر مهم لنمو الهيكل العظمي وتقدير الطول الكلي.",
    },
    en: {
      name: "Femur Length",
      desc: "The length of the baby's thigh bone — the longest bone in the body. A key indicator of skeletal growth and overall length.",
    },
  },
  {
    abbr: "AC",
    ar: {
      name: "محيط البطن (Abdominal Circumference)",
      desc: "قياس محيط بطن الجنين عند مستوى الكبد والمعدة. يعكس نمو الأعضاء الداخلية وحالة التغذية.",
    },
    en: {
      name: "Abdominal Circumference",
      desc: "The circumference of the baby's abdomen at the level of the liver and stomach. Reflects internal organ growth and nutritional status.",
    },
  },
  {
    abbr: "HC",
    ar: {
      name: "محيط الرأس (Head Circumference)",
      desc: "قياس محيط جمجمة الجنين. يُستخدم مع BPD لتقييم نمو الدماغ وحجم الرأس بدقة أكبر.",
    },
    en: {
      name: "Head Circumference",
      desc: "The circumference of the baby's skull. Used alongside BPD to assess brain growth and head size more precisely.",
    },
  },
  {
    abbr: "NT",
    ar: {
      name: "الشفافية القفوية (Nuchal Translucency)",
      desc: "قياس سُمك السائل خلف رقبة الجنين بين الأسبوع 11–14. فحص شائع للكشف عن مؤشرات تطور معينة.",
    },
    en: {
      name: "Nuchal Translucency",
      desc: "The thickness of fluid behind the baby's neck, measured between weeks 11–14. A common screening for early developmental indicators.",
    },
  },
  {
    abbr: "EFW",
    ar: {
      name: "الوزن المُقدَّر للجنين (Estimated Fetal Weight)",
      desc: "تقدير حسابي لوزن الجنين بناءً على القياسات السابقة (BPD + FL + AC + HC). يساعد في متابعة مسار النمو.",
    },
    en: {
      name: "Estimated Fetal Weight",
      desc: "A calculated estimate of the baby's weight based on the above measurements (BPD + FL + AC + HC). Helps track growth trajectory.",
    },
  },
];

export function UltrasoundAbbreviationsGuide() {
  const { isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-card via-card to-primary/[0.03] overflow-hidden shadow-sm">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-start hover:bg-primary/[0.04] transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5 text-primary" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] font-bold text-foreground leading-tight">
              {isRTL ? "دليل اختصارات السونار" : "Ultrasound Abbreviations Guide"}
            </p>
            <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug">
              {isRTL
                ? "اضغط لمعرفة معنى BPD · FL · AC · HC · NT · EFW"
                : "Tap to learn what BPD · FL · AC · HC · NT · EFW mean"}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
        >
          <ChevronDown className="w-4.5 h-4.5 text-primary" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden border-t border-primary/10"
          >
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ITEMS.map((item) => {
                const isActive = activeItem === item.abbr;
                const t = isRTL ? item.ar : item.en;
                return (
                  <button
                    key={item.abbr}
                    onClick={() => setActiveItem(isActive ? null : item.abbr)}
                    className={`text-start rounded-xl border transition-all p-3 ${
                      isActive
                        ? "border-primary/40 bg-primary/5 shadow-sm"
                        : "border-border/60 bg-background/60 hover:border-primary/25 hover:bg-primary/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center min-w-[44px] h-7 px-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-[12px] font-extrabold tracking-wide shadow-sm">
                        {item.abbr}
                      </span>
                      <span className="text-[12px] font-semibold text-foreground leading-tight flex-1">
                        {t.name}
                      </span>
                    </div>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.p
                          initial={{ height: 0, opacity: 0, marginTop: 0 }}
                          animate={{ height: "auto", opacity: 1, marginTop: 6 }}
                          exit={{ height: 0, opacity: 0, marginTop: 0 }}
                          transition={{ duration: 0.22 }}
                          className="text-[11.5px] text-muted-foreground leading-relaxed overflow-hidden"
                        >
                          {t.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>
            <p className="px-4 pb-3 pt-1 text-[10px] text-muted-foreground/80 leading-snug">
              {isRTL
                ? "ℹ️ هذه شروحات تعليمية عامة — القياسات الفعلية يقدّمها طبيبك من جهاز السونار."
                : "ℹ️ Educational explanations only — actual measurements are provided by your doctor from the ultrasound device."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UltrasoundAbbreviationsGuide;
