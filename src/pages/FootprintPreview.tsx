import { useState } from "react";
import { useTranslation } from "react-i18next";
import { footprintOptions, FootprintStyle } from "@/components/BabyFootprintsIcon";

const labels: Record<FootprintStyle, { ar: string; en: string }> = {
  single: { ar: "بصمة واحدة بسيطة", en: "Single Clean Foot" },
  twoFeet: { ar: "بصمتان متقابلتان", en: "Two Facing Feet" },
  heartFoot: { ar: "بصمة داخل قلب", en: "Foot in Heart" },
  lucide: { ar: "أيقونة Lucide جاهزة", en: "Lucide Icon" },
};

const FOOTPRINT_STYLE_KEY = "footprint-icon-style";

const FootprintPreview = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [selected, setSelected] = useState<FootprintStyle>(() => {
    try {
      const s = localStorage.getItem(FOOTPRINT_STYLE_KEY);
      if (s && s in footprintOptions) return s as FootprintStyle;
    } catch {}
    return "twoFeet";
  });

  const choose = (key: FootprintStyle) => {
    setSelected(key);
    localStorage.setItem(FOOTPRINT_STYLE_KEY, key);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-8" dir={isAr ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold text-foreground">{isAr ? "اختر شكل بصمة القدم" : "Choose Footprint Style"}</h1>
      <div className="grid grid-cols-2 gap-6 max-w-md w-full">
        {(Object.keys(footprintOptions) as FootprintStyle[]).map(key => {
          const Comp = footprintOptions[key];
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => choose(key)}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg scale-105"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[hsl(15,70%,62%)] via-[hsl(25,65%,65%)] to-[hsl(340,50%,65%)] flex items-center justify-center">
                <Comp className="w-10 h-10" />
              </div>
              <span className="text-sm font-medium text-foreground">{isAr ? labels[key].ar : labels[key].en}</span>
              {isSelected && (
                <span className="text-xs text-primary font-semibold">{isAr ? "✓ مختار" : "✓ Selected"}</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {isAr ? "اختر الشكل المناسب ثم عد للصفحة الرئيسية لرؤية النتيجة" : "Pick your style then go back to the home page to see it"}
      </p>
    </div>
  );
};

export default FootprintPreview;
