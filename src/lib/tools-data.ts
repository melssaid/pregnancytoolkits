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
  GlassWater,
  Dumbbell,
  CheckSquare,
  LucideIcon,
  Scale,
  BookOpen,
  Ban,
  Moon,
  Sparkles,
  Wind,
  Flower2,
  Ruler,
  Stethoscope,
  Camera,
  MessageCircle,
  Star,
  FileText,
  HeartPulse,
  Footprints,
  Milestone,
  Utensils,
  ShoppingCart,
  Users,
  Bell,
  Lightbulb,
  Salad,
  Bed,
  Briefcase,
  HeartHandshake,
  PersonStanding,
  Palette,
  CircleDot,
  Leaf,
  Wallet,
  Home,
  Milk,
} from "lucide-react";

export interface Tool {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  categoryKey: string;
  href: string;
  priority: number;
  hasAI?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFESSIONAL PREGNANCY TOOLS - 35 CURATED AI-POWERED TOOLS
// Optimized for Google Play compliance with AI integration
// Duplicate tools consolidated for better UX
// ═══════════════════════════════════════════════════════════════════════════

export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🤖 AI-POWERED CORE TOOLS (Priority 1-20) - Main AI Features
  // ═══════════════════════════════════════════════════════════════
  { id: "pregnancy-assistant", titleKey: "tools.pregnancyAssistant.title", descriptionKey: "tools.pregnancyAssistant.description", icon: MessageCircle, categoryKey: "categories.ai", href: "/tools/pregnancy-assistant", priority: 1, hasAI: true },
  { id: "symptom-analyzer", titleKey: "tools.symptomAnalyzer.title", descriptionKey: "tools.symptomAnalyzer.description", icon: Stethoscope, categoryKey: "categories.ai", href: "/tools/symptom-analyzer", priority: 2, hasAI: true },
  { id: "ai-meal-suggestion", titleKey: "tools.aiMealSuggestion.title", descriptionKey: "tools.aiMealSuggestion.description", icon: Utensils, categoryKey: "categories.ai", href: "/tools/ai-meal-suggestion", priority: 3, hasAI: true },
  { id: "weekly-summary", titleKey: "tools.weeklySummary.title", descriptionKey: "tools.weeklySummary.description", icon: Star, categoryKey: "categories.ai", href: "/tools/weekly-summary", priority: 4, hasAI: true },
  { id: "ai-pregnancy-journal", titleKey: "tools.aiPregnancyJournal.title", descriptionKey: "tools.aiPregnancyJournal.description", icon: BookOpen, categoryKey: "categories.ai", href: "/tools/ai-pregnancy-journal", priority: 5, hasAI: true },
  { id: "smart-appointment-reminder", titleKey: "tools.smartAppointmentReminder.title", descriptionKey: "tools.smartAppointmentReminder.description", icon: Bell, categoryKey: "categories.ai", href: "/tools/smart-appointment-reminder", priority: 6, hasAI: true },
  { id: "ai-baby-name-finder", titleKey: "tools.aiBabyNameFinder.title", descriptionKey: "tools.aiBabyNameFinder.description", icon: Sparkles, categoryKey: "categories.ai", href: "/tools/ai-baby-name-finder", priority: 7, hasAI: true },
  { id: "ai-pregnancy-tips", titleKey: "tools.aiPregnancyTips.title", descriptionKey: "tools.aiPregnancyTips.description", icon: Lightbulb, categoryKey: "categories.ai", href: "/tools/ai-pregnancy-tips", priority: 8, hasAI: true },
  { id: "ai-birth-story", titleKey: "tools.aiBirthStory.title", descriptionKey: "tools.aiBirthStory.description", icon: FileText, categoryKey: "categories.ai", href: "/tools/ai-birth-story", priority: 9, hasAI: true },
  { id: "smart-grocery-list", titleKey: "tools.smartGroceryList.title", descriptionKey: "tools.smartGroceryList.description", icon: ShoppingCart, categoryKey: "categories.ai", href: "/tools/smart-grocery-list", priority: 10, hasAI: true },
  
