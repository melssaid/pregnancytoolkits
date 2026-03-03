import { Routes, Route, Navigate } from "react-router-dom";
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



// AI 2026 TOOLS
const PregnancyComfort = lazy(() => import("@/pages/tools/PregnancyComfort"));
const AIHospitalBag = lazy(() => import("@/pages/tools/AIHospitalBag"));
const AIPartnerGuide = lazy(() => import("@/pages/tools/AIPartnerGuide"));
const AIBirthPosition = lazy(() => import("@/pages/tools/AIBirthPosition"));
const AIPregnancySkincare = lazy(() => import("@/pages/tools/AIPregnancySkincare"));
const AIBumpPhotos = lazy(() => import("@/pages/tools/AIBumpPhotos"));

// AI WELLNESS
const AIFitnessCoach = lazy(() => import("@/pages/tools/AIFitnessCoach"));
const AIBackPainRelief = lazy(() => import("@/pages/tools/AIBackPainRelief"));
const VitaminTracker = lazy(() => import("@/pages/tools/VitaminTracker"));


// AI LABOR
const AILaborProgressTracker = lazy(() => import("@/pages/tools/AILaborProgressTracker"));
const AIBirthPlanGenerator = lazy(() => import("@/pages/tools/AIBirthPlanGenerator"));

// FERTILITY & PLANNING
const CycleTracker = lazy(() => import("@/pages/tools/CycleTracker"));
const DueDateCalculator = lazy(() => import("@/pages/tools/DueDateCalculator"));

const FertilityAcademy = lazy(() => import("@/pages/tools/FertilityAcademy"));
const NutritionSupplementsGuide = lazy(() => import("@/pages/tools/NutritionSupplementsGuide"));

const PreconceptionCheckup = lazy(() => import("@/pages/tools/PreconceptionCheckup"));

// PREGNANCY TRACKING
const FetalDevelopment3D = lazy(() => import("@/pages/tools/FetalDevelopment3D"));
const SmartKickCounter = lazy(() => import("@/pages/tools/SmartKickCounter"));
const SmartWeightGainAnalyzer = lazy(() => import("@/pages/tools/SmartWeightGainAnalyzer"));

// MENTAL HEALTH
const PostpartumMentalHealthCoach = lazy(() => import("@/pages/tools/PostpartumMentalHealthCoach"));

// MATERNAL HEALTH AWARENESS (merged)
const MaternalHealthAwareness = lazy(() => import("@/pages/tools/MaternalHealthAwareness"));

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
const AIUsageDashboard = lazy(() => import("@/pages/AIUsageDashboard"));
const LandingEN = lazy(() => import("@/pages/LandingEN"));


