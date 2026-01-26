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

// Tool explanations organized by category
const toolExplanations: Record<string, string> = {
  // 🤖 AI Core Tools
  "tools.pregnancyAssistant.title": "Ask any pregnancy question and get instant AI-powered answers tailored to your stage.",
  "tools.symptomAnalyzer.title": "Describe your symptoms and receive AI analysis with relief tips and when to seek care.",
  "tools.aiMealSuggestion.title": "Get personalized meal ideas based on your trimester, cravings, and nutritional needs.",
  "tools.weeklySummary.title": "Receive a personalized weekly update on your baby's development and body changes.",
  "tools.aiPregnancyJournal.title": "Document your pregnancy journey with AI-enhanced prompts and memory keeping.",
  "tools.smartAppointmentReminder.title": "Never miss an appointment with smart reminders and AI-generated doctor questions.",
  "tools.aiBabyNameFinder.title": "Discover perfect baby names with AI suggestions based on your preferences.",
  "tools.aiPregnancyTips.title": "Get daily AI-curated tips personalized to your pregnancy stage.",
  "tools.aiBirthStory.title": "Create a beautiful birth story with AI-assisted writing and prompts.",
  "tools.smartGroceryList.title": "Generate smart pregnancy-safe grocery lists based on your meal plans.",

  // 💪 AI Wellness & Fitness
  "tools.aiPostureCoach.title": "Improve your pregnancy posture with guided exercises to reduce back pain.",
  "tools.smartStretchReminder.title": "Get personalized stretching routines with AI recommendations for your trimester.",
  "tools.aiBackPainRelief.title": "Safe exercises and AI tips to relieve pregnancy-related back pain.",
  "tools.aiLegCrampPreventer.title": "Prevent and manage leg cramps with smart prevention checklist and relief tips.",
  "tools.smartWalkingCoach.title": "Personalized walking program with AI coaching adapted to each trimester.",
  "tools.pregnancySmoothieAI.title": "AI-generated nutritious smoothie recipes tailored for each pregnancy stage.",
  "tools.exerciseGuide.title": "Safe workout routines designed specifically for pregnant women.",

  // 🏥 Labor & Monitoring
  "tools.aiLaborProgress.title": "Track contractions and get AI analysis of your labor progress with hospital alerts.",
  "tools.contractionTimer.title": "Time your contractions accurately to know when it's time for the hospital.",
  "tools.laborBreathing.title": "Guided breathing exercises to help manage labor pain and stay calm.",

  // 🔄 Fertility & Planning
  "tools.ovulationCalculator.title": "Calculate your fertile window to maximize your chances of conception.",
  "tools.cycleTracker.title": "Track your menstrual cycle to understand your fertility patterns.",
  "tools.dueDateCalculator.title": "Enter your last period date to calculate your estimated due date.",

  // 🤰 Pregnancy Tracking
  "tools.fetalGrowth.title": "See your baby's weekly growth with size comparisons and development updates.",
  "tools.kickCounter.title": "Monitor your baby's movements to ensure healthy activity patterns.",
  "tools.pregnancyMilestones.title": "Track important pregnancy milestones and celebrate each achievement.",
  "tools.bumpPhotos.title": "Create a beautiful photo timeline of your growing bump.",
  "tools.pregnancyBmi.title": "Calculate your BMI for personalized weight gain recommendations.",

  // 🥗 Nutrition & Hydration
  "tools.waterIntake.title": "Track daily water intake with smart reminders to stay hydrated.",
  "tools.vitaminTracker.title": "Track your prenatal vitamins with AI advice on optimal timing.",
  "tools.forbiddenFoods.title": "Quick reference guide for foods to avoid during pregnancy.",
  "tools.meditationYoga.title": "Guided meditation and yoga sessions designed for pregnancy.",

  // 🧠 Mental Health
  "tools.affirmations.title": "Daily positive affirmations to boost your mood and confidence.",
  "tools.postpartumMentalHealth.title": "AI-powered mental health screening and support resources.",
  "tools.weightGain.title": "Track your pregnancy weight gain with personalized recommendations.",

  // ⚠️ Health Monitoring
  "tools.gestationalDiabetes.title": "Risk assessment tool for gestational diabetes with lifestyle tips.",
  "tools.bloodType.title": "Blood type compatibility information for you and your baby.",

  // 📋 Preparation
  "tools.birthPrep.title": "Complete birth preparation checklist and planning guide.",

  // 👶 Postpartum & Baby
  "tools.babySleepTracker.title": "Track your baby's sleep patterns with AI-powered insights.",
  "tools.babyGrowth.title": "Monitor your baby's growth with percentile charts and milestones.",
  "tools.doctorQuestions.title": "AI-generated questions to ask at your next doctor appointment.",
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
