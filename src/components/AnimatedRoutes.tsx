import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";

// Pages
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Contact from "@/pages/Contact";

// Pregnancy Tools - Core
import OvulationCalculator from "@/pages/tools/OvulationCalculator";
import DueDateCalculator from "@/pages/tools/DueDateCalculator";
import CycleTracker from "@/pages/tools/CycleTracker";
import PregnancyBMI from "@/pages/tools/PregnancyBMI";
import BloodType from "@/pages/tools/BloodType";
import GestationalDiabetes from "@/pages/tools/GestationalDiabetes";
import PreeclampsiaRisk from "@/pages/tools/PreeclampsiaRisk";
import WaterIntake from "@/pages/tools/WaterIntake";
import ForbiddenFoods from "@/pages/tools/ForbiddenFoods";
import BabySleepTracker from "@/pages/tools/BabySleepTracker";
import DiaperTracker from "@/pages/tools/DiaperTracker";
import BabyGrowth from "@/pages/tools/BabyGrowth";
import ConceptionCalculator from "@/pages/tools/ConceptionCalculator";
import Affirmations from "@/pages/tools/Affirmations";
import BumpPhotos from "@/pages/tools/BumpPhotos";
import PregnancyMilestones from "@/pages/tools/PregnancyMilestones";
import VitaminTracker from "@/pages/tools/VitaminTracker";
import KegelExercises from "@/pages/tools/KegelExercises";
import DoctorQuestions from "@/pages/tools/DoctorQuestions";
import PregnancyAssistant from "@/pages/tools/PregnancyAssistant";
import AIMealSuggestion from "@/pages/tools/AIMealSuggestion";
import WeeklySummary from "@/pages/tools/WeeklySummary";

// Smart/AI Tools (replacements for old tools)
import AISymptomAnalyzer from "@/pages/tools/AISymptomAnalyzer";
import FetalDevelopment3D from "@/pages/tools/FetalDevelopment3D";
import SmartNutritionOptimizer from "@/pages/tools/SmartNutritionOptimizer";
import AIFitnessCoach from "@/pages/tools/AIFitnessCoach";
import ContractionPatternAnalyzer from "@/pages/tools/ContractionPatternAnalyzer";
import SmartKickCounter from "@/pages/tools/SmartKickCounter";
import PelvicFloorCoach from "@/pages/tools/PelvicFloorCoach";
import SleepPatternAnalyzer from "@/pages/tools/SleepPatternAnalyzer";
import AdvancedMoodTracker from "@/pages/tools/AdvancedMoodTracker";
import SmartWeightGainAnalyzer from "@/pages/tools/SmartWeightGainAnalyzer";
import LaborBreathingCoach from "@/pages/tools/LaborBreathingCoach";
import BirthPrepGuide from "@/pages/tools/BirthPrepGuide";
import PregnancyMeditationYoga from "@/pages/tools/PregnancyMeditationYoga";
import AILaborProgressTracker from "@/pages/tools/AILaborProgressTracker";
import PostpartumMentalHealthCoach from "@/pages/tools/PostpartumMentalHealthCoach";
import BabyGearRecommender from "@/pages/tools/BabyGearRecommender";
import PersonalizedWorkoutPlanner from "@/pages/tools/PersonalizedWorkoutPlanner";

