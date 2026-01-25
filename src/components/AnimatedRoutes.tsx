import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Contact from "@/pages/Contact";

// Pregnancy Tools
import OvulationCalculator from "@/pages/tools/OvulationCalculator";
import DueDateCalculator from "@/pages/tools/DueDateCalculator";
import CycleTracker from "@/pages/tools/CycleTracker";
import PregnancyBMI from "@/pages/tools/PregnancyBMI";
import KickCounter from "@/pages/tools/KickCounter";
import ContractionTimer from "@/pages/tools/ContractionTimer";
import FetalGrowth from "@/pages/tools/FetalGrowth";
import BloodType from "@/pages/tools/BloodType";
import GestationalDiabetes from "@/pages/tools/GestationalDiabetes";
import PreeclampsiaRisk from "@/pages/tools/PreeclampsiaRisk";
import SafeMedications from "@/pages/tools/SafeMedications";
import PPDScreener from "@/pages/tools/PPDScreener";
import BreastfeedingTracker from "@/pages/tools/BreastfeedingTracker";
import WaterIntake from "@/pages/tools/WaterIntake";
import ExerciseGuide from "@/pages/tools/ExerciseGuide";
import VaccinationSchedule from "@/pages/tools/VaccinationSchedule";
import HospitalBag from "@/pages/tools/HospitalBag";

// Premium Tools
import WeightGain from "@/pages/tools/WeightGain";
import PregnancyDiary from "@/pages/tools/PregnancyDiary";
import NutritionGuide from "@/pages/tools/NutritionGuide";
import ForbiddenFoods from "@/pages/tools/ForbiddenFoods";
import BabySleepTracker from "@/pages/tools/BabySleepTracker";
import DiaperTracker from "@/pages/tools/DiaperTracker";
import BabyGrowth from "@/pages/tools/BabyGrowth";

