import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// Pregnancy Tools
import OvulationCalculator from "./pages/tools/OvulationCalculator";
import DueDateCalculator from "./pages/tools/DueDateCalculator";
import CycleTracker from "./pages/tools/CycleTracker";
import PregnancyBMI from "./pages/tools/PregnancyBMI";
import KickCounter from "./pages/tools/KickCounter";
import ContractionTimer from "./pages/tools/ContractionTimer";
import FetalGrowth from "./pages/tools/FetalGrowth";
import BloodType from "./pages/tools/BloodType";
import GestationalDiabetes from "./pages/tools/GestationalDiabetes";
import PreeclampsiaRisk from "./pages/tools/PreeclampsiaRisk";
import SafeMedications from "./pages/tools/SafeMedications";
import PPDScreener from "./pages/tools/PPDScreener";
import BreastfeedingTracker from "./pages/tools/BreastfeedingTracker";
import WaterIntake from "./pages/tools/WaterIntake";
import ExerciseGuide from "./pages/tools/ExerciseGuide";
import VaccinationSchedule from "./pages/tools/VaccinationSchedule";
import HospitalBag from "./pages/tools/HospitalBag";

// New Premium Tools
import WeightGain from "./pages/tools/WeightGain";
import PregnancyDiary from "./pages/tools/PregnancyDiary";
import NutritionGuide from "./pages/tools/NutritionGuide";
import ForbiddenFoods from "./pages/tools/ForbiddenFoods";
import BabySleepTracker from "./pages/tools/BabySleepTracker";
import DiaperTracker from "./pages/tools/DiaperTracker";
import BabyGrowth from "./pages/tools/BabyGrowth";
import VaccinationGuide from "./pages/tools/VaccinationGuide";
import GenderPredictor from "./pages/tools/GenderPredictor";
import ConceptionCalculator from "./pages/tools/ConceptionCalculator";
import BreathingExercises from "./pages/tools/BreathingExercises";
import MoodDiary from "./pages/tools/MoodDiary";
import YogaGuide from "./pages/tools/YogaGuide";
import Affirmations from "./pages/tools/Affirmations";
import BumpPhotos from "./pages/tools/BumpPhotos";
import PregnancyMilestones from "./pages/tools/PregnancyMilestones";
import MealPlanner from "./pages/tools/MealPlanner";
import VitaminTracker from "./pages/tools/VitaminTracker";
import KegelExercises from "./pages/tools/KegelExercises";
import BirthPlan from "./pages/tools/BirthPlan";
import NurseryChecklist from "./pages/tools/NurseryChecklist";
import BabyBudget from "./pages/tools/BabyBudget";
import DoctorQuestions from "./pages/tools/DoctorQuestions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* Core Tools */}
          <Route path="/tools/ovulation-calculator" element={<OvulationCalculator />} />
          <Route path="/tools/due-date-calculator" element={<DueDateCalculator />} />
          <Route path="/tools/cycle-tracker" element={<CycleTracker />} />
          <Route path="/tools/pregnancy-bmi" element={<PregnancyBMI />} />
          <Route path="/tools/kick-counter" element={<KickCounter />} />
          <Route path="/tools/contraction-timer" element={<ContractionTimer />} />
          <Route path="/tools/fetal-growth" element={<FetalGrowth />} />
          <Route path="/tools/blood-type" element={<BloodType />} />
          <Route path="/tools/gestational-diabetes" element={<GestationalDiabetes />} />
          <Route path="/tools/preeclampsia-risk" element={<PreeclampsiaRisk />} />
          <Route path="/tools/safe-medications" element={<SafeMedications />} />
          <Route path="/tools/ppd-screener" element={<PPDScreener />} />
          <Route path="/tools/breastfeeding-tracker" element={<BreastfeedingTracker />} />
          <Route path="/tools/water-intake" element={<WaterIntake />} />
          <Route path="/tools/exercise-guide" element={<ExerciseGuide />} />
          <Route path="/tools/vaccination-schedule" element={<VaccinationSchedule />} />
          <Route path="/tools/hospital-bag" element={<HospitalBag />} />
          
          {/* New Premium Tools */}
          <Route path="/tools/weight-gain" element={<WeightGain />} />
          <Route path="/tools/pregnancy-diary" element={<PregnancyDiary />} />
          <Route path="/tools/nutrition-guide" element={<NutritionGuide />} />
          <Route path="/tools/forbidden-foods" element={<ForbiddenFoods />} />
          <Route path="/tools/baby-sleep-tracker" element={<BabySleepTracker />} />
          <Route path="/tools/diaper-tracker" element={<DiaperTracker />} />
          <Route path="/tools/baby-growth" element={<BabyGrowth />} />
          <Route path="/tools/vaccination-guide" element={<VaccinationGuide />} />
          <Route path="/tools/gender-predictor" element={<GenderPredictor />} />
          <Route path="/tools/conception-calculator" element={<ConceptionCalculator />} />
          <Route path="/tools/breathing-exercises" element={<BreathingExercises />} />
          <Route path="/tools/mood-diary" element={<MoodDiary />} />
          <Route path="/tools/yoga-guide" element={<YogaGuide />} />
          <Route path="/tools/affirmations" element={<Affirmations />} />
          <Route path="/tools/bump-photos" element={<BumpPhotos />} />
          <Route path="/tools/pregnancy-milestones" element={<PregnancyMilestones />} />
          <Route path="/tools/meal-planner" element={<MealPlanner />} />
          <Route path="/tools/vitamin-tracker" element={<VitaminTracker />} />
          <Route path="/tools/kegel-exercises" element={<KegelExercises />} />
          <Route path="/tools/birth-plan" element={<BirthPlan />} />
          <Route path="/tools/nursery-checklist" element={<NurseryChecklist />} />
          <Route path="/tools/baby-budget" element={<BabyBudget />} />
          <Route path="/tools/doctor-questions" element={<DoctorQuestions />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
