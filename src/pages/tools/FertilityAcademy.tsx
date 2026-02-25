import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, GraduationCap } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";

const LESSON_KEYS = [
  "menstrualCycle", "ovulationProcess", "fertilizationBasics", "hormonesRole",
  "ageAndFertility", "lifestyleFactors", "commonMyths", "whenToSeekHelp",
  "maleFertility", "emotionalWellbeing", "trackingMethods", "optimizingTiming",
] as const;

export default function FertilityAcademy() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [expandedLesson, setExpandedLesson] = useState<string | null>(LESSON_KEYS[0]);

  const lessons = LESSON_KEYS.map((key, index) => ({
    key,
    order: index + 1,
    title: t(`toolsInternal.fertilityAcademy.lessons.${key}.title`),
    content: t(`toolsInternal.fertilityAcademy.lessons.${key}.content`),
  }));

  return (
    <ToolFrame title={t("tools.fertilityAcademy.title")} subtitle={t("tools.fertilityAcademy.description")} mood="calm" toolId="fertility-academy">
      <div className={`space-y-3 ${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
          <div className={`flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="text-xs font-bold text-foreground">
                  {t("toolsInternal.fertilityAcademy.lessonsCount", { count: LESSON_KEYS.length })}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {t("toolsInternal.fertilityAcademy.headerHint", {
                    defaultValue: isRTL ? "اضغطي على أي بطاقة لعرض التفاصيل" : "Tap any lesson card to view details",
                  })}
                </p>
              </div>
            </div>
            <GraduationCap className="h-4 w-4 text-primary/80" />
          </div>
        </div>

        <div className="space-y-2">
          {lessons.map((lesson, i) => {
            const isOpen = expandedLesson === lesson.key;
            const panelId = `fertility-lesson-panel-${lesson.key}`;

            return (
              <motion.article
                key={lesson.key}
                initial={{ opacity: 0, x: isRTL ? 14 : -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.22, ease: "easeOut" }}
              >
                <Card className={`border-border/60 transition-all duration-300 ${isOpen ? "border-primary/40 bg-primary/5 shadow-card-hover" : "hover:border-primary/25"}`}>
                  <CardContent className="p-0">
                    <button
                      type="button"
                      className="w-full p-3"
                      onClick={() => setExpandedLesson(isOpen ? null : lesson.key)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      aria-label={
                        isOpen
                          ? t("toolsInternal.fertilityAcademy.collapseLesson", { defaultValue: "Collapse lesson" })
                          : t("toolsInternal.fertilityAcademy.expandLesson", { defaultValue: "Expand lesson" })
                      }
                    >
                      <div className={`flex items-center justify-between gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <div className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {lesson.order}
                          </div>
                          <span className={`text-xs font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}>
                            {lesson.title}
                          </span>
                        </div>

                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted/70"
                        >
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </motion.span>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mx-3 mb-3 rounded-lg border border-border/50 bg-background/70 p-3">
                            <p className={`whitespace-pre-line text-[11px] leading-relaxed text-muted-foreground ${isRTL ? "text-right" : "text-left"}`}>
                              {lesson.content ||
                                t("toolsInternal.fertilityAcademy.contentFallback", {
                                  defaultValue: "Detailed educational content will appear here.",
                                })}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.article>
            );
          })}
        </div>
      </div>
    </ToolFrame>
  );
}
