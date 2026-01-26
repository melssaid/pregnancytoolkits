import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Contact from "@/pages/Contact";

// ═══════════════════════════════════════════════════════════════
// AI-POWERED TOOLS (8 tools)
// ═══════════════════════════════════════════════════════════════
import PregnancyAssistant from "@/pages/tools/PregnancyAssistant";
import AISymptomAnalyzer from "@/pages/tools/AISymptomAnalyzer";
import AIMealSuggestion from "@/pages/tools/AIMealSuggestion";
import WeeklySummary from "@/pages/tools/WeeklySummary";
import AIPregnancyJournal from "@/pages/tools/AIPregnancyJournal";
import AIBabyNameFinder from "@/pages/tools/AIBabyNameFinder";
import AIBirthStoryGenerator from "@/pages/tools/AIBirthStoryGenerator";
import SmartGroceryList from "@/pages/tools/SmartGroceryList";

// ═══════════════════════════════════════════════════════════════
// FERTILITY & PLANNING (3 tools)
// ═══════════════════════════════════════════════════════════════
import OvulationCalculator from "@/pages/tools/OvulationCalculator";
import CycleTracker from "@/pages/tools/CycleTracker";
import DueDateCalculator from "@/pages/tools/DueDateCalculator";

// ═══════════════════════════════════════════════════════════════
// PREGNANCY TRACKING (5 tools)
// ═══════════════════════════════════════════════════════════════
import FetalDevelopment3D from "@/pages/tools/FetalDevelopment3D";
import SmartKickCounter from "@/pages/tools/SmartKickCounter";
import PregnancyMilestones from "@/pages/tools/PregnancyMilestones";
import BumpPhotos from "@/pages/tools/BumpPhotos";
import PregnancyBMI from "@/pages/tools/PregnancyBMI";

// ═══════════════════════════════════════════════════════════════
// WELLNESS & NUTRITION (5 tools)
// ═══════════════════════════════════════════════════════════════
import WaterIntake from "@/pages/tools/WaterIntake";
import VitaminTracker from "@/pages/tools/VitaminTracker";
import ForbiddenFoods from "@/pages/tools/ForbiddenFoods";
import AIFitnessCoach from "@/pages/tools/AIFitnessCoach";
import PregnancyMeditationYoga from "@/pages/tools/PregnancyMeditationYoga";

// ═══════════════════════════════════════════════════════════════
// MENTAL HEALTH (3 tools)
// ═══════════════════════════════════════════════════════════════
import Affirmations from "@/pages/tools/Affirmations";
import PostpartumMentalHealthCoach from "@/pages/tools/PostpartumMentalHealthCoach";
import SmartWeightGainAnalyzer from "@/pages/tools/SmartWeightGainAnalyzer";

// ═══════════════════════════════════════════════════════════════
// HEALTH MONITORING (2 tools)
// ═══════════════════════════════════════════════════════════════
import GestationalDiabetes from "@/pages/tools/GestationalDiabetes";
import BloodType from "@/pages/tools/BloodType";

// ═══════════════════════════════════════════════════════════════
// LABOR & PREPARATION (3 tools)
// ═══════════════════════════════════════════════════════════════
import ContractionPatternAnalyzer from "@/pages/tools/ContractionPatternAnalyzer";
import LaborBreathingCoach from "@/pages/tools/LaborBreathingCoach";
import BirthPrepGuide from "@/pages/tools/BirthPrepGuide";

