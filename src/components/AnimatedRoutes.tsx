import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";
import { Suspense, lazy, forwardRef } from "react";
import { Loader2 } from "lucide-react";

// Loading Component with forwardRef for AnimatePresence compatibility
const PageLoader = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
));
PageLoader.displayName = "PageLoader";

// ═══════════════════════════════════════════════════════════════
// LAZY LOADED PAGES - Performance Optimization
// ═══════════════════════════════════════════════════════════════
const Index = lazy(() => import("@/pages/Index"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Contact = lazy(() => import("@/pages/Contact"));

// AI-POWERED CORE TOOLS
const PregnancyAssistant = lazy(() => import("@/pages/tools/PregnancyAssistant"));
const AISymptomAnalyzer = lazy(() => import("@/pages/tools/AISymptomAnalyzer"));
const AIMealSuggestion = lazy(() => import("@/pages/tools/AIMealSuggestion"));
const WeeklySummary = lazy(() => import("@/pages/tools/WeeklySummary"));

const SmartAppointmentReminder = lazy(() => import("@/pages/tools/SmartAppointmentReminder"));
const AIBabyNameFinder = lazy(() => import("@/pages/tools/AIBabyNameFinder"));
const AIPregnancyTipsDaily = lazy(() => import("@/pages/tools/AIPregnancyTipsDaily"));
const AIBirthStoryGenerator = lazy(() => import("@/pages/tools/AIBirthStoryGenerator"));
const SmartGroceryList = lazy(() => import("@/pages/tools/SmartGroceryList"));

// AI WELLNESS & FITNESS TOOLS
const AIPostureCoach = lazy(() => import("@/pages/tools/AIPostureCoach"));
const SmartStretchReminder = lazy(() => import("@/pages/tools/SmartStretchReminder"));
const AIBackPainRelief = lazy(() => import("@/pages/tools/AIBackPainRelief"));
const AIMobilityCoach = lazy(() => import("@/pages/tools/AIMobilityCoach"));
const PregnancySmoothieAI = lazy(() => import("@/pages/tools/PregnancySmoothieAI"));
const AIFitnessCoach = lazy(() => import("@/pages/tools/AIFitnessCoach"));

// 2026 AI TOOLS
const AISleepOptimizer = lazy(() => import("@/pages/tools/AISleepOptimizer"));
const AIHospitalBag = lazy(() => import("@/pages/tools/AIHospitalBag"));
const AIPartnerGuide = lazy(() => import("@/pages/tools/AIPartnerGuide"));
const AIBirthPosition = lazy(() => import("@/pages/tools/AIBirthPosition"));
const AIPregnancySkincare = lazy(() => import("@/pages/tools/AIPregnancySkincare"));
const AINauseaRelief = lazy(() => import("@/pages/tools/AINauseaRelief"));
const AIBudgetPlanner = lazy(() => import("@/pages/tools/AIBudgetPlanner"));
const AILactationPrep = lazy(() => import("@/pages/tools/AILactationPrep"));
const AIBumpPhotos = lazy(() => import("@/pages/tools/AIBumpPhotos"));
const AISmartNutritionTracker = lazy(() => import("@/pages/tools/AISmartNutritionTracker"));

// AI LABOR & MONITORING
const AILaborProgressTracker = lazy(() => import("@/pages/tools/AILaborProgressTracker"));
const AIBirthPlanGenerator = lazy(() => import("@/pages/tools/AIBirthPlanGenerator"));

// FERTILITY & PLANNING
const OvulationCalculator = lazy(() => import("@/pages/tools/OvulationCalculator"));
const CycleTracker = lazy(() => import("@/pages/tools/CycleTracker"));
const DueDateCalculator = lazy(() => import("@/pages/tools/DueDateCalculator"));

// PREGNANCY TRACKING
const FetalDevelopment3D = lazy(() => import("@/pages/tools/FetalDevelopment3D"));
const SmartKickCounter = lazy(() => import("@/pages/tools/SmartKickCounter"));

// NUTRITION & WELLNESS
const VitaminTracker = lazy(() => import("@/pages/tools/VitaminTracker"));

// MENTAL HEALTH
const PostpartumMentalHealthCoach = lazy(() => import("@/pages/tools/PostpartumMentalHealthCoach"));
const SmartWeightGainAnalyzer = lazy(() => import("@/pages/tools/SmartWeightGainAnalyzer"));

// HEALTH MONITORING
const GestationalDiabetes = lazy(() => import("@/pages/tools/GestationalDiabetes"));

// POSTPARTUM & BABY
const BabySleepTracker = lazy(() => import("@/pages/tools/BabySleepTracker"));
const BabyGrowth = lazy(() => import("@/pages/tools/BabyGrowth"));
const DoctorQuestions = lazy(() => import("@/pages/tools/DoctorQuestions"));

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Main Pages */}
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          
          {/* AI-POWERED CORE TOOLS */}
          <Route path="/tools/pregnancy-assistant" element={<PageTransition><PregnancyAssistant /></PageTransition>} />
          <Route path="/tools/symptom-analyzer" element={<PageTransition><AISymptomAnalyzer /></PageTransition>} />
          <Route path="/tools/ai-meal-suggestion" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
          <Route path="/tools/weekly-summary" element={<PageTransition><WeeklySummary /></PageTransition>} />
          
          <Route path="/tools/smart-appointment-reminder" element={<PageTransition><SmartAppointmentReminder /></PageTransition>} />
          <Route path="/tools/ai-baby-name-finder" element={<PageTransition><AIBabyNameFinder /></PageTransition>} />
          <Route path="/tools/ai-pregnancy-tips" element={<PageTransition><AIPregnancyTipsDaily /></PageTransition>} />
          <Route path="/tools/ai-birth-story" element={<PageTransition><AIBirthStoryGenerator /></PageTransition>} />
          <Route path="/tools/smart-grocery-list" element={<PageTransition><SmartGroceryList /></PageTransition>} />

          {/* AI WELLNESS & FITNESS TOOLS */}
          <Route path="/tools/ai-posture-coach" element={<PageTransition><AIPostureCoach /></PageTransition>} />
          <Route path="/tools/smart-stretch-reminder" element={<PageTransition><SmartStretchReminder /></PageTransition>} />
          <Route path="/tools/ai-back-pain-relief" element={<PageTransition><AIBackPainRelief /></PageTransition>} />
          <Route path="/tools/ai-mobility-coach" element={<PageTransition><AIMobilityCoach /></PageTransition>} />
          <Route path="/tools/ai-leg-cramp-preventer" element={<PageTransition><AIMobilityCoach /></PageTransition>} />
          <Route path="/tools/smart-walking-coach" element={<PageTransition><AIMobilityCoach /></PageTransition>} />
          <Route path="/tools/pregnancy-smoothie-ai" element={<PageTransition><PregnancySmoothieAI /></PageTransition>} />
          <Route path="/tools/exercise-guide" element={<PageTransition><AIFitnessCoach /></PageTransition>} />

          {/* AI LABOR & MONITORING */}
          <Route path="/tools/labor-progress" element={<PageTransition><AILaborProgressTracker /></PageTransition>} />
          <Route path="/tools/contraction-timer" element={<PageTransition><AILaborProgressTracker /></PageTransition>} />
          <Route path="/tools/labor-breathing" element={<PageTransition><AILaborProgressTracker /></PageTransition>} />
          <Route path="/tools/breathing-exercises" element={<PageTransition><AILaborProgressTracker /></PageTransition>} />

          {/* FERTILITY & PLANNING */}
          <Route path="/tools/ovulation-calculator" element={<PageTransition><OvulationCalculator /></PageTransition>} />
          <Route path="/tools/cycle-tracker" element={<PageTransition><CycleTracker /></PageTransition>} />
          <Route path="/tools/due-date-calculator" element={<PageTransition><DueDateCalculator /></PageTransition>} />
          <Route path="/tools/conception-calculator" element={<PageTransition><DueDateCalculator /></PageTransition>} />

          {/* PREGNANCY TRACKING */}
          <Route path="/tools/fetal-growth" element={<PageTransition><FetalDevelopment3D /></PageTransition>} />
          <Route path="/tools/kick-counter" element={<PageTransition><SmartKickCounter /></PageTransition>} />
          <Route path="/tools/pregnancy-milestones" element={<PageTransition><WeeklySummary /></PageTransition>} />

          {/* NUTRITION & WELLNESS */}
          <Route path="/tools/water-intake" element={<PageTransition><VitaminTracker /></PageTransition>} />
          <Route path="/tools/vitamin-tracker" element={<PageTransition><VitaminTracker /></PageTransition>} />
          <Route path="/tools/nutrition-guide" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
          <Route path="/tools/meal-planner" element={<PageTransition><AIMealSuggestion /></PageTransition>} />

          {/* MENTAL HEALTH */}
          <Route path="/tools/affirmations" element={<PageTransition><PostpartumMentalHealthCoach /></PageTransition>} />
          <Route path="/tools/mental-health-coach" element={<PageTransition><PostpartumMentalHealthCoach /></PageTransition>} />
          <Route path="/tools/weight-gain" element={<PageTransition><SmartWeightGainAnalyzer /></PageTransition>} />
          <Route path="/tools/mood-tracker" element={<PageTransition><PostpartumMentalHealthCoach /></PageTransition>} />
          <Route path="/tools/smart-weight-gain" element={<PageTransition><SmartWeightGainAnalyzer /></PageTransition>} />

          {/* HEALTH MONITORING */}
          <Route path="/tools/gestational-diabetes" element={<PageTransition><GestationalDiabetes /></PageTransition>} />

          {/* PREPARATION */}
          <Route path="/tools/birth-prep" element={<PageTransition><AIHospitalBag /></PageTransition>} />
          <Route path="/tools/birth-plan" element={<PageTransition><AIBirthPlanGenerator /></PageTransition>} />
          <Route path="/tools/ai-birth-plan" element={<PageTransition><AIBirthPlanGenerator /></PageTransition>} />

          {/* 2026 AI TOOLS */}
          <Route path="/tools/ai-sleep-optimizer" element={<PageTransition><AISleepOptimizer /></PageTransition>} />
          <Route path="/tools/ai-hospital-bag" element={<PageTransition><AIHospitalBag /></PageTransition>} />
          <Route path="/tools/hospital-bag" element={<PageTransition><AIHospitalBag /></PageTransition>} />
          <Route path="/tools/ai-partner-guide" element={<PageTransition><AIPartnerGuide /></PageTransition>} />
          <Route path="/tools/ai-birth-position" element={<PageTransition><AIBirthPosition /></PageTransition>} />
          <Route path="/tools/ai-skincare" element={<PageTransition><AIPregnancySkincare /></PageTransition>} />
          <Route path="/tools/ai-nausea-relief" element={<PageTransition><AINauseaRelief /></PageTransition>} />
          <Route path="/tools/ai-budget-planner" element={<PageTransition><AIBudgetPlanner /></PageTransition>} />
          <Route path="/tools/ai-bump-photos" element={<PageTransition><AIBumpPhotos /></PageTransition>} />
          <Route path="/tools/ai-lactation-prep" element={<PageTransition><AILactationPrep /></PageTransition>} />
          <Route path="/tools/ai-nutrition-tracker" element={<PageTransition><AISmartNutritionTracker /></PageTransition>} />

          {/* POSTPARTUM & BABY */}
          <Route path="/tools/baby-sleep-tracker" element={<PageTransition><BabySleepTracker /></PageTransition>} />
          <Route path="/tools/baby-growth" element={<PageTransition><BabyGrowth /></PageTransition>} />
          <Route path="/tools/doctor-questions" element={<PageTransition><DoctorQuestions /></PageTransition>} />

          {/* 404 */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
