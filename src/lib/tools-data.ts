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

// ═══════════════════════════════════════════════════════════════════════════
// PREGNANCY TOOLS - 37 SPECIALIZED TOOLS
// Organized by pregnancy journey stage for logical flow
// All tools are FREE - Premium features will be added later via Google Play
// Duplicate/redundant tools have been consolidated for better UX
// ═══════════════════════════════════════════════════════════════════════════

export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🤖 AI-POWERED TOOLS (8 tools)
  // ═══════════════════════════════════════════════════════════════
  { id: "pregnancy-assistant", titleKey: "tools.pregnancyAssistant.title", descriptionKey: "tools.pregnancyAssistant.description", icon: MessageCircle, categoryKey: "categories.ai", href: "/tools/pregnancy-assistant", priority: 1 },
  { id: "symptom-analyzer", titleKey: "tools.symptomAnalyzer.title", descriptionKey: "tools.symptomAnalyzer.description", icon: Stethoscope, categoryKey: "categories.ai", href: "/tools/symptom-analyzer", priority: 2 },
  { id: "ai-meal-suggestion", titleKey: "tools.aiMealSuggestion.title", descriptionKey: "tools.aiMealSuggestion.description", icon: Utensils, categoryKey: "categories.ai", href: "/tools/ai-meal-suggestion", priority: 3 },
  { id: "weekly-summary", titleKey: "tools.weeklySummary.title", descriptionKey: "tools.weeklySummary.description", icon: Star, categoryKey: "categories.ai", href: "/tools/weekly-summary", priority: 4 },
  { id: "ai-pregnancy-journal", titleKey: "tools.aiPregnancyJournal.title", descriptionKey: "tools.aiPregnancyJournal.description", icon: BookOpen, categoryKey: "categories.ai", href: "/tools/ai-pregnancy-journal", priority: 5 },
  { id: "smart-appointment-reminder", titleKey: "tools.smartAppointmentReminder.title", descriptionKey: "tools.smartAppointmentReminder.description", icon: Calendar, categoryKey: "categories.ai", href: "/tools/smart-appointment-reminder", priority: 6 },
  { id: "ai-birth-story", titleKey: "tools.aiBirthStory.title", descriptionKey: "tools.aiBirthStory.description", icon: FileText, categoryKey: "categories.ai", href: "/tools/ai-birth-story", priority: 7 },
  { id: "pregnancy-photo-timeline", titleKey: "tools.pregnancyPhotoTimeline.title", descriptionKey: "tools.pregnancyPhotoTimeline.description", icon: Camera, categoryKey: "categories.ai", href: "/tools/pregnancy-photo-timeline", priority: 8 },

  // ═══════════════════════════════════════════════════════════════
  // 🔄 FERTILITY & CYCLE TRACKING (3 tools)
  // ═══════════════════════════════════════════════════════════════
  { id: "ovulation-calculator", titleKey: "tools.ovulationCalculator.title", descriptionKey: "tools.ovulationCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/ovulation-calculator", priority: 20 },
  { id: "cycle-tracker", titleKey: "tools.cycleTracker.title", descriptionKey: "tools.cycleTracker.description", icon: Activity, categoryKey: "categories.fertility", href: "/tools/cycle-tracker", priority: 21 },
  { id: "ai-baby-name-finder", titleKey: "tools.aiBabyNameFinder.title", descriptionKey: "tools.aiBabyNameFinder.description", icon: Sparkles, categoryKey: "categories.fertility", href: "/tools/ai-baby-name-finder", priority: 22 },

  // ═══════════════════════════════════════════════════════════════
  // 🤰 PREGNANCY TRACKING (6 tools)
  // ═══════════════════════════════════════════════════════════════
  { id: "due-date-calculator", titleKey: "tools.dueDateCalculator.title", descriptionKey: "tools.dueDateCalculator.description", icon: Baby, categoryKey: "categories.pregnancy", href: "/tools/due-date-calculator", priority: 23 },
  { id: "pregnancy-bmi", titleKey: "tools.pregnancyBmi.title", descriptionKey: "tools.pregnancyBmi.description", icon: Calculator, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-bmi", priority: 24 },
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 25 },
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 26 },
  { id: "bump-photos", titleKey: "tools.bumpPhotos.title", descriptionKey: "tools.bumpPhotos.description", icon: Camera, categoryKey: "categories.pregnancy", href: "/tools/bump-photos", priority: 27 },
  { id: "pregnancy-milestones", titleKey: "tools.pregnancyMilestones.title", descriptionKey: "tools.pregnancyMilestones.description", icon: Milestone, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-milestones", priority: 28 },

  // ═══════════════════════════════════════════════════════════════
  // 💪 WELLNESS & FITNESS (7 tools)
  // NOTE: ConsolidAted AIFitnessCoach + Exercise Guide into one
  // NOTE: Consolidated SmartWalkingCoach + Kegel into wellness category
  // ═══════════════════════════════════════════════════════════════
  { id: "water-intake", titleKey: "tools.waterIntake.title", descriptionKey: "tools.waterIntake.description", icon: GlassWater, categoryKey: "categories.wellness", href: "/tools/water-intake", priority: 30 },
  { id: "vitamin-tracker", titleKey: "tools.vitaminTracker.title", descriptionKey: "tools.vitaminTracker.description", icon: Pill, categoryKey: "categories.wellness", href: "/tools/vitamin-tracker", priority: 31 },
  { id: "nutrition-guide", titleKey: "tools.nutritionGuide.title", descriptionKey: "tools.nutritionGuide.description", icon: Apple, categoryKey: "categories.wellness", href: "/tools/nutrition-guide", priority: 32 },
  { id: "forbidden-foods", titleKey: "tools.forbiddenFoods.title", descriptionKey: "tools.forbiddenFoods.description", icon: Ban, categoryKey: "categories.wellness", href: "/tools/forbidden-foods", priority: 33 },
  { id: "exercise-guide", titleKey: "tools.exerciseGuide.title", descriptionKey: "tools.exerciseGuide.description", icon: Dumbbell, categoryKey: "categories.wellness", href: "/tools/exercise-guide", priority: 34 },
  { id: "meditation-yoga", titleKey: "tools.meditationYoga.title", descriptionKey: "tools.meditationYoga.description", icon: Flower2, categoryKey: "categories.wellness", href: "/tools/meditation-yoga", priority: 35 },
  { id: "ai-posture-coach", titleKey: "tools.aiPostureCoach.title", descriptionKey: "tools.aiPostureCoach.description", icon: Users, categoryKey: "categories.wellness", href: "/tools/ai-posture-coach", priority: 36 },
  { id: "smart-stretch-reminder", titleKey: "tools.smartStretchReminder.title", descriptionKey: "tools.smartStretchReminder.description", icon: Activity, categoryKey: "categories.wellness", href: "/tools/smart-stretch-reminder", priority: 37 },
  { id: "ai-back-pain-relief", titleKey: "tools.aiBackPainRelief.title", descriptionKey: "tools.aiBackPainRelief.description", icon: HeartPulse, categoryKey: "categories.wellness", href: "/tools/ai-back-pain-relief", priority: 38 },
  { id: "pregnancy-massage-guide", titleKey: "tools.pregnancyMassageGuide.title", descriptionKey: "tools.pregnancyMassageGuide.description", icon: Hand, categoryKey: "categories.wellness", href: "/tools/pregnancy-massage-guide", priority: 39 },
  { id: "ai-leg-cramp-preventer", titleKey: "tools.aiLegCrampPreventer.title", descriptionKey: "tools.aiLegCrampPreventer.description", icon: Footprints, categoryKey: "categories.wellness", href: "/tools/ai-leg-cramp-preventer", priority: 40 },
  { id: "smart-walking-coach", titleKey: "tools.smartWalkingCoach.title", descriptionKey: "tools.smartWalkingCoach.description", icon: Footprints, categoryKey: "categories.wellness", href: "/tools/smart-walking-coach", priority: 41 },
  { id: "ai-craving-alternatives", titleKey: "tools.aiCravingAlternatives.title", descriptionKey: "tools.aiCravingAlternatives.description", icon: Apple, categoryKey: "categories.wellness", href: "/tools/ai-craving-alternatives", priority: 42 },
  { id: "workout-planner", titleKey: "tools.workoutPlanner.title", descriptionKey: "tools.workoutPlanner.description", icon: Dumbbell, categoryKey: "categories.wellness", href: "/tools/workout-planner", priority: 43 },

  // ═══════════════════════════════════════════════════════════════
  // 🧠 MENTAL HEALTH (4 tools)
  // ═══════════════════════════════════════════════════════════════
  { id: "affirmations", titleKey: "tools.affirmations.title", descriptionKey: "tools.affirmations.description", icon: Heart, categoryKey: "categories.mentalHealth", href: "/tools/affirmations", priority: 50 },
  { id: "mood-tracker", titleKey: "tools.moodTracker.title", descriptionKey: "tools.moodTracker.description", icon: Smile, categoryKey: "categories.mentalHealth", href: "/tools/mood-tracker", priority: 51 },
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, categoryKey: "categories.mentalHealth", href: "/tools/weight-gain", priority: 52 },
  { id: "postpartum-mental-health", titleKey: "tools.postpartumMentalHealth.title", descriptionKey: "tools.postpartumMentalHealth.description", icon: Heart, categoryKey: "categories.mentalHealth", href: "/tools/mental-health-coach", priority: 53 },

  // ═══════════════════════════════════════════════════════════════
  // ⚠️ RISK ASSESSMENT (3 tools)
  // ═══════════════════════════════════════════════════════════════
  { id: "gestational-diabetes", titleKey: "tools.gestationalDiabetes.title", descriptionKey: "tools.gestationalDiabetes.description", icon: AlertTriangle, categoryKey: "categories.riskAssessment", href: "/tools/gestational-diabetes", priority: 60 },
  { id: "preeclampsia-risk", titleKey: "tools.preeclampsiaRisk.title", descriptionKey: "tools.preeclampsiaRisk.description", icon: Heart, categoryKey: "categories.riskAssessment", href: "/tools/preeclampsia-risk", priority: 61 },
  { id: "blood-type", titleKey: "tools.bloodType.title", descriptionKey: "tools.bloodType.description", icon: Droplet, categoryKey: "categories.riskAssessment", href: "/tools/blood-type", priority: 62 },

  // ═══════════════════════════════════════════════════════════════
  // 🏥 LABOR & PREPARATION (4 tools)
  // ═══════════════════════════════════════════════════════════════
  { id: "contraction-timer", titleKey: "tools.contractionTimer.title", descriptionKey: "tools.contractionTimer.description", icon: Timer, categoryKey: "categories.labor", href: "/tools/contraction-timer", priority: 70 },
  { id: "labor-breathing", titleKey: "tools.laborBreathing.title", descriptionKey: "tools.laborBreathing.description", icon: Wind, categoryKey: "categories.labor", href: "/tools/labor-breathing", priority: 71 },
  { id: "birth-prep", titleKey: "tools.birthPrep.title", descriptionKey: "tools.birthPrep.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/birth-prep", priority: 72 },
  { id: "labor-progress", titleKey: "tools.aiLaborProgress.title", descriptionKey: "tools.aiLaborProgress.description", icon: Activity, categoryKey: "categories.labor", href: "/tools/labor-progress", priority: 73 },

  // ═══════════════════════════════════════════════════════════════
  // 👶 POSTPARTUM & BABY CARE (5 tools)
  // ═══════════════════════════════════════════════════════════════
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 80 },
  { id: "diaper-tracker", titleKey: "tools.diaperTracker.title", descriptionKey: "tools.diaperTracker.description", icon: Droplet, categoryKey: "categories.postpartum", href: "/tools/diaper-tracker", priority: 81 },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 82 },
  { id: "doctor-questions", titleKey: "tools.doctorQuestions.title", descriptionKey: "tools.doctorQuestions.description", icon: MessageCircle, categoryKey: "categories.postpartum", href: "/tools/doctor-questions", priority: 83 },
  { id: "baby-gear", titleKey: "tools.babyGearRecommender.title", descriptionKey: "tools.babyGearRecommender.description", icon: CheckSquare, categoryKey: "categories.postpartum", href: "/tools/baby-gear", priority: 84 },
];

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

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
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const getSortedTools = () => {
  return [...toolsData].sort((a, b) => a.priority - b.priority);
};

// All tools are free now
export const getFreeTools = () => toolsData;
export const getPremiumTools = () => [] as Tool[];
export const getToolsByCategory = (categoryKey: string) =>
  toolsData.filter((t) => t.categoryKey === categoryKey);

// Get tools count by category
export const getToolsCountByCategory = (categoryKey: string) =>
  getToolsByCategory(categoryKey).length;

// Get all tools count
export const getTotalToolsCount = () => toolsData.length;
