import { useState, useEffect, useCallback } from 'react';
import { safeParseLocalStorage } from '@/lib/safeStorage';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string;
  totalDays: number;
  badges: string[];
}

const STORAGE_KEY = 'pt_streak_data';

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function computeBadges(streak: number, total: number): string[] {
  const b: string[] = [];
  if (streak >= 3) b.push('3_days');
  if (streak >= 7) b.push('7_days');
  if (streak >= 14) b.push('14_days');
  if (streak >= 30) b.push('30_days');
  if (streak >= 60) b.push('60_days');
  if (streak >= 90) b.push('90_days');
  if (total >= 50) b.push('50_total');
  if (total >= 100) b.push('100_total');
  return b;
}

export function useStreaks() {
  const [data, setData] = useState<StreakData>(() => {
    const saved = safeParseLocalStorage<StreakData>(STORAGE_KEY, {
      currentStreak: 0,
      longestStreak: 0,
      lastVisitDate: '',
      totalDays: 0,
      badges: [],
    });
    return saved;
  });

  const recordVisit = useCallback(() => {
    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    setData(prev => {
      if (prev.lastVisitDate === today) return prev;

      let newStreak = 1;
      if (prev.lastVisitDate === yesterday) {
        newStreak = prev.currentStreak + 1;
      }

      const newTotal = prev.totalDays + 1;
      const newLongest = Math.max(prev.longestStreak, newStreak);
      const newBadges = computeBadges(newStreak, newTotal);

      const updated: StreakData = {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastVisitDate: today,
        totalDays: newTotal,
        badges: newBadges,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      return updated;
    });
  }, []);

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  return data;
}
