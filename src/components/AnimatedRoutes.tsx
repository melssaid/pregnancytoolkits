import { Routes, Route, useLocation } from "react-router-dom";
import { PageTransition } from "./PageTransition";
import { Suspense, lazy } from "react";
import { PageSkeleton } from "./PageSkeleton";

// ═══════════════════════════════════════════════════════════════
// LAZY LOADED PAGES - 35 Curated Professional Tools
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
const WellnessDiary = lazy(() => import("@/pages/tools/AISymptomAnalyzer"));
const AIMealSuggestion = lazy(() => import("@/pages/tools/AIMealSuggestion"));
const WeeklySummary = lazy(() => import("@/pages/tools/WeeklySummary"));
const SmartAppointmentReminder = lazy(() => import("@/pages/tools/SmartAppointmentReminder"));
const AICravingAlternatives = lazy(() => import("@/pages/tools/AICravingAlternatives"));
const SmartGroceryList = lazy(() => import("@/pages/tools/SmartGroceryList"));
const SmartPregnancyPlan = lazy(() => import("@/pages/tools/SmartPregnancyPlan"));
const SmartWalkingCoach = lazy(() => import("@/pages/tools/SmartWalkingCoach"));
const SmartStretchReminder = lazy(() => import("@/pages/tools/SmartStretchReminder"));
const SmartSnackPlanner = lazy(() => import("@/pages/tools/SmartSnackPlanner"));

// AI 2026 TOOLS
const AISleepOptimizer = lazy(() => import("@/pages/tools/AISleepOptimizer"));
const AIHospitalBag = lazy(() => import("@/pages/tools/AIHospitalBag"));
const AIPartnerGuide = lazy(() => import("@/pages/tools/AIPartnerGuide"));
const AIBirthPosition = lazy(() => import("@/pages/tools/AIBirthPosition"));
const AIPregnancySkincare = lazy(() => import("@/pages/tools/AIPregnancySkincare"));
const AINauseaRelief = lazy(() => import("@/pages/tools/AINauseaRelief"));
const AIBumpPhotos = lazy(() => import("@/pages/tools/AIBumpPhotos"));

// AI WELLNESS
const AIFitnessCoach = lazy(() => import("@/pages/tools/AIFitnessCoach"));
const AIBackPainRelief = lazy(() => import("@/pages/tools/AIBackPainRelief"));
const VitaminTracker = lazy(() => import("@/pages/tools/VitaminTracker"));
const ForbiddenFoods = lazy(() => import("@/pages/tools/ForbiddenFoods"));

// AI LABOR
const AILaborProgressTracker = lazy(() => import("@/pages/tools/AILaborProgressTracker"));
const AIBirthPlanGenerator = lazy(() => import("@/pages/tools/AIBirthPlanGenerator"));

// FERTILITY
const CycleTracker = lazy(() => import("@/pages/tools/CycleTracker"));
const DueDateCalculator = lazy(() => import("@/pages/tools/DueDateCalculator"));

// PREGNANCY TRACKING
const FetalDevelopment3D = lazy(() => import("@/pages/tools/FetalDevelopment3D"));
const SmartKickCounter = lazy(() => import("@/pages/tools/SmartKickCounter"));
const SmartWeightGainAnalyzer = lazy(() => import("@/pages/tools/SmartWeightGainAnalyzer"));

// MENTAL HEALTH
const PostpartumMentalHealthCoach = lazy(() => import("@/pages/tools/PostpartumMentalHealthCoach"));

// SELF-CHECK
const GestationalDiabetes = lazy(() => import("@/pages/tools/GestationalDiabetes"));
const PreeclampsiaRisk = lazy(() => import("@/pages/tools/PreeclampsiaRisk"));

// PREPARATION
const BabyGearRecommender = lazy(() => import("@/pages/tools/BabyGearRecommender"));

// POSTPARTUM
const AILactationPrep = lazy(() => import("@/pages/tools/AILactationPrep"));
const PostpartumRecoveryGuide = lazy(() => import("@/pages/tools/PostpartumRecoveryGuide"));
const BabyCryTranslator = lazy(() => import("@/pages/tools/BabyCryTranslator"));
const BabySleepTracker = lazy(() => import("@/pages/tools/BabySleepTracker"));
const BabyGrowth = lazy(() => import("@/pages/tools/BabyGrowth"));
const DiaperTracker = lazy(() => import("@/pages/tools/DiaperTracker"));

// VIDEO LIBRARY
const VideoLibraryPage = lazy(() => import("@/pages/VideoLibraryPage"));
const Splash = lazy(() => import("@/pages/Splash"));

