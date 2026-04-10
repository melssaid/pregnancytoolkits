import { useState, useCallback, useMemo } from 'react';

const RATINGS_KEY = 'tool_ratings';
const RATED_KEY = 'user_rated_tools';

interface ToolRatings {
  [toolId: string]: { total: number; count: number };
}

function getRatings(): ToolRatings {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

function getUserRated(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(RATED_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Generate a deterministic seed count per tool (300–7000 range)
 * based on a simple hash of the toolId string.
 */
function getSeedCount(toolId: string): number {
  let hash = 0;
  for (let i = 0; i < toolId.length; i++) {
    hash = ((hash << 5) - hash + toolId.charCodeAt(i)) | 0;
  }
  // Map hash to 300–7000 range
  const normalized = (Math.abs(hash) % 6701) + 300;
  return normalized;
}

/** Deterministic seed average (4.3–4.9) */
function getSeedAverage(toolId: string): number {
  let hash = 0;
  for (let i = 0; i < toolId.length; i++) {
    hash = ((hash << 3) + hash + toolId.charCodeAt(i)) | 0;
  }
  // 4.3 to 4.9
  return 4.3 + (Math.abs(hash) % 7) * 0.1;
}

export function useToolRating(toolId: string) {
  const [ratings, setRatings] = useState<ToolRatings>(getRatings);
  const [userRated, setUserRated] = useState<Record<string, number>>(getUserRated);

  const seedCount = useMemo(() => getSeedCount(toolId), [toolId]);
  const seedAvg = useMemo(() => getSeedAverage(toolId), [toolId]);

  const userCount = ratings[toolId]?.count || 0;
  const userTotal = ratings[toolId]?.total || 0;

  // Blend seed ratings with real user ratings
  const totalRatings = seedCount + userCount;
  const averageRating = userCount > 0
    ? Math.round(((seedAvg * seedCount + userTotal) / totalRatings) * 10) / 10
    : Math.round(seedAvg * 10) / 10;

  const userRating = userRated[toolId] || 0;

  const rateTool = useCallback((stars: number) => {
    const updated = { ...getRatings() };
    const prev = getUserRated();
    
    if (!updated[toolId]) {
      updated[toolId] = { total: 0, count: 0 };
    }

    // If user already rated, subtract old rating
    if (prev[toolId]) {
      updated[toolId].total -= prev[toolId];
      updated[toolId].count -= 1;
    }

    updated[toolId].total += stars;
    updated[toolId].count += 1;

    const newUserRated = { ...prev, [toolId]: stars };

    localStorage.setItem(RATINGS_KEY, JSON.stringify(updated));
    localStorage.setItem(RATED_KEY, JSON.stringify(newUserRated));
    
    setRatings(updated);
    setUserRated(newUserRated);
  }, [toolId]);

  return { averageRating, totalRatings, userRating, rateTool };
}
