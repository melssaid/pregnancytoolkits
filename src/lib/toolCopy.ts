import type { TFunction } from "i18next";
import type { Tool } from "@/lib/tools-data";

const toolLabelFallbacks: Record<string, Record<string, string>> = {
  "pregnancy-assistant": { ar: "المساعد الذكي", en: "Smart Assistant" },
  "smart-pregnancy-plan": { ar: "الخطة الذكية", en: "Smart Plan" },
  "weekly-summary": { ar: "الملخص الأسبوعي", en: "Weekly Summary" },
  "cycle-tracker": { ar: "متابعة الدورة", en: "Cycle Tracker" },
  "due-date-calculator": { ar: "حاسبة الموعد", en: "Due Date" },
  "fertility-academy": { ar: "أكاديمية الخصوبة", en: "Fertility Academy" },
  "nutrition-supplements": { ar: "التغذية والمكملات", en: "Nutrition & Supplements" },
  "preconception-checkup": { ar: "فحص ما قبل الحمل", en: "Preconception Checkup" },
  "fetal-growth": { ar: "نمو الجنين", en: "Fetal Growth" },
  "ai-birth-plan": { ar: "خطة الولادة", en: "Birth Plan" },
  "contraction-timer": { ar: "مؤقت الانقباضات", en: "Contraction Timer" },
  "kick-counter": { ar: "عداد ركلات الجنين", en: "Kick Counter" },
  "weight-gain": { ar: "زيادة الوزن", en: "Weight Gain" },
  "ai-bump-photos": { ar: "صور البطن الذكية", en: "Bump Photos" },
  "ai-meal-suggestion": { ar: "اقتراح الوجبات", en: "Meal Suggestions" },
  "smart-grocery-list": { ar: "قائمة المشتريات", en: "Grocery List" },
  "vitamin-tracker": { ar: "متابعة الفيتامينات", en: "Vitamin Tracker" },
  "wellness-diary": { ar: "مذكرة العافية", en: "Wellness Diary" },
  "ai-fitness-coach": { ar: "اللياقة الذكية", en: "Fitness Coach" },
  "pregnancy-comfort": { ar: "الراحة أثناء الحمل", en: "Pregnancy Comfort" },
  "ai-pregnancy-skincare": { ar: "العناية بالبشرة", en: "Pregnancy Skincare" },
  "maternal-health-awareness": { ar: "التوعية الصحية", en: "Health Awareness" },
  "ai-hospital-bag": { ar: "حقيبة المستشفى", en: "Hospital Bag" },
  "baby-gear-recommender": { ar: "مستلزمات الطفل", en: "Baby Gear" },
  "smart-appointment-reminder": { ar: "تذكير المواعيد", en: "Appointments" },
  "ai-partner-guide": { ar: "دليل الشريك", en: "Partner Guide" },
  "postpartum-mental-health": { ar: "الدعم النفسي", en: "Mental Health" },
  "ai-lactation-prep": { ar: "الرضاعة الذكية", en: "Lactation Prep" },
  "postpartum-recovery": { ar: "التعافي بعد الولادة", en: "Recovery" },
  "baby-cry-translator": { ar: "مترجم بكاء الطفل", en: "Cry Translator" },
  "baby-sleep-tracker": { ar: "نوم الطفل", en: "Baby Sleep" },
  "baby-growth": { ar: "نمو الطفل", en: "Baby Growth" },
  "diaper-tracker": { ar: "متابعة الحفاض", en: "Diaper Tracker" },
};

export function getToolTitle(tool: Tool, t: TFunction, lang: string) {
  const translated = t(tool.titleKey);
  if (translated && translated !== tool.titleKey) return translated;
  return toolLabelFallbacks[tool.id]?.[lang] || toolLabelFallbacks[tool.id]?.en || tool.id;
}

export function getToolDescription(tool: Tool, t: TFunction, lang: string) {
  const translated = t(tool.descriptionKey);
  if (translated && translated !== tool.descriptionKey) return translated;
  return getToolTitle(tool, t, lang);
}