import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { differenceInDays, addDays, format } from "date-fns";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";

/* ── Types ── */
export type FlowLevel = "spotting" | "light" | "medium" | "heavy";
export type MoodLevel = "great" | "good" | "okay" | "bad" | "awful";
export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface DayLog {
  flow?: FlowLevel;
  symptoms?: string[];
  mood?: MoodLevel;
  notes?: string;
}

export interface CycleDataState {
  dayLogs: Record<string, DayLog>;
  version: number;
}

export interface DetectedCycle {
  startDate: string;
  endDate: string;
  periodLength: number;
  cycleLength?: number;
}

export interface CycleStats {
  avgCycle: number;
  avgPeriod: number;
  nextPeriod: Date;
  ovulationDay: Date;
  fertileStart: Date;
  fertileEnd: Date;
  daysToOv: number;
  daysToPeriod: number;
  daysToFertile: number;
  isRegular: boolean;
  phase: CyclePhase;
  cycleDay: number;
  detectedCycles: DetectedCycle[];
}

/* ── Constants ── */
const STORAGE_KEY = "cycle-tracker-v2";
const OLD_STORAGE_KEY = "cycle-tracker-data";

export const SYMPTOM_KEYS = [
  "cramps", "headache", "bloating", "moodSwings",
  "fatigue", "breastTenderness", "acne", "backPain",
] as const;

export const MOOD_OPTIONS: MoodLevel[] = ["great", "good", "okay", "bad", "awful"];
export const MOOD_EMOJIS: Record<MoodLevel, string> = {
  great: "😄", good: "🙂", okay: "😐", bad: "😟", awful: "😢",
};

/* ── Old format for migration ── */
interface OldCycleEntry {
  id: string;
  startDate: string;
  endDate?: string;
  flowIntensity: "light" | "medium" | "heavy";
  symptoms?: string[];
}

/* ── Migration ── */
function migrateFromOld(oldData: OldCycleEntry[]): CycleDataState {
  const dayLogs: Record<string, DayLog> = {};
  for (const entry of oldData) {
    const start = new Date(entry.startDate);
    const end = entry.endDate ? new Date(entry.endDate) : start;
    const days = Math.max(1, differenceInDays(end, start) + 1);
    for (let i = 0; i < Math.min(days, 14); i++) {
      const date = format(addDays(start, i), "yyyy-MM-dd");
      dayLogs[date] = {
        flow: entry.flowIntensity,
        symptoms: i === 0 ? entry.symptoms : undefined,
      };
    }
  }
  return { dayLogs, version: 2 };
}

/* ── Cycle detection ── */
function detectCycles(dayLogs: Record<string, DayLog>): DetectedCycle[] {
  const dates = Object.keys(dayLogs)
    .filter(d => dayLogs[d].flow)
    .sort();
  if (dates.length === 0) return [];

  const periods: { start: string; end: string }[] = [];
  let cur = { start: dates[0], end: dates[0] };

  for (let i = 1; i < dates.length; i++) {
    const gap = differenceInDays(new Date(dates[i]), new Date(cur.end));
    if (gap <= 2) {
      cur.end = dates[i];
    } else {
      periods.push({ ...cur });
      cur = { start: dates[i], end: dates[i] };
    }
  }
  periods.push(cur);

  return periods.map((p, i) => ({
    startDate: p.start,
    endDate: p.end,
    periodLength: differenceInDays(new Date(p.end), new Date(p.start)) + 1,
    cycleLength: i < periods.length - 1
      ? differenceInDays(new Date(periods[i + 1].start), new Date(p.start))
      : undefined,
  }));
}

/* ── Phase calculation ── */
function getCurrentPhase(lastStart: Date, avgCycle: number, avgPeriod: number): { phase: CyclePhase; day: number } {
  const today = new Date();
  const day = differenceInDays(today, lastStart) + 1;
  const ovDay = Math.round(avgCycle - 14);
  if (day <= avgPeriod) return { phase: "menstrual", day };
  if (day < ovDay - 2) return { phase: "follicular", day };
  if (day <= ovDay + 1) return { phase: "ovulation", day };
  return { phase: "luteal", day };
}

/* ── Validation ── */
function isValidV2(data: unknown): data is CycleDataState {
  return typeof data === 'object' && data !== null &&
    'version' in data && (data as CycleDataState).version === 2 &&
    'dayLogs' in data && typeof (data as CycleDataState).dayLogs === 'object';
}

function isValidOld(data: unknown): data is OldCycleEntry[] {
  return Array.isArray(data) && data.every(item =>
    typeof item === 'object' && item !== null &&
    typeof (item as OldCycleEntry).id === 'string' &&
    typeof (item as OldCycleEntry).startDate === 'string'
  );
}

