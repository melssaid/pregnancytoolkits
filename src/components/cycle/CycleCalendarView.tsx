import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isAfter,
} from "date-fns";
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
  const [direction, setDirection] = useState(0);
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

  const goNext = () => { setDirection(1); setCurrentMonth(prev => addMonths(prev, 1)); };
  const goPrev = () => { setDirection(-1); setCurrentMonth(prev => subMonths(prev, 1)); };

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

  const getFlowColor = (flow?: string) => {
    const colors: Record<string, string> = {
      spotting: "bg-rose-300 dark:bg-rose-400",
      light: "bg-rose-400 dark:bg-rose-500",
      medium: "bg-rose-500",
      heavy: "bg-rose-600 dark:bg-rose-500",
    };
    return colors[flow || ""] || "bg-rose-500";
  };

  const monthKey = format(currentMonth, "yyyy-MM");

  return (
    <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Month header */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={goPrev}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
        >
          {isRTL ? <ChevronRight className="w-5 h-5 text-foreground/70" /> : <ChevronLeft className="w-5 h-5 text-foreground/70" />}
        </button>
        <AnimatePresence mode="wait">
          <motion.h3
            key={monthKey}
            initial={{ opacity: 0, y: direction * 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction * -10 }}
            transition={{ duration: 0.2 }}
            className="text-base font-bold text-foreground"
          >
            {formatLocalized(currentMonth, "LLLL yyyy", currentLanguage)}
          </motion.h3>
        </AnimatePresence>
        <button
          onClick={goNext}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
        >
          {isRTL ? <ChevronLeft className="w-5 h-5 text-foreground/70" /> : <ChevronRight className="w-5 h-5 text-foreground/70" />}
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-2">
        {weekDayNames.map((name, i) => (
          <div key={i} className="text-center py-2 text-[11px] font-semibold text-muted-foreground">
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="px-2 pb-3"
        >
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-0.5">
              {week.map((day) => {
                const { dateStr, log, isLogged, isPredictedPeriod, isFertile, isOvulation, isFuture } = getDayStatus(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, today);
                const hasMood = !!log?.mood;

                return (
                  <motion.button
                    key={dateStr}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => !isFuture && onDayTap(dateStr)}
                    disabled={isFuture}
                    className={cn(
                      "relative aspect-square flex flex-col items-center justify-center rounded-xl m-0.5 transition-colors",
                      !isCurrentMonth && "opacity-25",
                      isFuture && "opacity-35 cursor-default",
                      isToday && !isLogged && "ring-2 ring-primary/60 ring-offset-1 ring-offset-card",
                      isLogged && "bg-rose-500/15 dark:bg-rose-500/20",
                      isPredictedPeriod && "bg-rose-500/8 border border-dashed border-rose-300/40 dark:border-rose-600/30",
                      isFertile && !isLogged && !isPredictedPeriod && "bg-violet-500/10 border border-dashed border-violet-300/40 dark:border-violet-600/30",
                      isOvulation && !isLogged && "bg-violet-500/20 border-2 border-violet-400/50 dark:border-violet-500/40",
                      !isLogged && !isPredictedPeriod && !isFertile && !isOvulation && "hover:bg-muted/60",
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium leading-none",
                      isToday && "font-bold text-primary",
                      isLogged && "font-bold text-rose-700 dark:text-rose-300",
                    )}>
                      {format(day, "d")}
                    </span>
                    
                    {/* Indicators */}
                    <div className="flex items-center gap-0.5 mt-0.5 h-2.5">
                      {isLogged && (
                        <div className={cn("w-[6px] h-[6px] rounded-full", getFlowColor(log?.flow))} />
                      )}
                      {isOvulation && !isLogged && (
                        <div className="w-[6px] h-[6px] rounded-full bg-violet-500" />
                      )}
                      {hasMood && (
                        <span className="text-[7px] leading-none">
                          {log?.mood === "great" ? "😄" : log?.mood === "good" ? "🙂" : log?.mood === "okay" ? "😐" : log?.mood === "bad" ? "😟" : "😢"}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-3 border-t border-border/50 bg-muted/20 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
          {t('toolsInternal.cycleTracker.menstrual', 'Period')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
          {t('toolsInternal.cycleTracker.ovulation', 'Ovulation')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-dashed border-violet-400 bg-violet-500/10" />
          {t('toolsInternal.cycleTracker.fertileWindow', 'Fertile')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-dashed border-rose-300 bg-rose-500/8" />
          {t('toolsInternal.cycleTracker.predicted', 'Predicted')}
        </span>
      </div>
    </div>
  );
}
