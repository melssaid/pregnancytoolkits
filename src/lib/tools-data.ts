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
  Wind,
  Ruler,
  Stethoscope,
  Camera,
  MessageCircle,
  Star,
  FileText,
  HeartPulse,
  Utensils,
  ShoppingCart,
  Users,
  Bell,
  Lightbulb,
  Bed,
  Briefcase,
  HeartHandshake,
  PersonStanding,
  Palette,
  Leaf,
  Wallet,
  Milk,
  Volume2,
  Flower2,
  Footprints,
  ClipboardList,
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
// PREGNANCY TOOLKITS - ORGANIZED BY USER JOURNEY
// ═══════════════════════════════════════════════════════════════════════════

export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // SMART ASSISTANT — Flagship AI tools
  // ═══════════════════════════════════════════════════════════════
  { id: "pregnancy-assistant", titleKey: "tools.pregnancyAssistant.title", descriptionKey: "tools.pregnancyAssistant.description", icon: MessageCircle, categoryKey: "categories.smartAssistant", href: "/tools/pregnancy-assistant", priority: 1, hasAI: true },
  { id: "weekly-summary", titleKey: "tools.weeklySummary.title", descriptionKey: "tools.weeklySummary.description", icon: Star, categoryKey: "categories.smartAssistant", href: "/tools/weekly-summary", priority: 2, hasAI: true },
  { id: "smart-pregnancy-plan", titleKey: "tools.smartPregnancyPlan.title", descriptionKey: "tools.smartPregnancyPlan.description", icon: ClipboardList, categoryKey: "categories.smartAssistant", href: "/tools/smart-plan", priority: 3, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // FERTILITY & PLANNING
  // ═══════════════════════════════════════════════════════════════
  { id: "cycle-tracker", titleKey: "tools.cycleTracker.title", descriptionKey: "tools.cycleTracker.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/cycle-tracker", priority: 4 },
  { id: "due-date-calculator", titleKey: "tools.dueDateCalculator.title", descriptionKey: "tools.dueDateCalculator.description", icon: Baby, categoryKey: "categories.fertility", href: "/tools/due-date-calculator", priority: 5 },

  // ═══════════════════════════════════════════════════════════════
  // PREGNANCY TRACKING
  // ═══════════════════════════════════════════════════════════════
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 6, hasAI: true },
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 7, hasAI: true },
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, categoryKey: "categories.pregnancy", href: "/tools/weight-gain", priority: 8, hasAI: true },
  { id: "ai-bump-photos", titleKey: "tools.aiBumpPhotos.title", descriptionKey: "tools.aiBumpPhotos.description", icon: Camera, categoryKey: "categories.pregnancy", href: "/tools/ai-bump-photos", priority: 9, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // NUTRITION & DIET
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-meal-suggestion", titleKey: "tools.aiMealSuggestion.title", descriptionKey: "tools.aiMealSuggestion.description", icon: Utensils, categoryKey: "categories.nutrition", href: "/tools/ai-meal-suggestion", priority: 10, hasAI: true },
  { id: "ai-craving-alternatives", titleKey: "tools.aiCravingAlternatives.title", descriptionKey: "tools.aiCravingAlternatives.description", icon: Utensils, categoryKey: "categories.nutrition", href: "/tools/ai-craving-alternatives", priority: 11, hasAI: true },
  { id: "smart-grocery-list", titleKey: "tools.smartGroceryList.title", descriptionKey: "tools.smartGroceryList.description", icon: ShoppingCart, categoryKey: "categories.nutrition", href: "/tools/smart-grocery-list", priority: 12, hasAI: true },
  { id: "vitamin-tracker", titleKey: "tools.vitaminTracker.title", descriptionKey: "tools.vitaminTracker.description", icon: Pill, categoryKey: "categories.nutrition", href: "/tools/vitamin-tracker", priority: 13, hasAI: true },
  

  // ═══════════════════════════════════════════════════════════════
  // WELLNESS & FITNESS
  // ═══════════════════════════════════════════════════════════════
  { id: "wellness-diary", titleKey: "tools.wellnessDiary.title", descriptionKey: "tools.wellnessDiary.description", icon: Heart, categoryKey: "categories.wellness", href: "/tools/wellness-diary", priority: 16 },
  { id: "ai-fitness-coach", titleKey: "tools.aiFitnessCoach.title", descriptionKey: "tools.aiFitnessCoach.description", icon: Dumbbell, categoryKey: "categories.wellness", href: "/tools/ai-fitness-coach", priority: 17, hasAI: true },
  { id: "ai-back-pain-relief", titleKey: "tools.aiBackPainRelief.title", descriptionKey: "tools.aiBackPainRelief.description", icon: HeartPulse, categoryKey: "categories.wellness", href: "/tools/ai-back-pain-relief", priority: 18, hasAI: true },
  { id: "ai-sleep-optimizer", titleKey: "tools.aiSleepOptimizer.title", descriptionKey: "tools.aiSleepOptimizer.description", icon: Bed, categoryKey: "categories.wellness", href: "/tools/ai-sleep-optimizer", priority: 19, hasAI: true },
  { id: "ai-nausea-relief", titleKey: "tools.aiNauseaRelief.title", descriptionKey: "tools.aiNauseaRelief.description", icon: Leaf, categoryKey: "categories.wellness", href: "/tools/ai-nausea-relief", priority: 20, hasAI: true },
  { id: "ai-pregnancy-skincare", titleKey: "tools.aiSkincare.title", descriptionKey: "tools.aiSkincare.description", icon: Palette, categoryKey: "categories.wellness", href: "/tools/ai-skincare", priority: 21, hasAI: true },
  { id: "smart-walking-coach", titleKey: "tools.smartWalkingCoach.title", descriptionKey: "tools.smartWalkingCoach.description", icon: Footprints, categoryKey: "categories.wellness", href: "/tools/smart-walking-coach", priority: 22, hasAI: true },
  { id: "smart-stretch-reminder", titleKey: "tools.smartStretchReminder.title", descriptionKey: "tools.smartStretchReminder.description", icon: Sparkles, categoryKey: "categories.wellness", href: "/tools/smart-stretch-reminder", priority: 23, hasAI: true },
  

  // ═══════════════════════════════════════════════════════════════
  // MENTAL HEALTH
  // ═══════════════════════════════════════════════════════════════
  { id: "postpartum-mental-health", titleKey: "tools.postpartumMentalHealth.title", descriptionKey: "tools.postpartumMentalHealth.description", icon: Brain, categoryKey: "categories.mentalHealth", href: "/tools/mental-health-coach", priority: 25, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // SELF-CHECK
  // ═══════════════════════════════════════════════════════════════
  { id: "gestational-diabetes", titleKey: "tools.gestationalDiabetes.title", descriptionKey: "tools.gestationalDiabetes.description", icon: AlertTriangle, categoryKey: "categories.selfCheck", href: "/tools/gestational-diabetes", priority: 26 },
  { id: "preeclampsia-risk", titleKey: "tools.preeclampsiaRisk.title", descriptionKey: "tools.preeclampsiaRisk.description", icon: AlertTriangle, categoryKey: "categories.selfCheck", href: "/tools/preeclampsia-risk", priority: 27 },

  // ═══════════════════════════════════════════════════════════════
  // LABOR & BIRTH
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-labor-progress", titleKey: "tools.aiLaborProgress.title", descriptionKey: "tools.aiLaborProgress.description", icon: Activity, categoryKey: "categories.labor", href: "/tools/labor-progress", priority: 28, hasAI: true },
  { id: "ai-birth-plan", titleKey: "tools.aiBirthPlan.title", descriptionKey: "tools.aiBirthPlan.description", icon: FileText, categoryKey: "categories.labor", href: "/tools/ai-birth-plan", priority: 29, hasAI: true },
  { id: "ai-birth-position", titleKey: "tools.aiBirthPosition.title", descriptionKey: "tools.aiBirthPosition.description", icon: PersonStanding, categoryKey: "categories.labor", href: "/tools/ai-birth-position", priority: 30, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // PREPARATION
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-hospital-bag", titleKey: "tools.aiHospitalBag.title", descriptionKey: "tools.aiHospitalBag.description", icon: Briefcase, categoryKey: "categories.preparation", href: "/tools/ai-hospital-bag", priority: 31, hasAI: true },
  { id: "baby-gear-recommender", titleKey: "tools.babyGearRecommender.title", descriptionKey: "tools.babyGearRecommender.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/baby-gear-recommender", priority: 32, hasAI: true },
  { id: "smart-appointment-reminder", titleKey: "tools.smartAppointmentReminder.title", descriptionKey: "tools.smartAppointmentReminder.description", icon: Bell, categoryKey: "categories.preparation", href: "/tools/smart-appointment-reminder", priority: 33, hasAI: true },
  { id: "ai-partner-guide", titleKey: "tools.aiPartnerGuide.title", descriptionKey: "tools.aiPartnerGuide.description", icon: HeartHandshake, categoryKey: "categories.preparation", href: "/tools/ai-partner-guide", priority: 34, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // POSTPARTUM & BABY
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-lactation-prep", titleKey: "tools.aiLactationPrep.title", descriptionKey: "tools.aiLactationPrep.description", icon: Milk, categoryKey: "categories.postpartum", href: "/tools/ai-lactation-prep", priority: 35, hasAI: true },
  { id: "postpartum-recovery", titleKey: "tools.postpartumRecovery.title", descriptionKey: "tools.postpartumRecovery.description", icon: Flower2, categoryKey: "categories.postpartum", href: "/tools/postpartum-recovery", priority: 36, hasAI: true },
  { id: "baby-cry-translator", titleKey: "tools.babyCryTranslator.title", descriptionKey: "tools.babyCryTranslator.description", icon: Volume2, categoryKey: "categories.postpartum", href: "/tools/baby-cry-translator", priority: 37, hasAI: true },
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 38, hasAI: true },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 39 },
  { id: "diaper-tracker", titleKey: "tools.diaperTracker.title", descriptionKey: "tools.diaperTracker.description", icon: Baby, categoryKey: "categories.postpartum", href: "/tools/diaper-tracker", priority: 40 },
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
  "categories.mentalHealth",
  "categories.selfCheck",
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
  "ai-meal-suggestion": ["ai-craving-alternatives", "smart-grocery-list", "vitamin-tracker"],
  "ai-craving-alternatives": ["ai-meal-suggestion", "smart-grocery-list", "vitamin-tracker"],
  "smart-grocery-list": ["ai-meal-suggestion", "ai-craving-alternatives", "vitamin-tracker"],

  // Fertility
  "cycle-tracker": ["due-date-calculator", "pregnancy-assistant", "weekly-summary"],
  "due-date-calculator": ["cycle-tracker", "weekly-summary", "fetal-growth"],

  // Pregnancy Tracking
  "fetal-growth": ["weekly-summary", "kick-counter", "baby-growth"],
  "kick-counter": ["fetal-growth", "wellness-diary", "ai-labor-progress"],
  "weight-gain": ["ai-meal-suggestion", "ai-fitness-coach", "weekly-summary"],
  "ai-bump-photos": ["weekly-summary", "fetal-growth", "baby-growth"],
  "smart-pregnancy-plan": ["weekly-summary", "smart-appointment-reminder", "ai-meal-suggestion"],

  // Labor & Birth
  "ai-labor-progress": ["ai-birth-plan", "ai-birth-position", "ai-hospital-bag"],
  "ai-birth-plan": ["ai-hospital-bag", "ai-birth-position", "ai-partner-guide"],
  "ai-birth-position": ["ai-labor-progress", "ai-birth-plan", "ai-back-pain-relief"],

  // Wellness
  "wellness-diary": ["pregnancy-assistant", "ai-sleep-optimizer", "ai-back-pain-relief"],
  "ai-fitness-coach": ["ai-back-pain-relief", "vitamin-tracker", "weight-gain"],
  "ai-back-pain-relief": ["ai-fitness-coach", "ai-sleep-optimizer", "wellness-diary"],
  "ai-sleep-optimizer": ["ai-back-pain-relief", "wellness-diary", "postpartum-mental-health"],
  "ai-nausea-relief": ["ai-meal-suggestion", "wellness-diary", "ai-craving-alternatives"],
  "vitamin-tracker": ["ai-meal-suggestion", "smart-grocery-list", "ai-craving-alternatives"],
  "smart-walking-coach": ["ai-fitness-coach", "ai-back-pain-relief", "wellness-diary"],
  "smart-stretch-reminder": ["ai-fitness-coach", "ai-back-pain-relief", "smart-walking-coach"],

  // Mental Health
  "postpartum-mental-health": ["ai-sleep-optimizer", "pregnancy-assistant", "wellness-diary"],
  "ai-pregnancy-skincare": ["ai-meal-suggestion", "vitamin-tracker", "weekly-summary"],

  // Self-Check
  "gestational-diabetes": ["ai-meal-suggestion", "ai-fitness-coach", "wellness-diary"],
  "preeclampsia-risk": ["wellness-diary", "pregnancy-assistant", "gestational-diabetes"],

  // Preparation
  "ai-hospital-bag": ["ai-birth-plan", "ai-partner-guide", "baby-gear-recommender"],
  "ai-partner-guide": ["ai-birth-plan", "ai-hospital-bag", "ai-labor-progress"],
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
