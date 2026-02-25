import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { FertilityDailyTip } from "@/components/FertilityDailyTip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LESSON_KEYS = [
  "menstrualCycle", "ovulationProcess", "fertilizationBasics", "hormonesRole",
  "ageAndFertility", "lifestyleFactors", "commonMyths", "whenToSeekHelp",
  "maleFertility", "emotionalWellbeing", "trackingMethods", "optimizingTiming",
] as const;

const SIGN_KEYS = [
  "cervicalMucus", "basalTemp", "cervicalPosition", "ovulationPain",
  "breastTenderness", "libidoChanges", "moodShifts", "bloating",
  "lightSpotting", "heightenedSenses",
];

const TOPIC_KEYS = [
  "stressHormones", "cortisol", "mindfulness", "breathing",
  "journaling", "sleep", "exercise", "socialSupport",
  "professionalHelp", "acceptance",
];

export default function FertilityAcademy() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const dir = isRTL ? "rtl" : "ltr";
  const [expandedLesson, setExpandedLesson] = useState<string | null>(LESSON_KEYS[0]);
  const [expandedSign, setExpandedSign] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const lessons = LESSON_KEYS.map((key, index) => ({
    key,
    order: index + 1,
    title: t(`toolsInternal.fertilityAcademy.lessons.${key}.title`),
    content: t(`toolsInternal.fertilityAcademy.lessons.${key}.content`),
  }));

  return (
    <ToolFrame title={t("tools.fertilityAcademy.title")} subtitle={t("tools.fertilityAcademy.description")} mood="calm" toolId="fertility-academy">
      <div className="space-y-3" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>
        <FertilityDailyTip />

        <Tabs defaultValue="lessons" dir={dir}>
          <TabsList className="grid w-full grid-cols-3 mb-3">
            <TabsTrigger value="lessons" className="text-[10px] sm:text-xs">
              {t("tools.fertilityAcademy.lessonsTab")}
            </TabsTrigger>
            <TabsTrigger value="signs" className="text-[10px] sm:text-xs">
              {t("tools.fertilityAcademy.signsTab")}
            </TabsTrigger>
            <TabsTrigger value="stress" className="text-[10px] sm:text-xs">
              {t("tools.fertilityAcademy.stressTab")}
            </TabsTrigger>
          </TabsList>

          {/* LESSONS TAB */}
          <TabsContent value="lessons" className="space-y-2 mt-0">
            <p className="text-[10px] text-muted-foreground mb-2">
              {t("toolsInternal.fertilityAcademy.lessonsCount", { count: LESSON_KEYS.length })}
            </p>
            <div className="space-y-2">
              {lessons.map((lesson, i) => {
                const isOpen = expandedLesson === lesson.key;
                return (
                  <motion.article key={lesson.key} initial={{ opacity: 0, x: isRTL ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.22, ease: "easeOut" }}>
                    <Card className={`border-border/60 transition-all duration-300 ${isOpen ? "border-primary/40 bg-primary/5 shadow-card-hover" : "hover:border-primary/25"}`}>
                      <CardContent className="p-0">
                        <button type="button" className="w-full p-3" dir={dir} onClick={() => setExpandedLesson(isOpen ? null : lesson.key)}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                {lesson.order}
                              </span>
                              <span className="text-xs font-semibold text-foreground" style={{ textAlign: isRTL ? "right" : "left" }}>
                                {lesson.title}
                              </span>
                            </div>
                            <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/70">
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            </motion.span>
                          </div>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="overflow-hidden">
                              <div className="mx-3 mb-3 rounded-lg border border-border/50 bg-background/70 p-3" dir={dir}>
                                <p className="whitespace-pre-line text-[11px] leading-relaxed text-muted-foreground" style={{ textAlign: isRTL ? "right" : "left" }}>
                                  {lesson.content}
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
          </TabsContent>

          {/* FERTILITY SIGNS TAB */}
          <TabsContent value="signs" className="space-y-2 mt-0">
            <p className="text-[10px] text-muted-foreground mb-2">
              {t('toolsInternal.fertilitySigns.signsCount', { count: SIGN_KEYS.length })}
            </p>
            {SIGN_KEYS.map((key, i) => {
              const isOpen = expandedSign === key;
              return (
                <motion.div key={key} initial={{ opacity: 0, x: isRTL ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.22 }}>
                  <Card className={`border-border/60 transition-all duration-300 cursor-pointer ${isOpen ? "border-primary/40 bg-primary/5 shadow-card-hover" : "hover:border-primary/25"}`} onClick={() => setExpandedSign(isOpen ? null : key)}>
                    <CardContent className="p-0">
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.fertilitySigns.signs.${key}.title`)}</span>
                          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/70">
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          </motion.span>
                        </div>
                      </div>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="overflow-hidden">
                            <div className="mx-3 mb-3 space-y-2">
                              <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                                <p className="whitespace-pre-line text-[11px] leading-relaxed text-muted-foreground">{t(`toolsInternal.fertilitySigns.signs.${key}.description`)}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-primary/5 text-[10px] text-primary font-medium">
                                {t(`toolsInternal.fertilitySigns.signs.${key}.tip`)}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* STRESS & FERTILITY TAB */}
          <TabsContent value="stress" className="space-y-2 mt-0">
            <p className="text-[10px] text-muted-foreground mb-2">
              {t('toolsInternal.stressFertility.topicsCount', { count: TOPIC_KEYS.length })}
            </p>
            {TOPIC_KEYS.map((key, i) => {
              const isOpen = expandedTopic === key;
              return (
                <motion.div key={key} initial={{ opacity: 0, x: isRTL ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03, duration: 0.22 }}>
                  <Card className={`border-border/60 transition-all duration-300 cursor-pointer ${isOpen ? "border-primary/40 bg-primary/5 shadow-card-hover" : "hover:border-primary/25"}`} onClick={() => setExpandedTopic(isOpen ? null : key)}>
                    <CardContent className="p-0">
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground">{t(`toolsInternal.stressFertility.topics.${key}.title`)}</span>
                          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/70">
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          </motion.span>
                        </div>
                      </div>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="overflow-hidden">
                            <div className="mx-3 mb-3 space-y-2">
                              <div className="rounded-lg border border-border/50 bg-background/70 p-3">
                                <p className="whitespace-pre-line text-[11px] leading-relaxed text-muted-foreground">{t(`toolsInternal.stressFertility.topics.${key}.content`)}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-primary/5 text-[10px] text-primary font-medium">
                                {t(`toolsInternal.stressFertility.topics.${key}.practice`)}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </ToolFrame>
  );
}
