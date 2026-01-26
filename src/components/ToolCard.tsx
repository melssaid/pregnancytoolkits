import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, Brain, Sparkles, ChevronRight, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ToolCardProps {
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  href: string;
  categoryKey: string;
  index: number;
  hasAI?: boolean;
}

// Tool explanations for each tool
const toolExplanations: Record<string, string> = {
  "tools.dueDateCalculator.title": "Enter your last period date to calculate your estimated due date and track pregnancy progress.",
  "tools.pregnancyBmi.title": "Calculate your BMI for personalized weight gain recommendations during pregnancy.",
  "tools.waterIntake.title": "Track daily water intake with smart reminders to stay hydrated.",
  "tools.kickCounter.title": "Monitor your baby's movements to ensure healthy activity patterns.",
  "tools.babyGrowth.title": "Track your baby's weekly growth with size comparisons and milestones.",
  "tools.symptomAnalyzer.title": "Get AI-powered analysis of pregnancy symptoms with personalized advice.",
  "tools.mealSuggestion.title": "Receive personalized meal ideas based on your nutritional needs.",
  "tools.pregnancyAssistant.title": "Ask any pregnancy question and get instant AI answers.",
  "tools.weeklySummary.title": "Get personalized weekly updates on baby's development.",
  "tools.laborTracker.title": "Time contractions and track labor progress with smart alerts.",
  "tools.posture.title": "Improve pregnancy posture with guided exercises to reduce back pain.",
  "tools.walkingCoach.title": "Personalized walking program with AI coaching for each trimester.",
  "tools.backPainRelief.title": "Safe exercises and AI tips to relieve pregnancy-related back pain.",
  "tools.legCrampPreventer.title": "Prevent and manage leg cramps with smart prevention tips.",
  "tools.smoothieAI.title": "AI-generated nutritious smoothie recipes for each trimester.",
  "tools.dailyTips.title": "Daily AI-curated pregnancy tips personalized to your stage.",
  "tools.stretchReminder.title": "Guided stretching routines with AI recommendations.",
  "tools.appointmentReminder.title": "Smart reminders and AI-generated questions for doctor visits.",
};

export function ToolCard({ titleKey, descriptionKey, icon: Icon, href, categoryKey, index, hasAI }: ToolCardProps) {
  const { t } = useTranslation();
  
  const isAITool = hasAI || categoryKey === "categories.ai";
  const explanation = toolExplanations[titleKey];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.02,
        ease: "easeOut"
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={href} className="block">
        <div className={`group relative p-3 rounded-xl bg-card border transition-all duration-200 ${
          isAITool
            ? "border-primary/20 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/40 hover:shadow-md hover:shadow-primary/10"
            : "border-border/50 hover:border-primary/20 hover:bg-muted/30"
        }`}>
          
          {/* Main Row */}
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`relative flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
              isAITool
                ? "bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/20"
                : "bg-secondary text-primary group-hover:bg-primary group-hover:text-white"
            }`}>
              <Icon className="h-5 w-5" />
              {isAITool && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-card">
                  <Brain className="h-2 w-2 text-white" />
                </span>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-semibold truncate transition-colors ${
                  isAITool 
                    ? "text-foreground group-hover:text-primary" 
                    : "text-card-foreground group-hover:text-primary"
                }`}>
                  {t(titleKey)}
                </h3>
                {isAITool && (
                  <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                    <Sparkles className="h-2 w-2" />
                    AI
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {t(descriptionKey)}
              </p>
            </div>
            
            {/* Arrow */}
            <ChevronRight className="flex-shrink-0 h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Explanation Box */}
          {explanation && (
            <div className="mt-2.5 p-2.5 rounded-lg bg-gradient-to-r from-muted/80 to-muted/40 border border-border/30">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
