import { useMemo } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

export interface TrimesterTheme {
  trimester: 1 | 2 | 3;
  gradient: string;
  accentHue: number;
  emoji: string;
  label: string;
}

const themes: Record<1 | 2 | 3, TrimesterTheme> = {
  1: {
    trimester: 1,
    gradient: 'from-emerald-500/[0.06] via-card to-green-500/[0.03]',
    accentHue: 160,
    emoji: '🌱',
    label: 'first',
  },
  2: {
    trimester: 2,
    gradient: 'from-rose-500/[0.06] via-card to-pink-500/[0.03]',
    accentHue: 340,
    emoji: '🌸',
    label: 'second',
  },
  3: {
    trimester: 3,
    gradient: 'from-violet-500/[0.06] via-card to-amber-500/[0.03]',
    accentHue: 280,
    emoji: '👶',
    label: 'third',
  },
};

export function useTrimesterTheme(): TrimesterTheme {
  const { profile } = useUserProfile();
  const week = profile.pregnancyWeek;

  return useMemo(() => {
    const trimester: 1 | 2 | 3 = week <= 13 ? 1 : week <= 26 ? 2 : 3;
    return themes[trimester];
  }, [week]);
}