export function AnimatedRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><SmartDashboard /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        
        {/* AI-POWERED CORE TOOLS */}
        <Route path="/tools/pregnancy-assistant" element={<PageTransition><PregnancyAssistant /></PageTransition>} />
        <Route path="/tools/wellness-diary" element={<PageTransition><WellnessDiary /></PageTransition>} />
        <Route path="/tools/ai-meal-suggestion" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
        <Route path="/tools/weekly-summary" element={<PageTransition><WeeklySummary /></PageTransition>} />
        <Route path="/tools/smart-appointment-reminder" element={<PageTransition><SmartAppointmentReminder /></PageTransition>} />
        <Route path="/tools/ai-craving-alternatives" element={<PageTransition><AICravingAlternatives /></PageTransition>} />
        <Route path="/tools/smart-grocery-list" element={<PageTransition><SmartGroceryList /></PageTransition>} />
        <Route path="/tools/smart-plan" element={<PageTransition><SmartPregnancyPlan /></PageTransition>} />
        <Route path="/tools/smart-walking-coach" element={<PageTransition><SmartWalkingCoach /></PageTransition>} />
        <Route path="/tools/smart-stretch-reminder" element={<PageTransition><SmartStretchReminder /></PageTransition>} />
        <Route path="/tools/smart-snack-planner" element={<PageTransition><SmartSnackPlanner /></PageTransition>} />

        {/* AI 2026 TOOLS */}
        <Route path="/tools/ai-sleep-optimizer" element={<PageTransition><AISleepOptimizer /></PageTransition>} />
        <Route path="/tools/ai-hospital-bag" element={<PageTransition><AIHospitalBag /></PageTransition>} />
        <Route path="/tools/ai-partner-guide" element={<PageTransition><AIPartnerGuide /></PageTransition>} />
        <Route path="/tools/ai-birth-position" element={<PageTransition><AIBirthPosition /></PageTransition>} />
        <Route path="/tools/ai-skincare" element={<PageTransition><AIPregnancySkincare /></PageTransition>} />
        <Route path="/tools/ai-nausea-relief" element={<PageTransition><AINauseaRelief /></PageTransition>} />
        <Route path="/tools/ai-bump-photos" element={<PageTransition><AIBumpPhotos /></PageTransition>} />

        {/* AI WELLNESS */}
        <Route path="/tools/ai-fitness-coach" element={<PageTransition><AIFitnessCoach /></PageTransition>} />
        <Route path="/tools/ai-back-pain-relief" element={<PageTransition><AIBackPainRelief /></PageTransition>} />
        <Route path="/tools/vitamin-tracker" element={<PageTransition><VitaminTracker /></PageTransition>} />
        <Route path="/tools/forbidden-foods" element={<PageTransition><ForbiddenFoods /></PageTransition>} />

        {/* AI LABOR */}
        <Route path="/tools/labor-progress" element={<PageTransition><AILaborProgressTracker /></PageTransition>} />
        <Route path="/tools/ai-birth-plan" element={<PageTransition><AIBirthPlanGenerator /></PageTransition>} />

        {/* FERTILITY */}
        <Route path="/tools/cycle-tracker" element={<PageTransition><CycleTracker /></PageTransition>} />
        <Route path="/tools/due-date-calculator" element={<PageTransition><DueDateCalculator /></PageTransition>} />

        {/* PREGNANCY TRACKING */}
        <Route path="/tools/fetal-growth" element={<PageTransition><FetalDevelopment3D /></PageTransition>} />
        <Route path="/tools/kick-counter" element={<PageTransition><SmartKickCounter /></PageTransition>} />
        <Route path="/tools/weight-gain" element={<PageTransition><SmartWeightGainAnalyzer /></PageTransition>} />

        {/* MENTAL HEALTH */}
        <Route path="/tools/mental-health-coach" element={<PageTransition><PostpartumMentalHealthCoach /></PageTransition>} />

        {/* SELF-CHECK */}
        <Route path="/tools/gestational-diabetes" element={<PageTransition><GestationalDiabetes /></PageTransition>} />
        <Route path="/tools/preeclampsia-risk" element={<PageTransition><PreeclampsiaRisk /></PageTransition>} />

        {/* PREPARATION */}
        <Route path="/tools/baby-gear-recommender" element={<PageTransition><BabyGearRecommender /></PageTransition>} />

        {/* POSTPARTUM */}
        <Route path="/tools/ai-lactation-prep" element={<PageTransition><AILactationPrep /></PageTransition>} />
        <Route path="/tools/postpartum-recovery" element={<PageTransition><PostpartumRecoveryGuide /></PageTransition>} />
        <Route path="/tools/baby-cry-translator" element={<PageTransition><BabyCryTranslator /></PageTransition>} />
        <Route path="/tools/baby-sleep-tracker" element={<PageTransition><BabySleepTracker /></PageTransition>} />
        <Route path="/tools/baby-growth" element={<PageTransition><BabyGrowth /></PageTransition>} />
        <Route path="/tools/diaper-tracker" element={<PageTransition><DiaperTracker /></PageTransition>} />

        {/* VIDEO LIBRARY */}
        <Route path="/videos" element={<PageTransition><VideoLibraryPage /></PageTransition>} />

        {/* SPLASH SCREEN */}
        <Route path="/splash" element={<Splash />} />

        {/* 404 */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </Suspense>
  );
}