export function AnimatedRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/en" element={<PageTransition><LandingEN /></PageTransition>} />
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
        <Route path="/tools/smart-pregnancy-plan" element={<Navigate to="/tools/smart-plan" replace />} />
        
        

        {/* PREGNANCY COMFORT (merged sleep + nausea) */}
        <Route path="/tools/pregnancy-comfort" element={<PageTransition><PregnancyComfort /></PageTransition>} />
        <Route path="/tools/ai-sleep-optimizer" element={<Navigate to="/tools/pregnancy-comfort" replace />} />
        <Route path="/tools/ai-nausea-relief" element={<Navigate to="/tools/pregnancy-comfort" replace />} />
        <Route path="/tools/ai-hospital-bag" element={<PageTransition><AIHospitalBag /></PageTransition>} />
        <Route path="/tools/ai-partner-guide" element={<PageTransition><AIPartnerGuide /></PageTransition>} />
        <Route path="/tools/ai-birth-position" element={<PageTransition><AIBirthPosition /></PageTransition>} />
        <Route path="/tools/ai-skincare" element={<PageTransition><AIPregnancySkincare /></PageTransition>} />
        <Route path="/tools/ai-bump-photos" element={<PageTransition><AIBumpPhotos /></PageTransition>} />

        {/* AI WELLNESS */}
        <Route path="/tools/ai-fitness-coach" element={<PageTransition><AIFitnessCoach /></PageTransition>} />
        <Route path="/tools/ai-back-pain-relief" element={<PageTransition><AIBackPainRelief /></PageTransition>} />
        <Route path="/tools/vitamin-tracker" element={<PageTransition><VitaminTracker /></PageTransition>} />
        

        {/* AI LABOR */}
        <Route path="/tools/labor-progress" element={<PageTransition><AILaborProgressTracker /></PageTransition>} />
        <Route path="/tools/ai-birth-plan" element={<PageTransition><AIBirthPlanGenerator /></PageTransition>} />

        {/* FERTILITY & PLANNING */}
        <Route path="/tools/cycle-tracker" element={<PageTransition><CycleTracker /></PageTransition>} />
        <Route path="/tools/due-date-calculator" element={<PageTransition><DueDateCalculator /></PageTransition>} />
        
        <Route path="/tools/fertility-academy" element={<PageTransition><FertilityAcademy /></PageTransition>} />
        <Route path="/tools/nutrition-supplements" element={<PageTransition><NutritionSupplementsGuide /></PageTransition>} />
        <Route path="/tools/tww-companion" element={<Navigate to="/tools/fertility-academy" replace />} />
        <Route path="/tools/preconception-checkup" element={<PageTransition><PreconceptionCheckup /></PageTransition>} />

        {/* LEGACY REDIRECTS — merged fertility tools */}
        <Route path="/tools/fertility-signs" element={<Navigate to="/tools/fertility-academy" replace />} />
        <Route path="/tools/stress-fertility" element={<Navigate to="/tools/fertility-academy" replace />} />
        <Route path="/tools/preconception-nutrition" element={<Navigate to="/tools/nutrition-supplements" replace />} />
        <Route path="/tools/prenatal-vitamins" element={<Navigate to="/tools/nutrition-supplements" replace />} />

        {/* PREGNANCY TRACKING */}
        <Route path="/tools/fetal-growth" element={<PageTransition><FetalDevelopment3D /></PageTransition>} />
        <Route path="/tools/kick-counter" element={<PageTransition><SmartKickCounter /></PageTransition>} />
        <Route path="/tools/weight-gain" element={<PageTransition><SmartWeightGainAnalyzer /></PageTransition>} />

        {/* MENTAL HEALTH */}
        <Route path="/tools/mental-health-coach" element={<PageTransition><PostpartumMentalHealthCoach /></PageTransition>} />

        {/* MATERNAL HEALTH AWARENESS (merged diabetes + preeclampsia) */}
        <Route path="/tools/maternal-health" element={<PageTransition><MaternalHealthAwareness /></PageTransition>} />
        <Route path="/tools/gestational-diabetes" element={<Navigate to="/tools/maternal-health" replace />} />
        <Route path="/tools/preeclampsia-risk" element={<Navigate to="/tools/maternal-health" replace />} />

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
        <Route path="/admin/ai-usage" element={<PageTransition><AIUsageDashboard /></PageTransition>} />
        

        {/* LEGACY REDIRECTS — deleted tools */}
        <Route path="/tools/smart-walking-coach" element={<Navigate to="/tools/ai-fitness-coach" replace />} />
        <Route path="/tools/smart-stretch-reminder" element={<Navigate to="/tools/ai-fitness-coach" replace />} />
        <Route path="/tools/kegel-exercise" element={<Navigate to="/tools/ai-fitness-coach" replace />} />
        <Route path="/tools/smart-snack-planner" element={<Navigate to="/tools/ai-meal-suggestion" replace />} />
        <Route path="/tools/forbidden-foods" element={<Navigate to="/tools/ai-meal-suggestion" replace />} />

        {/* 404 */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </Suspense>
  );
}