/* ── Hook ── */
export function useCycleData() {
  const [data, setData] = useState<CycleDataState>({ dayLogs: {}, version: 2 });
  const initialized = useRef(false);

  // Load with migration
  useEffect(() => {
    let loaded = safeParseLocalStorage<CycleDataState>(STORAGE_KEY, { dayLogs: {}, version: 2 }, isValidV2);
    
    // If empty, try migrating from old format
    if (Object.keys(loaded.dayLogs).length === 0) {
      const oldData = safeParseLocalStorage<OldCycleEntry[]>(OLD_STORAGE_KEY, [], isValidOld);
      if (oldData.length > 0) {
        loaded = migrateFromOld(oldData);
      }
    }
    
    setData(loaded);
    initialized.current = true;
  }, []);

  // Save
  useEffect(() => {
    if (!initialized.current) return;
    safeSaveToLocalStorage(STORAGE_KEY, data);
  }, [data]);

  // Toggle a day's period status (quick tap)
  const toggleDay = useCallback((dateStr: string) => {
    setData(prev => {
      const logs = { ...prev.dayLogs };
      if (logs[dateStr]?.flow) {
        // Remove flow but keep other data if any
        const { flow, ...rest } = logs[dateStr];
        if (Object.keys(rest).length === 0 || (Object.keys(rest).length === 1 && !rest.symptoms?.length && !rest.mood && !rest.notes)) {
          delete logs[dateStr];
        } else {
          logs[dateStr] = rest;
        }
      } else {
        logs[dateStr] = { ...logs[dateStr], flow: "medium" };
      }
      return { ...prev, dayLogs: logs };
    });
  }, []);

  // Update a day's full details
  const updateDay = useCallback((dateStr: string, log: DayLog) => {
    setData(prev => {
      const logs = { ...prev.dayLogs };
      const isEmpty = !log.flow && (!log.symptoms || log.symptoms.length === 0) && !log.mood && !log.notes;
      if (isEmpty) {
        delete logs[dateStr];
      } else {
        logs[dateStr] = log;
      }
      return { ...prev, dayLogs: logs };
    });
  }, []);

  // Delete a day
  const deleteDay = useCallback((dateStr: string) => {
    setData(prev => {
      const logs = { ...prev.dayLogs };
      delete logs[dateStr];
      return { ...prev, dayLogs: logs };
    });
  }, []);

  // Computed stats
  const stats = useMemo((): CycleStats | null => {
    const cycles = detectCycles(data.dayLogs);
    if (cycles.length === 0) return null;

    const cycleLengths = cycles
      .map(c => c.cycleLength)
      .filter((l): l is number => l !== undefined && l > 0 && l < 60);

    const avg = cycleLengths.length
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : 28;

    const periodLengths = cycles.map(c => c.periodLength);
    const avgPeriod = periodLengths.length
      ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
      : 5;

    const lastCycle = cycles[cycles.length - 1];
    const lastStart = new Date(lastCycle.startDate);
    const nextPeriod = addDays(lastStart, avg);
    const ovulationDay = addDays(lastStart, avg - 14);
    const fertileStart = addDays(ovulationDay, -4);
    const fertileEnd = addDays(ovulationDay, 1);
    const daysToOv = Math.max(0, differenceInDays(ovulationDay, new Date()));
    const daysToPeriod = Math.max(0, differenceInDays(nextPeriod, new Date()));
    const daysToFertile = Math.max(0, differenceInDays(fertileStart, new Date()));

    const stdDev = cycleLengths.length > 1
      ? Math.sqrt(cycleLengths.reduce((s, v) => s + (v - avg) ** 2, 0) / cycleLengths.length)
      : 0;

    const phaseInfo = getCurrentPhase(lastStart, avg, avgPeriod);

    return {
      avgCycle: avg,
      avgPeriod,
      nextPeriod,
      ovulationDay,
      fertileStart,
      fertileEnd,
      daysToOv,
      daysToPeriod,
      daysToFertile,
      isRegular: stdDev <= 3,
      phase: phaseInfo.phase,
      cycleDay: phaseInfo.day,
      detectedCycles: cycles,
    };
  }, [data.dayLogs]);

  // Get predicted dates for calendar coloring
  const predictedDates = useMemo(() => {
    if (!stats) return { periodDays: new Set<string>(), fertileDays: new Set<string>(), ovulationDay: "" };
    
    const periodDays = new Set<string>();
    const fertileDays = new Set<string>();
    
    // Logged period days
    Object.entries(data.dayLogs).forEach(([date, log]) => {
      if (log.flow) periodDays.add(date);
    });

    // Predicted next period
    for (let i = 0; i < stats.avgPeriod; i++) {
      periodDays.add(format(addDays(stats.nextPeriod, i), "yyyy-MM-dd"));
    }

    // Fertile window
    for (let d = stats.fertileStart; d <= stats.fertileEnd; d = addDays(d, 1)) {
      fertileDays.add(format(d, "yyyy-MM-dd"));
    }

    return {
      periodDays,
      fertileDays,
      ovulationDay: format(stats.ovulationDay, "yyyy-MM-dd"),
    };
  }, [stats, data.dayLogs]);

  return {
    dayLogs: data.dayLogs,
    stats,
    predictedDates,
    toggleDay,
    updateDay,
    deleteDay,
  };
}
