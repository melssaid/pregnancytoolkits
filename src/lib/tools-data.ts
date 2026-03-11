import {
  Calendar,
  Baby,
  Activity,
  Hand,
  TrendingUp,
  AlertTriangle,
  Heart,
  Pill,
  Brain,
  Dumbbell,
  CheckSquare,
  LucideIcon,
  Scale,
  Moon,
  Sparkles,
  Ruler,
  ScanLine,
  MessageCircle,
  Star,
  FileText,
  Utensils,
  Bell,
  Bed,
  Briefcase,
  HeartHandshake,
  
  Palette,
  Leaf,
  Milk,
  Volume2,
  Flower2,
  
  ClipboardList,
} from "lucide-react";

export interface Tool {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  pngIcon?: string;
  categoryKey: string;
  href: string;
  priority: number;
  hasAI?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// PREGNANCY TOOLKITS - ORGANIZED BY USER JOURNEY
// ═══════════════════════════════════════════════════════════════════════════

export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // SMART ASSISTANT — Flagship AI tools
  // ═══════════════════════════════════════════════════════════════
  { id: "smart-pregnancy-plan", titleKey: "tools.smartPregnancyPlan.title", descriptionKey: "tools.smartPregnancyPlan.description", icon: ClipboardList, pngIcon: "https://img.icons8.com/3d-fluency/94/checklist.png", categoryKey: "categories.smartAssistant", href: "/tools/smart-plan", priority: 1, hasAI: true },
  { id: "pregnancy-assistant", titleKey: "tools.pregnancyAssistant.title", descriptionKey: "tools.pregnancyAssistant.description", icon: MessageCircle, pngIcon: "https://img.icons8.com/3d-fluency/94/chat.png", categoryKey: "categories.smartAssistant", href: "/tools/pregnancy-assistant", priority: 2, hasAI: true },
  { id: "weekly-summary", titleKey: "tools.weeklySummary.title", descriptionKey: "tools.weeklySummary.description", icon: Star, pngIcon: "https://img.icons8.com/3d-fluency/94/star.png", categoryKey: "categories.smartAssistant", href: "/tools/weekly-summary", priority: 3, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // FERTILITY & PLANNING — "أحلم بطفل" Journey
  // ═══════════════════════════════════════════════════════════════
  { id: "cycle-tracker", titleKey: "tools.cycleTracker.title", descriptionKey: "tools.cycleTracker.description", icon: Calendar, pngIcon: "https://img.icons8.com/3d-fluency/94/calendar.png", categoryKey: "categories.fertility", href: "/tools/cycle-tracker", priority: 4 },
  { id: "due-date-calculator", titleKey: "tools.dueDateCalculator.title", descriptionKey: "tools.dueDateCalculator.description", icon: Baby, pngIcon: "https://img.icons8.com/3d-fluency/94/baby.png", categoryKey: "categories.fertility", href: "/tools/due-date-calculator", priority: 5 },
  
  { id: "fertility-academy", titleKey: "tools.fertilityAcademy.title", descriptionKey: "tools.fertilityAcademy.description", icon: Star, pngIcon: "https://img.icons8.com/3d-fluency/94/graduation-cap.png", categoryKey: "categories.fertility", href: "/tools/fertility-academy", priority: 7 },
  { id: "nutrition-supplements", titleKey: "tools.nutritionSupplements.title", descriptionKey: "tools.nutritionSupplements.description", icon: Leaf, pngIcon: "https://img.icons8.com/3d-fluency/94/pill.png", categoryKey: "categories.fertility", href: "/tools/nutrition-supplements", priority: 8 },
  
  { id: "preconception-checkup", titleKey: "tools.preconceptionCheckup.title", descriptionKey: "tools.preconceptionCheckup.description", icon: CheckSquare, pngIcon: "https://img.icons8.com/3d-fluency/94/stethoscope.png", categoryKey: "categories.fertility", href: "/tools/preconception-checkup", priority: 10 },

  // ═══════════════════════════════════════════════════════════════
  // PREGNANCY TRACKING
  // ═══════════════════════════════════════════════════════════════
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, pngIcon: "https://img.icons8.com/3d-fluency/94/ultrasound.png", categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 6, hasAI: true },
  { id: "ai-birth-plan", titleKey: "tools.aiBirthPlan.title", descriptionKey: "tools.aiBirthPlan.description", icon: FileText, pngIcon: "https://img.icons8.com/3d-fluency/94/document.png", categoryKey: "categories.pregnancy", href: "/tools/ai-birth-plan", priority: 6.5, hasAI: true },
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, pngIcon: "https://img.icons8.com/3d-fluency/94/baby-feet.png", categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 7, hasAI: true },
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, pngIcon: "https://img.icons8.com/3d-fluency/94/scale.png", categoryKey: "categories.pregnancy", href: "/tools/weight-gain", priority: 8, hasAI: true },
  { id: "ai-bump-photos", titleKey: "tools.aiBumpPhotos.title", descriptionKey: "tools.aiBumpPhotos.description", icon: ScanLine, pngIcon: "https://img.icons8.com/3d-fluency/94/camera.png", categoryKey: "categories.pregnancy", href: "/tools/ai-bump-photos", priority: 9, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // NUTRITION & DIET
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-meal-suggestion", titleKey: "tools.aiMealSuggestion.title", descriptionKey: "tools.aiMealSuggestion.description", icon: Utensils, pngIcon: "https://img.icons8.com/3d-fluency/94/salad.png", categoryKey: "categories.nutrition", href: "/tools/ai-meal-suggestion", priority: 10, hasAI: true },
  { id: "vitamin-tracker", titleKey: "tools.vitaminTracker.title", descriptionKey: "tools.vitaminTracker.description", icon: Pill, pngIcon: "https://img.icons8.com/3d-fluency/94/pill.png", categoryKey: "categories.nutrition", href: "/tools/vitamin-tracker", priority: 13, hasAI: true },
  

  // ═══════════════════════════════════════════════════════════════
  // WELLNESS & FITNESS (Hub)
  // ═══════════════════════════════════════════════════════════════
  { id: "wellness-diary", titleKey: "tools.wellnessDiary.title", descriptionKey: "tools.wellnessDiary.description", icon: Heart, pngIcon: "/icons/mental-health.png", categoryKey: "categories.wellness", href: "/tools/wellness-diary", priority: 16 },
  { id: "ai-fitness-coach", titleKey: "tools.aiFitnessCoach.title", descriptionKey: "tools.aiFitnessCoach.description", icon: Dumbbell, pngIcon: "/icons/fitness-coach.png", categoryKey: "categories.wellness", href: "/tools/ai-fitness-coach", priority: 17, hasAI: true },
  { id: "pregnancy-comfort", titleKey: "tools.pregnancyComfort.title", descriptionKey: "tools.pregnancyComfort.description", icon: Bed, pngIcon: "/icons/sleep-optimizer.png", categoryKey: "categories.wellness", href: "/tools/pregnancy-comfort", priority: 19, hasAI: true },
  { id: "ai-pregnancy-skincare", titleKey: "tools.aiSkincare.title", descriptionKey: "tools.aiSkincare.description", icon: Palette, pngIcon: "/icons/skincare.png", categoryKey: "categories.wellness", href: "/tools/ai-skincare", priority: 21, hasAI: true },
  

  // Mental health moved to postpartum section

  // Self-check tools merged into preparation section below

  // ═══════════════════════════════════════════════════════════════
  // PREPARATION & BIRTH
  // ═══════════════════════════════════════════════════════════════
  { id: "maternal-health-awareness", titleKey: "tools.maternalHealth.title", descriptionKey: "tools.maternalHealth.description", icon: AlertTriangle, pngIcon: "/icons/diabetes.png", categoryKey: "categories.preparation", href: "/tools/maternal-health", priority: 30 },
  { id: "ai-hospital-bag", titleKey: "tools.aiHospitalBag.title", descriptionKey: "tools.aiHospitalBag.description", icon: Briefcase, pngIcon: "/icons/hospital-bag.png", categoryKey: "categories.preparation", href: "/tools/ai-hospital-bag", priority: 32, hasAI: true },
  { id: "baby-gear-recommender", titleKey: "tools.babyGearRecommender.title", descriptionKey: "tools.babyGearRecommender.description", icon: CheckSquare, pngIcon: "/icons/birth-prep.png", categoryKey: "categories.preparation", href: "/tools/baby-gear-recommender", priority: 33, hasAI: true },
  { id: "smart-appointment-reminder", titleKey: "tools.smartAppointmentReminder.title", descriptionKey: "tools.smartAppointmentReminder.description", icon: Bell, pngIcon: "/icons/appointment-reminder.png", categoryKey: "categories.preparation", href: "/tools/smart-appointment-reminder", priority: 34, hasAI: true },
  { id: "ai-partner-guide", titleKey: "tools.aiPartnerGuide.title", descriptionKey: "tools.aiPartnerGuide.description", icon: HeartHandshake, pngIcon: "/icons/partner-guide.png", categoryKey: "categories.preparation", href: "/tools/ai-partner-guide", priority: 35, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // POSTPARTUM & BABY
  // ═══════════════════════════════════════════════════════════════
  { id: "postpartum-mental-health", titleKey: "tools.postpartumMentalHealth.title", descriptionKey: "tools.postpartumMentalHealth.description", icon: Brain, pngIcon: "/icons/mental-health.png", categoryKey: "categories.postpartum", href: "/tools/mental-health-coach", priority: 36, hasAI: true },
  { id: "ai-lactation-prep", titleKey: "tools.aiLactationPrep.title", descriptionKey: "tools.aiLactationPrep.description", icon: Milk, pngIcon: "/icons/lactation.png", categoryKey: "categories.postpartum", href: "/tools/ai-lactation-prep", priority: 37, hasAI: true },
  { id: "postpartum-recovery", titleKey: "tools.postpartumRecovery.title", descriptionKey: "tools.postpartumRecovery.description", icon: Flower2, pngIcon: "/icons/postpartum-recovery.png", categoryKey: "categories.postpartum", href: "/tools/postpartum-recovery", priority: 38, hasAI: true },
  { id: "baby-cry-translator", titleKey: "tools.babyCryTranslator.title", descriptionKey: "tools.babyCryTranslator.description", icon: Volume2, pngIcon: "/icons/baby-cry-translator.png", categoryKey: "categories.postpartum", href: "/tools/baby-cry-translator", priority: 39, hasAI: true },
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, pngIcon: "/icons/baby-sleep.png", categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 40, hasAI: true },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, pngIcon: "/icons/baby-growth.png", categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 41 },
  { id: "diaper-tracker", titleKey: "tools.diaperTracker.title", descriptionKey: "tools.diaperTracker.description", icon: Baby, pngIcon: "/icons/milestones.png", categoryKey: "categories.postpartum", href: "/tools/diaper-tracker", priority: 42 },
];

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const categoryKeys = [
  "categories.all",
  "categories.smartAssistant",
  "categories.fertility",
  "categories.pregnancy",
  "categories.nutrition",
  "categories.wellness",
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

export const getToolById = (id: string) => toolsData.find((t) => t.id === id);

export const getTotalToolsCount = () => toolsData.length;

// Logical tool relationships for smart recommendations
const toolRelationships: Record<string, string[]> = {
  // AI Core
  "pregnancy-assistant": ["wellness-diary", "weekly-summary", "ai-meal-suggestion"],
  "weekly-summary": ["pregnancy-assistant", "fetal-growth", "weight-gain"],
  "ai-meal-suggestion": ["vitamin-tracker", "weekly-summary", "wellness-diary"],

  // Fertility
  "cycle-tracker": ["due-date-calculator", "pregnancy-assistant", "weekly-summary"],
  "due-date-calculator": ["cycle-tracker", "weekly-summary", "fetal-growth"],

  // Pregnancy Tracking
  "fetal-growth": ["weekly-summary", "kick-counter", "baby-growth"],
  "kick-counter": ["fetal-growth", "wellness-diary", "ai-birth-plan"],
  "weight-gain": ["ai-meal-suggestion", "ai-fitness-coach", "weekly-summary"],
  "ai-bump-photos": ["weekly-summary", "fetal-growth", "baby-growth"],
  "smart-pregnancy-plan": ["weekly-summary", "smart-appointment-reminder", "ai-meal-suggestion"],

  // Labor & Birth
  "ai-birth-plan": ["ai-hospital-bag", "ai-partner-guide", "ai-fitness-coach"],

  // Wellness
  "wellness-diary": ["pregnancy-assistant", "ai-fitness-coach", "pregnancy-comfort"],
  "ai-fitness-coach": ["vitamin-tracker", "weight-gain", "wellness-diary"],
  "pregnancy-comfort": ["wellness-diary", "ai-fitness-coach", "ai-meal-suggestion"],
  "vitamin-tracker": ["ai-meal-suggestion", "wellness-diary", "pregnancy-comfort"],

  // Mental Health
  "postpartum-mental-health": ["pregnancy-comfort", "pregnancy-assistant", "wellness-diary"],
  "ai-pregnancy-skincare": ["ai-meal-suggestion", "vitamin-tracker", "weekly-summary"],

  // Health Awareness
  "maternal-health-awareness": ["ai-meal-suggestion", "ai-fitness-coach", "wellness-diary"],

  // Preparation
  "ai-hospital-bag": ["ai-birth-plan", "ai-partner-guide", "baby-gear-recommender"],
  "ai-partner-guide": ["ai-birth-plan", "ai-hospital-bag", "ai-fitness-coach"],
  "baby-gear-recommender": ["ai-hospital-bag", "ai-lactation-prep", "baby-growth"],
  "smart-appointment-reminder": ["pregnancy-assistant", "wellness-diary", "weekly-summary"],

  // Postpartum
  "ai-lactation-prep": ["postpartum-recovery", "baby-sleep-tracker", "baby-growth"],
  "postpartum-recovery": ["ai-lactation-prep", "postpartum-mental-health", "baby-cry-translator"],
  "baby-cry-translator": ["baby-sleep-tracker", "postpartum-recovery", "ai-lactation-prep"],
  "baby-sleep-tracker": ["baby-growth", "baby-cry-translator", "diaper-tracker"],
  "baby-growth": ["baby-sleep-tracker", "diaper-tracker", "ai-lactation-prep"],
  "diaper-tracker": ["baby-sleep-tracker", "baby-growth", "baby-cry-translator"],
};

// Get related tools based on logical relationships
export const getRelatedTools = (currentToolId: string, maxItems: number = 3) => {
  const currentTool = getToolById(currentToolId);
  if (!currentTool) return [];
  
  const relatedIds = toolRelationships[currentToolId];
  if (relatedIds && relatedIds.length > 0) {
    const relatedTools = relatedIds
      .map(id => getToolById(id))
      .filter((t): t is Tool => t !== undefined)
      .slice(0, maxItems);
    
    if (relatedTools.length >= maxItems) {
      return relatedTools;
    }
    
    const sameCategoryTools = toolsData.filter(
      t => t.categoryKey === currentTool.categoryKey && 
           t.id !== currentToolId && 
           !relatedIds.includes(t.id)
    );
    
    return [...relatedTools, ...sameCategoryTools].slice(0, maxItems);
  }
  
  const sameCategoryTools = toolsData.filter(
    t => t.categoryKey === currentTool.categoryKey && t.id !== currentToolId
  );
  
  const aiTools = toolsData.filter(
    t => t.hasAI && t.id !== currentToolId && !sameCategoryTools.includes(t)
  );
  
  return [...sameCategoryTools, ...aiTools].slice(0, maxItems);
};

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY MAPPING — 3 clear user paths
// ═══════════════════════════════════════════════════════════════════════════

export type JourneyKey = 'planning' | 'pregnant' | 'postpartum';

const journeyCategoryMap: Record<JourneyKey, string[]> = {
  planning: [
    "categories.fertility",
  ],
  pregnant: [
    "categories.smartAssistant",
    "categories.pregnancy",
    "categories.nutrition",
    "categories.wellness",
    "categories.labor",
    "categories.preparation",
  ],
  postpartum: [
    "categories.postpartum",
  ],
};

export const getJourneyCategories = (journey: JourneyKey): string[] =>
  journeyCategoryMap[journey];

export const getToolsByJourney = (journey: JourneyKey): Tool[] =>
  toolsData.filter(t => journeyCategoryMap[journey].includes(t.categoryKey));