// New 2026 AI Tools
import AIPregnancyJournal from "@/pages/tools/AIPregnancyJournal";
import SmartAppointmentReminder from "@/pages/tools/SmartAppointmentReminder";
import AIBirthStoryGenerator from "@/pages/tools/AIBirthStoryGenerator";
import PregnancyPhotoTimeline from "@/pages/tools/PregnancyPhotoTimeline";
import AIBabyNameFinder from "@/pages/tools/AIBabyNameFinder";
import AIPostureCoach from "@/pages/tools/AIPostureCoach";
import SmartStretchReminder from "@/pages/tools/SmartStretchReminder";
import AIBackPainRelief from "@/pages/tools/AIBackPainRelief";
import PregnancyMassageGuide from "@/pages/tools/PregnancyMassageGuide";
import AILegCrampPreventer from "@/pages/tools/AILegCrampPreventer";
import SmartWalkingCoach from "@/pages/tools/SmartWalkingCoach";
import AICravingAlternatives from "@/pages/tools/AICravingAlternatives";
import AIStressReliefCoach from "@/pages/tools/AIStressReliefCoach";
import SmartGroceryList from "@/pages/tools/SmartGroceryList";
import AIRecipeModifier from "@/pages/tools/AIRecipeModifier";
import PregnancySmoothieAI from "@/pages/tools/PregnancySmoothieAI";
import SmartSnackPlanner from "@/pages/tools/SmartSnackPlanner";
import AIPregnancyTipsDaily from "@/pages/tools/AIPregnancyTipsDaily";

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
        <Route path="/tools/blood-type" element={<PageTransition><BloodType /></PageTransition>} />
        <Route path="/tools/gestational-diabetes" element={<PageTransition><GestationalDiabetes /></PageTransition>} />
        <Route path="/tools/preeclampsia-risk" element={<PageTransition><PreeclampsiaRisk /></PageTransition>} />
        <Route path="/tools/water-intake" element={<PageTransition><WaterIntake /></PageTransition>} />
        <Route path="/tools/forbidden-foods" element={<PageTransition><ForbiddenFoods /></PageTransition>} />
        <Route path="/tools/baby-sleep-tracker" element={<PageTransition><BabySleepTracker /></PageTransition>} />
        <Route path="/tools/diaper-tracker" element={<PageTransition><DiaperTracker /></PageTransition>} />
        <Route path="/tools/baby-growth" element={<PageTransition><BabyGrowth /></PageTransition>} />
        <Route path="/tools/conception-calculator" element={<PageTransition><ConceptionCalculator /></PageTransition>} />
        <Route path="/tools/affirmations" element={<PageTransition><Affirmations /></PageTransition>} />
        <Route path="/tools/bump-photos" element={<PageTransition><BumpPhotos /></PageTransition>} />
        <Route path="/tools/pregnancy-milestones" element={<PageTransition><PregnancyMilestones /></PageTransition>} />
        <Route path="/tools/vitamin-tracker" element={<PageTransition><VitaminTracker /></PageTransition>} />
        <Route path="/tools/kegel-exercises" element={<PageTransition><KegelExercises /></PageTransition>} />
        <Route path="/tools/doctor-questions" element={<PageTransition><DoctorQuestions /></PageTransition>} />
        <Route path="/tools/pregnancy-assistant" element={<PageTransition><PregnancyAssistant /></PageTransition>} />
        <Route path="/tools/ai-meal-suggestion" element={<PageTransition><AIMealSuggestion /></PageTransition>} />
        <Route path="/tools/weekly-summary" element={<PageTransition><WeeklySummary /></PageTransition>} />
        
        {/* Smart/AI Tools (replacements) */}
        <Route path="/tools/symptom-analyzer" element={<PageTransition><AISymptomAnalyzer /></PageTransition>} />
        <Route path="/tools/fetal-growth" element={<PageTransition><FetalDevelopment3D /></PageTransition>} />
        <Route path="/tools/nutrition-guide" element={<PageTransition><SmartNutritionOptimizer /></PageTransition>} />
        <Route path="/tools/meal-planner" element={<PageTransition><SmartNutritionOptimizer /></PageTransition>} />
        <Route path="/tools/exercise-guide" element={<PageTransition><AIFitnessCoach /></PageTransition>} />
        <Route path="/tools/yoga-guide" element={<PageTransition><AIFitnessCoach /></PageTransition>} />
        <Route path="/tools/contraction-timer" element={<PageTransition><ContractionPatternAnalyzer /></PageTransition>} />
        <Route path="/tools/kick-counter" element={<PageTransition><SmartKickCounter /></PageTransition>} />
        <Route path="/tools/kegel-coach" element={<PageTransition><PelvicFloorCoach /></PageTransition>} />
        <Route path="/tools/sleep-analyzer" element={<PageTransition><SleepPatternAnalyzer /></PageTransition>} />
        <Route path="/tools/mood-tracker" element={<PageTransition><AdvancedMoodTracker /></PageTransition>} />
        <Route path="/tools/advanced-mood-tracker" element={<PageTransition><AdvancedMoodTracker /></PageTransition>} />
        <Route path="/tools/weight-gain" element={<PageTransition><SmartWeightGainAnalyzer /></PageTransition>} />
        <Route path="/tools/smart-weight-gain" element={<PageTransition><SmartWeightGainAnalyzer /></PageTransition>} />
        <Route path="/tools/labor-breathing" element={<PageTransition><LaborBreathingCoach /></PageTransition>} />
        <Route path="/tools/breathing-exercises" element={<PageTransition><LaborBreathingCoach /></PageTransition>} />
        <Route path="/tools/birth-prep" element={<PageTransition><BirthPrepGuide /></PageTransition>} />
        <Route path="/tools/birth-plan" element={<PageTransition><BirthPrepGuide /></PageTransition>} />
        <Route path="/tools/hospital-bag" element={<PageTransition><BirthPrepGuide /></PageTransition>} />
        <Route path="/tools/meditation-yoga" element={<PageTransition><PregnancyMeditationYoga /></PageTransition>} />
        <Route path="/tools/pregnancy-meditation" element={<PageTransition><PregnancyMeditationYoga /></PageTransition>} />
        
        {/* New 2026 AI Tools */}
        <Route path="/tools/labor-progress" element={<PageTransition><AILaborProgressTracker /></PageTransition>} />
        <Route path="/tools/mental-health-coach" element={<PageTransition><PostpartumMentalHealthCoach /></PageTransition>} />
        <Route path="/tools/baby-gear" element={<PageTransition><BabyGearRecommender /></PageTransition>} />
        <Route path="/tools/workout-planner" element={<PageTransition><PersonalizedWorkoutPlanner /></PageTransition>} />
        <Route path="/tools/ai-pregnancy-journal" element={<PageTransition><AIPregnancyJournal /></PageTransition>} />
        <Route path="/tools/smart-appointment-reminder" element={<PageTransition><SmartAppointmentReminder /></PageTransition>} />
        <Route path="/tools/ai-birth-story" element={<PageTransition><AIBirthStoryGenerator /></PageTransition>} />
        <Route path="/tools/pregnancy-photo-timeline" element={<PageTransition><PregnancyPhotoTimeline /></PageTransition>} />
        <Route path="/tools/ai-baby-name-finder" element={<PageTransition><AIBabyNameFinder /></PageTransition>} />
        <Route path="/tools/ai-posture-coach" element={<PageTransition><AIPostureCoach /></PageTransition>} />
        <Route path="/tools/smart-stretch-reminder" element={<PageTransition><SmartStretchReminder /></PageTransition>} />
        <Route path="/tools/ai-back-pain-relief" element={<PageTransition><AIBackPainRelief /></PageTransition>} />
        <Route path="/tools/pregnancy-massage-guide" element={<PageTransition><PregnancyMassageGuide /></PageTransition>} />
        <Route path="/tools/ai-leg-cramp-preventer" element={<PageTransition><AILegCrampPreventer /></PageTransition>} />
        <Route path="/tools/smart-walking-coach" element={<PageTransition><SmartWalkingCoach /></PageTransition>} />
        <Route path="/tools/ai-craving-alternatives" element={<PageTransition><AICravingAlternatives /></PageTransition>} />
        
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}