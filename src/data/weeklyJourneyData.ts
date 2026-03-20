/**
 * Static editorial content for each pregnancy week (4-42).
 * Translation keys are used so content is rendered via i18next.
 * Each week has: fetalDevelopment, bodyChanges, nutritionFocus, mentalWellness, doctorQuestions, weeklyChecklist.
 */

export interface WeeklyJourneyContent {
  fetalDevelopment: string[]; // i18n keys
  bodyChanges: string[];
  nutritionNutrients: string[]; // nutrient name keys
  nutritionTip: string; // i18n key
  mentalAffirmation: string;
  mentalTip: string;
  doctorQuestions: string[];
  weeklyChecklist: string[];
}

// We use translation key suffixes. Full key: `weeklyJourney.week${N}.fetalDev.0`
// The actual component will build the full key path.

// Generate week numbers array for iteration
export const PREGNANCY_WEEKS = Array.from({ length: 39 }, (_, i) => i + 4);

// Number of items per section per week (used for iteration in components)
export const weekSectionCounts: Record<number, {
  fetalDev: number;
  bodyChanges: number;
  nutrients: number;
  doctorQ: number;
  checklist: number;
}> = {};

// Default counts for weeks without specific data
const DEFAULT_COUNTS = { fetalDev: 4, bodyChanges: 3, nutrients: 3, doctorQ: 3, checklist: 5 };

for (let w = 4; w <= 42; w++) {
  weekSectionCounts[w] = { ...DEFAULT_COUNTS };
}

// Fetal size data (re-exported for convenience)
export const fetalSizeData: Record<number, { sizeEn: string; sizeAr: string; lengthCm: string; weightG: string }> = {
  4: { sizeEn: "Poppy seed", sizeAr: "حبة خشخاش", lengthCm: "0.1", weightG: "<1" },
  5: { sizeEn: "Sesame seed", sizeAr: "حبة سمسم", lengthCm: "0.2", weightG: "<1" },
  6: { sizeEn: "Lentil", sizeAr: "حبة عدس", lengthCm: "0.6", weightG: "<1" },
  7: { sizeEn: "Blueberry", sizeAr: "حبة توت", lengthCm: "1.3", weightG: "1" },
  8: { sizeEn: "Raspberry", sizeAr: "حبة توت أحمر", lengthCm: "1.6", weightG: "1" },
  9: { sizeEn: "Cherry", sizeAr: "حبة كرز", lengthCm: "2.3", weightG: "2" },
  10: { sizeEn: "Strawberry", sizeAr: "حبة فراولة", lengthCm: "3.1", weightG: "4" },
  11: { sizeEn: "Fig", sizeAr: "حبة تين", lengthCm: "4.1", weightG: "7" },
  12: { sizeEn: "Lime", sizeAr: "حبة ليمون", lengthCm: "5.4", weightG: "14" },
  13: { sizeEn: "Peach", sizeAr: "حبة خوخ", lengthCm: "7.4", weightG: "23" },
  14: { sizeEn: "Lemon", sizeAr: "ليمونة", lengthCm: "8.7", weightG: "43" },
  15: { sizeEn: "Apple", sizeAr: "تفاحة", lengthCm: "10.1", weightG: "70" },
  16: { sizeEn: "Avocado", sizeAr: "حبة أفوكادو", lengthCm: "11.6", weightG: "100" },
  17: { sizeEn: "Pear", sizeAr: "حبة إجاص", lengthCm: "13", weightG: "140" },
  18: { sizeEn: "Bell pepper", sizeAr: "حبة فلفل", lengthCm: "14.2", weightG: "190" },
  19: { sizeEn: "Mango", sizeAr: "حبة مانجو", lengthCm: "15.3", weightG: "240" },
  20: { sizeEn: "Banana", sizeAr: "موزة", lengthCm: "16.4", weightG: "300" },
  21: { sizeEn: "Carrot", sizeAr: "جزرة", lengthCm: "26.7", weightG: "360" },
  22: { sizeEn: "Papaya", sizeAr: "حبة بابايا", lengthCm: "27.8", weightG: "430" },
  23: { sizeEn: "Grapefruit", sizeAr: "جريب فروت", lengthCm: "28.9", weightG: "500" },
  24: { sizeEn: "Corn", sizeAr: "كوز ذرة", lengthCm: "30", weightG: "600" },
  25: { sizeEn: "Cauliflower", sizeAr: "قرنبيط", lengthCm: "34.6", weightG: "660" },
  26: { sizeEn: "Lettuce", sizeAr: "خس", lengthCm: "35.6", weightG: "760" },
  27: { sizeEn: "Cabbage", sizeAr: "ملفوف", lengthCm: "36.6", weightG: "875" },
  28: { sizeEn: "Eggplant", sizeAr: "باذنجان", lengthCm: "37.6", weightG: "1000" },
  29: { sizeEn: "Butternut squash", sizeAr: "قرع", lengthCm: "38.6", weightG: "1150" },
  30: { sizeEn: "Coconut", sizeAr: "جوز هند", lengthCm: "39.9", weightG: "1320" },
  31: { sizeEn: "Pineapple", sizeAr: "أناناس", lengthCm: "41.1", weightG: "1500" },
  32: { sizeEn: "Squash", sizeAr: "كوسة كبيرة", lengthCm: "42.4", weightG: "1700" },
  33: { sizeEn: "Celery", sizeAr: "كرفس", lengthCm: "43.7", weightG: "1920" },
  34: { sizeEn: "Cantaloupe", sizeAr: "شمام", lengthCm: "45", weightG: "2150" },
  35: { sizeEn: "Honeydew melon", sizeAr: "شمام أخضر", lengthCm: "46.2", weightG: "2380" },
  36: { sizeEn: "Romaine lettuce", sizeAr: "خس روماني", lengthCm: "47.4", weightG: "2620" },
  37: { sizeEn: "Swiss chard", sizeAr: "سلق", lengthCm: "48.6", weightG: "2860" },
  38: { sizeEn: "Leek", sizeAr: "كراث", lengthCm: "49.8", weightG: "3080" },
  39: { sizeEn: "Watermelon", sizeAr: "بطيخة صغيرة", lengthCm: "50.7", weightG: "3290" },
  40: { sizeEn: "Pumpkin", sizeAr: "يقطينة", lengthCm: "51.2", weightG: "3460" },
  41: { sizeEn: "Watermelon", sizeAr: "بطيخة", lengthCm: "51.5", weightG: "3600" },
  42: { sizeEn: "Jackfruit", sizeAr: "جاك فروت", lengthCm: "51.7", weightG: "3700" },
};
