import { useState, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Smile, BookOpen, Eye, Brain, Calendar, Lightbulb, Sparkles } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";


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
  badge?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accentColor?: "primary" | "destructive";
  gradient?: string;
}

const AccordionItem = memo(function AccordionItem({
  isOpen, onToggle, index, isRTL, badge, title, children, accentColor = "primary", gradient
}: AccordionItemProps) {
  const accent = accentColor === "destructive";
  const borderSide = isRTL ? "border-r-[3px]" : "border-l-[3px]";
  const openBorderColor = accent ? "border-r-destructive/50 border-l-destructive/50" : "border-r-primary/50 border-l-primary/50";
  const openBg = accent ? "bg-destructive/[0.04]" : "bg-primary/[0.04]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.25, ease: "easeOut" }}
    >
      <div
        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
          isOpen
            ? `${borderSide} ${openBorderColor} ${openBg} shadow-md border-border/20`
            : "border-border/30 hover:border-border/50 bg-card/60 backdrop-blur-sm hover:shadow-sm"
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="w-full px-3.5 py-3 flex items-center justify-between gap-2.5 group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {badge}
            <span className={`text-[13px] font-semibold leading-snug text-start ${
              isOpen ? "text-foreground" : "text-foreground/75 group-hover:text-foreground"
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

// ── Number Badge — circular gradient ─────────────────────────────────
function NumberBadge({ index, gradient }: { index: number; gradient?: string }) {
  return (
    <span
      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm bg-gradient-to-br ${gradient || "from-primary to-primary/70"}`}
    >
      {index + 1}
    </span>
  );
}

// ── Content Block — with icon and better styling ─────────────────────
function ContentBlock({ text, isRTL, icon: Icon = BookOpen }: { text: string; isRTL: boolean; icon?: any }) {
  return (
    <div className="rounded-xl border border-border/20 bg-gradient-to-br from-background/80 to-muted/30 backdrop-blur-sm p-3.5">
      <div className="flex items-start gap-2">
        <div className="w-5 h-5 rounded-md bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-3 h-3 text-primary/50" />
        </div>
        <p className="whitespace-pre-line text-[13px] font-semibold leading-[1.9] text-foreground flex-1" style={{ textAlign: isRTL ? "right" : "left" }}>
          {text}
        </p>
      </div>
    </div>
  );
}

function TipBlock({ text, accent = "primary", icon: Icon }: { text: string; accent?: "primary" | "destructive"; icon?: any }) {
  const TipIcon = Icon || Lightbulb;
  const isDestructive = accent === "destructive";
  const borderSide = "ltr:border-l-2 rtl:border-r-2";
  const borderColor = isDestructive ? "border-l-destructive/40 border-r-destructive/40" : "border-l-primary/40 border-r-primary/40";
  const bg = isDestructive ? "bg-destructive/[0.05]" : "bg-primary/[0.05]";
  const textColor = isDestructive ? "text-destructive" : "text-primary";

  return (
    <div className={`mt-2.5 p-3 rounded-xl ${bg} ${borderSide} ${borderColor} flex items-start gap-2`}>
      <div className={`w-5 h-5 rounded-full ${isDestructive ? "bg-destructive/10" : "bg-primary/10"} flex items-center justify-center shrink-0 mt-0.5`}>
        <TipIcon className={`w-3 h-3 ${textColor}`} />
      </div>
      <span className={`text-xs ${textColor} font-bold leading-relaxed flex-1`}>{text}</span>
    </div>
  );
}

