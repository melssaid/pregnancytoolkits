import {
  Calendar,
  Baby,
  Activity,
  Calculator,
  Hand,
  Timer,
  TrendingUp,
  Droplet,
  AlertTriangle,
  Heart,
  Pill,
  Brain,
  CircleDot,
  GlassWater,
  Dumbbell,
  Syringe,
  CheckSquare,
  LucideIcon,
  Scale,
  BookOpen,
  Apple,
  Ban,
  Moon,
  Sparkles,
  Wind,
  Smile,
  Flower2,
  Ruler,
} from "lucide-react";

export interface Tool {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  categoryKey: string;
  href: string;
  priority: number;
  isPremium?: boolean;
}

export const toolsData: Tool[] = [
  // FREE TOOLS (First 3 days all free, then these stay free)
  { id: "due-date-calculator", titleKey: "tools.dueDateCalculator.title", descriptionKey: "tools.dueDateCalculator.description", icon: Baby, categoryKey: "categories.pregnancy", href: "/tools/due-date-calculator", priority: 1 },
  { id: "pregnancy-bmi", titleKey: "tools.pregnancyBmi.title", descriptionKey: "tools.pregnancyBmi.description", icon: Calculator, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-bmi", priority: 2 },
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 3 },
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 4 },
  { id: "contraction-timer", titleKey: "tools.contractionTimer.title", descriptionKey: "tools.contractionTimer.description", icon: Timer, categoryKey: "categories.labor", href: "/tools/contraction-timer", priority: 5 },
  
  // PREMIUM TOOLS ($1.99/month after 3-day trial)
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, categoryKey: "categories.pregnancy", href: "/tools/weight-gain", priority: 6, isPremium: true },
  { id: "pregnancy-diary", titleKey: "tools.pregnancyDiary.title", descriptionKey: "tools.pregnancyDiary.description", icon: BookOpen, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-diary", priority: 7, isPremium: true },
  { id: "nutrition-guide", titleKey: "tools.nutritionGuide.title", descriptionKey: "tools.nutritionGuide.description", icon: Apple, categoryKey: "categories.wellness", href: "/tools/nutrition-guide", priority: 8, isPremium: true },
  { id: "forbidden-foods", titleKey: "tools.forbiddenFoods.title", descriptionKey: "tools.forbiddenFoods.description", icon: Ban, categoryKey: "categories.reference", href: "/tools/forbidden-foods", priority: 9, isPremium: true },
  { id: "gestational-diabetes", titleKey: "tools.gestationalDiabetes.title", descriptionKey: "tools.gestationalDiabetes.description", icon: AlertTriangle, categoryKey: "categories.riskAssessment", href: "/tools/gestational-diabetes", priority: 10, isPremium: true },
  { id: "preeclampsia-risk", titleKey: "tools.preeclampsiaRisk.title", descriptionKey: "tools.preeclampsiaRisk.description", icon: Heart, categoryKey: "categories.riskAssessment", href: "/tools/preeclampsia-risk", priority: 11, isPremium: true },
  { id: "safe-medications", titleKey: "tools.safeMedications.title", descriptionKey: "tools.safeMedications.description", icon: Pill, categoryKey: "categories.reference", href: "/tools/safe-medications", priority: 12, isPremium: true },
  { id: "exercise-guide", titleKey: "tools.exerciseGuide.title", descriptionKey: "tools.exerciseGuide.description", icon: Dumbbell, categoryKey: "categories.wellness", href: "/tools/exercise-guide", priority: 13, isPremium: true },
  { id: "water-intake", titleKey: "tools.waterIntake.title", descriptionKey: "tools.waterIntake.description", icon: GlassWater, categoryKey: "categories.wellness", href: "/tools/water-intake", priority: 14, isPremium: true },
  { id: "vaccination-schedule", titleKey: "tools.vaccinationSchedule.title", descriptionKey: "tools.vaccinationSchedule.description", icon: Syringe, categoryKey: "categories.reference", href: "/tools/vaccination-schedule", priority: 15, isPremium: true },
  { id: "hospital-bag", titleKey: "tools.hospitalBag.title", descriptionKey: "tools.hospitalBag.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/hospital-bag", priority: 16, isPremium: true },
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 17, isPremium: true },
  { id: "diaper-tracker", titleKey: "tools.diaperTracker.title", descriptionKey: "tools.diaperTracker.description", icon: Droplet, categoryKey: "categories.postpartum", href: "/tools/diaper-tracker", priority: 18, isPremium: true },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 19, isPremium: true },
  { id: "vaccination-guide", titleKey: "tools.vaccinationGuide.title", descriptionKey: "tools.vaccinationGuide.description", icon: Syringe, categoryKey: "categories.reference", href: "/tools/vaccination-guide", priority: 20, isPremium: true },
  { id: "ppd-screener", titleKey: "tools.ppdScreener.title", descriptionKey: "tools.ppdScreener.description", icon: Brain, categoryKey: "categories.mentalHealth", href: "/tools/ppd-screener", priority: 21, isPremium: true },
  { id: "breastfeeding-tracker", titleKey: "tools.breastfeedingTracker.title", descriptionKey: "tools.breastfeedingTracker.description", icon: CircleDot, categoryKey: "categories.postpartum", href: "/tools/breastfeeding-tracker", priority: 22, isPremium: true },
  { id: "gender-predictor", titleKey: "tools.genderPredictor.title", descriptionKey: "tools.genderPredictor.description", icon: Sparkles, categoryKey: "categories.pregnancy", href: "/tools/gender-predictor", priority: 23, isPremium: true },
  { id: "conception-calculator", titleKey: "tools.conceptionCalculator.title", descriptionKey: "tools.conceptionCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/conception-calculator", priority: 24, isPremium: true },
  { id: "ovulation-calculator", titleKey: "tools.ovulationCalculator.title", descriptionKey: "tools.ovulationCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/ovulation-calculator", priority: 25, isPremium: true },
  { id: "cycle-tracker", titleKey: "tools.cycleTracker.title", descriptionKey: "tools.cycleTracker.description", icon: Activity, categoryKey: "categories.menstrualHealth", href: "/tools/cycle-tracker", priority: 26, isPremium: true },
  { id: "breathing-exercises", titleKey: "tools.breathingExercises.title", descriptionKey: "tools.breathingExercises.description", icon: Wind, categoryKey: "categories.wellness", href: "/tools/breathing-exercises", priority: 27, isPremium: true },
  { id: "mood-diary", titleKey: "tools.moodDiary.title", descriptionKey: "tools.moodDiary.description", icon: Smile, categoryKey: "categories.mentalHealth", href: "/tools/mood-diary", priority: 28, isPremium: true },
  { id: "yoga-guide", titleKey: "tools.yogaGuide.title", descriptionKey: "tools.yogaGuide.description", icon: Flower2, categoryKey: "categories.wellness", href: "/tools/yoga-guide", priority: 29, isPremium: true },
  { id: "affirmations", titleKey: "tools.affirmations.title", descriptionKey: "tools.affirmations.description", icon: Heart, categoryKey: "categories.mentalHealth", href: "/tools/affirmations", priority: 30, isPremium: true },
  { id: "blood-type", titleKey: "tools.bloodType.title", descriptionKey: "tools.bloodType.description", icon: Droplet, categoryKey: "categories.genetics", href: "/tools/blood-type", priority: 31, isPremium: true },
];

export const categoryKeys = [
  "categories.all",
  "categories.pregnancy",
  "categories.riskAssessment",
  "categories.wellness",
  "categories.reference",
  "categories.preparation",
  "categories.labor",
  "categories.postpartum",
  "categories.mentalHealth",
  "categories.fertility",
  "categories.menstrualHealth",
  "categories.genetics",
];

export const getSortedTools = () => {
  return [...toolsData].sort((a, b) => a.priority - b.priority);
};

export const getFreeTools = () => toolsData.filter(t => !t.isPremium);
export const getPremiumTools = () => toolsData.filter(t => t.isPremium);
