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
// LAZY LOADED PAGES - 35 Consolidated Tools
// ═══════════════════════════════════════════════════════════════
const Index = lazy(() => import("@/pages/Index"));
const SmartDashboard = lazy(() => import("@/pages/SmartDashboard"));
const Settings = lazy(() => import("@/pages/Settings"));
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
const SmartGroceryList = lazy(() => import("@/pages/tools/SmartGroceryList"));

// AI WELLNESS & FITNESS (CONSOLIDATED)
const AIFitnessCoach = lazy(() => import("@/pages/tools/AIFitnessCoach"));
const AIBackPainRelief = lazy(() => import("@/pages/tools/AIBackPainRelief"));

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

// AI LABOR & MONITORING
const AILaborProgressTracker = lazy(() => import("@/pages/tools/AILaborProgressTracker"));
const AIBirthPlanGenerator = lazy(() => import("@/pages/tools/AIBirthPlanGenerator"));

// FERTILITY & PLANNING (CONSOLIDATED)
const CycleTracker = lazy(() => import("@/pages/tools/CycleTracker"));
const DueDateCalculator = lazy(() => import("@/pages/tools/DueDateCalculator"));

// PREGNANCY TRACKING
const FetalDevelopment3D = lazy(() => import("@/pages/tools/FetalDevelopment3D"));
const SmartKickCounter = lazy(() => import("@/pages/tools/SmartKickCounter"));

// NUTRITION & WELLNESS
const VitaminTracker = lazy(() => import("@/pages/tools/VitaminTracker"));
const ForbiddenFoods = lazy(() => import("@/pages/tools/ForbiddenFoods"));

// MENTAL HEALTH
const PostpartumMentalHealthCoach = lazy(() => import("@/pages/tools/PostpartumMentalHealthCoach"));
const SmartWeightGainAnalyzer = lazy(() => import("@/pages/tools/SmartWeightGainAnalyzer"));

// HEALTH MONITORING
const GestationalDiabetes = lazy(() => import("@/pages/tools/GestationalDiabetes"));
const PreeclampsiaRisk = lazy(() => import("@/pages/tools/PreeclampsiaRisk"));

