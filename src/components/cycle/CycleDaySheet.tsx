import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, Droplets } from "lucide-react";
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

const FLOW_OPTIONS: { value: FlowLevel; dots: number }[] = [
  { value: "spotting", dots: 1 },
  { value: "light", dots: 2 },
  { value: "medium", dots: 3 },
  { value: "heavy", dots: 4 },
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
    // Auto-expand if there's existing data beyond flow
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

  // Quick toggle: mark as medium flow and save immediately
  const handleQuickMark = () => {
    onSave(dateStr, { ...currentLog, flow: "medium" });
    onClose();
  };

  const date = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  const dateLabel = dateStr ? formatLocalized(date, "EEEE, d MMMM", currentLanguage) : "";
  const hasExistingData = !!(currentLog?.flow || currentLog?.symptoms?.length || currentLog?.mood || currentLog?.notes);

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-sm text-center">{dateLabel}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-3 space-y-3 overflow-y-auto">
          {/* Quick mark button - shown when no flow logged */}
          {!currentLog?.flow && (
            <button
              onClick={handleQuickMark}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-red-300/50 hover:border-red-400 hover:bg-red-500/5 transition-all active:scale-[0.98]"
            >
              <Droplets className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                {t('toolsInternal.cycleTracker.markPeriod', 'Mark as period day')}
              </span>
            </button>
          )}

          {/* Flow intensity */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('toolsInternal.cycleTracker.flowIntensity')}</Label>
            <div className="grid grid-cols-4 gap-2">
              {FLOW_OPTIONS.map(({ value, dots }) => (
                <button
                  key={value}
                  onClick={() => setFlow(flow === value ? undefined : value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all active:scale-95",
                    flow === value
                      ? "bg-red-500/10 border-red-400 text-red-600 dark:text-red-400"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: dots }).map((_, i) => (
                      <div key={i} className={cn("w-1.5 h-1.5 rounded-full", flow === value ? "bg-red-500" : "bg-muted-foreground/30")} />
                    ))}
                  </div>
                  <span className="text-[10px]">
                    {t(`toolsInternal.cycleTracker.flowLevels.${value}`, value)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood - always visible, compact */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('toolsInternal.cycleTracker.mood', 'Mood')}</Label>
            <div className="flex gap-1.5">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(mood === m ? undefined : m)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl border transition-all active:scale-95",
                    mood === m ? "bg-primary/10 border-primary" : "border-border hover:bg-muted"
                  )}
                >
                  <span className="text-base">{MOOD_EMOJIS[m]}</span>
                  <span className="text-[8px] text-muted-foreground">
                    {t(`toolsInternal.cycleTracker.moods.${m}`, m)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Expandable: Symptoms + Notes */}
          {!showMore ? (
            <button
              onClick={() => setShowMore(true)}
              className="w-full text-center text-xs text-primary/70 hover:text-primary py-1"
            >
              {t('toolsInternal.cycleTracker.addMore', '+ Add symptoms & notes')}
            </button>
          ) : (
            <>
              {/* Symptoms */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t('toolsInternal.cycleTracker.symptoms')}</Label>
                <div className="flex flex-wrap gap-1.5">
                  {SYMPTOM_KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() => toggleSymptom(key)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] transition-all border active:scale-95",
                        symptoms.includes(key)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground hover:bg-accent border-transparent"
                      )}
                    >
                      {t(`toolsInternal.cycleTracker.symptomOptions.${key}`, key)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t('toolsInternal.cycleTracker.notes', 'Notes')}</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('toolsInternal.cycleTracker.notesPlaceholder', 'Add notes...')}
                  className="text-sm min-h-[50px] resize-none"
                  maxLength={500}
                />
              </div>
            </>
          )}
        </div>

        <DrawerFooter className="pt-0 gap-1.5">
          <Button onClick={handleSave} className="w-full h-10">
            {t('toolsInternal.cycleTracker.saveDay', 'Save')}
          </Button>
          {hasExistingData && (
            <Button variant="ghost" size="sm" onClick={handleDelete} className="w-full text-destructive hover:text-destructive gap-1.5 h-8 text-xs">
              <Trash2 className="w-3 h-3" />
              {t('toolsInternal.cycleTracker.removeDay', 'Remove')}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
