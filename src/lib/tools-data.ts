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
// PROFESSIONAL PREGNANCY TOOLS - 34 CURATED AI-POWERED TOOLS (Consolidated)
// Merged duplicates for streamlined experience
// ═══════════════════════════════════════════════════════════════════════════

export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🤖 AI-POWERED CORE TOOLS (Priority 1-7)
  // ═══════════════════════════════════════════════════════════════
  { id: "pregnancy-assistant", titleKey: "tools.pregnancyAssistant.title", descriptionKey: "tools.pregnancyAssistant.description", icon: MessageCircle, categoryKey: "categories.ai", href: "/tools/pregnancy-assistant", priority: 1, hasAI: true },
  { id: "symptom-analyzer", titleKey: "tools.symptomAnalyzer.title", descriptionKey: "tools.symptomAnalyzer.description", icon: Stethoscope, categoryKey: "categories.ai", href: "/tools/symptom-analyzer", priority: 2, hasAI: true },
  { id: "ai-meal-suggestion", titleKey: "tools.aiMealSuggestion.title", descriptionKey: "tools.aiMealSuggestion.description", icon: Utensils, categoryKey: "categories.ai", href: "/tools/ai-meal-suggestion", priority: 3, hasAI: true },
  { id: "weekly-summary", titleKey: "tools.weeklySummary.title", descriptionKey: "tools.weeklySummary.description", icon: Star, categoryKey: "categories.ai", href: "/tools/weekly-summary", priority: 4, hasAI: true },
  { id: "ai-birth-plan", titleKey: "tools.aiBirthPlan.title", descriptionKey: "tools.aiBirthPlan.description", icon: FileText, categoryKey: "categories.ai", href: "/tools/ai-birth-plan", priority: 5, hasAI: true },
  { id: "smart-appointment-reminder", titleKey: "tools.smartAppointmentReminder.title", descriptionKey: "tools.smartAppointmentReminder.description", icon: Bell, categoryKey: "categories.ai", href: "/tools/smart-appointment-reminder", priority: 6, hasAI: true },
  { id: "ai-craving-alternatives", titleKey: "tools.aiCravingAlternatives.title", descriptionKey: "tools.aiCravingAlternatives.description", icon: Utensils, categoryKey: "categories.ai", href: "/tools/ai-craving-alternatives", priority: 7, hasAI: true },
  { id: "smart-grocery-list", titleKey: "tools.smartGroceryList.title", descriptionKey: "tools.smartGroceryList.description", icon: ShoppingCart, categoryKey: "categories.ai", href: "/tools/smart-grocery-list", priority: 8, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 🆕 AI TOOLS 2026 (Priority 8-15)
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-sleep-optimizer", titleKey: "tools.aiSleepOptimizer.title", descriptionKey: "tools.aiSleepOptimizer.description", icon: Bed, categoryKey: "categories.ai", href: "/tools/ai-sleep-optimizer", priority: 8, hasAI: true },
  { id: "ai-hospital-bag", titleKey: "tools.aiHospitalBag.title", descriptionKey: "tools.aiHospitalBag.description", icon: Briefcase, categoryKey: "categories.ai", href: "/tools/ai-hospital-bag", priority: 9, hasAI: true },
  { id: "ai-partner-guide", titleKey: "tools.aiPartnerGuide.title", descriptionKey: "tools.aiPartnerGuide.description", icon: HeartHandshake, categoryKey: "categories.ai", href: "/tools/ai-partner-guide", priority: 10, hasAI: true },
  { id: "ai-birth-position", titleKey: "tools.aiBirthPosition.title", descriptionKey: "tools.aiBirthPosition.description", icon: PersonStanding, categoryKey: "categories.ai", href: "/tools/ai-birth-position", priority: 11, hasAI: true },
  { id: "ai-pregnancy-skincare", titleKey: "tools.aiSkincare.title", descriptionKey: "tools.aiSkincare.description", icon: Palette, categoryKey: "categories.ai", href: "/tools/ai-skincare", priority: 12, hasAI: true },
  { id: "ai-nausea-relief", titleKey: "tools.aiNauseaRelief.title", descriptionKey: "tools.aiNauseaRelief.description", icon: Leaf, categoryKey: "categories.ai", href: "/tools/ai-nausea-relief", priority: 13, hasAI: true },
  
  { id: "ai-bump-photos", titleKey: "tools.aiBumpPhotos.title", descriptionKey: "tools.aiBumpPhotos.description", icon: Camera, categoryKey: "categories.ai", href: "/tools/ai-bump-photos", priority: 15, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 💪 AI WELLNESS & FITNESS (Priority 17-19) - CONSOLIDATED
  // Merged: posture-coach, stretch-reminder, mobility-coach → fitness-coach
  // Merged: massage-guide → back-pain-relief
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-fitness-coach", titleKey: "tools.aiFitnessCoach.title", descriptionKey: "tools.aiFitnessCoach.description", icon: Dumbbell, categoryKey: "categories.wellness", href: "/tools/ai-fitness-coach", priority: 17, hasAI: true },
  { id: "ai-back-pain-relief", titleKey: "tools.aiBackPainRelief.title", descriptionKey: "tools.aiBackPainRelief.description", icon: HeartPulse, categoryKey: "categories.wellness", href: "/tools/ai-back-pain-relief", priority: 18, hasAI: true },
  { id: "vitamin-tracker", titleKey: "tools.vitaminTracker.title", descriptionKey: "tools.vitaminTracker.description", icon: Pill, categoryKey: "categories.wellness", href: "/tools/vitamin-tracker", priority: 19, hasAI: true },
  { id: "forbidden-foods", titleKey: "tools.forbiddenFoods.title", descriptionKey: "tools.forbiddenFoods.description", icon: Utensils, categoryKey: "categories.wellness", href: "/tools/forbidden-foods", priority: 20, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 🏥 AI LABOR & MONITORING (Priority 21)
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-labor-progress", titleKey: "tools.aiLaborProgress.title", descriptionKey: "tools.aiLaborProgress.description", icon: Activity, categoryKey: "categories.labor", href: "/tools/labor-progress", priority: 21, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 🔄 FERTILITY & PLANNING (Priority 22-23) - CONSOLIDATED
  // Merged: ovulation-calculator → cycle-tracker
  // ═══════════════════════════════════════════════════════════════
  { id: "cycle-tracker", titleKey: "tools.cycleTracker.title", descriptionKey: "tools.cycleTracker.description", icon: Calendar, categoryKey: "categories.fertility", href: "/tools/cycle-tracker", priority: 22 },
  { id: "due-date-calculator", titleKey: "tools.dueDateCalculator.title", descriptionKey: "tools.dueDateCalculator.description", icon: Baby, categoryKey: "categories.fertility", href: "/tools/due-date-calculator", priority: 23 },

  // ═══════════════════════════════════════════════════════════════
  // 🤰 PREGNANCY TRACKING (Priority 24-26)
  // ═══════════════════════════════════════════════════════════════
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 24, hasAI: true },
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 25, hasAI: true },
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, categoryKey: "categories.pregnancy", href: "/tools/weight-gain", priority: 26, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 🧠 MENTAL HEALTH (Priority 27) - CONSOLIDATED
  // Merged: stress-relief → sleep-optimizer (above)
  // ═══════════════════════════════════════════════════════════════
  { id: "postpartum-mental-health", titleKey: "tools.postpartumMentalHealth.title", descriptionKey: "tools.postpartumMentalHealth.description", icon: Brain, categoryKey: "categories.mentalHealth", href: "/tools/mental-health-coach", priority: 27, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // ⚠️ RISK ASSESSMENT (Priority 28-29)
  // ═══════════════════════════════════════════════════════════════
  { id: "gestational-diabetes", titleKey: "tools.gestationalDiabetes.title", descriptionKey: "tools.gestationalDiabetes.description", icon: AlertTriangle, categoryKey: "categories.riskAssessment", href: "/tools/gestational-diabetes", priority: 28 },
  { id: "preeclampsia-risk", titleKey: "tools.preeclampsiaRisk.title", descriptionKey: "tools.preeclampsiaRisk.description", icon: AlertTriangle, categoryKey: "categories.riskAssessment", href: "/tools/preeclampsia-risk", priority: 29 },

  // ═══════════════════════════════════════════════════════════════
  // 🎯 PREPARATION (Priority 30)
  // ═══════════════════════════════════════════════════════════════
  { id: "baby-gear-recommender", titleKey: "tools.babyGearRecommender.title", descriptionKey: "tools.babyGearRecommender.description", icon: CheckSquare, categoryKey: "categories.preparation", href: "/tools/baby-gear-recommender", priority: 30, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 👶 POSTPARTUM & BABY (Priority 31-35)
  // Merged: doctor-questions functionality integrated
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-lactation-prep", titleKey: "tools.aiLactationPrep.title", descriptionKey: "tools.aiLactationPrep.description", icon: Milk, categoryKey: "categories.postpartum", href: "/tools/ai-lactation-prep", priority: 31, hasAI: true },
  { id: "postpartum-recovery", titleKey: "tools.postpartumRecovery.title", descriptionKey: "tools.postpartumRecovery.description", icon: Flower2, categoryKey: "categories.postpartum", href: "/tools/postpartum-recovery", priority: 32, hasAI: true },
  { id: "baby-cry-translator", titleKey: "tools.babyCryTranslator.title", descriptionKey: "tools.babyCryTranslator.description", icon: Volume2, categoryKey: "categories.postpartum", href: "/tools/baby-cry-translator", priority: 33, hasAI: true },
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 34, hasAI: true },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 35 },
  { id: "diaper-tracker", titleKey: "tools.diaperTracker.title", descriptionKey: "tools.diaperTracker.description", icon: Baby, categoryKey: "categories.postpartum", href: "/tools/diaper-tracker", priority: 36 },
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

export const getToolById = (id: string) => toolsData.find((t) => t.id === id);

export const getTotalToolsCount = () => toolsData.length;

// Logical tool relationships for smart recommendations
const toolRelationships: Record<string, string[]> = {
  // AI Core Tools
  "pregnancy-assistant": ["symptom-analyzer", "weekly-summary", "ai-meal-suggestion"],
  "symptom-analyzer": ["pregnancy-assistant", "ai-sleep-optimizer", "ai-back-pain-relief"],
  "ai-meal-suggestion": ["ai-craving-alternatives", "smart-grocery-list", "forbidden-foods"],
  "weekly-summary": ["pregnancy-assistant", "fetal-growth", "weight-gain"],
  "ai-birth-plan": ["ai-hospital-bag", "ai-birth-position", "ai-partner-guide"],
  "smart-appointment-reminder": ["pregnancy-assistant", "symptom-analyzer", "weekly-summary"],
  "ai-craving-alternatives": ["ai-meal-suggestion", "smart-grocery-list", "forbidden-foods"],
  "smart-grocery-list": ["ai-meal-suggestion", "ai-craving-alternatives", "vitamin-tracker"],
  
  // AI Tools 2026
  "ai-sleep-optimizer": ["ai-stress-relief", "ai-back-pain-relief", "postpartum-mental-health"],
  "ai-hospital-bag": ["ai-birth-plan", "ai-partner-guide", "baby-gear-recommender"],
  "ai-partner-guide": ["ai-birth-plan", "ai-hospital-bag", "ai-labor-progress"],
  "ai-birth-position": ["ai-labor-progress", "ai-birth-plan", "ai-back-pain-relief"],
  "ai-pregnancy-skincare": ["ai-meal-suggestion", "vitamin-tracker", "weekly-summary"],
  "ai-nausea-relief": ["ai-meal-suggestion", "symptom-analyzer", "ai-craving-alternatives"],
  "ai-bump-photos": ["weekly-summary", "fetal-growth", "baby-growth"],
  
  // Wellness
  "ai-fitness-coach": ["ai-back-pain-relief", "vitamin-tracker", "weight-gain"],
  "ai-back-pain-relief": ["ai-fitness-coach", "ai-sleep-optimizer", "symptom-analyzer"],
  "vitamin-tracker": ["ai-meal-suggestion", "smart-grocery-list", "forbidden-foods"],
  "forbidden-foods": ["ai-meal-suggestion", "ai-craving-alternatives", "vitamin-tracker"],
  
  // Labor
  "ai-labor-progress": ["ai-birth-plan", "ai-birth-position", "ai-hospital-bag"],
  
  // Fertility
  "cycle-tracker": ["due-date-calculator", "pregnancy-assistant", "weekly-summary"],
  "due-date-calculator": ["cycle-tracker", "weekly-summary", "fetal-growth"],
  
  // Pregnancy Tracking
  "fetal-growth": ["weekly-summary", "kick-counter", "baby-growth"],
  "kick-counter": ["fetal-growth", "symptom-analyzer", "ai-labor-progress"],
  "weight-gain": ["ai-meal-suggestion", "ai-fitness-coach", "weekly-summary"],
  
  // Mental Health
  "postpartum-mental-health": ["ai-sleep-optimizer", "pregnancy-assistant", "ai-stress-relief"],
  
  // Risk Assessment
  "gestational-diabetes": ["ai-meal-suggestion", "ai-fitness-coach", "symptom-analyzer"],
  "preeclampsia-risk": ["symptom-analyzer", "pregnancy-assistant", "gestational-diabetes"],
  
  // Preparation
  "baby-gear-recommender": ["ai-hospital-bag", "ai-lactation-prep", "baby-growth"],
  
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
  
  // Check for predefined relationships first
  const relatedIds = toolRelationships[currentToolId];
  if (relatedIds && relatedIds.length > 0) {
    const relatedTools = relatedIds
      .map(id => getToolById(id))
      .filter((t): t is Tool => t !== undefined)
      .slice(0, maxItems);
    
    if (relatedTools.length >= maxItems) {
      return relatedTools;
    }
    
    // Fill remaining spots with same category tools
    const sameCategoryTools = toolsData.filter(
      t => t.categoryKey === currentTool.categoryKey && 
           t.id !== currentToolId && 
           !relatedIds.includes(t.id)
    );
    
    return [...relatedTools, ...sameCategoryTools].slice(0, maxItems);
  }
  
  // Fallback: Get tools from same category
  const sameCategoryTools = toolsData.filter(
    t => t.categoryKey === currentTool.categoryKey && t.id !== currentToolId
  );
  
  // If not enough, add AI tools
  const aiTools = toolsData.filter(
    t => t.hasAI && t.id !== currentToolId && !sameCategoryTools.includes(t)
  );
  
  return [...sameCategoryTools, ...aiTools].slice(0, maxItems);
};
