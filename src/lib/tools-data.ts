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
  Salad,
  ShoppingCart,
  Lightbulb,
  Users,
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
// PROFESSIONAL PREGNANCY TOOLS - 28 CURATED TOOLS
// Optimized for Google Play compliance with AI integration
// Duplicates removed, advanced versions prioritized
// ═══════════════════════════════════════════════════════════════════════════

export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🤖 AI-POWERED TOOLS (8 tools) - Primary AI Features
  // ═══════════════════════════════════════════════════════════════
  { id: "pregnancy-assistant", titleKey: "tools.pregnancyAssistant.title", descriptionKey: "tools.pregnancyAssistant.description", icon: MessageCircle, categoryKey: "categories.ai", href: "/tools/pregnancy-assistant", priority: 1, hasAI: true },
  { id: "symptom-analyzer", titleKey: "tools.symptomAnalyzer.title", descriptionKey: "tools.symptomAnalyzer.description", icon: Stethoscope, categoryKey: "categories.ai", href: "/tools/symptom-analyzer", priority: 2, hasAI: true },
  { id: "ai-meal-suggestion", titleKey: "tools.aiMealSuggestion.title", descriptionKey: "tools.aiMealSuggestion.description", icon: Utensils, categoryKey: "categories.ai", href: "/tools/ai-meal-suggestion", priority: 3, hasAI: true },
  { id: "weekly-summary", titleKey: "tools.weeklySummary.title", descriptionKey: "tools.weeklySummary.description", icon: Star, categoryKey: "categories.ai", href: "/tools/weekly-summary", priority: 4, hasAI: true },
  { id: "ai-pregnancy-journal", titleKey: "tools.aiPregnancyJournal.title", descriptionKey: "tools.aiPregnancyJournal.description", icon: BookOpen, categoryKey: "categories.ai", href: "/tools/ai-pregnancy-journal", priority: 5, hasAI: true },
  { id: "ai-baby-name-finder", titleKey: "tools.aiBabyNameFinder.title", descriptionKey: "tools.aiBabyNameFinder.description", icon: Sparkles, categoryKey: "categories.ai", href: "/tools/ai-baby-name-finder", priority: 6, hasAI: true },
  { id: "ai-birth-story", titleKey: "tools.aiBirthStory.title", descriptionKey: "tools.aiBirthStory.description", icon: FileText, categoryKey: "categories.ai", href: "/tools/ai-birth-story", priority: 7, hasAI: true },
  { id: "smart-grocery-list", titleKey: "tools.smartGroceryList.title", descriptionKey: "tools.smartGroceryList.description", icon: ShoppingCart, categoryKey: "categories.ai", href: "/tools/smart-grocery-list", priority: 8, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 🔄 FERTILITY & PLANNING (3 tools)
  // ConceptionCalculator merged into DueDateCalculator
  // ═══════════════════════════════════════════════════════════════
  { id: "ovulation-calculator", titleKey: "tools.ovulationCalculator.title", descriptionKey: "tools.ovulationCalculator.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/ovulation-calculator", priority: 10 },
  { id: "cycle-tracker", titleKey: "tools.cycleTracker.title", descriptionKey: "tools.cycleTracker.description", icon: Activity, categoryKey: "categories.fertility", href: "/tools/cycle-tracker", priority: 11 },
  { id: "due-date-calculator", titleKey: "tools.dueDateCalculator.title", descriptionKey: "tools.dueDateCalculator.description", icon: Baby, categoryKey: "categories.fertility", href: "/tools/due-date-calculator", priority: 12 },

  // ═══════════════════════════════════════════════════════════════
  // 🤰 PREGNANCY TRACKING (5 tools) - With AI enhancements
  // ═══════════════════════════════════════════════════════════════
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 20, hasAI: true },
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 21, hasAI: true },
  { id: "pregnancy-milestones", titleKey: "tools.pregnancyMilestones.title", descriptionKey: "tools.pregnancyMilestones.description", icon: Milestone, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-milestones", priority: 22 },
  { id: "bump-photos", titleKey: "tools.bumpPhotos.title", descriptionKey: "tools.bumpPhotos.description", icon: Camera, categoryKey: "categories.pregnancy", href: "/tools/bump-photos", priority: 23 },
  { id: "pregnancy-bmi", titleKey: "tools.pregnancyBmi.title", descriptionKey: "tools.pregnancyBmi.description", icon: Calculator, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-bmi", priority: 24 },

  // ═══════════════════════════════════════════════════════════════
  // 💪 WELLNESS & NUTRITION (5 tools) - AI-enhanced
  // ═══════════════════════════════════════════════════════════════
  { id: "water-intake", titleKey: "tools.waterIntake.title", descriptionKey: "tools.waterIntake.description", icon: GlassWater, categoryKey: "categories.wellness", href: "/tools/water-intake", priority: 30 },
  { id: "vitamin-tracker", titleKey: "tools.vitaminTracker.title", descriptionKey: "tools.vitaminTracker.description", icon: Pill, categoryKey: "categories.wellness", href: "/tools/vitamin-tracker", priority: 31, hasAI: true },
  { id: "forbidden-foods", titleKey: "tools.forbiddenFoods.title", descriptionKey: "tools.forbiddenFoods.description", icon: Ban, categoryKey: "categories.wellness", href: "/tools/forbidden-foods", priority: 32 },
  { id: "exercise-guide", titleKey: "tools.exerciseGuide.title", descriptionKey: "tools.exerciseGuide.description", icon: Dumbbell, categoryKey: "categories.wellness", href: "/tools/exercise-guide", priority: 33, hasAI: true },
  { id: "meditation-yoga", titleKey: "tools.meditationYoga.title", descriptionKey: "tools.meditationYoga.description", icon: Flower2, categoryKey: "categories.wellness", href: "/tools/meditation-yoga", priority: 34 },

  // ═══════════════════════════════════════════════════════════════
  // 🧠 MENTAL HEALTH (3 tools)
  // ═══════════════════════════════════════════════════════════════
  { id: "affirmations", titleKey: "tools.affirmations.title", descriptionKey: "tools.affirmations.description", icon: Heart, categoryKey: "categories.mentalHealth", href: "/tools/affirmations", priority: 40 },
  { id: "postpartum-mental-health", titleKey: "tools.postpartumMentalHealth.title", descriptionKey: "tools.postpartumMentalHealth.description", icon: Brain, categoryKey: "categories.mentalHealth", href: "/tools/mental-health-coach", priority: 41, hasAI: true },
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, categoryKey: "categories.mentalHealth", href: "/tools/weight-gain", priority: 42, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // ⚠️ HEALTH MONITORING (2 tools) - With medical disclaimers
  // ═══════════════════════════════════════════════════════════════
  { id: "gestational-diabetes", titleKey: "tools.gestationalDiabetes.title", descriptionKey: "tools.gestationalDiabetes.description", icon: AlertTriangle, categoryKey: "categories.riskAssessment", href: "/tools/gestational-diabetes", priority: 50 },
  { id: "blood-type", titleKey: "tools.bloodType.title", descriptionKey: "tools.bloodType.description", icon: Droplet, categoryKey: "categories.riskAssessment", href: "/tools/blood-type", priority: 51 },

  // ═══════════════════════════════════════════════════════════════
  // 🏥 LABOR & PREPARATION (3 tools)
  // ═══════════════════════════════════════════════════════════════
  { id: "contraction-timer", titleKey: "tools.contractionTimer.title", descriptionKey: "tools.contractionTimer.description", icon: Timer, categoryKey: "categories.labor", href: "/tools/contraction-timer", priority: 60, hasAI: true },
  { id: "labor-breathing", titleKey: "tools.laborBreathing.title", descriptionKey: "tools.laborBreathing.description", icon: Wind, categoryKey: "categories.labor", href: "/tools/labor-breathing", priority: 61 },
  { id: "birth-prep", titleKey: "tools.birthPrep.title", descriptionKey: "tools.birthPrep.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/birth-prep", priority: 62 },

  // ═══════════════════════════════════════════════════════════════
  // 👶 POSTPARTUM & BABY (3 tools)
  // ═══════════════════════════════════════════════════════════════
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 70, hasAI: true },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 71 },
  { id: "doctor-questions", titleKey: "tools.doctorQuestions.title", descriptionKey: "tools.doctorQuestions.description", icon: MessageCircle, categoryKey: "categories.postpartum", href: "/tools/doctor-questions", priority: 72, hasAI: true },
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
    // AI Tools linking
    "pregnancy-assistant": ["symptom-analyzer", "weekly-summary", "ai-meal-suggestion"],
    "symptom-analyzer": ["pregnancy-assistant", "doctor-questions", "gestational-diabetes"],
    "ai-meal-suggestion": ["forbidden-foods", "smart-grocery-list", "vitamin-tracker"],
    "weekly-summary": ["fetal-growth", "pregnancy-milestones", "pregnancy-assistant"],
    "ai-pregnancy-journal": ["bump-photos", "pregnancy-milestones", "affirmations"],
    "ai-baby-name-finder": ["due-date-calculator", "ai-birth-story", "baby-growth"],
    "ai-birth-story": ["labor-breathing", "birth-prep", "contraction-timer"],
    "smart-grocery-list": ["ai-meal-suggestion", "forbidden-foods", "vitamin-tracker"],
    
    // Fertility linking
    "ovulation-calculator": ["cycle-tracker", "due-date-calculator", "fetal-growth"],
    "cycle-tracker": ["ovulation-calculator", "due-date-calculator", "pregnancy-bmi"],
    "due-date-calculator": ["fetal-growth", "pregnancy-milestones", "weekly-summary"],
    
    // Pregnancy tracking linking
    "fetal-growth": ["kick-counter", "weekly-summary", "bump-photos"],
    "kick-counter": ["fetal-growth", "contraction-timer", "pregnancy-milestones"],
    "pregnancy-milestones": ["bump-photos", "weekly-summary", "ai-pregnancy-journal"],
    "bump-photos": ["pregnancy-milestones", "ai-pregnancy-journal", "fetal-growth"],
    "pregnancy-bmi": ["weight-gain", "exercise-guide", "vitamin-tracker"],
    
    // Wellness linking
    "water-intake": ["vitamin-tracker", "ai-meal-suggestion", "exercise-guide"],
    "vitamin-tracker": ["water-intake", "ai-meal-suggestion", "forbidden-foods"],
    "forbidden-foods": ["ai-meal-suggestion", "smart-grocery-list", "gestational-diabetes"],
    "exercise-guide": ["meditation-yoga", "pregnancy-bmi", "weight-gain"],
    "meditation-yoga": ["affirmations", "exercise-guide", "labor-breathing"],
    
    // Mental health linking
    "affirmations": ["meditation-yoga", "postpartum-mental-health", "ai-pregnancy-journal"],
    "postpartum-mental-health": ["affirmations", "doctor-questions", "baby-sleep-tracker"],
    "weight-gain": ["pregnancy-bmi", "exercise-guide", "ai-meal-suggestion"],
    
    // Health monitoring linking
    "gestational-diabetes": ["ai-meal-suggestion", "exercise-guide", "doctor-questions"],
    "blood-type": ["doctor-questions", "gestational-diabetes", "symptom-analyzer"],
    
    // Labor linking
    "contraction-timer": ["labor-breathing", "birth-prep", "ai-birth-story"],
    "labor-breathing": ["contraction-timer", "meditation-yoga", "birth-prep"],
    "birth-prep": ["contraction-timer", "labor-breathing", "baby-sleep-tracker"],
    
    // Postpartum linking
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
