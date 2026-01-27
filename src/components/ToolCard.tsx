import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon, ChevronRight, Info } from "lucide-react";
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
  "tools.pregnancyAssistant.title": "Ask any pregnancy question and get instant AI-powered answers.",
  "tools.symptomAnalyzer.title": "Describe symptoms and receive AI analysis with relief tips.",
  "tools.aiMealSuggestion.title": "Get personalized meal ideas based on your trimester.",
  "tools.weeklySummary.title": "Receive a personalized weekly update on your baby's development.",
  "tools.aiPregnancyJournal.title": "Document your journey with AI-enhanced prompts.",
  "tools.smartAppointmentReminder.title": "Never miss an appointment with smart reminders.",
  "tools.aiBabyNameFinder.title": "Discover perfect baby names with AI suggestions.",
  "tools.aiPregnancyTips.title": "Get daily AI-curated tips for your pregnancy stage.",
  "tools.aiBirthStory.title": "Create a beautiful birth story with AI assistance.",
  "tools.smartGroceryList.title": "Generate smart pregnancy-safe grocery lists.",

  // 🆕 10 NEW AI TOOLS 2026
  "tools.aiSleepOptimizer.title": "AI-powered sleep analysis with relaxation techniques.",
  "tools.aiHospitalBag.title": "Smart hospital bag checklist personalized for you.",
  "tools.aiPartnerGuide.title": "Support tips for partners during pregnancy.",
  "tools.aiBirthPosition.title": "Optimal birth positions based on your situation.",
  "tools.aiPregnancySkincare.title": "Safe skincare routine for your pregnancy stage.",
  "tools.aiPelvicFloor.title": "Guided pelvic floor exercises with progress tracking.",
  "tools.aiNauseaRelief.title": "Personalized tips to manage morning sickness.",
  "tools.aiBudgetPlanner.title": "Plan your pregnancy and baby budget smartly.",
  "tools.aiBabyRoom.title": "AI-generated nursery design ideas.",
  "tools.aiLactationPrep.title": "Prepare for breastfeeding with expert AI guidance.",

  // 💪 AI Wellness & Fitness
  "tools.aiPostureCoach.title": "Improve posture with guided exercises.",
  "tools.smartStretchReminder.title": "Personalized stretching routines for your trimester.",
  "tools.aiBackPainRelief.title": "Safe exercises to relieve pregnancy back pain.",
  "tools.aiMobilityCoach.title": "Walking and leg cramp prevention program.",
  "tools.pregnancySmoothieAI.title": "Nutritious smoothie recipes for each stage.",
  "tools.exerciseGuide.title": "Safe workout routines for pregnant women.",

  // 🏥 Labor & Monitoring
  "tools.aiLaborProgress.title": "Track contractions and get AI analysis.",
  "tools.contractionTimer.title": "Time contractions to know when to go.",
  "tools.laborBreathing.title": "Guided breathing for labor pain management.",

  // 🔄 Fertility & Planning
  "tools.ovulationCalculator.title": "Calculate your fertile window.",
  "tools.cycleTracker.title": "Track your menstrual cycle patterns.",
  "tools.dueDateCalculator.title": "Calculate your estimated due date.",

  // 🤰 Pregnancy Tracking
  "tools.fetalGrowth.title": "See your baby's weekly growth updates.",
  "tools.kickCounter.title": "Monitor your baby's movement patterns.",
  "tools.pregnancyMilestones.title": "Track important pregnancy milestones.",
  "tools.bumpPhotos.title": "Create a photo timeline of your bump.",
  "tools.pregnancyBmi.title": "Calculate BMI for weight recommendations.",
  "tools.weightGain.title": "Track weight gain with recommendations.",

  // 🥗 Nutrition & Hydration
  "tools.waterIntake.title": "Track water intake with reminders.",
  "tools.vitaminTracker.title": "Track prenatal vitamins with AI advice.",
  "tools.forbiddenFoods.title": "Foods to avoid during pregnancy.",
  "tools.meditationYoga.title": "Guided meditation and yoga sessions.",

  // 🧠 Mental Health
  "tools.affirmations.title": "Daily positive affirmations for you.",
  "tools.postpartumMentalHealth.title": "AI mental health screening and support.",

  // ⚠️ Health Monitoring
  "tools.gestationalDiabetes.title": "Risk assessment for gestational diabetes.",
  "tools.bloodType.title": "Blood type compatibility information.",

  // 📋 Preparation
  "tools.birthPrep.title": "Complete birth preparation checklist.",

  // 👶 Postpartum & Baby
  "tools.babySleepTracker.title": "Track baby's sleep with AI insights.",
  "tools.babyGrowth.title": "Monitor baby growth with percentiles.",
  "tools.doctorQuestions.title": "AI-generated questions for your doctor.",
};

export function ToolCard({ titleKey, descriptionKey, icon: Icon, href, categoryKey, index, hasAI }: ToolCardProps) {
  const { t } = useTranslation();
  
  const isAITool = hasAI || categoryKey === "categories.ai";
  const explanation = toolExplanations[titleKey];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.015, 0.15) }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={href} className="block">
        <div className={`group relative p-2.5 rounded-lg bg-card border transition-all duration-150 ${
          isAITool
            ? "border-primary/15 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/30"
            : "border-border/40 hover:border-primary/20 hover:bg-muted/20"
        }`}>
          
          {/* Main Row */}
          <div className="flex items-center gap-2.5">
            {/* Icon */}
            <div className={`relative flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 ${
              isAITool
                ? "bg-gradient-to-br from-primary to-accent text-white shadow-sm"
                : "bg-secondary text-primary group-hover:bg-primary group-hover:text-white"
            }`}>
              <Icon className="h-4 w-4" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-xs font-semibold truncate transition-colors ${
                isAITool 
                  ? "text-foreground group-hover:text-primary" 
                  : "text-card-foreground group-hover:text-primary"
              }`}>
                {t(titleKey)}
              </h3>
              <p className="text-[10px] text-muted-foreground truncate">
                {t(descriptionKey)}
              </p>
            </div>
            
            {/* Arrow */}
            <ChevronRight className="flex-shrink-0 h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>

          {/* Explanation Box - Compact */}
          {explanation && (
            <div className="mt-2 p-2 rounded-md bg-muted/50 border border-border/20">
              <div className="flex items-start gap-1.5">
                <Info className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-[9px] text-muted-foreground leading-relaxed line-clamp-2">
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