// ═══════════════════════════════════════════════════════════════
// POSTPARTUM & BABY (3 tools)
// ═══════════════════════════════════════════════════════════════
import BabySleepTracker from "@/pages/tools/BabySleepTracker";
import BabyGrowth from "@/pages/tools/BabyGrowth";
import DoctorQuestions from "@/pages/tools/DoctorQuestions";

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Main Pages */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* AI-POWERED TOOLS */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Route path="/tools/pregnancy-assistant" element={<PageTransition><PregnancyAssistant /></PageTransition>} />
        <Route path="/tools/symptom-analyzer" element={<PageTransition><AISymptomAnalyzer /></PageTransition>} />
        <Route path="/tools/ai-meal-suggestion" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
        <Route path="/tools/weekly-summary" element={<PageTransition><WeeklySummary /></PageTransition>} />
        <Route path="/tools/ai-pregnancy-journal" element={<PageTransition><AIPregnancyJournal /></PageTransition>} />
        <Route path="/tools/ai-baby-name-finder" element={<PageTransition><AIBabyNameFinder /></PageTransition>} />
        <Route path="/tools/ai-birth-story" element={<PageTransition><AIBirthStoryGenerator /></PageTransition>} />
        <Route path="/tools/smart-grocery-list" element={<PageTransition><SmartGroceryList /></PageTransition>} />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FERTILITY & PLANNING */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Route path="/tools/ovulation-calculator" element={<PageTransition><OvulationCalculator /></PageTransition>} />
        <Route path="/tools/cycle-tracker" element={<PageTransition><CycleTracker /></PageTransition>} />
        <Route path="/tools/due-date-calculator" element={<PageTransition><DueDateCalculator /></PageTransition>} />
        {/* Alias: conception-calculator → due-date-calculator (same math) */}
        <Route path="/tools/conception-calculator" element={<PageTransition><DueDateCalculator /></PageTransition>} />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PREGNANCY TRACKING */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Route path="/tools/fetal-growth" element={<PageTransition><FetalDevelopment3D /></PageTransition>} />
        <Route path="/tools/kick-counter" element={<PageTransition><SmartKickCounter /></PageTransition>} />
        <Route path="/tools/pregnancy-milestones" element={<PageTransition><PregnancyMilestones /></PageTransition>} />
        <Route path="/tools/bump-photos" element={<PageTransition><BumpPhotos /></PageTransition>} />
        <Route path="/tools/pregnancy-bmi" element={<PageTransition><PregnancyBMI /></PageTransition>} />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* WELLNESS & NUTRITION */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Route path="/tools/water-intake" element={<PageTransition><WaterIntake /></PageTransition>} />
        <Route path="/tools/vitamin-tracker" element={<PageTransition><VitaminTracker /></PageTransition>} />
        <Route path="/tools/forbidden-foods" element={<PageTransition><ForbiddenFoods /></PageTransition>} />
        <Route path="/tools/exercise-guide" element={<PageTransition><AIFitnessCoach /></PageTransition>} />
        <Route path="/tools/meditation-yoga" element={<PageTransition><PregnancyMeditationYoga /></PageTransition>} />
        {/* Aliases for backwards compatibility */}
        <Route path="/tools/nutrition-guide" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
        <Route path="/tools/meal-planner" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
        <Route path="/tools/yoga-guide" element={<PageTransition><PregnancyMeditationYoga /></PageTransition>} />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MENTAL HEALTH */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Route path="/tools/affirmations" element={<PageTransition><Affirmations /></PageTransition>} />
        <Route path="/tools/mental-health-coach" element={<PageTransition><PostpartumMentalHealthCoach /></PageTransition>} />
        <Route path="/tools/weight-gain" element={<PageTransition><SmartWeightGainAnalyzer /></PageTransition>} />
        {/* Aliases */}
        <Route path="/tools/mood-tracker" element={<PageTransition><PostpartumMentalHealthCoach /></PageTransition>} />
        <Route path="/tools/smart-weight-gain" element={<PageTransition><SmartWeightGainAnalyzer /></PageTransition>} />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HEALTH MONITORING */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Route path="/tools/gestational-diabetes" element={<PageTransition><GestationalDiabetes /></PageTransition>} />
        <Route path="/tools/blood-type" element={<PageTransition><BloodType /></PageTransition>} />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* LABOR & PREPARATION */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Route path="/tools/contraction-timer" element={<PageTransition><ContractionPatternAnalyzer /></PageTransition>} />
        <Route path="/tools/labor-breathing" element={<PageTransition><LaborBreathingCoach /></PageTransition>} />
        <Route path="/tools/birth-prep" element={<PageTransition><BirthPrepGuide /></PageTransition>} />
        {/* Aliases */}
        <Route path="/tools/breathing-exercises" element={<PageTransition><LaborBreathingCoach /></PageTransition>} />
        <Route path="/tools/birth-plan" element={<PageTransition><BirthPrepGuide /></PageTransition>} />
        <Route path="/tools/hospital-bag" element={<PageTransition><BirthPrepGuide /></PageTransition>} />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* POSTPARTUM & BABY */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <Route path="/tools/baby-sleep-tracker" element={<PageTransition><BabySleepTracker /></PageTransition>} />
        <Route path="/tools/baby-growth" element={<PageTransition><BabyGrowth /></PageTransition>} />
        <Route path="/tools/doctor-questions" element={<PageTransition><DoctorQuestions /></PageTransition>} />

        {/* 404 */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
