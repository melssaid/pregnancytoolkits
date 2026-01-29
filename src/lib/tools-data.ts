import {
  Calendar,
  Baby,
  Activity,
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
// PROFESSIONAL PREGNANCY TOOLS - 40 CURATED AI-POWERED TOOLS
// Removed duplicates: blood-type, pregnancy-bmi, forbidden-foods, conception-calculator
// ═══════════════════════════════════════════════════════════════════════════

export const toolsData: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // 🤖 AI-POWERED CORE TOOLS (Priority 1-10)
  // ═══════════════════════════════════════════════════════════════
  { id: "pregnancy-assistant", titleKey: "tools.pregnancyAssistant.title", descriptionKey: "tools.pregnancyAssistant.description", icon: MessageCircle, categoryKey: "categories.ai", href: "/tools/pregnancy-assistant", priority: 1, hasAI: true },
  { id: "symptom-analyzer", titleKey: "tools.symptomAnalyzer.title", descriptionKey: "tools.symptomAnalyzer.description", icon: Stethoscope, categoryKey: "categories.ai", href: "/tools/symptom-analyzer", priority: 2, hasAI: true },
  { id: "ai-meal-suggestion", titleKey: "tools.aiMealSuggestion.title", descriptionKey: "tools.aiMealSuggestion.description", icon: Utensils, categoryKey: "categories.ai", href: "/tools/ai-meal-suggestion", priority: 3, hasAI: true },
  { id: "weekly-summary", titleKey: "tools.weeklySummary.title", descriptionKey: "tools.weeklySummary.description", icon: Star, categoryKey: "categories.ai", href: "/tools/weekly-summary", priority: 4, hasAI: true },
  
  { id: "ai-birth-plan", titleKey: "tools.aiBirthPlan.title", descriptionKey: "tools.aiBirthPlan.description", icon: FileText, categoryKey: "categories.ai", href: "/tools/ai-birth-plan", priority: 5, hasAI: true },
  { id: "smart-appointment-reminder", titleKey: "tools.smartAppointmentReminder.title", descriptionKey: "tools.smartAppointmentReminder.description", icon: Bell, categoryKey: "categories.ai", href: "/tools/smart-appointment-reminder", priority: 6, hasAI: true },
  { id: "ai-baby-name-finder", titleKey: "tools.aiBabyNameFinder.title", descriptionKey: "tools.aiBabyNameFinder.description", icon: Sparkles, categoryKey: "categories.ai", href: "/tools/ai-baby-name-finder", priority: 7, hasAI: true },
  { id: "ai-pregnancy-tips", titleKey: "tools.aiPregnancyTips.title", descriptionKey: "tools.aiPregnancyTips.description", icon: Lightbulb, categoryKey: "categories.ai", href: "/tools/ai-pregnancy-tips", priority: 8, hasAI: true },
  { id: "ai-birth-story", titleKey: "tools.aiBirthStory.title", descriptionKey: "tools.aiBirthStory.description", icon: FileText, categoryKey: "categories.ai", href: "/tools/ai-birth-story", priority: 9, hasAI: true },
  { id: "smart-grocery-list", titleKey: "tools.smartGroceryList.title", descriptionKey: "tools.smartGroceryList.description", icon: ShoppingCart, categoryKey: "categories.ai", href: "/tools/smart-grocery-list", priority: 10, hasAI: true },
  
  // 🆕 10 NEW AI TOOLS FOR 2026 (Priority 11-20)
  { id: "ai-sleep-optimizer", titleKey: "tools.aiSleepOptimizer.title", descriptionKey: "tools.aiSleepOptimizer.description", icon: Bed, categoryKey: "categories.ai", href: "/tools/ai-sleep-optimizer", priority: 11, hasAI: true },
  { id: "ai-hospital-bag", titleKey: "tools.aiHospitalBag.title", descriptionKey: "tools.aiHospitalBag.description", icon: Briefcase, categoryKey: "categories.ai", href: "/tools/ai-hospital-bag", priority: 12, hasAI: true },
  { id: "ai-partner-guide", titleKey: "tools.aiPartnerGuide.title", descriptionKey: "tools.aiPartnerGuide.description", icon: HeartHandshake, categoryKey: "categories.ai", href: "/tools/ai-partner-guide", priority: 13, hasAI: true },
  { id: "ai-birth-position", titleKey: "tools.aiBirthPosition.title", descriptionKey: "tools.aiBirthPosition.description", icon: PersonStanding, categoryKey: "categories.ai", href: "/tools/ai-birth-position", priority: 14, hasAI: true },
  { id: "ai-pregnancy-skincare", titleKey: "tools.aiSkincare.title", descriptionKey: "tools.aiSkincare.description", icon: Palette, categoryKey: "categories.ai", href: "/tools/ai-skincare", priority: 15, hasAI: true },
  { id: "ai-nausea-relief", titleKey: "tools.aiNauseaRelief.title", descriptionKey: "tools.aiNauseaRelief.description", icon: Leaf, categoryKey: "categories.ai", href: "/tools/ai-nausea-relief", priority: 16, hasAI: true },
  { id: "ai-budget-planner", titleKey: "tools.aiBudgetPlanner.title", descriptionKey: "tools.aiBudgetPlanner.description", icon: Wallet, categoryKey: "categories.ai", href: "/tools/ai-budget-planner", priority: 17, hasAI: true },
  
  { id: "ai-lactation-prep", titleKey: "tools.aiLactationPrep.title", descriptionKey: "tools.aiLactationPrep.description", icon: Milk, categoryKey: "categories.ai", href: "/tools/ai-lactation-prep", priority: 19, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 💪 AI WELLNESS & FITNESS TOOLS (Priority 21-26)
  // ═══════════════════════════════════════════════════════════════
  { id: "ai-posture-coach", titleKey: "tools.aiPostureCoach.title", descriptionKey: "tools.aiPostureCoach.description", icon: Users, categoryKey: "categories.wellness", href: "/tools/ai-posture-coach", priority: 21, hasAI: true },
  { id: "smart-stretch-reminder", titleKey: "tools.smartStretchReminder.title", descriptionKey: "tools.smartStretchReminder.description", icon: Activity, categoryKey: "categories.wellness", href: "/tools/smart-stretch-reminder", priority: 22, hasAI: true },
  { id: "ai-back-pain-relief", titleKey: "tools.aiBackPainRelief.title", descriptionKey: "tools.aiBackPainRelief.description", icon: HeartPulse, categoryKey: "categories.wellness", href: "/tools/ai-back-pain-relief", priority: 23, hasAI: true },
  { id: "ai-mobility-coach", titleKey: "tools.aiMobilityCoach.title", descriptionKey: "tools.aiMobilityCoach.description", icon: Footprints, categoryKey: "categories.wellness", href: "/tools/ai-mobility-coach", priority: 24, hasAI: true },
  { id: "pregnancy-smoothie-ai", titleKey: "tools.pregnancySmoothieAI.title", descriptionKey: "tools.pregnancySmoothieAI.description", icon: Salad, categoryKey: "categories.wellness", href: "/tools/pregnancy-smoothie-ai", priority: 25, hasAI: true },
  

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
  // 🤰 PREGNANCY TRACKING (Priority 33-37)
  // ═══════════════════════════════════════════════════════════════
  { id: "fetal-growth", titleKey: "tools.fetalGrowth.title", descriptionKey: "tools.fetalGrowth.description", icon: TrendingUp, categoryKey: "categories.pregnancy", href: "/tools/fetal-growth", priority: 33, hasAI: true },
  { id: "kick-counter", titleKey: "tools.kickCounter.title", descriptionKey: "tools.kickCounter.description", icon: Hand, categoryKey: "categories.pregnancy", href: "/tools/kick-counter", priority: 34, hasAI: true },
  { id: "pregnancy-milestones", titleKey: "tools.pregnancyMilestones.title", descriptionKey: "tools.pregnancyMilestones.description", icon: Milestone, categoryKey: "categories.pregnancy", href: "/tools/pregnancy-milestones", priority: 35 },
  
  { id: "weight-gain", titleKey: "tools.weightGain.title", descriptionKey: "tools.weightGain.description", icon: Scale, categoryKey: "categories.pregnancy", href: "/tools/weight-gain", priority: 37, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // 🥗 NUTRITION & HYDRATION (Priority 38-40)
  // ═══════════════════════════════════════════════════════════════
  { id: "water-intake", titleKey: "tools.waterIntake.title", descriptionKey: "tools.waterIntake.description", icon: GlassWater, categoryKey: "categories.wellness", href: "/tools/water-intake", priority: 38 },
  { id: "vitamin-tracker", titleKey: "tools.vitaminTracker.title", descriptionKey: "tools.vitaminTracker.description", icon: Pill, categoryKey: "categories.wellness", href: "/tools/vitamin-tracker", priority: 39, hasAI: true },
  

  // ═══════════════════════════════════════════════════════════════
  // 🧠 MENTAL HEALTH (Priority 41-42)
  // ═══════════════════════════════════════════════════════════════
  { id: "affirmations", titleKey: "tools.affirmations.title", descriptionKey: "tools.affirmations.description", icon: Heart, categoryKey: "categories.mentalHealth", href: "/tools/affirmations", priority: 41 },
  { id: "postpartum-mental-health", titleKey: "tools.postpartumMentalHealth.title", descriptionKey: "tools.postpartumMentalHealth.description", icon: Brain, categoryKey: "categories.mentalHealth", href: "/tools/mental-health-coach", priority: 42, hasAI: true },

  // ═══════════════════════════════════════════════════════════════
  // ⚠️ HEALTH MONITORING (Priority 43)
  // ═══════════════════════════════════════════════════════════════
  { id: "gestational-diabetes", titleKey: "tools.gestationalDiabetes.title", descriptionKey: "tools.gestationalDiabetes.description", icon: AlertTriangle, categoryKey: "categories.riskAssessment", href: "/tools/gestational-diabetes", priority: 43 },

  // ═══════════════════════════════════════════════════════════════
  // 📋 PREPARATION (Priority 44)
  // ═══════════════════════════════════════════════════════════════
  

  // ═══════════════════════════════════════════════════════════════
  // 👶 POSTPARTUM & BABY (Priority 45-47)
  // ═══════════════════════════════════════════════════════════════
  { id: "baby-sleep-tracker", titleKey: "tools.babySleepTracker.title", descriptionKey: "tools.babySleepTracker.description", icon: Moon, categoryKey: "categories.postpartum", href: "/tools/baby-sleep-tracker", priority: 45, hasAI: true },
  { id: "baby-growth", titleKey: "tools.babyGrowth.title", descriptionKey: "tools.babyGrowth.description", icon: Ruler, categoryKey: "categories.postpartum", href: "/tools/baby-growth", priority: 46 },
  { id: "doctor-questions", titleKey: "tools.doctorQuestions.title", descriptionKey: "tools.doctorQuestions.description", icon: MessageCircle, categoryKey: "categories.postpartum", href: "/tools/doctor-questions", priority: 47, hasAI: true },
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

// ═══════════════════════════════════════════════════════════════════════════
// RELATED TOOLS ENGINE
// ═══════════════════════════════════════════════════════════════════════════

const toolRelationships: Record<string, string[]> = {
  "pregnancy-assistant": ["symptom-analyzer", "weekly-summary", "ai-pregnancy-tips"],
  "symptom-analyzer": ["pregnancy-assistant", "gestational-diabetes", "ai-nausea-relief"],
  "ai-meal-suggestion": ["smart-grocery-list", "pregnancy-smoothie-ai", "vitamin-tracker"],
  "weekly-summary": ["pregnancy-assistant", "pregnancy-milestones", "fetal-growth"],
  
  "smart-appointment-reminder": ["doctor-questions", "vitamin-tracker", "pregnancy-milestones"],
  "ai-baby-name-finder": ["ai-birth-story", "ai-baby-room", "bump-photos"],
  "ai-pregnancy-tips": ["pregnancy-assistant", "weekly-summary", "symptom-analyzer"],
  "ai-birth-story": ["bump-photos", "ai-baby-name-finder", "birth-prep"],
  "smart-grocery-list": ["ai-meal-suggestion", "pregnancy-smoothie-ai", "vitamin-tracker"],
  "ai-sleep-optimizer": ["meditation-yoga", "affirmations", "ai-back-pain-relief"],
  "ai-hospital-bag": ["birth-prep", "labor-breathing", "ai-labor-progress"],
  "ai-partner-guide": ["ai-hospital-bag", "birth-prep", "postpartum-mental-health"],
  "ai-birth-position": ["labor-breathing", "ai-labor-progress", "ai-pelvic-floor"],
  "ai-pregnancy-skincare": ["vitamin-tracker", "water-intake", "meditation-yoga"],
  "ai-pelvic-floor": ["exercise-guide", "ai-mobility-coach", "birth-prep"],
  "ai-nausea-relief": ["symptom-analyzer", "water-intake", "ai-meal-suggestion"],
  "ai-budget-planner": ["ai-hospital-bag", "ai-baby-room", "smart-grocery-list"],
  "ai-baby-room": ["ai-budget-planner", "ai-baby-name-finder", "baby-growth"],
  "ai-lactation-prep": ["ai-hospital-bag", "baby-sleep-tracker", "postpartum-mental-health"],
  "kick-counter": ["fetal-growth", "pregnancy-milestones", "smart-appointment-reminder"],
  "due-date-calculator": ["ovulation-calculator", "pregnancy-milestones", "weekly-summary"],
  "ovulation-calculator": ["cycle-tracker", "due-date-calculator"],
  "cycle-tracker": ["ovulation-calculator", "due-date-calculator"],
  "fetal-growth": ["kick-counter", "weekly-summary", "pregnancy-milestones"],
  "contraction-timer": ["ai-labor-progress", "labor-breathing", "ai-hospital-bag"],
  "labor-breathing": ["contraction-timer", "ai-birth-position", "meditation-yoga"],
  "ai-labor-progress": ["contraction-timer", "labor-breathing", "ai-hospital-bag"],
  "gestational-diabetes": ["ai-meal-suggestion", "symptom-analyzer", "smart-grocery-list"],
  "birth-prep": ["ai-hospital-bag", "labor-breathing", "ai-birth-position"],
  "baby-sleep-tracker": ["baby-growth", "doctor-questions", "ai-lactation-prep"],
  "baby-growth": ["baby-sleep-tracker", "doctor-questions", "ai-lactation-prep"],
  "doctor-questions": ["symptom-analyzer", "smart-appointment-reminder", "pregnancy-assistant"],
  "postpartum-mental-health": ["affirmations", "meditation-yoga", "ai-partner-guide"],
  "affirmations": ["meditation-yoga", "postpartum-mental-health", "ai-sleep-optimizer"],
  "meditation-yoga": ["affirmations", "ai-sleep-optimizer", "labor-breathing"],
  "water-intake": ["vitamin-tracker", "ai-meal-suggestion", "ai-pregnancy-skincare"],
  "vitamin-tracker": ["water-intake", "ai-meal-suggestion", "smart-grocery-list"],
  "pregnancy-milestones": ["weekly-summary", "fetal-growth", "bump-photos"],
  "bump-photos": ["pregnancy-milestones", "ai-birth-story", "weekly-summary"],
  "weight-gain": ["ai-meal-suggestion", "exercise-guide", "smart-grocery-list"],
  "ai-posture-coach": ["ai-back-pain-relief", "smart-stretch-reminder", "exercise-guide"],
  "smart-stretch-reminder": ["ai-posture-coach", "exercise-guide", "ai-mobility-coach"],
  "ai-back-pain-relief": ["ai-posture-coach", "smart-stretch-reminder", "meditation-yoga"],
  "ai-mobility-coach": ["smart-stretch-reminder", "exercise-guide", "ai-pelvic-floor"],
  "pregnancy-smoothie-ai": ["ai-meal-suggestion", "smart-grocery-list", "vitamin-tracker"],
  "exercise-guide": ["smart-stretch-reminder", "ai-mobility-coach", "ai-pelvic-floor"],
};

export const getRelatedTools = (currentToolId: string, count = 3): Tool[] => {
  const relatedIds = toolRelationships[currentToolId] || [];
  const related = relatedIds
    .map((id) => toolsData.find((t) => t.id === id))
    .filter((t): t is Tool => t !== undefined)
    .slice(0, count);

  if (related.length < count) {
    const currentTool = toolsData.find((t) => t.id === currentToolId);
    const sameCategoryTools = toolsData
      .filter(
        (t) =>
          t.categoryKey === currentTool?.categoryKey &&
          t.id !== currentToolId &&
          !relatedIds.includes(t.id)
      )
      .slice(0, count - related.length);
    return [...related, ...sameCategoryTools];
  }

  return related;
};
