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
  Apple,
  Ban,
  Moon,
  Sparkles,
  Wind,
  Smile,
  Flower2,
  Ruler,
  Stethoscope,
  Clock,
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
  Zap,
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
// PROFESSIONAL PREGNANCY TOOLS - 37 CURATED AI-POWERED TOOLS
// Optimized for Google Play compliance with AI integration
// Sorted by AI priority for professional user experience
// ═══════════════════════════════════════════════════════════════════════════

export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🤖 AI-POWERED CORE TOOLS (Priority 1-10) - Main AI Features
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

  // ═══════════════════════════════════════════════════════════════
  // 💪 AI WELLNESS & FITNESS TOOLS (Priority 11-17)
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-posture-coach", titleKey: "tools.aiPostureCoach.title", descriptionKey: "tools.aiPostureCoach.description", icon: Users, categoryKey: "categories.wellness", href: "/tools/ai-posture-coach", priority: 11, hasAI: true },
  { id: "smart-stretch-reminder", titleKey: "tools.smartStretchReminder.title", descriptionKey: "tools.smartStretchReminder.description", icon: Activity, categoryKey: "categories.wellness", href: "/tools/smart-stretch-reminder", priority: 12, hasAI: true },
  { id: "ai-back-pain-relief", titleKey: "tools.aiBackPainRelief.title", descriptionKey: "tools.aiBackPainRelief.description", icon: HeartPulse, categoryKey: "categories.wellness", href: "/tools/ai-back-pain-relief", priority: 13, hasAI: true },
  { id: "ai-leg-cramp-preventer", titleKey: "tools.aiLegCrampPreventer.title", descriptionKey: "tools.aiLegCrampPreventer.description", icon: Footprints, categoryKey: "categories.wellness", href: "/tools/ai-leg-cramp-preventer", priority: 14, hasAI: true },
  { id: "smart-walking-coach", titleKey: "tools.smartWalkingCoach.title", descriptionKey: "tools.smartWalkingCoach.description", icon: Footprints, categoryKey: "categories.wellness", href: "/tools/smart-walking-coach", priority: 15, hasAI: true },
  { id: "pregnancy-smoothie-ai", titleKey: "tools.pregnancySmoothieAI.title", descriptionKey: "tools.pregnancySmoothieAI.description", icon: Salad, categoryKey: "categories.wellness", href: "/tools/pregnancy-smoothie-ai", priority: 16, hasAI: true },
  { id: "exercise-guide", titleKey: "tools.exerciseGuide.title", descriptionKey: "tools.exerciseGuide.description", icon: Dumbbell, categoryKey: "categories.wellness", href: "/tools/exercise-guide", priority: 17, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 🏥 AI LABOR & MONITORING (Priority 18-20)
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-labor-progress", titleKey: "tools.aiLaborProgress.title", descriptionKey: "tools.aiLaborProgress.description", icon: Activity, categoryKey: "categories.labor", href: "/tools/labor-progress", priority: 18, hasAI: true },
  { id: "contraction-timer", titleKey: "tools.contractionTimer.title", descriptionKey: "tools.contractionTimer.description", icon: Timer, categoryKey: "categories.labor", href: "/tools/contraction-timer", priority: 19, hasAI: true },
  { id: "labor-breathing", titleKey: "tools.laborBreathing.title", descriptionKey: "tools.laborBreathing.description", icon: Wind, categoryKey: "categories.labor", href: "/tools/labor-breathing", priority: 20 },

  // ═══════════════════════════════════════════════════════════════
  // 🔄 FERTILITY & PLANNING (Priority 21-23)
  // ═══════════════════════════════════════════════════════════════
  { id: "ovulation-calculator", titleKey: "tools.ovulationCalculator.title", descriptionKey: "tools.ovulationCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/ovulation-calculator", priority: 21 },
  { id: "cycle-tracker", titleKey: "tools.cycleTracker.title", descriptionKey: "tools.cycleTracker.description", icon: Activity, categoryKey: "categories.fertility", href: "/tools/cycle-tracker", priority: 22 },
  { id: "due-date-calculator", titleKey: "tools.dueDateCalculator.title", descriptionKey: "tools.dueDateCalculator.description", icon: Baby, categoryKey: "categories.fertility", href: "/tools/due-date-calculator", priority: 23 },

  // ═══════════════════════════════════════════════════════════════
  // 🤰 PREGNANCY TRACKING (Priority 24-28)
  // ═══════════════════════════════════════════════════════════════
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 24, hasAI: true },
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 25, hasAI: true },
  { id: "pregnancy-milestones", titleKey: "tools.pregnancyMilestones.title", descriptionKey: "tools.pregnancyMilestones.description", icon: Milestone, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-milestones", priority: 26 },
  { id: "bump-photos", titleKey: "tools.bumpPhotos.title", descriptionKey: "tools.bumpPhotos.description", icon: Camera, categoryKey: "categories.pregnancy", href: "/tools/bump-photos", priority: 27 },
  { id: "pregnancy-bmi", titleKey: "tools.pregnancyBmi.title", descriptionKey: "tools.pregnancyBmi.description", icon: Calculator, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-bmi", priority: 28 },

  // ═══════════════════════════════════════════════════════════════
  // 🥗 NUTRITION & HYDRATION (Priority 29-32)
  // ═══════════════════════════════════════════════════════════════
  { id: "water-intake", titleKey: "tools.waterIntake.title", descriptionKey: "tools.waterIntake.description", icon: GlassWater, categoryKey: "categories.wellness", href: "/tools/water-intake", priority: 29 },
  { id: "vitamin-tracker", titleKey: "tools.vitaminTracker.title", descriptionKey: "tools.vitaminTracker.description", icon: Pill, categoryKey: "categories.wellness", href: "/tools/vitamin-tracker", priority: 30, hasAI: true },
  { id: "forbidden-foods", titleKey: "tools.forbiddenFoods.title", descriptionKey: "tools.forbiddenFoods.description", icon: Ban, categoryKey: "categories.wellness", href: "/tools/forbidden-foods", priority: 31 },
  { id: "meditation-yoga", titleKey: "tools.meditationYoga.title", descriptionKey: "tools.meditationYoga.description", icon: Flower2, categoryKey: "categories.wellness", href: "/tools/meditation-yoga", priority: 32 },

  // ═══════════════════════════════════════════════════════════════
  // 🧠 MENTAL HEALTH (Priority 33-35)
  // ═══════════════════════════════════════════════════════════════
  { id: "affirmations", titleKey: "tools.affirmations.title", descriptionKey: "tools.affirmations.description", icon: Heart, categoryKey: "categories.mentalHealth", href: "/tools/affirmations", priority: 33 },
  { id: "postpartum-mental-health", titleKey: "tools.postpartumMentalHealth.title", descriptionKey: "tools.postpartumMentalHealth.description", icon: Brain, categoryKey: "categories.mentalHealth", href: "/tools/mental-health-coach", priority: 34, hasAI: true },
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, categoryKey: "categories.mentalHealth", href: "/tools/weight-gain", priority: 35, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // ⚠️ HEALTH MONITORING (Priority 36-37)
  // ═══════════════════════════════════════════════════════════════
  { id: "gestational-diabetes", titleKey: "tools.gestationalDiabetes.title", descriptionKey: "tools.gestationalDiabetes.description", icon: AlertTriangle, categoryKey: "categories.riskAssessment", href: "/tools/gestational-diabetes", priority: 36 },
  { id: "blood-type", titleKey: "tools.bloodType.title", descriptionKey: "tools.bloodType.description", icon: Droplet, categoryKey: "categories.riskAssessment", href: "/tools/blood-type", priority: 37 },

  // ═══════════════════════════════════════════════════════════════
  // 📋 PREPARATION (Priority 38)
  // ═══════════════════════════════════════════════════════════════
  { id: "birth-prep", titleKey: "tools.birthPrep.title", descriptionKey: "tools.birthPrep.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/birth-prep", priority: 38 },

  // ═══════════════════════════════════════════════════════════════
  // 👶 POSTPARTUM & BABY (Priority 39-41)
  // ═══════════════════════════════════════════════════════════════
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 39, hasAI: true },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 40 },
  { id: "doctor-questions", titleKey: "tools.doctorQuestions.title", descriptionKey: "tools.doctorQuestions.description", icon: MessageCircle, categoryKey: "categories.postpartum", href: "/tools/doctor-questions", priority: 41, hasAI: true },
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
    
    // AI Wellness
    "ai-posture-coach": ["ai-back-pain-relief", "smart-stretch-reminder", "exercise-guide"],
    "smart-stretch-reminder": ["ai-posture-coach", "ai-leg-cramp-preventer", "meditation-yoga"],
    "ai-back-pain-relief": ["ai-posture-coach", "smart-stretch-reminder", "meditation-yoga"],
    "ai-leg-cramp-preventer": ["smart-walking-coach", "smart-stretch-reminder", "vitamin-tracker"],
    "smart-walking-coach": ["exercise-guide", "ai-leg-cramp-preventer", "ai-posture-coach"],
    "pregnancy-smoothie-ai": ["ai-meal-suggestion", "vitamin-tracker", "water-intake"],
    "exercise-guide": ["meditation-yoga", "ai-posture-coach", "smart-walking-coach"],
    
    // Labor
    "ai-labor-progress": ["contraction-timer", "labor-breathing", "birth-prep"],
    "contraction-timer": ["ai-labor-progress", "labor-breathing", "birth-prep"],
    "labor-breathing": ["contraction-timer", "meditation-yoga", "ai-labor-progress"],
    
    // Fertility
    "ovulation-calculator": ["cycle-tracker", "due-date-calculator", "fetal-growth"],
    "cycle-tracker": ["ovulation-calculator", "due-date-calculator", "pregnancy-bmi"],
    "due-date-calculator": ["fetal-growth", "pregnancy-milestones", "weekly-summary"],
    
    // Pregnancy Tracking
    "fetal-growth": ["kick-counter", "weekly-summary", "bump-photos"],
    "kick-counter": ["fetal-growth", "contraction-timer", "pregnancy-milestones"],
    "pregnancy-milestones": ["bump-photos", "weekly-summary", "ai-pregnancy-journal"],
    "bump-photos": ["pregnancy-milestones", "ai-pregnancy-journal", "fetal-growth"],
    "pregnancy-bmi": ["weight-gain", "exercise-guide", "vitamin-tracker"],
    
    // Nutrition
    "water-intake": ["vitamin-tracker", "pregnancy-smoothie-ai", "exercise-guide"],
    "vitamin-tracker": ["water-intake", "ai-meal-suggestion", "forbidden-foods"],
    "forbidden-foods": ["ai-meal-suggestion", "smart-grocery-list", "gestational-diabetes"],
    "meditation-yoga": ["affirmations", "exercise-guide", "labor-breathing"],
    
    // Mental Health
    "affirmations": ["meditation-yoga", "postpartum-mental-health", "ai-pregnancy-journal"],
    "postpartum-mental-health": ["affirmations", "doctor-questions", "baby-sleep-tracker"],
    "weight-gain": ["pregnancy-bmi", "exercise-guide", "ai-meal-suggestion"],
    
    // Health Monitoring
    "gestational-diabetes": ["ai-meal-suggestion", "exercise-guide", "doctor-questions"],
    "blood-type": ["doctor-questions", "gestational-diabetes", "symptom-analyzer"],
    
    // Preparation
    "birth-prep": ["contraction-timer", "labor-breathing", "baby-sleep-tracker"],
    
    // Postpartum
    "baby-sleep-tracker": ["baby-growth", "postpartum-mental-health", "doctor-questions"],
    "baby-growth": ["baby-sleep-tracker", "doctor-questions", "ai-baby-name-finder"],
    "doctor-questions": ["symptom-analyzer", "postpartum-mental-health", "baby-growth"],
  };

  const relatedIds = relationships[currentToolId] || [];
  return relatedIds
    .map((id) => toolsData.find((tool) => tool.id === id))
    .filter((tool): tool is Tool => tool !== undefined)
    .slice(0, maxItems);
};
