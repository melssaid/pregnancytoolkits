import React, { useMemo } from 'react';
import type { WeightEntry } from '../../types';

/**
 * SmartWeightGainAnalyzer
 *
 * Props:
 * - entries: WeightEntry[] (date as ISO string, weightKg as number)
 *
 * This component computes:
 * - first and last weight (and dates)
 * - total gain in kg
 * - average weekly gain (kg/week)
 * - simple guidance message based on average weekly gain
 *
 * No use of `any`. Errors are logged instead of being swallowed.
 */

type Props = {
  entries?: WeightEntry[] | null;
  // optional: expectedWeeks to normalize weekly gain (default derived from entries)
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
  try {
    const entries = (entriesInput ?? []).filter(Boolean);
    if (entries.length === 0*

