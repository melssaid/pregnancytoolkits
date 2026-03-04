import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";

const CONCERN_KEYS = [
  "acne", "melasma", "stretchMarks", "dryness",
  "oiliness", "sensitivity", "itching", "glow",
] as const;

interface SkincareConcernGridProps {
  concerns: string[];
  onToggle: (id: string) => void;
}

export const SkincareConcernGrid = ({ concerns, onToggle }: SkincareConcernGridProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <span className="text-xs text-muted-foreground font-medium">
        {t('toolsInternal.skincare.skinConcerns')}
      </span>
      <div className="grid grid-cols-2 gap-1.5">
        {CONCERN_KEYS.map((key) => {
          const isSelected = concerns.includes(key);
          return (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-start ${
                isSelected
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card border-border/50 hover:bg-muted/50"
              }`}
            >
              <Checkbox checked={isSelected} className="shrink-0 pointer-events-none" />
              <span className="text-xs leading-snug">
                {t(`toolsInternal.skincare.concerns.${key}.label`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
