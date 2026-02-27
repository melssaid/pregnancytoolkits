import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Droplets, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

const FLOW_OPTIONS: { value: FlowLevel; dots: number; color: string }[] = [
  { value: "spotting", dots: 1, color: "bg-rose-300" },
  { value: "light", dots: 2, color: "bg-rose-400" },
  { value: "medium", dots: 3, color: "bg-rose-500" },
  { value: "heavy", dots: 4, color: "bg-rose-600" },
];

export function CycleDaySheet({ open, dateStr, currentLog, onSave, onDelete, onClose }: Props) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [flow, setFlow] = useState<FlowLevel | undefined>(currentLog?.flow);
  const [symptoms, setSymptoms] = useState<string[]>(currentLog?.symptoms || []);
  const [mood, setMood] = useState<MoodLevel | undefined>(currentLog?.mood);
  const [notes, setNotes] = useState(currentLog?.notes || "");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    setFlow(currentLog?.flow);
    setSymptoms(currentLog?.symptoms || []);
    setMood(currentLog?.mood);
    setNotes(currentLog?.notes || "");
    setShowMore(!!(currentLog?.symptoms?.length || currentLog?.mood || currentLog?.notes));
  }, [currentLog, dateStr]);

  const toggleSymptom = (s: string) =>
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = () => {
    onSave(dateStr, {
      flow,
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

  const handleQuickMark = () => {
    onSave(dateStr, { ...currentLog, flow: "medium" });
    onClose();
  };

  const date = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  const dateLabel = dateStr ? formatLocalized(date, "EEEE, d MMMM", currentLanguage) : "";
  const hasExistingData = !!(currentLog?.flow || currentLog?.symptoms?.length || currentLog?.mood || currentLog?.notes);

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base font-bold text-center">{dateLabel}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-3 space-y-4 overflow-y-auto">
          {/* Quick mark */}
          {!currentLog?.flow && (
            <motion.button
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleQuickMark}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 border-dashed border-rose-300/50 hover:border-rose-400 hover:bg-rose-500/5 transition-all"
            >
              <Droplets className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {t('toolsInternal.cycleTracker.markPeriod', 'Mark as period day')}
              </span>
            </motion.button>
          )}

          {/* Flow intensity */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">{t('toolsInternal.cycleTracker.flowIntensity')}</Label>
            <div className="grid grid-cols-4 gap-2">
              {FLOW_OPTIONS.map(({ value, dots, color }) => (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setFlow(flow === value ? undefined : value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all",
                    flow === value
                      ? "bg-rose-500/10 border-rose-400/70 dark:border-rose-500/50"
                      : "border-border/60 hover:bg-muted/50"
                  )}
                >
                  <div className="flex gap-[3px]">
                    {Array.from({ length: dots }).map((_, i) => (
                      <div key={i} className={cn("w-2 h-2 rounded-full transition-colors", flow === value ? color : "bg-muted-foreground/20")} />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-foreground/80">
                    {t(`toolsInternal.cycleTracker.flowLevels.${value}`, value)}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">{t('toolsInternal.cycleTracker.mood', 'Mood')}</Label>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map((m) => (
                <motion.button
                  key={m}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMood(mood === m ? undefined : m)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl border-2 transition-all",
                    mood === m
                      ? "bg-primary/10 border-primary/60"
                      : "border-border/60 hover:bg-muted/50"
                  )}
                >
                  <span className="text-xl">{MOOD_EMOJIS[m]}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {t(`toolsInternal.cycleTracker.moods.${m}`, m)}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Expandable Symptoms + Notes */}
          <button
            onClick={() => setShowMore(prev => !prev)}
            className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-primary/70 hover:text-primary py-1.5 transition-colors"
          >
            {showMore ? (
              <>
                <ChevronUp className="w-4 h-4" />
                {t('toolsInternal.cycleTracker.showLess', 'Show less')}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {t('toolsInternal.cycleTracker.addMore', '+ Add symptoms & notes')}
              </>
            )}
          </button>

          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Symptoms */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">{t('toolsInternal.cycleTracker.symptoms')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOM_KEYS.map((key) => (
                      <motion.button
                        key={key}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => toggleSymptom(key)}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border-2",
                          symptoms.includes(key)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 text-foreground/70 hover:bg-accent border-transparent"
                        )}
                      >
                        {t(`toolsInternal.cycleTracker.symptomOptions.${key}`, key)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">{t('toolsInternal.cycleTracker.notes', 'Notes')}</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('toolsInternal.cycleTracker.notesPlaceholder', 'Add notes...')}
                    className="text-sm min-h-[60px] resize-none rounded-xl"
                    maxLength={500}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DrawerFooter className="pt-0 gap-2">
          <Button onClick={handleSave} className="w-full h-12 text-sm font-bold rounded-xl">
            {t('toolsInternal.cycleTracker.saveDay', 'Save')}
          </Button>
          {hasExistingData && (
            <Button variant="ghost" size="sm" onClick={handleDelete} className="w-full text-destructive hover:text-destructive gap-1.5 h-9 text-xs font-semibold">
              <Trash2 className="w-3.5 h-3.5" />
              {t('toolsInternal.cycleTracker.removeDay', 'Remove')}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