  // 🆕 10 NEW AI TOOLS FOR 2026
  { id: "ai-sleep-optimizer", titleKey: "tools.aiSleepOptimizer.title", descriptionKey: "tools.aiSleepOptimizer.description", icon: Bed, categoryKey: "categories.ai", href: "/tools/ai-sleep-optimizer", priority: 11, hasAI: true },
  { id: "ai-hospital-bag", titleKey: "tools.aiHospitalBag.title", descriptionKey: "tools.aiHospitalBag.description", icon: Briefcase, categoryKey: "categories.ai", href: "/tools/ai-hospital-bag", priority: 12, hasAI: true },
  { id: "ai-partner-guide", titleKey: "tools.aiPartnerGuide.title", descriptionKey: "tools.aiPartnerGuide.description", icon: HeartHandshake, categoryKey: "categories.ai", href: "/tools/ai-partner-guide", priority: 13, hasAI: true },
  { id: "ai-birth-position", titleKey: "tools.aiBirthPosition.title", descriptionKey: "tools.aiBirthPosition.description", icon: PersonStanding, categoryKey: "categories.ai", href: "/tools/ai-birth-position", priority: 14, hasAI: true },
  { id: "ai-pregnancy-skincare", titleKey: "tools.aiPregnancySkincare.title", descriptionKey: "tools.aiPregnancySkincare.description", icon: Palette, categoryKey: "categories.ai", href: "/tools/ai-pregnancy-skincare", priority: 15, hasAI: true },
  { id: "ai-pelvic-floor", titleKey: "tools.aiPelvicFloor.title", descriptionKey: "tools.aiPelvicFloor.description", icon: CircleDot, categoryKey: "categories.ai", href: "/tools/ai-pelvic-floor", priority: 16, hasAI: true },
  { id: "ai-nausea-relief", titleKey: "tools.aiNauseaRelief.title", descriptionKey: "tools.aiNauseaRelief.description", icon: Leaf, categoryKey: "categories.ai", href: "/tools/ai-nausea-relief", priority: 17, hasAI: true },
  { id: "ai-budget-planner", titleKey: "tools.aiBudgetPlanner.title", descriptionKey: "tools.aiBudgetPlanner.description", icon: Wallet, categoryKey: "categories.ai", href: "/tools/ai-budget-planner", priority: 18, hasAI: true },
  { id: "ai-baby-room", titleKey: "tools.aiBabyRoom.title", descriptionKey: "tools.aiBabyRoom.description", icon: Home, categoryKey: "categories.ai", href: "/tools/ai-baby-room", priority: 19, hasAI: true },
  { id: "ai-lactation-prep", titleKey: "tools.aiLactationPrep.title", descriptionKey: "tools.aiLactationPrep.description", icon: Milk, categoryKey: "categories.ai", href: "/tools/ai-lactation-prep", priority: 20, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 💪 AI WELLNESS & FITNESS TOOLS (Priority 21-26)
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-posture-coach", titleKey: "tools.aiPostureCoach.title", descriptionKey: "tools.aiPostureCoach.description", icon: Users, categoryKey: "categories.wellness", href: "/tools/ai-posture-coach", priority: 21, hasAI: true },
  { id: "smart-stretch-reminder", titleKey: "tools.smartStretchReminder.title", descriptionKey: "tools.smartStretchReminder.description", icon: Activity, categoryKey: "categories.wellness", href: "/tools/smart-stretch-reminder", priority: 22, hasAI: true },
  { id: "ai-back-pain-relief", titleKey: "tools.aiBackPainRelief.title", descriptionKey: "tools.aiBackPainRelief.description", icon: HeartPulse, categoryKey: "categories.wellness", href: "/tools/ai-back-pain-relief", priority: 23, hasAI: true },
  { id: "ai-mobility-coach", titleKey: "tools.aiMobilityCoach.title", descriptionKey: "tools.aiMobilityCoach.description", icon: Footprints, categoryKey: "categories.wellness", href: "/tools/ai-mobility-coach", priority: 24, hasAI: true },
  { id: "pregnancy-smoothie-ai", titleKey: "tools.pregnancySmoothieAI.title", descriptionKey: "tools.pregnancySmoothieAI.description", icon: Salad, categoryKey: "categories.wellness", href: "/tools/pregnancy-smoothie-ai", priority: 25, hasAI: true },
  { id: "exercise-guide", titleKey: "tools.exerciseGuide.title", descriptionKey: "tools.exerciseGuide.description", icon: Dumbbell, categoryKey: "categories.wellness", href: "/tools/exercise-guide", priority: 26, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 🏥 AI LABOR & MONITORING (Priority 27-29)
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-labor-progress", titleKey: "tools.aiLaborProgress.title", descriptionKey: "tools.aiLaborProgress.description", icon: Activity, categoryKey: "categories.labor", href: "/tools/labor-progress", priority: 27, hasAI: true },
  { id: "contraction-timer", titleKey: "tools.contractionTimer.title", descriptionKey: "tools.contractionTimer.description", icon: Timer, categoryKey: "categories.labor", href: "/tools/contraction-timer", priority: 28, hasAI: true },
  { id: "labor-breathing", titleKey: "tools.laborBreathing.title", descriptionKey: "tools.laborBreathing.description", icon: Wind, categoryKey: "categories.labor", href: "/tools/labor-breathing", priority: 29 },

  // ═══════════════════════════════════════════════════════════════
  // 🔄 FERTILITY & PLANNING (Priority 30-32)
  // ═══════════════════════════════════════════════════════════════
  { id: "ovulation-calculator", titleKey: "tools.ovulationCalculator.title", descriptionKey: "tools.ovulationCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/ovulation-calculator", priority: 30 },
  { id: "cycle-tracker", titleKey: "tools.cycleTracker.title", descriptionKey: "tools.cycleTracker.description", icon: Activity, categoryKey: "categories.fertility", href: "/tools/cycle-tracker", priority: 31 },
  { id: "due-date-calculator", titleKey: "tools.dueDateCalculator.title", descriptionKey: "tools.dueDateCalculator.description", icon: Baby, categoryKey: "categories.fertility", href: "/tools/due-date-calculator", priority: 32 },

  // ═══════════════════════════════════════════════════════════════
  // 🤰 PREGNANCY TRACKING (Priority 33-38)
  // ═══════════════════════════════════════════════════════════════
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 33, hasAI: true },
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 34, hasAI: true },
  { id: "pregnancy-milestones", titleKey: "tools.pregnancyMilestones.title", descriptionKey: "tools.pregnancyMilestones.description", icon: Milestone, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-milestones", priority: 35 },
  { id: "bump-photos", titleKey: "tools.bumpPhotos.title", descriptionKey: "tools.bumpPhotos.description", icon: Camera, categoryKey: "categories.pregnancy", href: "/tools/bump-photos", priority: 36 },
  { id: "pregnancy-bmi", titleKey: "tools.pregnancyBmi.title", descriptionKey: "tools.pregnancyBmi.description", icon: Calculator, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-bmi", priority: 37 },
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, categoryKey: "categories.pregnancy", href: "/tools/weight-gain", priority: 38, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 🥗 NUTRITION & HYDRATION (Priority 39-42)
  // ═══════════════════════════════════════════════════════════════
  { id: "water-intake", titleKey: "tools.waterIntake.title", descriptionKey: "tools.waterIntake.description", icon: GlassWater, categoryKey: "categories.wellness", href: "/tools/water-intake", priority: 39 },
  { id: "vitamin-tracker", titleKey: "tools.vitaminTracker.title", descriptionKey: "tools.vitaminTracker.description", icon: Pill, categoryKey: "categories.wellness", href: "/tools/vitamin-tracker", priority: 40, hasAI: true },
  { id: "forbidden-foods", titleKey: "tools.forbiddenFoods.title", descriptionKey: "tools.forbiddenFoods.description", icon: Ban, categoryKey: "categories.wellness", href: "/tools/forbidden-foods", priority: 41 },
  { id: "meditation-yoga", titleKey: "tools.meditationYoga.title", descriptionKey: "tools.meditationYoga.description", icon: Flower2, categoryKey: "categories.wellness", href: "/tools/meditation-yoga", priority: 42 },

  // ═══════════════════════════════════════════════════════════════
  // 🧠 MENTAL HEALTH (Priority 43-44)
  // ═══════════════════════════════════════════════════════════════
  { id: "affirmations", titleKey: "tools.affirmations.title", descriptionKey: "tools.affirmations.description", icon: Heart, categoryKey: "categories.mentalHealth", href: "/tools/affirmations", priority: 43 },
  { id: "postpartum-mental-health", titleKey: "tools.postpartumMentalHealth.title", descriptionKey: "tools.postpartumMentalHealth.description", icon: Brain, categoryKey: "categories.mentalHealth", href: "/tools/mental-health-coach", priority: 44, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // ⚠️ HEALTH MONITORING (Priority 45-46)
  // ═══════════════════════════════════════════════════════════════
  { id: "gestational-diabetes", titleKey: "tools.gestationalDiabetes.title", descriptionKey: "tools.gestationalDiabetes.description", icon: AlertTriangle, categoryKey: "categories.riskAssessment", href: "/tools/gestational-diabetes", priority: 45 },
  { id: "blood-type", titleKey: "tools.bloodType.title", descriptionKey: "tools.bloodType.description", icon: Droplet, categoryKey: "categories.riskAssessment", href: "/tools/blood-type", priority: 46 },

  // ═══════════════════════════════════════════════════════════════
  // 📋 PREPARATION (Priority 47)
  // ═══════════════════════════════════════════════════════════════
  { id: "birth-prep", titleKey: "tools.birthPrep.title", descriptionKey: "tools.birthPrep.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/birth-prep", priority: 47 },

  // ═══════════════════════════════════════════════════════════════
  // 👶 POSTPARTUM & BABY (Priority 48-50)
  // ═══════════════════════════════════════════════════════════════
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 48, hasAI: true },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 49 },
  { id: "doctor-questions", titleKey: "tools.doctorQuestions.title", descriptionKey: "tools.doctorQuestions.description", icon: MessageCircle, categoryKey: "categories.postpartum", href: "/tools/doctor-questions", priority: 50, hasAI: true },
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
  "categories.labor",
  "categories.preparation",
  "categories.postpartum",
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const getSortedTools = () => {
  return [...toolsData].sort((a, b) => a.priority - b.priority);
};

export const getAITools = () => toolsData.filter((t) => t.hasAI);
export const getFreeTools = () => toolsData;
export const getPremiumTools = () => [] as Tool[];

export const getToolsByCategory = (categoryKey: string) =>
  toolsData.filter((t) => t.categoryKey === categoryKey);

export const getToolsCountByCategory = (categoryKey: string) =>
  getToolsByCategory(categoryKey).length;

export const getTotalToolsCount = () => toolsData.length;

export const getRelatedTools = (currentToolId: string, maxItems = 3): Tool[] => {
  const relationships: Record<string, string[]> = {
    // AI Core Tools
    "pregnancy-assistant": ["symptom-analyzer", "weekly-summary", "ai-meal-suggestion"],
    "symptom-analyzer": ["pregnancy-assistant", "doctor-questions", "gestational-diabetes"],
    "ai-meal-suggestion": ["forbidden-foods", "smart-grocery-list", "vitamin-tracker"],
    "weekly-summary": ["fetal-growth", "pregnancy-milestones", "pregnancy-assistant"],
    "ai-pregnancy-journal": ["bump-photos", "pregnancy-milestones", "affirmations"],
    "smart-appointment-reminder": ["doctor-questions", "pregnancy-milestones", "weekly-summary"],
    "ai-baby-name-finder": ["due-date-calculator", "ai-birth-story", "baby-growth"],
    "ai-pregnancy-tips": ["weekly-summary", "pregnancy-assistant", "symptom-analyzer"],
    "ai-birth-story": ["labor-breathing", "birth-prep", "contraction-timer"],
    "smart-grocery-list": ["ai-meal-suggestion", "forbidden-foods", "vitamin-tracker"],
    
    // 🆕 10 NEW AI TOOLS 2026
    "ai-sleep-optimizer": ["meditation-yoga", "ai-back-pain-relief", "affirmations"],
    "ai-hospital-bag": ["birth-prep", "ai-birth-story", "ai-labor-progress"],
    "ai-partner-guide": ["ai-pregnancy-tips", "pregnancy-assistant", "affirmations"],
    "ai-birth-position": ["ai-labor-progress", "labor-breathing", "exercise-guide"],
    "ai-pregnancy-skincare": ["ai-pregnancy-tips", "vitamin-tracker", "water-intake"],
    "ai-pelvic-floor": ["exercise-guide", "ai-posture-coach", "labor-breathing"],
    "ai-nausea-relief": ["symptom-analyzer", "ai-meal-suggestion", "water-intake"],
    "ai-budget-planner": ["ai-hospital-bag", "smart-grocery-list", "birth-prep"],
    "ai-baby-room": ["ai-baby-name-finder", "birth-prep", "ai-hospital-bag"],
    "ai-lactation-prep": ["baby-growth", "postpartum-mental-health", "ai-pregnancy-tips"],
    
    // AI Wellness (consolidated)
    "ai-posture-coach": ["ai-back-pain-relief", "smart-stretch-reminder", "exercise-guide"],
    "smart-stretch-reminder": ["ai-posture-coach", "ai-mobility-coach", "meditation-yoga"],
    "ai-back-pain-relief": ["ai-posture-coach", "smart-stretch-reminder", "meditation-yoga"],
    "ai-mobility-coach": ["exercise-guide", "smart-stretch-reminder", "vitamin-tracker"],
    "pregnancy-smoothie-ai": ["ai-meal-suggestion", "vitamin-tracker", "water-intake"],
    "exercise-guide": ["meditation-yoga", "ai-posture-coach", "ai-mobility-coach"],
    
    // Labor
    "ai-labor-progress": ["contraction-timer", "labor-breathing", "birth-prep"],
    "contraction-timer": ["ai-labor-progress", "labor-breathing", "birth-prep"],
    "labor-breathing": ["contraction-timer", "meditation-yoga", "birth-prep"],
    
    // Fertility
    "ovulation-calculator": ["cycle-tracker", "due-date-calculator", "fetal-growth"],
    "cycle-tracker": ["ovulation-calculator", "due-date-calculator", "pregnancy-milestones"],
    "due-date-calculator": ["fetal-growth", "pregnancy-milestones", "weekly-summary"],
    
    // Pregnancy Tracking
    "fetal-growth": ["kick-counter", "weekly-summary", "pregnancy-milestones"],
    "kick-counter": ["fetal-growth", "weekly-summary", "contraction-timer"],
    "pregnancy-milestones": ["weekly-summary", "bump-photos", "fetal-growth"],
    "bump-photos": ["pregnancy-milestones", "ai-pregnancy-journal", "fetal-growth"],
    "pregnancy-bmi": ["weight-gain", "exercise-guide", "ai-meal-suggestion"],
    "weight-gain": ["pregnancy-bmi", "ai-meal-suggestion", "exercise-guide"],
    
    // Nutrition
    "water-intake": ["vitamin-tracker", "ai-meal-suggestion", "smart-stretch-reminder"],
    "vitamin-tracker": ["water-intake", "ai-meal-suggestion", "pregnancy-smoothie-ai"],
    "forbidden-foods": ["ai-meal-suggestion", "smart-grocery-list", "vitamin-tracker"],
    "meditation-yoga": ["affirmations", "labor-breathing", "smart-stretch-reminder"],
    
    // Mental Health
    "affirmations": ["meditation-yoga", "postpartum-mental-health", "ai-pregnancy-journal"],
    "postpartum-mental-health": ["affirmations", "baby-sleep-tracker", "doctor-questions"],
    
    // Risk Assessment
    "gestational-diabetes": ["symptom-analyzer", "ai-meal-suggestion", "doctor-questions"],
    "blood-type": ["gestational-diabetes", "doctor-questions", "fetal-growth"],
    
    // Preparation
    "birth-prep": ["labor-breathing", "contraction-timer", "ai-labor-progress"],
    
    // Postpartum
    "baby-sleep-tracker": ["baby-growth", "postpartum-mental-health", "doctor-questions"],
    "baby-growth": ["baby-sleep-tracker", "fetal-growth", "doctor-questions"],
    "doctor-questions": ["symptom-analyzer", "pregnancy-assistant", "weekly-summary"],
  };

  const relatedIds = relationships[currentToolId] || [];
  return relatedIds
    .map((id) => toolsData.find((t) => t.id === id))
    .filter((t): t is Tool => t !== undefined)
    .slice(0, maxItems);
};