// POSTPARTUM & BABY
const BabySleepTracker = lazy(() => import("@/pages/tools/BabySleepTracker"));
const BabyGrowth = lazy(() => import("@/pages/tools/BabyGrowth"));
const DiaperTracker = lazy(() => import("@/pages/tools/DiaperTracker"));
const BabyGearRecommender = lazy(() => import("@/pages/tools/BabyGearRecommender"));
const VideoLibraryPage = lazy(() => import("@/pages/VideoLibraryPage"));

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Main Pages */}
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><SmartDashboard /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* AI-POWERED CORE TOOLS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Route path="/tools/pregnancy-assistant" element={<PageTransition><PregnancyAssistant /></PageTransition>} />
          <Route path="/tools/symptom-analyzer" element={<PageTransition><AISymptomAnalyzer /></PageTransition>} />
          <Route path="/tools/ai-meal-suggestion" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
          <Route path="/tools/weekly-summary" element={<PageTransition><WeeklySummary /></PageTransition>} />
          <Route path="/tools/smart-appointment-reminder" element={<PageTransition><SmartAppointmentReminder /></PageTransition>} />
          <Route path="/tools/ai-baby-name-finder" element={<PageTransition><AIBabyNameFinder /></PageTransition>} />
          <Route path="/tools/smart-grocery-list" element={<PageTransition><SmartGroceryList /></PageTransition>} />

          {/* MERGED ROUTES: ai-pregnancy-tips, ai-birth-story → weekly-summary */}
          <Route path="/tools/ai-pregnancy-tips" element={<PageTransition><WeeklySummary /></PageTransition>} />
          <Route path="/tools/ai-birth-story" element={<PageTransition><WeeklySummary /></PageTransition>} />
          <Route path="/tools/pregnancy-milestones" element={<PageTransition><WeeklySummary /></PageTransition>} />

          {/* MERGED ROUTES: nutrition tools → ai-meal-suggestion */}
          <Route path="/tools/ai-nutrition-tracker" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
          <Route path="/tools/pregnancy-smoothie-ai" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
          <Route path="/tools/ai-craving-alternatives" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
          <Route path="/tools/nutrition-guide" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
          <Route path="/tools/meal-planner" element={<PageTransition><AIMealSuggestion /></PageTransition>} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* AI WELLNESS & FITNESS (CONSOLIDATED) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Route path="/tools/ai-fitness-coach" element={<PageTransition><AIFitnessCoach /></PageTransition>} />
          <Route path="/tools/ai-back-pain-relief" element={<PageTransition><AIBackPainRelief /></PageTransition>} />

          {/* MERGED ROUTES: fitness tools → ai-fitness-coach */}
          <Route path="/tools/ai-posture-coach" element={<PageTransition><AIFitnessCoach /></PageTransition>} />
          <Route path="/tools/smart-stretch-reminder" element={<PageTransition><AIFitnessCoach /></PageTransition>} />
          <Route path="/tools/ai-mobility-coach" element={<PageTransition><AIFitnessCoach /></PageTransition>} />
          <Route path="/tools/ai-leg-cramp-preventer" element={<PageTransition><AIFitnessCoach /></PageTransition>} />
          <Route path="/tools/smart-walking-coach" element={<PageTransition><AIFitnessCoach /></PageTransition>} />
          <Route path="/tools/exercise-guide" element={<PageTransition><AIFitnessCoach /></PageTransition>} />

          {/* MERGED ROUTES: pain relief tools → ai-back-pain-relief */}
          <Route path="/tools/pregnancy-massage" element={<PageTransition><AIBackPainRelief /></PageTransition>} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* AI LABOR & MONITORING */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Route path="/tools/labor-progress" element={<PageTransition><AILaborProgressTracker /></PageTransition>} />
          <Route path="/tools/contraction-timer" element={<PageTransition><AILaborProgressTracker /></PageTransition>} />
          <Route path="/tools/labor-breathing" element={<PageTransition><AILaborProgressTracker /></PageTransition>} />
          <Route path="/tools/breathing-exercises" element={<PageTransition><AILaborProgressTracker /></PageTransition>} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PREPARATION */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Route path="/tools/birth-prep" element={<PageTransition><AIHospitalBag /></PageTransition>} />
          <Route path="/tools/birth-plan" element={<PageTransition><AIBirthPlanGenerator /></PageTransition>} />
          <Route path="/tools/ai-birth-plan" element={<PageTransition><AIBirthPlanGenerator /></PageTransition>} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 2026 AI TOOLS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
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

          {/* MERGED ROUTES: stress-relief → ai-sleep-optimizer */}
          <Route path="/tools/ai-stress-relief" element={<PageTransition><AISleepOptimizer /></PageTransition>} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* FERTILITY & PLANNING (CONSOLIDATED) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Route path="/tools/cycle-tracker" element={<PageTransition><CycleTracker /></PageTransition>} />
          <Route path="/tools/due-date-calculator" element={<PageTransition><DueDateCalculator /></PageTransition>} />

          {/* MERGED ROUTES: ovulation → cycle-tracker */}
          <Route path="/tools/ovulation-calculator" element={<PageTransition><CycleTracker /></PageTransition>} />
          <Route path="/tools/conception-calculator" element={<PageTransition><DueDateCalculator /></PageTransition>} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PREGNANCY TRACKING */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Route path="/tools/fetal-growth" element={<PageTransition><FetalDevelopment3D /></PageTransition>} />
          <Route path="/tools/kick-counter" element={<PageTransition><SmartKickCounter /></PageTransition>} />
          <Route path="/tools/weight-gain" element={<PageTransition><SmartWeightGainAnalyzer /></PageTransition>} />
          <Route path="/tools/smart-weight-gain" element={<PageTransition><SmartWeightGainAnalyzer /></PageTransition>} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* NUTRITION & WELLNESS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Route path="/tools/water-intake" element={<PageTransition><VitaminTracker /></PageTransition>} />
          <Route path="/tools/vitamin-tracker" element={<PageTransition><VitaminTracker /></PageTransition>} />
          <Route path="/tools/forbidden-foods" element={<PageTransition><ForbiddenFoods /></PageTransition>} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* MENTAL HEALTH */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Route path="/tools/affirmations" element={<PageTransition><PostpartumMentalHealthCoach /></PageTransition>} />
          <Route path="/tools/mental-health-coach" element={<PageTransition><PostpartumMentalHealthCoach /></PageTransition>} />
          <Route path="/tools/mood-tracker" element={<PageTransition><PostpartumMentalHealthCoach /></PageTransition>} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* HEALTH MONITORING */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Route path="/tools/gestational-diabetes" element={<PageTransition><GestationalDiabetes /></PageTransition>} />
          <Route path="/tools/preeclampsia-risk" element={<PageTransition><PreeclampsiaRisk /></PageTransition>} />

          {/* MERGED ROUTES: doctor-questions → symptom-analyzer */}
          <Route path="/tools/doctor-questions" element={<PageTransition><AISymptomAnalyzer /></PageTransition>} />

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* POSTPARTUM & BABY */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <Route path="/tools/baby-sleep-tracker" element={<PageTransition><BabySleepTracker /></PageTransition>} />
          <Route path="/tools/baby-growth" element={<PageTransition><BabyGrowth /></PageTransition>} />
          <Route path="/tools/diaper-tracker" element={<PageTransition><DiaperTracker /></PageTransition>} />
          <Route path="/tools/baby-gear-recommender" element={<PageTransition><BabyGearRecommender /></PageTransition>} />

          {/* VIDEO LIBRARY */}
          <Route path="/videos" element={<PageTransition><VideoLibraryPage /></PageTransition>} />

          {/* 404 */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
