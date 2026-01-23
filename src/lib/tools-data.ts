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

export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // FREE TOOLS (5 أدوات مجانية دائماً)
  // ═══════════════════════════════════════════════════════════════
  { id: "due-date-calculator", titleKey: "tools.dueDateCalculator.title", descriptionKey: "tools.dueDateCalculator.description", icon: Baby, categoryKey: "categories.pregnancy", href: "/tools/due-date-calculator", priority: 1 },
  { id: "pregnancy-bmi", titleKey: "tools.pregnancyBmi.title", descriptionKey: "tools.pregnancyBmi.description", icon: Calculator, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-bmi", priority: 2 },
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 3 },
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 4 },
  { id: "contraction-timer", titleKey: "tools.contractionTimer.title", descriptionKey: "tools.contractionTimer.description", icon: Timer, categoryKey: "categories.labor", href: "/tools/contraction-timer", priority: 5 },
  
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TOOLS - الحمل والمتابعة (Pregnancy & Tracking)
  // ═══════════════════════════════════════════════════════════════
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, categoryKey: "categories.pregnancy", href: "/tools/weight-gain", priority: 6, isPremium: true },
  { id: "pregnancy-diary", titleKey: "tools.pregnancyDiary.title", descriptionKey: "tools.pregnancyDiary.description", icon: BookOpen, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-diary", priority: 7, isPremium: true },
  { id: "gender-predictor", titleKey: "tools.genderPredictor.title", descriptionKey: "tools.genderPredictor.description", icon: Sparkles, categoryKey: "categories.pregnancy", href: "/tools/gender-predictor", priority: 8, isPremium: true },
  { id: "baby-names", titleKey: "tools.babyNames.title", descriptionKey: "tools.babyNames.description", icon: Star, categoryKey: "categories.pregnancy", href: "/tools/baby-names", priority: 9, isPremium: true },
  { id: "bump-photos", titleKey: "tools.bumpPhotos.title", descriptionKey: "tools.bumpPhotos.description", icon: Camera, categoryKey: "categories.pregnancy", href: "/tools/bump-photos", priority: 10, isPremium: true },
  { id: "pregnancy-milestones", titleKey: "tools.pregnancyMilestones.title", descriptionKey: "tools.pregnancyMilestones.description", icon: Milestone, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-milestones", priority: 11, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TOOLS - تقييم المخاطر (Risk Assessment)
  // ═══════════════════════════════════════════════════════════════
  { id: "gestational-diabetes", titleKey: "tools.gestationalDiabetes.title", descriptionKey: "tools.gestationalDiabetes.description", icon: AlertTriangle, categoryKey: "categories.riskAssessment", href: "/tools/gestational-diabetes", priority: 12, isPremium: true },
  { id: "preeclampsia-risk", titleKey: "tools.preeclampsiaRisk.title", descriptionKey: "tools.preeclampsiaRisk.description", icon: Heart, categoryKey: "categories.riskAssessment", href: "/tools/preeclampsia-risk", priority: 13, isPremium: true },
  { id: "blood-pressure", titleKey: "tools.bloodPressure.title", descriptionKey: "tools.bloodPressure.description", icon: HeartPulse, categoryKey: "categories.riskAssessment", href: "/tools/blood-pressure", priority: 14, isPremium: true },
  { id: "symptom-checker", titleKey: "tools.symptomChecker.title", descriptionKey: "tools.symptomChecker.description", icon: Stethoscope, categoryKey: "categories.riskAssessment", href: "/tools/symptom-checker", priority: 15, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TOOLS - الصحة والتغذية (Health & Nutrition)
  // ═══════════════════════════════════════════════════════════════
  { id: "nutrition-guide", titleKey: "tools.nutritionGuide.title", descriptionKey: "tools.nutritionGuide.description", icon: Apple, categoryKey: "categories.wellness", href: "/tools/nutrition-guide", priority: 16, isPremium: true },
  { id: "forbidden-foods", titleKey: "tools.forbiddenFoods.title", descriptionKey: "tools.forbiddenFoods.description", icon: Ban, categoryKey: "categories.reference", href: "/tools/forbidden-foods", priority: 17, isPremium: true },
  { id: "water-intake", titleKey: "tools.waterIntake.title", descriptionKey: "tools.waterIntake.description", icon: GlassWater, categoryKey: "categories.wellness", href: "/tools/water-intake", priority: 18, isPremium: true },
  { id: "meal-planner", titleKey: "tools.mealPlanner.title", descriptionKey: "tools.mealPlanner.description", icon: Utensils, categoryKey: "categories.wellness", href: "/tools/meal-planner", priority: 19, isPremium: true },
  { id: "vitamin-tracker", titleKey: "tools.vitaminTracker.title", descriptionKey: "tools.vitaminTracker.description", icon: Pill, categoryKey: "categories.wellness", href: "/tools/vitamin-tracker", priority: 20, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TOOLS - اللياقة والحركة (Fitness & Movement)
  // ═══════════════════════════════════════════════════════════════
  { id: "exercise-guide", titleKey: "tools.exerciseGuide.title", descriptionKey: "tools.exerciseGuide.description", icon: Dumbbell, categoryKey: "categories.wellness", href: "/tools/exercise-guide", priority: 21, isPremium: true },
  { id: "yoga-guide", titleKey: "tools.yogaGuide.title", descriptionKey: "tools.yogaGuide.description", icon: Flower2, categoryKey: "categories.wellness", href: "/tools/yoga-guide", priority: 22, isPremium: true },
  { id: "breathing-exercises", titleKey: "tools.breathingExercises.title", descriptionKey: "tools.breathingExercises.description", icon: Wind, categoryKey: "categories.wellness", href: "/tools/breathing-exercises", priority: 23, isPremium: true },
  { id: "kegel-exercises", titleKey: "tools.kegelExercises.title", descriptionKey: "tools.kegelExercises.description", icon: Activity, categoryKey: "categories.wellness", href: "/tools/kegel-exercises", priority: 24, isPremium: true },
  { id: "sleep-tracker", titleKey: "tools.sleepTracker.title", descriptionKey: "tools.sleepTracker.description", icon: BedDouble, categoryKey: "categories.wellness", href: "/tools/sleep-tracker", priority: 25, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TOOLS - الصحة النفسية (Mental Health)
  // ═══════════════════════════════════════════════════════════════
  { id: "mood-diary", titleKey: "tools.moodDiary.title", descriptionKey: "tools.moodDiary.description", icon: Smile, categoryKey: "categories.mentalHealth", href: "/tools/mood-diary", priority: 26, isPremium: true },
  { id: "ppd-screener", titleKey: "tools.ppdScreener.title", descriptionKey: "tools.ppdScreener.description", icon: Brain, categoryKey: "categories.mentalHealth", href: "/tools/ppd-screener", priority: 27, isPremium: true },
  { id: "affirmations", titleKey: "tools.affirmations.title", descriptionKey: "tools.affirmations.description", icon: Heart, categoryKey: "categories.mentalHealth", href: "/tools/affirmations", priority: 28, isPremium: true },
  { id: "relaxation-sounds", titleKey: "tools.relaxationSounds.title", descriptionKey: "tools.relaxationSounds.description", icon: Music, categoryKey: "categories.mentalHealth", href: "/tools/relaxation-sounds", priority: 29, isPremium: true },
  { id: "gratitude-journal", titleKey: "tools.gratitudeJournal.title", descriptionKey: "tools.gratitudeJournal.description", icon: Lightbulb, categoryKey: "categories.mentalHealth", href: "/tools/gratitude-journal", priority: 30, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TOOLS - التحضير للولادة (Birth Preparation)
  // ═══════════════════════════════════════════════════════════════
  { id: "hospital-bag", titleKey: "tools.hospitalBag.title", descriptionKey: "tools.hospitalBag.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/hospital-bag", priority: 31, isPremium: true },
  { id: "birth-plan", titleKey: "tools.birthPlan.title", descriptionKey: "tools.birthPlan.description", icon: FileText, categoryKey: "categories.preparation", href: "/tools/birth-plan", priority: 32, isPremium: true },
  { id: "nursery-checklist", titleKey: "tools.nurseryChecklist.title", descriptionKey: "tools.nurseryChecklist.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/nursery-checklist", priority: 33, isPremium: true },
  { id: "baby-budget", titleKey: "tools.babyBudget.title", descriptionKey: "tools.babyBudget.description", icon: Calculator, categoryKey: "categories.preparation", href: "/tools/baby-budget", priority: 34, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TOOLS - ما بعد الولادة (Postpartum)
  // ═══════════════════════════════════════════════════════════════
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 35, isPremium: true },
  { id: "diaper-tracker", titleKey: "tools.diaperTracker.title", descriptionKey: "tools.diaperTracker.description", icon: Droplet, categoryKey: "categories.postpartum", href: "/tools/diaper-tracker", priority: 36, isPremium: true },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 37, isPremium: true },
  { id: "breastfeeding-tracker", titleKey: "tools.breastfeedingTracker.title", descriptionKey: "tools.breastfeedingTracker.description", icon: CircleDot, categoryKey: "categories.postpartum", href: "/tools/breastfeeding-tracker", priority: 38, isPremium: true },
  { id: "baby-milestones", titleKey: "tools.babyMilestones.title", descriptionKey: "tools.babyMilestones.description", icon: Footprints, categoryKey: "categories.postpartum", href: "/tools/baby-milestones", priority: 39, isPremium: true },
  { id: "tummy-time", titleKey: "tools.tummyTime.title", descriptionKey: "tools.tummyTime.description", icon: Clock, categoryKey: "categories.postpartum", href: "/tools/tummy-time", priority: 40, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TOOLS - المراجع الطبية (Medical Reference)
  // ═══════════════════════════════════════════════════════════════
  { id: "safe-medications", titleKey: "tools.safeMedications.title", descriptionKey: "tools.safeMedications.description", icon: Pill, categoryKey: "categories.reference", href: "/tools/safe-medications", priority: 41, isPremium: true },
  { id: "vaccination-schedule", titleKey: "tools.vaccinationSchedule.title", descriptionKey: "tools.vaccinationSchedule.description", icon: Syringe, categoryKey: "categories.reference", href: "/tools/vaccination-schedule", priority: 42, isPremium: true },
  { id: "vaccination-guide", titleKey: "tools.vaccinationGuide.title", descriptionKey: "tools.vaccinationGuide.description", icon: Syringe, categoryKey: "categories.reference", href: "/tools/vaccination-guide", priority: 43, isPremium: true },
  { id: "emergency-guide", titleKey: "tools.emergencyGuide.title", descriptionKey: "tools.emergencyGuide.description", icon: AlertTriangle, categoryKey: "categories.reference", href: "/tools/emergency-guide", priority: 44, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TOOLS - الخصوبة والدورة (Fertility & Cycle)
  // ═══════════════════════════════════════════════════════════════
  { id: "ovulation-calculator", titleKey: "tools.ovulationCalculator.title", descriptionKey: "tools.ovulationCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/ovulation-calculator", priority: 45, isPremium: true },
  { id: "conception-calculator", titleKey: "tools.conceptionCalculator.title", descriptionKey: "tools.conceptionCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/conception-calculator", priority: 46, isPremium: true },
  { id: "cycle-tracker", titleKey: "tools.cycleTracker.title", descriptionKey: "tools.cycleTracker.description", icon: Activity, categoryKey: "categories.menstrualHealth", href: "/tools/cycle-tracker", priority: 47, isPremium: true },
  { id: "fertility-diet", titleKey: "tools.fertilityDiet.title", descriptionKey: "tools.fertilityDiet.description", icon: Apple, categoryKey: "categories.fertility", href: "/tools/fertility-diet", priority: 48, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TOOLS - الوراثة (Genetics)
  // ═══════════════════════════════════════════════════════════════
  { id: "blood-type", titleKey: "tools.bloodType.title", descriptionKey: "tools.bloodType.description", icon: Droplet, categoryKey: "categories.genetics", href: "/tools/blood-type", priority: 49, isPremium: true },
  { id: "eye-color-predictor", titleKey: "tools.eyeColorPredictor.title", descriptionKey: "tools.eyeColorPredictor.description", icon: Palette, categoryKey: "categories.genetics", href: "/tools/eye-color-predictor", priority: 50, isPremium: true },
  
  // ═══════════════════════════════════════════════════════════════
  // PREMIUM TOOLS - الدعم والمجتمع (Support & Community)
  // ═══════════════════════════════════════════════════════════════
  { id: "partner-tips", titleKey: "tools.partnerTips.title", descriptionKey: "tools.partnerTips.description", icon: Users, categoryKey: "categories.support", href: "/tools/partner-tips", priority: 51, isPremium: true },
  { id: "doctor-questions", titleKey: "tools.doctorQuestions.title", descriptionKey: "tools.doctorQuestions.description", icon: MessageCircle, categoryKey: "categories.support", href: "/tools/doctor-questions", priority: 52, isPremium: true },
];

export const categoryKeys = [
  "categories.all",
  "categories.pregnancy",
  "categories.riskAssessment",
  "categories.wellness",
  "categories.mentalHealth",
  "categories.preparation",
  "categories.labor",
  "categories.postpartum",
  "categories.reference",
  "categories.fertility",
  "categories.menstrualHealth",
  "categories.genetics",
  "categories.support",
];

export const getSortedTools = () => {
  return [...toolsData].sort((a, b) => a.priority - b.priority);
};

export const getFreeTools = () => toolsData.filter(t => !t.isPremium);
export const getPremiumTools = () => toolsData.filter(t => t.isPremium);
export const getToolsByCategory = (categoryKey: string) => 
  toolsData.filter(t => t.categoryKey === categoryKey);
