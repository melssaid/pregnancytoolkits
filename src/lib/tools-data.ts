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
// PROFESSIONAL PREGNANCY TOOLS - 35 CURATED AI-POWERED TOOLS (Consolidated)
// Merged duplicates for streamlined experience
// ═══════════════════════════════════════════════════════════════════════════

export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🤖 AI-POWERED CORE TOOLS (Priority 1-8)
  // ═══════════════════════════════════════════════════════════════
  { id: "pregnancy-assistant", titleKey: "tools.pregnancyAssistant.title", descriptionKey: "tools.pregnancyAssistant.description", icon: MessageCircle, categoryKey: "categories.ai", href: "/tools/pregnancy-assistant", priority: 1, hasAI: true },
  { id: "symptom-analyzer", titleKey: "tools.symptomAnalyzer.title", descriptionKey: "tools.symptomAnalyzer.description", icon: Stethoscope, categoryKey: "categories.ai", href: "/tools/symptom-analyzer", priority: 2, hasAI: true },
  { id: "ai-meal-suggestion", titleKey: "tools.aiMealSuggestion.title", descriptionKey: "tools.aiMealSuggestion.description", icon: Utensils, categoryKey: "categories.ai", href: "/tools/ai-meal-suggestion", priority: 3, hasAI: true },
  { id: "weekly-summary", titleKey: "tools.weeklySummary.title", descriptionKey: "tools.weeklySummary.description", icon: Star, categoryKey: "categories.ai", href: "/tools/weekly-summary", priority: 4, hasAI: true },
  { id: "ai-birth-plan", titleKey: "tools.aiBirthPlan.title", descriptionKey: "tools.aiBirthPlan.description", icon: FileText, categoryKey: "categories.ai", href: "/tools/ai-birth-plan", priority: 5, hasAI: true },
  { id: "smart-appointment-reminder", titleKey: "tools.smartAppointmentReminder.title", descriptionKey: "tools.smartAppointmentReminder.description", icon: Bell, categoryKey: "categories.ai", href: "/tools/smart-appointment-reminder", priority: 6, hasAI: true },
  { id: "ai-baby-name-finder", titleKey: "tools.aiBabyNameFinder.title", descriptionKey: "tools.aiBabyNameFinder.description", icon: Sparkles, categoryKey: "categories.ai", href: "/tools/ai-baby-name-finder", priority: 7, hasAI: true },
  { id: "smart-grocery-list", titleKey: "tools.smartGroceryList.title", descriptionKey: "tools.smartGroceryList.description", icon: ShoppingCart, categoryKey: "categories.ai", href: "/tools/smart-grocery-list", priority: 8, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 🆕 AI TOOLS 2026 (Priority 9-16)
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-sleep-optimizer", titleKey: "tools.aiSleepOptimizer.title", descriptionKey: "tools.aiSleepOptimizer.description", icon: Bed, categoryKey: "categories.ai", href: "/tools/ai-sleep-optimizer", priority: 9, hasAI: true },
  { id: "ai-hospital-bag", titleKey: "tools.aiHospitalBag.title", descriptionKey: "tools.aiHospitalBag.description", icon: Briefcase, categoryKey: "categories.ai", href: "/tools/ai-hospital-bag", priority: 10, hasAI: true },
  { id: "ai-partner-guide", titleKey: "tools.aiPartnerGuide.title", descriptionKey: "tools.aiPartnerGuide.description", icon: HeartHandshake, categoryKey: "categories.ai", href: "/tools/ai-partner-guide", priority: 11, hasAI: true },
  { id: "ai-birth-position", titleKey: "tools.aiBirthPosition.title", descriptionKey: "tools.aiBirthPosition.description", icon: PersonStanding, categoryKey: "categories.ai", href: "/tools/ai-birth-position", priority: 12, hasAI: true },
  { id: "ai-pregnancy-skincare", titleKey: "tools.aiSkincare.title", descriptionKey: "tools.aiSkincare.description", icon: Palette, categoryKey: "categories.ai", href: "/tools/ai-skincare", priority: 13, hasAI: true },
  { id: "ai-nausea-relief", titleKey: "tools.aiNauseaRelief.title", descriptionKey: "tools.aiNauseaRelief.description", icon: Leaf, categoryKey: "categories.ai", href: "/tools/ai-nausea-relief", priority: 14, hasAI: true },
  { id: "ai-budget-planner", titleKey: "tools.aiBudgetPlanner.title", descriptionKey: "tools.aiBudgetPlanner.description", icon: Wallet, categoryKey: "categories.ai", href: "/tools/ai-budget-planner", priority: 15, hasAI: true },
  { id: "ai-bump-photos", titleKey: "tools.aiBumpPhotos.title", descriptionKey: "tools.aiBumpPhotos.description", icon: Camera, categoryKey: "categories.ai", href: "/tools/ai-bump-photos", priority: 16, hasAI: true },

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
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 32, hasAI: true },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 33 },
  { id: "diaper-tracker", titleKey: "tools.diaperTracker.title", descriptionKey: "tools.diaperTracker.description", icon: Baby, categoryKey: "categories.postpartum", href: "/tools/diaper-tracker", priority: 34 },
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

// Get related tools based on category (excluding current tool)
export const getRelatedTools = (currentToolId: string, maxItems: number = 3) => {
  const currentTool = getToolById(currentToolId);
  if (!currentTool) return [];
  
  // Get tools from same category first
  const sameCategoryTools = toolsData.filter(
    t => t.categoryKey === currentTool.categoryKey && t.id !== currentToolId
  );
  
  // If not enough, add AI tools
  const aiTools = toolsData.filter(
    t => t.hasAI && t.id !== currentToolId && !sameCategoryTools.includes(t)
  );
  
  return [...sameCategoryTools, ...aiTools].slice(0, maxItems);
};
