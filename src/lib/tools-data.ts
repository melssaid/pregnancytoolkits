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
  Stethoscope,
  Thermometer,
  Clock,
  Camera,
  Music,
  Users,
  MessageCircle,
  Lightbulb,
  Star,
  FileText,
  HeartPulse,
  Ribbon,
  Palette,
  BedDouble,
  Footprints,
  Milestone,
  Utensils,
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

// Tools organized by pregnancy journey stage for logical flow
// Note: Gender Predictor removed - not compliant with Google Play policies (no scientific basis claims)
export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🤖 AI-POWERED TOOLS (Featured)
  // ═══════════════════════════════════════════════════════════════
  { id: "pregnancy-assistant", titleKey: "tools.pregnancyAssistant.title", descriptionKey: "tools.pregnancyAssistant.description", icon: MessageCircle, categoryKey: "categories.ai", href: "/tools/pregnancy-assistant", priority: 1, isPremium: true },
  { id: "symptom-analyzer", titleKey: "tools.symptomAnalyzer.title", descriptionKey: "tools.symptomAnalyzer.description", icon: Stethoscope, categoryKey: "categories.ai", href: "/tools/symptom-analyzer", priority: 2, isPremium: true },
  { id: "ai-meal-suggestion", titleKey: "tools.aiMealSuggestion.title", descriptionKey: "tools.aiMealSuggestion.description", icon: Utensils, categoryKey: "categories.ai", href: "/tools/ai-meal-suggestion", priority: 3, isPremium: true },
  { id: "weekly-summary", titleKey: "tools.weeklySummary.title", descriptionKey: "tools.weeklySummary.description", icon: Star, categoryKey: "categories.ai", href: "/tools/weekly-summary", priority: 4, isPremium: true },

  // ═══════════════════════════════════════════════════════════════
  // STAGE 1: PRE-PREGNANCY & FERTILITY (Trying to Conceive)
  // ═══════════════════════════════════════════════════════════════
  { id: "ovulation-calculator", titleKey: "tools.ovulationCalculator.title", descriptionKey: "tools.ovulationCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/ovulation-calculator", priority: 5, isPremium: true },
  { id: "cycle-tracker", titleKey: "tools.cycleTracker.title", descriptionKey: "tools.cycleTracker.description", icon: Activity, categoryKey: "categories.fertility", href: "/tools/cycle-tracker", priority: 6, isPremium: true },
  { id: "conception-calculator", titleKey: "tools.conceptionCalculator.title", descriptionKey: "tools.conceptionCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/conception-calculator", priority: 7, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 2: EARLY PREGNANCY (Finding Out & First Steps)
  // ═══════════════════════════════════════════════════════════════
  { id: "due-date-calculator", titleKey: "tools.dueDateCalculator.title", descriptionKey: "tools.dueDateCalculator.description", icon: Baby, categoryKey: "categories.pregnancy", href: "/tools/due-date-calculator", priority: 8 },
  { id: "pregnancy-bmi", titleKey: "tools.pregnancyBmi.title", descriptionKey: "tools.pregnancyBmi.description", icon: Calculator, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-bmi", priority: 9 },
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 10 },
  { id: "pregnancy-diary", titleKey: "tools.pregnancyDiary.title", descriptionKey: "tools.pregnancyDiary.description", icon: BookOpen, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-diary", priority: 11, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 3: ONGOING PREGNANCY (Daily Tracking & Health)
  // ═══════════════════════════════════════════════════════════════
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 12 },
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, categoryKey: "categories.pregnancy", href: "/tools/weight-gain", priority: 13, isPremium: true },
  { id: "water-intake", titleKey: "tools.waterIntake.title", descriptionKey: "tools.waterIntake.description", icon: GlassWater, categoryKey: "categories.wellness", href: "/tools/water-intake", priority: 14, isPremium: true },
  { id: "vitamin-tracker", titleKey: "tools.vitaminTracker.title", descriptionKey: "tools.vitaminTracker.description", icon: Pill, categoryKey: "categories.wellness", href: "/tools/vitamin-tracker", priority: 15, isPremium: true },
  { id: "bump-photos", titleKey: "tools.bumpPhotos.title", descriptionKey: "tools.bumpPhotos.description", icon: Camera, categoryKey: "categories.pregnancy", href: "/tools/bump-photos", priority: 16, isPremium: true },
  { id: "pregnancy-milestones", titleKey: "tools.pregnancyMilestones.title", descriptionKey: "tools.pregnancyMilestones.description", icon: Milestone, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-milestones", priority: 17, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 4: HEALTH & NUTRITION
  // ═══════════════════════════════════════════════════════════════
  { id: "nutrition-guide", titleKey: "tools.nutritionGuide.title", descriptionKey: "tools.nutritionGuide.description", icon: Apple, categoryKey: "categories.wellness", href: "/tools/nutrition-guide", priority: 18, isPremium: true },
  { id: "forbidden-foods", titleKey: "tools.forbiddenFoods.title", descriptionKey: "tools.forbiddenFoods.description", icon: Ban, categoryKey: "categories.wellness", href: "/tools/forbidden-foods", priority: 19, isPremium: true },
  { id: "meal-planner", titleKey: "tools.mealPlanner.title", descriptionKey: "tools.mealPlanner.description", icon: Utensils, categoryKey: "categories.wellness", href: "/tools/meal-planner", priority: 20, isPremium: true },
  { id: "safe-medications", titleKey: "tools.safeMedications.title", descriptionKey: "tools.safeMedications.description", icon: Pill, categoryKey: "categories.reference", href: "/tools/safe-medications", priority: 21, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 5: FITNESS & WELLNESS
  // ═══════════════════════════════════════════════════════════════
  { id: "exercise-guide", titleKey: "tools.exerciseGuide.title", descriptionKey: "tools.exerciseGuide.description", icon: Dumbbell, categoryKey: "categories.wellness", href: "/tools/exercise-guide", priority: 22, isPremium: true },
  { id: "yoga-guide", titleKey: "tools.yogaGuide.title", descriptionKey: "tools.yogaGuide.description", icon: Flower2, categoryKey: "categories.wellness", href: "/tools/yoga-guide", priority: 23, isPremium: true },
  { id: "breathing-exercises", titleKey: "tools.breathingExercises.title", descriptionKey: "tools.breathingExercises.description", icon: Wind, categoryKey: "categories.wellness", href: "/tools/breathing-exercises", priority: 24, isPremium: true },
  { id: "kegel-exercises", titleKey: "tools.kegelExercises.title", descriptionKey: "tools.kegelExercises.description", icon: Activity, categoryKey: "categories.wellness", href: "/tools/kegel-exercises", priority: 25, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 6: MENTAL HEALTH & WELLBEING
  // ═══════════════════════════════════════════════════════════════
  { id: "mood-diary", titleKey: "tools.moodDiary.title", descriptionKey: "tools.moodDiary.description", icon: Smile, categoryKey: "categories.mentalHealth", href: "/tools/mood-diary", priority: 26, isPremium: true },
  { id: "affirmations", titleKey: "tools.affirmations.title", descriptionKey: "tools.affirmations.description", icon: Heart, categoryKey: "categories.mentalHealth", href: "/tools/affirmations", priority: 27, isPremium: true },
  { id: "ppd-screener", titleKey: "tools.ppdScreener.title", descriptionKey: "tools.ppdScreener.description", icon: Brain, categoryKey: "categories.mentalHealth", href: "/tools/ppd-screener", priority: 28, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 7: RISK ASSESSMENT (Educational - Not Diagnostic)
  // ═══════════════════════════════════════════════════════════════
  { id: "gestational-diabetes", titleKey: "tools.gestationalDiabetes.title", descriptionKey: "tools.gestationalDiabetes.description", icon: AlertTriangle, categoryKey: "categories.riskAssessment", href: "/tools/gestational-diabetes", priority: 29, isPremium: true },
  { id: "preeclampsia-risk", titleKey: "tools.preeclampsiaRisk.title", descriptionKey: "tools.preeclampsiaRisk.description", icon: Heart, categoryKey: "categories.riskAssessment", href: "/tools/preeclampsia-risk", priority: 30, isPremium: true },
  { id: "blood-type", titleKey: "tools.bloodType.title", descriptionKey: "tools.bloodType.description", icon: Droplet, categoryKey: "categories.riskAssessment", href: "/tools/blood-type", priority: 31, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 8: BIRTH PREPARATION (Third Trimester)
  // ═══════════════════════════════════════════════════════════════
  { id: "contraction-timer", titleKey: "tools.contractionTimer.title", descriptionKey: "tools.contractionTimer.description", icon: Timer, categoryKey: "categories.labor", href: "/tools/contraction-timer", priority: 32 },
  { id: "hospital-bag", titleKey: "tools.hospitalBag.title", descriptionKey: "tools.hospitalBag.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/hospital-bag", priority: 33, isPremium: true },
  { id: "birth-plan", titleKey: "tools.birthPlan.title", descriptionKey: "tools.birthPlan.description", icon: FileText, categoryKey: "categories.preparation", href: "/tools/birth-plan", priority: 34, isPremium: true },
  { id: "nursery-checklist", titleKey: "tools.nurseryChecklist.title", descriptionKey: "tools.nurseryChecklist.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/nursery-checklist", priority: 35, isPremium: true },
  { id: "baby-budget", titleKey: "tools.babyBudget.title", descriptionKey: "tools.babyBudget.description", icon: Calculator, categoryKey: "categories.preparation", href: "/tools/baby-budget", priority: 36, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 9: POSTPARTUM & BABY CARE
  // ═══════════════════════════════════════════════════════════════
  { id: "breastfeeding-tracker", titleKey: "tools.breastfeedingTracker.title", descriptionKey: "tools.breastfeedingTracker.description", icon: CircleDot, categoryKey: "categories.postpartum", href: "/tools/breastfeeding-tracker", priority: 37, isPremium: true },
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 38, isPremium: true },
  { id: "diaper-tracker", titleKey: "tools.diaperTracker.title", descriptionKey: "tools.diaperTracker.description", icon: Droplet, categoryKey: "categories.postpartum", href: "/tools/diaper-tracker", priority: 39, isPremium: true },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 40, isPremium: true },
  { id: "vaccination-schedule", titleKey: "tools.vaccinationSchedule.title", descriptionKey: "tools.vaccinationSchedule.description", icon: Syringe, categoryKey: "categories.postpartum", href: "/tools/vaccination-schedule", priority: 41, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL: DOCTOR & SUPPORT
  // ═══════════════════════════════════════════════════════════════
  { id: "doctor-questions", titleKey: "tools.doctorQuestions.title", descriptionKey: "tools.doctorQuestions.description", icon: MessageCircle, categoryKey: "categories.support", href: "/tools/doctor-questions", priority: 42, isPremium: true },
];

// Simplified categories organized by journey stage
export const categoryKeys = [
  "categories.all",
  "categories.ai",
  "categories.fertility",
  "categories.pregnancy",
  "categories.wellness",
  "categories.mentalHealth",
  "categories.riskAssessment",
  "categories.preparation",
  "categories.labor",
  "categories.postpartum",
  "categories.support",
];

export const getSortedTools = () => {
  return [...toolsData].sort((a, b) => a.priority - b.priority);
};

export const getFreeTools = () => toolsData.filter(t => !t.isPremium);
export const getPremiumTools = () => toolsData.filter(t => t.isPremium);
export const getToolsByCategory = (categoryKey: string) => 
  toolsData.filter(t => t.categoryKey === categoryKey);
