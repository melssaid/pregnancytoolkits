import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Smile, Stethoscope, Sparkles } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const LESSON_KEYS = [
  "menstrualCycle", "ovulationProcess", "hormonesRole", "fertilizationBasics", "implantationWindow",
  "trackingMethods", "optimizingTiming",
  "cervicalHealth", "maleFertility", "ageAndFertility",
  "thyroidFertility", "pcosManagement", "endometriosisAwareness", "immunologyFertility",
  "nutritionFertility", "supplementsGuide", "sleepHormones", "exerciseBalance",
  "lifestyleFactors", "environmentalToxins",
  "secondaryInfertility", "recurrentLoss", "geneticFactors", "epigeneticsFertility",
  "emotionalWellbeing", "commonMyths",
  "whenToSeekHelp", "fertilityPreservation", "assistedReproduction",
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

const DAY_KEYS = Array.from({ length: 14 }, (_, i) => `day${i + 1}`);

export default function FertilityAcademy() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const dir = isRTL ? "rtl" : "ltr";
  const [expandedLesson, setExpandedLesson] = useState<string | null>(LESSON_KEYS[0]);
  const [expandedSign, setExpandedSign] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const lessons = LESSON_KEYS.map((key, index) => ({
    key,
    order: index + 1,
    title: t(`toolsInternal.fertilityAcademy.lessons.${key}.title`),
    content: t(`toolsInternal.fertilityAcademy.lessons.${key}.content`),
  }));

  const tipIndex = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return (dayOfYear % 44) + 1;
  }, []);

  return (
    <ToolFrame title={t("tools.fertilityAcademy.title")} subtitle={t("tools.fertilityAcademy.description")} mood="calm" toolId="fertility-academy">
      <div className="space-y-3" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>

        {/* Fertility Expert Daily Tip */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="mb-1">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-pink-50/30 dark:to-primary/5 relative overflow-visible">
            <div className="absolute -top-3 ltr:-right-3 rtl:-left-3 opacity-[0.06] pointer-events-none">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="h-20 w-20 text-primary" />
              </motion.div>
            </div>
            <CardContent className="p-4 relative z-10" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-bold text-primary">
                  {t("fertilityExpert.title")}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap break-words">
                {t(`fertilityTip.tips.tip${tipIndex}`)}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-3">
                {t("fertilityTip.disclaimer")}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="lessons" dir={dir}>
          <TabsList className="grid w-full grid-cols-4 mb-4 h-11 rounded-xl bg-muted/60 border border-border/40 p-1">
            <TabsTrigger value="lessons" className="text-[11px] sm:text-xs font-semibold rounded-lg data-[state=active]:shadow-sm">
              {t("tools.fertilityAcademy.lessonsTab")}
            </TabsTrigger>
            <TabsTrigger value="signs" className="text-[11px] sm:text-xs font-semibold rounded-lg data-[state=active]:shadow-sm">
              {t("tools.fertilityAcademy.signsTab")}
            </TabsTrigger>
            <TabsTrigger value="stress" className="text-[11px] sm:text-xs font-semibold rounded-lg data-[state=active]:shadow-sm">
              {t("tools.fertilityAcademy.stressTab")}
            </TabsTrigger>
            <TabsTrigger value="tww" className="text-[11px] sm:text-xs font-semibold rounded-lg data-[state=active]:shadow-sm">
              {t("tools.fertilityAcademy.twwTab")}
            </TabsTrigger>
          </TabsList>

          {/* LESSONS TAB */}
          <TabsContent value="lessons" className="space-y-2 mt-0">
            <p className="text-xs text-muted-foreground mb-2">
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
                              <span className="text-sm font-bold text-foreground" style={{ textAlign: isRTL ? "right" : "left" }}>
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
                                <p className="whitespace-pre-line text-xs leading-relaxed text-foreground/80" style={{ textAlign: isRTL ? "right" : "left" }}>
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
            <p className="text-xs text-muted-foreground mb-2">
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
                          <span className="text-sm font-bold text-foreground">{t(`toolsInternal.fertilitySigns.signs.${key}.title`)}</span>
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
                                <p className="whitespace-pre-line text-xs leading-relaxed text-foreground/80">{t(`toolsInternal.fertilitySigns.signs.${key}.description`)}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-primary/5 text-xs text-primary font-semibold">
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
            <p className="text-xs text-muted-foreground mb-2">
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
                          <span className="text-sm font-bold text-foreground">{t(`toolsInternal.stressFertility.topics.${key}.title`)}</span>
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
                                <p className="whitespace-pre-line text-xs leading-relaxed text-foreground/80">{t(`toolsInternal.stressFertility.topics.${key}.content`)}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-primary/5 text-xs text-primary font-semibold">
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

          {/* TWW COMPANION TAB */}
          <TabsContent value="tww" className="space-y-2 mt-0">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 shrink-0 text-destructive" />
              <span className="text-sm font-bold text-foreground">{t('toolsInternal.twwCompanion.subtitle')}</span>
            </div>
            {DAY_KEYS.map((key, i) => {
              const isOpen = expandedDay === key;
              return (
                <motion.div key={key} initial={{ opacity: 0, x: isRTL ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02, duration: 0.22 }}>
                  <Card className={`border-border/60 transition-all duration-300 cursor-pointer ${isOpen ? "border-destructive/30 bg-destructive/5 shadow-card-hover" : "hover:border-destructive/20"}`} onClick={() => setExpandedDay(isOpen ? null : key)}>
                    <CardContent className="p-0">
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 shrink-0 rounded-full bg-destructive/10 flex items-center justify-center text-[10px] font-bold text-destructive">{i + 1}</div>
                            <span className="text-sm font-bold text-foreground">{t(`toolsInternal.twwCompanion.days.${key}.title`)}</span>
                          </div>
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
                                <p className="whitespace-pre-line text-xs leading-relaxed text-foreground/80">{t(`toolsInternal.twwCompanion.days.${key}.body`)}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-destructive/5 text-xs text-destructive font-semibold flex items-center gap-1.5">
                                <Smile className="w-3 h-3 shrink-0" />
                                {t(`toolsInternal.twwCompanion.days.${key}.tip`)}
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
