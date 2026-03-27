import React, { useMemo } from 'react';
import type { WeightEntry } from '../../types';

type Props = {
  entries?: WeightEntry[] | null;
  expectedWeeks?: number;
};

type AnalysisResult = {
  first?: WeightEntry;
  last?: WeightEntry;
  totalGainKg: number;
  weeksElapsed: number;
  weeklyGainKg: number;
  message: string;
};

function safeParseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function calculateAnalysis(entriesInput?: WeightEntry[] | null, expectedWeeks?: number): AnalysisResult {
  const empty: AnalysisResult = { totalGainKg: 0, weeksElapsed: 0, weeklyGainKg: 0, message: '' };
  try {
    const entries = (entriesInput ?? []).filter(Boolean);
    if (entries.length === 0) return { ...empty, message: 'No entries yet.' };

    const sorted = [...entries].sort((a, b) => {
      const da = safeParseDate(a.date);
      const db = safeParseDate(b.date);
      if (!da || !db) return 0;
      return da.getTime() - db.getTime();
    });

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalGainKg = last.weightKg - first.weightKg;

    const firstDate = safeParseDate(first.date);
    const lastDate = safeParseDate(last.date);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksElapsed = expectedWeeks ?? (firstDate && lastDate ? Math.max((lastDate.getTime() - firstDate.getTime()) / msPerWeek, 0.1) : 1);
    const weeklyGainKg = weeksElapsed > 0 ? totalGainKg / weeksElapsed : 0;

    let message = '';
    if (weeklyGainKg < 0.2) message = 'Weight gain is below the typical range. Consider consulting your healthcare provider.';
    else if (weeklyGainKg <= 0.5) message = 'Your weight gain is within a healthy range. Keep it up!';
    else message = 'Weight gain is above the typical range. Consider discussing with your healthcare provider.';

    return { first, last, totalGainKg, weeksElapsed, weeklyGainKg, message };
  } catch (err) {
    console.error('SmartWeightGainAnalyzer error:', err);
    return { ...empty, message: 'Could not analyze weight data.' };
  }
}

const SmartWeightGainAnalyzer: React.FC<Props> = ({ entries, expectedWeeks }) => {
  const analysis = useMemo(() => calculateAnalysis(entries, expectedWeeks), [entries, expectedWeeks]);

  if (!entries || entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No weight entries to analyze.</p>;
  }

  return (
    <div className="space-y-2 rounded-lg border p-4 bg-card">
      <h3 className="font-semibold text-foreground">Weight Gain Analysis</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Total Gain:</span>{' '}
          <span className="font-medium">{analysis.totalGainKg.toFixed(1)} kg</span>
        </div>
        <div>
          <span className="text-muted-foreground">Weekly Avg:</span>{' '}
          <span className="font-medium">{analysis.weeklyGainKg.toFixed(2)} kg/week</span>
        </div>
      </div>
      {analysis.message && (
        <p className="text-sm text-muted-foreground mt-1">{analysis.message}</p>
      )}
    </div>
  );
};

export default SmartWeightGainAnalyzer;
