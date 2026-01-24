import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toolsData } from "@/lib/tools-data";

interface RelatedToolsProps {
  currentToolId: string;
  maxItems?: number;
}

// Define tool relationships based on user journey
const toolRelationships: Record<string, string[]> = {
  // Fertility tools → Early Pregnancy
  "ovulation-calculator": ["cycle-tracker", "conception-calculator", "due-date-calculator"],
  "cycle-tracker": ["ovulation-calculator", "conception-calculator", "pregnancy-diary"],
  "conception-calculator": ["ovulation-calculator", "due-date-calculator", "fetal-growth"],
  
  // Early Pregnancy → Tracking
  "due-date-calculator": ["fetal-growth", "pregnancy-milestones", "weekly-summary"],
  "pregnancy-bmi": ["weight-gain", "nutrition-guide", "exercise-guide"],
  "fetal-growth": ["kick-counter", "weekly-summary", "bump-photos"],
  
  // Daily Tracking
  "kick-counter": ["contraction-timer", "fetal-growth", "pregnancy-diary"],
  "weight-gain": ["pregnancy-bmi", "nutrition-guide", "exercise-guide"],
  "water-intake": ["nutrition-guide", "vitamin-tracker", "meal-planner"],
  "vitamin-tracker": ["nutrition-guide", "water-intake", "safe-medications"],
  "bump-photos": ["pregnancy-diary", "pregnancy-milestones", "weekly-summary"],
  "pregnancy-milestones": ["bump-photos", "weekly-summary", "pregnancy-diary"],
  "pregnancy-diary": ["mood-diary", "bump-photos", "pregnancy-milestones"],
  
  // AI Tools
  "pregnancy-assistant": ["symptom-analyzer", "weekly-summary", "ai-meal-suggestion"],
  "symptom-analyzer": ["pregnancy-assistant", "safe-medications", "doctor-questions"],
  "ai-meal-suggestion": ["nutrition-guide", "forbidden-foods", "meal-planner"],
  "weekly-summary": ["fetal-growth", "pregnancy-milestones", "pregnancy-assistant"],
  
  // Health & Nutrition
  "nutrition-guide": ["forbidden-foods", "ai-meal-suggestion", "meal-planner"],
  "forbidden-foods": ["nutrition-guide", "safe-medications", "meal-planner"],
  "meal-planner": ["ai-meal-suggestion", "nutrition-guide", "forbidden-foods"],
  "safe-medications": ["symptom-analyzer", "doctor-questions", "vitamin-tracker"],
  
  // Fitness & Wellness
  "exercise-guide": ["yoga-guide", "kegel-exercises", "breathing-exercises"],
  "yoga-guide": ["breathing-exercises", "exercise-guide", "affirmations"],
  "breathing-exercises": ["yoga-guide", "contraction-timer", "affirmations"],
  "kegel-exercises": ["exercise-guide", "yoga-guide", "birth-plan"],
  
  // Mental Health
  "mood-diary": ["affirmations", "pregnancy-diary", "ppd-screener"],
  "affirmations": ["mood-diary", "breathing-exercises", "yoga-guide"],
  "ppd-screener": ["mood-diary", "doctor-questions", "pregnancy-assistant"],
  
  // Risk Assessment
  "gestational-diabetes": ["nutrition-guide", "exercise-guide", "doctor-questions"],
  "preeclampsia-risk": ["blood-type", "doctor-questions", "symptom-analyzer"],
  "blood-type": ["preeclampsia-risk", "doctor-questions", "safe-medications"],
  
  // Labor & Preparation
  "contraction-timer": ["hospital-bag", "birth-plan", "breathing-exercises"],
  "hospital-bag": ["nursery-checklist", "birth-plan", "contraction-timer"],
  "birth-plan": ["hospital-bag", "doctor-questions", "breathing-exercises"],
  "nursery-checklist": ["baby-budget", "hospital-bag", "vaccination-schedule"],
  "baby-budget": ["nursery-checklist", "hospital-bag", "breastfeeding-tracker"],
  
  // Postpartum & Baby
  "breastfeeding-tracker": ["baby-sleep-tracker", "diaper-tracker", "nutrition-guide"],
  "baby-sleep-tracker": ["breastfeeding-tracker", "diaper-tracker", "baby-growth"],
  "diaper-tracker": ["breastfeeding-tracker", "baby-sleep-tracker", "baby-growth"],
  "baby-growth": ["vaccination-schedule", "baby-sleep-tracker", "diaper-tracker"],
  "vaccination-schedule": ["baby-growth", "doctor-questions", "safe-medications"],
  
  // Support
  "doctor-questions": ["symptom-analyzer", "pregnancy-assistant", "safe-medications"],
};

export function RelatedTools({ currentToolId, maxItems = 3 }: RelatedToolsProps) {
  const { t } = useTranslation();
  
  const relatedIds = toolRelationships[currentToolId] || [];
  const relatedTools = relatedIds
    .map(id => toolsData.find(tool => tool.id === id))
    .filter(Boolean)
    .slice(0, maxItems);
  
  if (relatedTools.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-8"
    >
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <span className="h-1 w-8 rounded-full gradient-primary" />
        Related Tools
      </h3>
      
      <div className="grid gap-3 sm:grid-cols-3">
        {relatedTools.map((tool, index) => {
          if (!tool) return null;
          const Icon = tool.icon;
          
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                to={tool.href}
                className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary group-hover:gradient-primary group-hover:text-white transition-all duration-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {t(tool.titleKey)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t(tool.categoryKey)}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default RelatedTools;
