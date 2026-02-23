import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Trash2 } from "lucide-react";
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

  useEffect(() => {
    setFlow(currentLog?.flow);
    setSymptoms(currentLog?.symptoms || []);
    setMood(currentLog?.mood);
    setNotes(currentLog?.notes || "");
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

  const date = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  const dateLabel = dateStr ? formatLocalized(date, "EEEE, d MMMM yyyy", currentLanguage) : "";

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-sm">{dateLabel}</DrawerTitle>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-muted">
              <X className="w-4 h-4" />
            </button>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          {/* Flow */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">{t('toolsInternal.cycleTracker.flowIntensity')}</Label>
            <div className="grid grid-cols-4 gap-2">
              {FLOW_OPTIONS.map(({ value, dots }) => (
                <button
                  key={value}
                  onClick={() => setFlow(flow === value ? undefined : value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all",
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
                    {value === "spotting"
                      ? t('toolsInternal.cycleTracker.flowLevels.spotting', 'Spotting')
                      : t(`toolsInternal.cycleTracker.flowLevels.${value}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">{t('toolsInternal.cycleTracker.mood', 'Mood')}</Label>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(mood === m ? undefined : m)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                    mood === m ? "bg-primary/10 border-primary" : "border-border hover:bg-muted"
                  )}
                >
                  <span className="text-lg">{MOOD_EMOJIS[m]}</span>
                  <span className="text-[9px] text-muted-foreground">
                    {t(`toolsInternal.cycleTracker.moods.${m}`, m)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">{t('toolsInternal.cycleTracker.symptoms')}</Label>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOM_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => toggleSymptom(key)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] transition-all border",
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
          <div className="space-y-2">
            <Label className="text-xs font-semibold">{t('toolsInternal.cycleTracker.notes', 'Notes')}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('toolsInternal.cycleTracker.notesPlaceholder', 'Add notes about your day...')}
              className="text-sm min-h-[60px] resize-none"
              maxLength={500}
            />
          </div>
        </div>

        <DrawerFooter className="pt-0 gap-2">
          <Button onClick={handleSave} className="w-full">
            {t('toolsInternal.cycleTracker.saveDay', 'Save')}
          </Button>
          {currentLog && (
            <Button variant="ghost" onClick={handleDelete} className="w-full text-destructive hover:text-destructive gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              {t('toolsInternal.cycleTracker.removeDay', 'Remove Entry')}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
