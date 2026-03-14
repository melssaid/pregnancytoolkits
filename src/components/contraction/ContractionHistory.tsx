import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Trash2, RotateCcw } from "lucide-react";

interface Contraction {
  id: string;
  start: number;
  end: number | null;
  duration: number;
}

interface ContractionHistoryProps {
  contractions: Contraction[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getIntensityLabel(duration: number, t: any): { label: string; color: string } {
  if (duration >= 90) return { label: t("toolsInternal.contractionTimer.intensityStrong", "قوي جداً"), color: "text-destructive bg-destructive/10" };
  if (duration >= 60) return { label: t("toolsInternal.contractionTimer.intensityModerate", "قوي"), color: "text-orange-600 bg-orange-500/10" };
  if (duration >= 30) return { label: t("toolsInternal.contractionTimer.intensityMild", "متوسط"), color: "text-amber-600 bg-amber-500/10" };
  return { label: t("toolsInternal.contractionTimer.intensityLight", "خفيف"), color: "text-muted-foreground bg-muted" };
}

export function ContractionHistory({ contractions, onDelete, onClear }: ContractionHistoryProps) {
  const { t } = useTranslation();

  if (contractions.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-foreground">
          {t("toolsInternal.contractionTimer.history", "السجل")} ({contractions.length})
        </h3>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          {t("toolsInternal.contractionTimer.clearAll", "مسح الكل")}
        </button>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[2rem_1fr_1fr_1fr_1.2fr_1.5rem] gap-1 px-2 mb-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
        <span>#</span>
        <span>{t("toolsInternal.contractionTimer.time", "الوقت")}</span>
        <span>{t("toolsInternal.contractionTimer.duration", "المدة")}</span>
        <span>{t("toolsInternal.contractionTimer.gap", "الفاصل")}</span>
        <span>{t("toolsInternal.contractionTimer.intensity", "الشدة")}</span>
        <span></span>
      </div>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        {contractions.slice(0, 30).map((c, i) => {
          const interval =
            i < contractions.length - 1
              ? Math.floor(
                  (c.start - (contractions[i + 1].end || contractions[i + 1].start)) / 1000
                )
              : null;

          const intensity = getIntensityLabel(c.duration, t);

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="grid grid-cols-[2rem_1fr_1fr_1fr_1.2fr_1.5rem] gap-1 items-center p-2 rounded-lg bg-card border border-border/10 shadow-sm"
            >
              <span className="text-[10px] font-bold text-destructive/70 tabular-nums">
                {contractions.length - i}
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {formatTime(c.start)}
              </span>
              <span className="text-[11px] font-bold text-foreground tabular-nums">
                {formatDuration(c.duration)}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 tabular-nums">
                {interval !== null && interval > 0 ? formatDuration(interval) : "—"}
              </span>
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full w-fit ${intensity.color}`}>
                {intensity.label}
              </span>
              <button
                onClick={() => onDelete(c.id)}
                className="p-1 rounded hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3 h-3 text-muted-foreground/40 hover:text-destructive" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
