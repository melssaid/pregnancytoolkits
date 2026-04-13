import { Stethoscope, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { motion } from "framer-motion";

export function DoctorVisitPrepCard() {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();

  const week = profile.pregnancyWeek;

  // Generate smart questions based on user data
  const questions: string[] = [];

  // Weight-based
  if (stats.dailyTracking.lastWeight) {
    questions.push(t("doctorPrep.questions.weightProgress"));
  }

  // Kick-based
  if (stats.dailyTracking.todayKicks < 5 && week >= 28) {
    questions.push(t("doctorPrep.questions.reducedMovement"));
  }

  // Trimester-based questions
  if (week <= 12) {
    questions.push(t("doctorPrep.questions.firstTrimesterScreening"));
    questions.push(t("doctorPrep.questions.prenatalVitamins"));
  } else if (week <= 26) {
    questions.push(t("doctorPrep.questions.anatomyScan"));
    questions.push(t("doctorPrep.questions.glucoseTest"));
  } else {
    questions.push(t("doctorPrep.questions.birthPlanDiscuss"));
    questions.push(t("doctorPrep.questions.laborSigns"));
  }

  // Always relevant
  questions.push(t("doctorPrep.questions.supplements"));

  const displayQuestions = questions.slice(0, 4);

  return (
    <Card className="p-4 bg-card border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Stethoscope className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-extrabold text-foreground">{t("doctorPrep.title")}</h3>
      </div>
      <p className="text-[10px] text-muted-foreground mb-2">{t("doctorPrep.subtitle")}</p>
      <div className="space-y-2">
        {displayQuestions.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-2 bg-muted/30 rounded-lg px-3 py-2"
          >
            <span className="text-[10px] font-bold text-primary mt-0.5">{i + 1}</span>
            <p className="text-[11px] text-foreground leading-relaxed">{q}</p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