// More Tools
import ConceptionCalculator from "@/pages/tools/ConceptionCalculator";
import BreathingExercises from "@/pages/tools/BreathingExercises";
import MoodDiary from "@/pages/tools/MoodDiary";
import YogaGuide from "@/pages/tools/YogaGuide";
import Affirmations from "@/pages/tools/Affirmations";
import BumpPhotos from "@/pages/tools/BumpPhotos";
import PregnancyMilestones from "@/pages/tools/PregnancyMilestones";
import MealPlanner from "@/pages/tools/MealPlanner";
import VitaminTracker from "@/pages/tools/VitaminTracker";
import KegelExercises from "@/pages/tools/KegelExercises";
import BirthPlan from "@/pages/tools/BirthPlan";
import NurseryChecklist from "@/pages/tools/NurseryChecklist";
import BabyBudget from "@/pages/tools/BabyBudget";
import DoctorQuestions from "@/pages/tools/DoctorQuestions";
import PregnancyAssistant from "@/pages/tools/PregnancyAssistant";
import SymptomAnalyzer from "@/pages/tools/SymptomAnalyzer";
import AIMealSuggestion from "@/pages/tools/AIMealSuggestion";
import WeeklySummary from "@/pages/tools/WeeklySummary";

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        
        {/* Core Tools */}
        <Route path="/tools/ovulation-calculator" element={<PageTransition><OvulationCalculator /></PageTransition>} />
        <Route path="/tools/due-date-calculator" element={<PageTransition><DueDateCalculator /></PageTransition>} />
        <Route path="/tools/cycle-tracker" element={<PageTransition><CycleTracker /></PageTransition>} />
        <Route path="/tools/pregnancy-bmi" element={<PageTransition><PregnancyBMI /></PageTransition>} />
        <Route path="/tools/kick-counter" element={<PageTransition><KickCounter /></PageTransition>} />
        <Route path="/tools/contraction-timer" element={<PageTransition><ContractionTimer /></PageTransition>} />
        <Route path="/tools/fetal-growth" element={<PageTransition><FetalGrowth /></PageTransition>} />
        <Route path="/tools/blood-type" element={<PageTransition><BloodType /></PageTransition>} />
        <Route path="/tools/gestational-diabetes" element={<PageTransition><GestationalDiabetes /></PageTransition>} />
        <Route path="/tools/preeclampsia-risk" element={<PageTransition><PreeclampsiaRisk /></PageTransition>} />
        <Route path="/tools/safe-medications" element={<PageTransition><SafeMedications /></PageTransition>} />
        <Route path="/tools/ppd-screener" element={<PageTransition><PPDScreener /></PageTransition>} />
        <Route path="/tools/breastfeeding-tracker" element={<PageTransition><BreastfeedingTracker /></PageTransition>} />
        <Route path="/tools/water-intake" element={<PageTransition><WaterIntake /></PageTransition>} />
        <Route path="/tools/exercise-guide" element={<PageTransition><ExerciseGuide /></PageTransition>} />
        <Route path="/tools/vaccination-schedule" element={<PageTransition><VaccinationSchedule /></PageTransition>} />
        <Route path="/tools/hospital-bag" element={<PageTransition><HospitalBag /></PageTransition>} />
        
        {/* Premium Tools */}
        <Route path="/tools/weight-gain" element={<PageTransition><WeightGain /></PageTransition>} />
        <Route path="/tools/pregnancy-diary" element={<PageTransition><PregnancyDiary /></PageTransition>} />
        <Route path="/tools/nutrition-guide" element={<PageTransition><NutritionGuide /></PageTransition>} />
        <Route path="/tools/forbidden-foods" element={<PageTransition><ForbiddenFoods /></PageTransition>} />
        <Route path="/tools/baby-sleep-tracker" element={<PageTransition><BabySleepTracker /></PageTransition>} />
        <Route path="/tools/diaper-tracker" element={<PageTransition><DiaperTracker /></PageTransition>} />
        <Route path="/tools/baby-growth" element={<PageTransition><BabyGrowth /></PageTransition>} />
        
        {/* More Tools */}
        <Route path="/tools/conception-calculator" element={<PageTransition><ConceptionCalculator /></PageTransition>} />
        <Route path="/tools/breathing-exercises" element={<PageTransition><BreathingExercises /></PageTransition>} />
        <Route path="/tools/mood-diary" element={<PageTransition><MoodDiary /></PageTransition>} />
        <Route path="/tools/yoga-guide" element={<PageTransition><YogaGuide /></PageTransition>} />
        <Route path="/tools/affirmations" element={<PageTransition><Affirmations /></PageTransition>} />
        <Route path="/tools/bump-photos" element={<PageTransition><BumpPhotos /></PageTransition>} />
        <Route path="/tools/pregnancy-milestones" element={<PageTransition><PregnancyMilestones /></PageTransition>} />
        <Route path="/tools/meal-planner" element={<PageTransition><MealPlanner /></PageTransition>} />
        <Route path="/tools/vitamin-tracker" element={<PageTransition><VitaminTracker /></PageTransition>} />
        <Route path="/tools/kegel-exercises" element={<PageTransition><KegelExercises /></PageTransition>} />
        <Route path="/tools/birth-plan" element={<PageTransition><BirthPlan /></PageTransition>} />
        <Route path="/tools/nursery-checklist" element={<PageTransition><NurseryChecklist /></PageTransition>} />
        <Route path="/tools/baby-budget" element={<PageTransition><BabyBudget /></PageTransition>} />
        <Route path="/tools/doctor-questions" element={<PageTransition><DoctorQuestions /></PageTransition>} />
        <Route path="/tools/pregnancy-assistant" element={<PageTransition><PregnancyAssistant /></PageTransition>} />
        <Route path="/tools/symptom-analyzer" element={<PageTransition><SymptomAnalyzer /></PageTransition>} />
        <Route path="/tools/ai-meal-suggestion" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
        <Route path="/tools/weekly-summary" element={<PageTransition><WeeklySummary /></PageTransition>} />
        
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
