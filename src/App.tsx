import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