// ── Section Header with count ────────────────────────────────────────
function SectionHeader({ icon: Icon, count, label, gradient }: { icon: any; count: number; label: string; gradient: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-[11px] text-muted-foreground/70 font-semibold">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/30" />
      <span className={`text-[10px] font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {count}
      </span>
    </div>
  );
}

// ── Tab config ───────────────────────────────────────────────────────
const TAB_CONFIG = [
  { key: "lessons", icon: BookOpen, gradient: "from-[hsl(340,55%,55%)] to-[hsl(350,50%,60%)]", lightBg: "bg-[hsl(340,30%,96%)]", darkBg: "dark:bg-[hsl(340,20%,12%)]", ring: "ring-[hsl(340,40%,70%)]" },
  { key: "signs", icon: Eye, gradient: "from-[hsl(280,45%,55%)] to-[hsl(300,40%,58%)]", lightBg: "bg-[hsl(280,25%,96%)]", darkBg: "dark:bg-[hsl(280,15%,12%)]", ring: "ring-[hsl(280,35%,70%)]" },
  { key: "stress", icon: Brain, gradient: "from-[hsl(170,40%,42%)] to-[hsl(160,35%,48%)]", lightBg: "bg-[hsl(170,20%,96%)]", darkBg: "dark:bg-[hsl(170,12%,12%)]", ring: "ring-[hsl(170,30%,65%)]" },
  { key: "tww", icon: Calendar, gradient: "from-[hsl(15,60%,55%)] to-[hsl(25,55%,58%)]", lightBg: "bg-[hsl(15,30%,96%)]", darkBg: "dark:bg-[hsl(15,18%,12%)]", ring: "ring-[hsl(15,40%,70%)]" },
] as const;

export default function FertilityAcademy() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  const [activeTab, setActiveTab] = useState("lessons");
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
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

        {/* ── Tab Navigation with icons ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none -mx-1 px-1">
          {TAB_CONFIG.map(tab => {
            const isActive = activeTab === tab.key;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-3.5 py-2.5 rounded-2xl text-[11px] font-bold whitespace-nowrap transition-all duration-300 flex-shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? `bg-gradient-to-br ${tab.gradient} text-white shadow-lg shadow-black/10`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {isActive && <TabIcon className="w-3.5 h-3.5" />}
                {t(`tools.fertilityAcademy.${tab.key}Tab`)}
              </button>
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
                <SectionHeader
                  icon={BookOpen}
                  count={LESSON_KEYS.length}
                  label={t("toolsInternal.fertilityAcademy.lessonsCount", { count: LESSON_KEYS.length })}
                  gradient={activeConfig.gradient}
                />
                <div className="space-y-2">
                  {LESSON_KEYS.map((key, i) => (
                    <AccordionItem
                      key={key}
                      isOpen={expandedLesson === key}
                      onToggle={() => toggleLesson(key)}
                      index={i}
                      isRTL={isRTL}
                      badge={<NumberBadge index={i} gradient={activeConfig.gradient} />}
                      title={t(`toolsInternal.fertilityAcademy.lessons.${key}.title`)}
                      gradient={activeConfig.gradient}
                    >
                      <ContentBlock text={t(`toolsInternal.fertilityAcademy.lessons.${key}.content`)} isRTL={isRTL} icon={Sparkles} />
                    </AccordionItem>
                  ))}
                </div>
              </>
            )}

            {/* SIGNS */}
            {activeTab === "signs" && (
              <>
                <SectionHeader
                  icon={Eye}
                  count={SIGN_KEYS.length}
                  label={t('toolsInternal.fertilitySigns.signsCount', { count: SIGN_KEYS.length })}
                  gradient={activeConfig.gradient}
                />
                <div className="space-y-2">
                  {SIGN_KEYS.map((key, i) => (
                    <AccordionItem
                      key={key}
                      isOpen={expandedSign === key}
                      onToggle={() => toggleSign(key)}
                      index={i}
                      isRTL={isRTL}
                      badge={<NumberBadge index={i} gradient={activeConfig.gradient} />}
                      title={t(`toolsInternal.fertilitySigns.signs.${key}.title`)}
                      gradient={activeConfig.gradient}
                    >
                      <ContentBlock text={t(`toolsInternal.fertilitySigns.signs.${key}.description`)} isRTL={isRTL} icon={Eye} />
                      <TipBlock text={t(`toolsInternal.fertilitySigns.signs.${key}.tip`)} />
                    </AccordionItem>
                  ))}
                </div>
              </>
            )}

            {/* STRESS */}
            {activeTab === "stress" && (
              <>
                <SectionHeader
                  icon={Brain}
                  count={TOPIC_KEYS.length}
                  label={t('toolsInternal.stressFertility.topicsCount', { count: TOPIC_KEYS.length })}
                  gradient={activeConfig.gradient}
                />
                <div className="space-y-2">
                  {TOPIC_KEYS.map((key, i) => (
                    <AccordionItem
                      key={key}
                      isOpen={expandedTopic === key}
                      onToggle={() => toggleTopic(key)}
                      index={i}
                      isRTL={isRTL}
                      badge={<NumberBadge index={i} gradient={activeConfig.gradient} />}
                      title={t(`toolsInternal.stressFertility.topics.${key}.title`)}
                      gradient={activeConfig.gradient}
                    >
                      <ContentBlock text={t(`toolsInternal.stressFertility.topics.${key}.content`)} isRTL={isRTL} icon={Brain} />
                      <TipBlock text={t(`toolsInternal.stressFertility.topics.${key}.practice`)} />
                    </AccordionItem>
                  ))}
                </div>
              </>
            )}

            {/* TWW */}
            {activeTab === "tww" && (
              <>
                <SectionHeader
                  icon={Heart}
                  count={DAY_KEYS.length}
                  label={t('toolsInternal.twwCompanion.subtitle')}
                  gradient={activeConfig.gradient}
                />
                <div className="space-y-2">
                  {DAY_KEYS.map((key, i) => (
                    <AccordionItem
                      key={key}
                      isOpen={expandedDay === key}
                      onToggle={() => toggleDay(key)}
                      index={i}
                      isRTL={isRTL}
                      badge={<NumberBadge index={i} gradient={activeConfig.gradient} />}
                      title={t(`toolsInternal.twwCompanion.days.${key}.title`)}
                      accentColor="destructive"
                      gradient={activeConfig.gradient}
                    >
                      <ContentBlock text={t(`toolsInternal.twwCompanion.days.${key}.body`)} isRTL={isRTL} icon={Calendar} />
                      <TipBlock text={t(`toolsInternal.twwCompanion.days.${key}.tip`)} accent="destructive" icon={Smile} />
                    </AccordionItem>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </ToolFrame>
  );
}
