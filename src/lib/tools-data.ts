import { useTranslation } from "react-i18next";
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
} from "lucide-react";

export interface Tool {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  categoryKey: string;
  href: string;
  priority: number; // Lower number = higher priority
}

// Tools ordered by pregnancy journey priority
export const toolsData: Tool[] = [
  // 1. PREGNANCY STAGE - Most used during active pregnancy
  {
    id: "due-date-calculator",
    titleKey: "tools.dueDateCalculator.title",
    descriptionKey: "tools.dueDateCalculator.description",
    icon: Baby,
    categoryKey: "categories.pregnancy",
    href: "/tools/due-date-calculator",
    priority: 1,
  },
  {
    id: "pregnancy-bmi",
    titleKey: "tools.pregnancyBmi.title",
    descriptionKey: "tools.pregnancyBmi.description",
    icon: Calculator,
    categoryKey: "categories.pregnancy",
    href: "/tools/pregnancy-bmi",
    priority: 2,
  },
  {
    id: "fetal-growth",
    titleKey: "tools.fetalGrowth.title",
    descriptionKey: "tools.fetalGrowth.description",
    icon: TrendingUp,
    categoryKey: "categories.pregnancy",
    href: "/tools/fetal-growth",
    priority: 3,
  },
  {
    id: "kick-counter",
    titleKey: "tools.kickCounter.title",
    descriptionKey: "tools.kickCounter.description",
    icon: Hand,
    categoryKey: "categories.pregnancy",
    href: "/tools/kick-counter",
    priority: 4,
  },
  
  // 2. RISK ASSESSMENT - Important health monitoring
  {
    id: "gestational-diabetes",
    titleKey: "tools.gestationalDiabetes.title",
    descriptionKey: "tools.gestationalDiabetes.description",
    icon: AlertTriangle,
    categoryKey: "categories.riskAssessment",
    href: "/tools/gestational-diabetes",
    priority: 5,
  },
  {
    id: "preeclampsia-risk",
    titleKey: "tools.preeclampsiaRisk.title",
    descriptionKey: "tools.preeclampsiaRisk.description",
    icon: Heart,
    categoryKey: "categories.riskAssessment",
    href: "/tools/preeclampsia-risk",
    priority: 6,
  },
  
  // 3. WELLNESS & REFERENCE - Daily use tools
  {
    id: "safe-medications",
    titleKey: "tools.safeMedications.title",
    descriptionKey: "tools.safeMedications.description",
    icon: Pill,
    categoryKey: "categories.reference",
    href: "/tools/safe-medications",
    priority: 7,
  },
  {
    id: "exercise-guide",
    titleKey: "tools.exerciseGuide.title",
    descriptionKey: "tools.exerciseGuide.description",
    icon: Dumbbell,
    categoryKey: "categories.wellness",
    href: "/tools/exercise-guide",
    priority: 8,
  },
  {
    id: "water-intake",
    titleKey: "tools.waterIntake.title",
    descriptionKey: "tools.waterIntake.description",
    icon: GlassWater,
    categoryKey: "categories.wellness",
    href: "/tools/water-intake",
    priority: 9,
  },
  {
    id: "vaccination-schedule",
    titleKey: "tools.vaccinationSchedule.title",
    descriptionKey: "tools.vaccinationSchedule.description",
    icon: Syringe,
    categoryKey: "categories.reference",
    href: "/tools/vaccination-schedule",
    priority: 10,
  },
  
  // 4. PREPARATION & LABOR
  {
    id: "hospital-bag",
    titleKey: "tools.hospitalBag.title",
    descriptionKey: "tools.hospitalBag.description",
    icon: CheckSquare,
    categoryKey: "categories.preparation",
    href: "/tools/hospital-bag",
    priority: 11,
  },
  {
    id: "contraction-timer",
    titleKey: "tools.contractionTimer.title",
    descriptionKey: "tools.contractionTimer.description",
    icon: Timer,
    categoryKey: "categories.labor",
    href: "/tools/contraction-timer",
    priority: 12,
  },
  
  // 5. POSTPARTUM
  {
    id: "ppd-screener",
    titleKey: "tools.ppdScreener.title",
    descriptionKey: "tools.ppdScreener.description",
    icon: Brain,
    categoryKey: "categories.mentalHealth",
    href: "/tools/ppd-screener",
    priority: 13,
  },
  {
    id: "breastfeeding-tracker",
    titleKey: "tools.breastfeedingTracker.title",
    descriptionKey: "tools.breastfeedingTracker.description",
    icon: CircleDot,
    categoryKey: "categories.postpartum",
    href: "/tools/breastfeeding-tracker",
    priority: 14,
  },
  
  // 6. FERTILITY & PLANNING (Pre-pregnancy)
  {
    id: "ovulation-calculator",
    titleKey: "tools.ovulationCalculator.title",
    descriptionKey: "tools.ovulationCalculator.description",
    icon: Calendar,
    categoryKey: "categories.fertility",
    href: "/tools/ovulation-calculator",
    priority: 15,
  },
  {
    id: "cycle-tracker",
    titleKey: "tools.cycleTracker.title",
    descriptionKey: "tools.cycleTracker.description",
    icon: Activity,
    categoryKey: "categories.menstrualHealth",
    href: "/tools/cycle-tracker",
    priority: 16,
  },
  
  // 7. GENETICS
  {
    id: "blood-type",
    titleKey: "tools.bloodType.title",
    descriptionKey: "tools.bloodType.description",
    icon: Droplet,
    categoryKey: "categories.genetics",
    href: "/tools/blood-type",
    priority: 17,
  },
];

// Category keys for filtering
export const categoryKeys = [
  "categories.all",
  "categories.pregnancy",
  "categories.riskAssessment",
  "categories.wellness",
  "categories.reference",
  "categories.preparation",
  "categories.labor",
  "categories.postpartum",
  "categories.mentalHealth",
  "categories.fertility",
  "categories.menstrualHealth",
  "categories.genetics",
];

// Get sorted tools by priority
export const getSortedTools = () => {
  return [...toolsData].sort((a, b) => a.priority - b.priority);
};
