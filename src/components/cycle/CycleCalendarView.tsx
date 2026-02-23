import { useState, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isAfter } from "date-fns";
import { getDateLocale, formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { DayLog } from "@/hooks/useCycleData";

interface Props {
  dayLogs: Record<string, DayLog>;
  predictedDates: {
    periodDays: Set<string>;
    fertileDays: Set<string>;
    ovulationDay: string;
  };
  onDayTap: (dateStr: string) => void;
}

export function CycleCalendarView({ dayLogs, predictedDates, onDayTap }: Props) {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const locale = getDateLocale(currentLanguage);
  const today = new Date();

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { locale });
    const calEnd = endOfWeek(monthEnd, { locale });

    const result: Date[][] = [];
    let day = calStart;
    while (day <= calEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      result.push(week);
    }
    return result;
  }, [currentMonth, locale]);

  const weekDayNames = useMemo(() => {
    const start = startOfWeek(new Date(), { locale });
    return Array.from({ length: 7 }, (_, i) =>
      formatLocalized(addDays(start, i), "EEEEEE", currentLanguage)
    );
  }, [currentLanguage, locale]);

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const log = dayLogs[dateStr];
    const isLogged = !!log?.flow;
    const isPredictedPeriod = predictedDates.periodDays.has(dateStr) && !isLogged;
    const isFertile = predictedDates.fertileDays.has(dateStr);
    const isOvulation = predictedDates.ovulationDay === dateStr;
    const isFuture = isAfter(date, today);
    return { dateStr, log, isLogged, isPredictedPeriod, isFertile, isOvulation, isFuture };
  };

  const getFlowDot = (flow?: string) => {
    if (!flow) return null;
    const colors: Record<string, string> = {
      spotting: "bg-red-300",
      light: "bg-red-400",
      medium: "bg-red-500",
      heavy: "bg-red-600",
    };
    return colors[flow] || "bg-red-500";
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Month header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
        <button
          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <h3 className="text-sm font-semibold text-foreground">
          {formatLocalized(currentMonth, "LLLL yyyy", currentLanguage)}
        </h3>
        <button
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDayNames.map((name, i) => (
          <div key={i} className="text-center py-2 text-[10px] font-medium text-muted-foreground">
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="p-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((day) => {
              const { dateStr, log, isLogged, isPredictedPeriod, isFertile, isOvulation, isFuture } = getDayStatus(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const hasMood = !!log?.mood;

              return (
                <button
                  key={dateStr}
                  onClick={() => !isFuture && onDayTap(dateStr)}
                  disabled={isFuture}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center rounded-lg m-0.5 text-xs transition-all active:scale-95",
                    !isCurrentMonth && "opacity-30",
                    isFuture && "opacity-40 cursor-default",
                    isToday && "ring-1.5 ring-primary/60",
                    isLogged && "bg-red-500/15 text-red-700 dark:text-red-300 font-semibold",
                    isPredictedPeriod && !isLogged && "bg-red-500/5 border border-dashed border-red-300/40",
                    isFertile && !isLogged && !isPredictedPeriod && "bg-pink-500/8 border border-dashed border-pink-300/40",
                    isOvulation && !isLogged && "bg-pink-500/15 border border-pink-400/50",
                    !isLogged && !isPredictedPeriod && !isFertile && !isOvulation && "hover:bg-muted/50",
                  )}
                >
                  <span className="text-[11px] leading-none">{format(day, "d")}</span>
                  
                  {/* Indicators row */}
                  <div className="flex items-center gap-0.5 mt-0.5 h-2">
                    {isLogged && (
                      <div className={cn("w-1.5 h-1.5 rounded-full", getFlowDot(log?.flow))} />
                    )}
                    {isOvulation && !isLogged && (
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    )}
                    {hasMood && (
                      <span className="text-[7px] leading-none">
                        {log?.mood === "great" ? "😄" : log?.mood === "good" ? "🙂" : log?.mood === "okay" ? "😐" : log?.mood === "bad" ? "😟" : "😢"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-3 py-2.5 border-t border-border bg-muted/20 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500/60" />
          {t('toolsInternal.cycleTracker.menstrual', 'Period')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pink-500" />
          {t('toolsInternal.cycleTracker.ovulation', 'Ovulation')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border border-dashed border-pink-400 bg-pink-500/10" />
          {t('toolsInternal.cycleTracker.fertileWindow', 'Fertile')}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border border-dashed border-red-300 bg-red-500/5" />
          {t('toolsInternal.cycleTracker.predicted', 'Predicted')}
        </span>
      </div>
    </div>
  );
}
