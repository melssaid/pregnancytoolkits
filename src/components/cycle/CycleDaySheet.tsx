import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import type { DayLog, FlowLevel, MoodLevel } from "@/hooks/useCycleData";
import { SYMPTOM_KEYS, MOOD_OPTIONS, MOOD_EMOJIS } from "@/hooks/useCycleData";

interface Props {
  open: boolean;
  dateStr: string;
  currentLog?: DayLog;
  onSave: (dateStr: string, log: DayLog) => void;
  onDelete: (dateStr: string) => void;
  onClose: () => void;
}

const FLOW_LEVELS: { value: FlowLevel; emoji: string }[] = [
  { value: "spotting", emoji: "💧" },
  { value: "light", emoji: "💧💧" },
  { value: "medium", emoji: "💧💧💧" },
  { value: "heavy", emoji: "🩸" },
];

export function CycleDaySheet({ open, dateStr, currentLog, onSave, onDelete, onClose }: Props) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [isPeriod, setIsPeriod] = useState(!!currentLog?.flow);
  const [flow, setFlow] = useState<FlowLevel>(currentLog?.flow || "medium");
  const [symptoms, setSymptoms] = useState<string[]>(currentLog?.symptoms || []);
  const [mood, setMood] = useState<MoodLevel | undefined>(currentLog?.mood);
  const [notes, setNotes] = useState(currentLog?.notes || "");

  useEffect(() => {
    setIsPeriod(!!currentLog?.flow);
    setFlow(currentLog?.flow || "medium");
    setSymptoms(currentLog?.symptoms || []);
    setMood(currentLog?.mood);
    setNotes(currentLog?.notes || "");
  }, [currentLog, dateStr]);

  const toggleSymptom = (s: string) =>
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = () => {
    onSave(dateStr, {
      flow: isPeriod ? flow : undefined,
      symptoms: symptoms.length > 0 ? symptoms : undefined,
      mood,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(dateStr);
    onClose();
  };

  const date = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  const dateLabel = dateStr ? formatLocalized(date, "EEEE, d MMMM", currentLanguage) : "";
  const hasExistingData = !!(currentLog?.flow || currentLog?.symptoms?.length || currentLog?.mood || currentLog?.notes);

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-1">
          <DrawerTitle className="text-base font-bold text-center">{dateLabel}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-3 overflow-y-auto">
          {/* Period Toggle */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsPeriod(!isPeriod)}
            className={cn(
              "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border-2 transition-all",
              isPeriod
                ? "bg-rose-500/10 border-rose-400/60 dark:border-rose-500/40"
                : "border-dashed border-border/60 hover:border-rose-300 hover:bg-rose-500/5"
            )}
          >
            <Droplets className={cn("w-5 h-5", isPeriod ? "text-rose-500" : "text-muted-foreground")} />
            <span className={cn("text-sm font-bold", isPeriod ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>
              {t('toolsInternal.cycleTracker.markPeriod', 'Mark as period day')}
            </span>
          </motion.button>

          {/* Flow Level - only when period is on */}
          <AnimatePresence>
            {isPeriod && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2">
                  {FLOW_LEVELS.map(({ value, emoji }) => (
                    <motion.button
                      key={value}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setFlow(value)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all",
                        flow === value
                          ? "bg-rose-500/10 border-rose-400/60 dark:border-rose-500/40"
                          : "border-border/40 hover:bg-muted/50"
                      )}
                    >
                      <span className="text-sm">{emoji}</span>
                      <span className="text-[10px] font-medium text-foreground/70">
                        {t(`toolsInternal.cycleTracker.flowLevels.${value}`, value)}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mood */}
          <div className="flex gap-1.5">
            {MOOD_OPTIONS.map((m) => (
              <motion.button
                key={m}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMood(mood === m ? undefined : m)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 transition-all",
                  mood === m
                    ? "bg-primary/10 border-primary/50"
                    : "border-border/40 hover:bg-muted/50"
                )}
              >
                <span className="text-lg">{MOOD_EMOJIS[m]}</span>
                <span className="text-[9px] font-medium text-muted-foreground">
                  {t(`toolsInternal.cycleTracker.moods.${m}`, m)}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Symptoms */}
          <div className="flex flex-wrap gap-1.5">
            {SYMPTOM_KEYS.map((key) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.93 }}
                onClick={() => toggleSymptom(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-medium transition-all border",
                  symptoms.includes(key)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-foreground/60 hover:bg-accent border-transparent"
                )}
              >
                {t(`toolsInternal.cycleTracker.symptomOptions.${key}`, key)}
              </motion.button>
            ))}
          </div>

          {/* Notes */}
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('toolsInternal.cycleTracker.notesPlaceholder', 'Add notes...')}
            className="text-sm min-h-[50px] resize-none rounded-xl"
            maxLength={300}
          />
        </div>

        <DrawerFooter className="pt-1 gap-1.5">
          <Button onClick={handleSave} className="w-full h-11 text-sm font-bold rounded-xl">
            {t('toolsInternal.cycleTracker.saveDay', 'Save')}
          </Button>
          {hasExistingData && (
            <Button variant="ghost" size="sm" onClick={handleDelete} className="w-full text-destructive hover:text-destructive gap-1.5 h-8 text-xs font-semibold">
              <Trash2 className="w-3.5 h-3.5" />
              {t('toolsInternal.cycleTracker.removeDay', 'Remove')}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
