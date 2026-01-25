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
}

// Tools organized by pregnancy journey stage for logical flow
// All tools are now FREE - Premium features will be added later via Google Play Billing
// Old redundant tools have been removed and replaced with smarter versions
export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🤖 AI-POWERED TOOLS (Featured)
  // ═══════════════════════════════════════════════════════════════
  { id: "pregnancy-assistant", titleKey: "tools.pregnancyAssistant.title", descriptionKey: "tools.pregnancyAssistant.description", icon: MessageCircle, categoryKey: "categories.ai", href: "/tools/pregnancy-assistant", priority: 1 },
  { id: "symptom-analyzer", titleKey: "tools.symptomAnalyzer.title", descriptionKey: "tools.symptomAnalyzer.description", icon: Stethoscope, categoryKey: "categories.ai", href: "/tools/symptom-analyzer", priority: 2 },
  { id: "ai-meal-suggestion", titleKey: "tools.aiMealSuggestion.title", descriptionKey: "tools.aiMealSuggestion.description", icon: Utensils, categoryKey: "categories.ai", href: "/tools/ai-meal-suggestion", priority: 3 },
  { id: "weekly-summary", titleKey: "tools.weeklySummary.title", descriptionKey: "tools.weeklySummary.description", icon: Star, categoryKey: "categories.ai", href: "/tools/weekly-summary", priority: 4 },

  // ═══════════════════════════════════════════════════════════════
  // STAGE 1: PRE-PREGNANCY & FERTILITY (Trying to Conceive)
  // ═══════════════════════════════════════════════════════════════
  { id: "ovulation-calculator", titleKey: "tools.ovulationCalculator.title", descriptionKey: "tools.ovulationCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/ovulation-calculator", priority: 5 },
  { id: "cycle-tracker", titleKey: "tools.cycleTracker.title", descriptionKey: "tools.cycleTracker.description", icon: Activity, categoryKey: "categories.fertility", href: "/tools/cycle-tracker", priority: 6 },
  { id: "conception-calculator", titleKey: "tools.conceptionCalculator.title", descriptionKey: "tools.conceptionCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/conception-calculator", priority: 7 },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 2: EARLY PREGNANCY (Finding Out & First Steps)
  // ═══════════════════════════════════════════════════════════════
  { id: "due-date-calculator", titleKey: "tools.dueDateCalculator.title", descriptionKey: "tools.dueDateCalculator.description", icon: Baby, categoryKey: "categories.pregnancy", href: "/tools/due-date-calculator", priority: 8 },
  { id: "pregnancy-bmi", titleKey: "tools.pregnancyBmi.title", descriptionKey: "tools.pregnancyBmi.description", icon: Calculator, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-bmi", priority: 9 },
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 10 },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 3: ONGOING PREGNANCY (Daily Tracking & Health)
  // ═══════════════════════════════════════════════════════════════
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 11 },
  { id: "water-intake", titleKey: "tools.waterIntake.title", descriptionKey: "tools.waterIntake.description", icon: GlassWater, categoryKey: "categories.wellness", href: "/tools/water-intake", priority: 12 },
  { id: "vitamin-tracker", titleKey: "tools.vitaminTracker.title", descriptionKey: "tools.vitaminTracker.description", icon: Pill, categoryKey: "categories.wellness", href: "/tools/vitamin-tracker", priority: 13 },
  { id: "bump-photos", titleKey: "tools.bumpPhotos.title", descriptionKey: "tools.bumpPhotos.description", icon: Camera, categoryKey: "categories.pregnancy", href: "/tools/bump-photos", priority: 14 },
  { id: "pregnancy-milestones", titleKey: "tools.pregnancyMilestones.title", descriptionKey: "tools.pregnancyMilestones.description", icon: Milestone, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-milestones", priority: 15 },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 4: HEALTH & NUTRITION
  // ═══════════════════════════════════════════════════════════════
  { id: "nutrition-guide", titleKey: "tools.nutritionGuide.title", descriptionKey: "tools.nutritionGuide.description", icon: Apple, categoryKey: "categories.wellness", href: "/tools/nutrition-guide", priority: 16 },
  { id: "forbidden-foods", titleKey: "tools.forbiddenFoods.title", descriptionKey: "tools.forbiddenFoods.description", icon: Ban, categoryKey: "categories.wellness", href: "/tools/forbidden-foods", priority: 17 },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 5: FITNESS & WELLNESS
  // ═══════════════════════════════════════════════════════════════
  { id: "exercise-guide", titleKey: "tools.exerciseGuide.title", descriptionKey: "tools.exerciseGuide.description", icon: Dumbbell, categoryKey: "categories.wellness", href: "/tools/exercise-guide", priority: 18 },
  { id: "kegel-exercises", titleKey: "tools.kegelExercises.title", descriptionKey: "tools.kegelExercises.description", icon: Activity, categoryKey: "categories.wellness", href: "/tools/kegel-exercises", priority: 19 },
  { id: "meditation-yoga", titleKey: "tools.meditationYoga.title", descriptionKey: "tools.meditationYoga.description", icon: Flower2, categoryKey: "categories.wellness", href: "/tools/meditation-yoga", priority: 20 },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 6: MENTAL HEALTH & WELLBEING
  // ═══════════════════════════════════════════════════════════════
  { id: "affirmations", titleKey: "tools.affirmations.title", descriptionKey: "tools.affirmations.description", icon: Heart, categoryKey: "categories.mentalHealth", href: "/tools/affirmations", priority: 20 },
  { id: "mood-tracker", titleKey: "tools.moodTracker.title", descriptionKey: "tools.moodTracker.description", icon: Smile, categoryKey: "categories.mentalHealth", href: "/tools/mood-tracker", priority: 21 },
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, categoryKey: "categories.wellness", href: "/tools/weight-gain", priority: 22 },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 7: RISK ASSESSMENT (Educational - Not Diagnostic)
  // ═══════════════════════════════════════════════════════════════
  { id: "gestational-diabetes", titleKey: "tools.gestationalDiabetes.title", descriptionKey: "tools.gestationalDiabetes.description", icon: AlertTriangle, categoryKey: "categories.riskAssessment", href: "/tools/gestational-diabetes", priority: 21 },
  { id: "preeclampsia-risk", titleKey: "tools.preeclampsiaRisk.title", descriptionKey: "tools.preeclampsiaRisk.description", icon: Heart, categoryKey: "categories.riskAssessment", href: "/tools/preeclampsia-risk", priority: 22 },
  { id: "blood-type", titleKey: "tools.bloodType.title", descriptionKey: "tools.bloodType.description", icon: Droplet, categoryKey: "categories.riskAssessment", href: "/tools/blood-type", priority: 23 },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 8: BIRTH PREPARATION (Third Trimester)
  // ═══════════════════════════════════════════════════════════════
  { id: "contraction-timer", titleKey: "tools.contractionTimer.title", descriptionKey: "tools.contractionTimer.description", icon: Timer, categoryKey: "categories.labor", href: "/tools/contraction-timer", priority: 24 },
  { id: "labor-breathing", titleKey: "tools.laborBreathing.title", descriptionKey: "tools.laborBreathing.description", icon: Wind, categoryKey: "categories.labor", href: "/tools/labor-breathing", priority: 25 },
  { id: "birth-prep", titleKey: "tools.birthPrep.title", descriptionKey: "tools.birthPrep.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/birth-prep", priority: 26 },
  
  // ═══════════════════════════════════════════════════════════════
  // STAGE 9: POSTPARTUM & BABY CARE
  // ═══════════════════════════════════════════════════════════════
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 25 },
  { id: "diaper-tracker", titleKey: "tools.diaperTracker.title", descriptionKey: "tools.diaperTracker.description", icon: Droplet, categoryKey: "categories.postpartum", href: "/tools/diaper-tracker", priority: 26 },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 27 },
  
  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL: DOCTOR & SUPPORT
  // ═══════════════════════════════════════════════════════════════
  { id: "doctor-questions", titleKey: "tools.doctorQuestions.title", descriptionKey: "tools.doctorQuestions.description", icon: MessageCircle, categoryKey: "categories.support", href: "/tools/doctor-questions", priority: 28 },
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

// All tools are free now
export const getFreeTools = () => toolsData;
export const getPremiumTools = () => [] as Tool[];
export const getToolsByCategory = (categoryKey: string) => 
  toolsData.filter(t => t.categoryKey === categoryKey);
