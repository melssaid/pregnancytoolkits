import { useState, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Smile, BookOpen, Eye, Brain, Calendar } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";
import { RelatedToolLinks } from "@/components/RelatedToolLinks";

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

// ── Accordion Item Component ─────────────────────────────────────────
interface AccordionItemProps {
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  isRTL: boolean;
  // Header
  badge?: React.ReactNode;
  title: string;
  // Content
  children: React.ReactNode;
  // Theming
  accentColor?: "primary" | "destructive";
}

const AccordionItem = memo(function AccordionItem({
  isOpen, onToggle, index, isRTL, badge, title, children, accentColor = "primary"
}: AccordionItemProps) {
  const accent = accentColor === "destructive";
  const openBorder = accent ? "border-destructive/30" : "border-primary/30";
  const openBg = accent ? "bg-destructive/[0.03]" : "bg-primary/[0.03]";
  const hoverBorder = accent ? "hover:border-destructive/15" : "hover:border-primary/15";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.25, ease: "easeOut" }}
    >
      <div
        className={`rounded-xl border transition-all duration-300 overflow-hidden ${
          isOpen
            ? `${openBorder} ${openBg} shadow-sm`
            : `border-border/40 ${hoverBorder} bg-card/40`
        }`}
      >
        {/* Header */}
        <button
          type="button"
          onClick={onToggle}
          className="w-full px-3.5 py-3 flex items-center justify-between gap-2.5 group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {badge}
            <span className={`text-[13px] font-semibold leading-snug text-start ${
              isOpen ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
            } transition-colors`}>
              {title}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              isOpen
                ? accent ? "bg-destructive/10" : "bg-primary/10"
                : "bg-muted/50 group-hover:bg-muted"
            }`}
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-colors ${
              isOpen
                ? accent ? "text-destructive" : "text-primary"
                : "text-muted-foreground"
            }`} />
          </motion.div>
        </button>

        {/* Content */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-3.5 pb-3.5 pt-0.5">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// ── Number Badge (formal) ────────────────────────────────────────────
function NumberBadge({ index, accent = "primary" }: { index: number; accent?: "primary" | "destructive" }) {
  const color = accent === "destructive" ? "text-destructive/60" : "text-muted-foreground";
  return (
    <span className={`text-[11px] font-medium tabular-nums ${color} shrink-0 w-5 text-center`}>
      {index + 1}
    </span>
  );
}

// ── Content Block ────────────────────────────────────────────────────
function ContentBlock({ text, isRTL }: { text: string; isRTL: boolean }) {
  return (
    <div className="rounded-lg border border-border/30 bg-background/60 backdrop-blur-sm p-3">
      <p className="whitespace-pre-line text-xs leading-[1.8] text-foreground/75" style={{ textAlign: isRTL ? "right" : "left" }}>
        {text}
      </p>
    </div>
  );
}

function TipBlock({ text, accent = "primary", icon: Icon }: { text: string; accent?: "primary" | "destructive"; icon?: any }) {
  const bg = accent === "destructive" ? "bg-destructive/[0.06]" : "bg-primary/[0.06]";
  const textColor = accent === "destructive" ? "text-destructive" : "text-primary";
  return (
    <div className={`mt-2 p-2.5 rounded-lg ${bg} text-xs ${textColor} font-medium flex items-start gap-1.5`}>
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
      <span>{text}</span>
    </div>
  );
}

// ── Tab config with unique theming ───────────────────────────────────
const TAB_CONFIG = [
  { key: "lessons", icon: BookOpen, gradient: "from-[hsl(340,55%,55%)] to-[hsl(350,50%,60%)]", lightBg: "bg-[hsl(340,30%,96%)]", darkBg: "dark:bg-[hsl(340,20%,12%)]", ring: "ring-[hsl(340,40%,70%)]" },
  { key: "signs", icon: Eye, gradient: "from-[hsl(280,45%,55%)] to-[hsl(300,40%,58%)]", lightBg: "bg-[hsl(280,25%,96%)]", darkBg: "dark:bg-[hsl(280,15%,12%)]", ring: "ring-[hsl(280,35%,70%)]" },
  { key: "stress", icon: Brain, gradient: "from-[hsl(170,40%,42%)] to-[hsl(160,35%,48%)]", lightBg: "bg-[hsl(170,20%,96%)]", darkBg: "dark:bg-[hsl(170,12%,12%)]", ring: "ring-[hsl(170,30%,65%)]" },
  { key: "tww", icon: Calendar, gradient: "from-[hsl(15,60%,55%)] to-[hsl(25,55%,58%)]", lightBg: "bg-[hsl(15,30%,96%)]", darkBg: "dark:bg-[hsl(15,18%,12%)]", ring: "ring-[hsl(15,40%,70%)]" },
] as const;

export default function FertilityAcademy() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const dir = isRTL ? "rtl" : "ltr";
  const [activeTab, setActiveTab] = useState("lessons");
  const [expandedLesson, setExpandedLesson] = useState<string | null>(LESSON_KEYS[0]);
  const [expandedSign, setExpandedSign] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const toggleLesson = useCallback((key: string) => setExpandedLesson(prev => prev === key ? null : key), []);
  const toggleSign = useCallback((key: string) => setExpandedSign(prev => prev === key ? null : key), []);
  const toggleTopic = useCallback((key: string) => setExpandedTopic(prev => prev === key ? null : key), []);
  const toggleDay = useCallback((key: string) => setExpandedDay(prev => prev === key ? null : key), []);

  const activeConfig = TAB_CONFIG.find(c => c.key === activeTab)!;

  return (
    <ToolFrame title={t("tools.fertilityAcademy.title")} subtitle={t("tools.fertilityAcademy.description")} mood="calm" toolId="fertility-academy">
      <div className="space-y-4" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>

        {/* ── Custom Tab Navigation ── */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
          {TAB_CONFIG.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-col items-center gap-1 min-w-[68px] px-3 py-2.5 rounded-2xl font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                  isActive
                    ? `bg-gradient-to-br ${tab.gradient} text-white shadow-lg shadow-black/10`
                    : `${tab.lightBg} ${tab.darkBg} text-muted-foreground hover:text-foreground border border-border/20`
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isActive ? "bg-white/20" : "bg-white/80 dark:bg-white/10"
                }`}>
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-white" : ""}`} strokeWidth={1.8} />
                </div>
                <span className="text-[10px] leading-tight">{t(`tools.fertilityAcademy.${tab.key}Tab`)}</span>
              </motion.button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {/* LESSONS */}
            {activeTab === "lessons" && (
              <>
                <p className="text-[11px] text-muted-foreground/70 mb-3 font-medium">
                  {t("toolsInternal.fertilityAcademy.lessonsCount", { count: LESSON_KEYS.length })}
                </p>
                <div className="space-y-2">
                  {LESSON_KEYS.map((key, i) => (
                    <AccordionItem
                      key={key}
                      isOpen={expandedLesson === key}
                      onToggle={() => toggleLesson(key)}
                      index={i}
                      isRTL={isRTL}
                      badge={<NumberBadge index={i} />}
                      title={t(`toolsInternal.fertilityAcademy.lessons.${key}.title`)}
                    >
                      <ContentBlock text={t(`toolsInternal.fertilityAcademy.lessons.${key}.content`)} isRTL={isRTL} />
                    </AccordionItem>
                  ))}
                </div>
              </>
            )}

            {/* SIGNS */}
            {activeTab === "signs" && (
              <>
                <p className="text-[11px] text-muted-foreground/70 mb-3 font-medium">
                  {t('toolsInternal.fertilitySigns.signsCount', { count: SIGN_KEYS.length })}
                </p>
                <div className="space-y-2">
                  {SIGN_KEYS.map((key, i) => (
                    <AccordionItem
                      key={key}
                      isOpen={expandedSign === key}
                      onToggle={() => toggleSign(key)}
                      index={i}
                      isRTL={isRTL}
                      badge={<NumberBadge index={i} />}
                      title={t(`toolsInternal.fertilitySigns.signs.${key}.title`)}
                    >
                      <ContentBlock text={t(`toolsInternal.fertilitySigns.signs.${key}.description`)} isRTL={isRTL} />
                      <TipBlock text={t(`toolsInternal.fertilitySigns.signs.${key}.tip`)} />
                    </AccordionItem>
                  ))}
                </div>
              </>
            )}

            {/* STRESS */}
            {activeTab === "stress" && (
              <>
                <p className="text-[11px] text-muted-foreground/70 mb-3 font-medium">
                  {t('toolsInternal.stressFertility.topicsCount', { count: TOPIC_KEYS.length })}
                </p>
                <div className="space-y-2">
                  {TOPIC_KEYS.map((key, i) => (
                    <AccordionItem
                      key={key}
                      isOpen={expandedTopic === key}
                      onToggle={() => toggleTopic(key)}
                      index={i}
                      isRTL={isRTL}
                      badge={<NumberBadge index={i} />}
                      title={t(`toolsInternal.stressFertility.topics.${key}.title`)}
                    >
                      <ContentBlock text={t(`toolsInternal.stressFertility.topics.${key}.content`)} isRTL={isRTL} />
                      <TipBlock text={t(`toolsInternal.stressFertility.topics.${key}.practice`)} />
                    </AccordionItem>
                  ))}
                </div>
              </>
            )}

            {/* TWW */}
            {activeTab === "tww" && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 shrink-0 text-destructive" />
                  <span className="text-sm font-bold text-foreground">{t('toolsInternal.twwCompanion.subtitle')}</span>
                </div>
                <div className="space-y-2">
                  {DAY_KEYS.map((key, i) => (
                    <AccordionItem
                      key={key}
                      isOpen={expandedDay === key}
                      onToggle={() => toggleDay(key)}
                      index={i}
                      isRTL={isRTL}
                      badge={<NumberBadge index={i} accent="destructive" />}
                      title={t(`toolsInternal.twwCompanion.days.${key}.title`)}
                      accentColor="destructive"
                    >
                      <ContentBlock text={t(`toolsInternal.twwCompanion.days.${key}.body`)} isRTL={isRTL} />
                      <TipBlock text={t(`toolsInternal.twwCompanion.days.${key}.tip`)} accent="destructive" icon={Smile} />
                    </AccordionItem>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <RelatedToolLinks links={[
          { to: "/tools/cycle-tracker", titleKey: "toolsInternal.fertilityAcademy.related.cycleTracker", titleFallback: "Cycle Tracker", descKey: "toolsInternal.fertilityAcademy.related.cycleTrackerDesc", descFallback: "Track your menstrual cycle", icon: "droplets" },
          { to: "/tools/preconception-checkup", titleKey: "toolsInternal.fertilityAcademy.related.preconception", titleFallback: "Preconception Checkup", descKey: "toolsInternal.fertilityAcademy.related.preconceptionDesc", descFallback: "Prepare for a healthy pregnancy", icon: "heart" },
          { to: "/tools/nutrition-supplements", titleKey: "toolsInternal.fertilityAcademy.related.nutrition", titleFallback: "Nutrition Guide", descKey: "toolsInternal.fertilityAcademy.related.nutritionDesc", descFallback: "Fertility nutrition & supplements", icon: "pill" },
        ]} />

      </div>
    </ToolFrame>
  );
}
