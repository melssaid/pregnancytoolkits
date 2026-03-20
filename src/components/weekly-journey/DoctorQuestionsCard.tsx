import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Stethoscope, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Props {
  week: number;
}

export const DoctorQuestionsCard = memo(function DoctorQuestionsCard({ week }: Props) {
  const { t } = useTranslation();

  const questions: string[] = [];
  for (let i = 0; i < 5; i++) {
    const key = `weeklyJourney.weeks.w${week}.doctorQ.${i}`;
    const val = t(key, { defaultValue: "" });
    if (val && val !== key) questions.push(val);
  }

  const copyAll = useCallback(() => {
    const text = questions.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      toast.success(t("weeklyJourney.copied"));
    }).catch(() => {});
  }, [questions, t]);

  if (questions.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="border-blue-200/30 dark:border-blue-800/30 bg-gradient-to-br from-blue-50/50 to-card dark:from-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{t("weeklyJourney.sections.doctorQuestions")}</h3>
            </div>
            <button
              onClick={copyAll}
              className="p-1.5 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </button>
          </div>

          <ul className="space-y-2">
            {questions.map((q, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 tabular-nums">{i + 1}</span>
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">{q}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
});
