import { useState, useCallback } from 'react';

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

export function useToolRating(toolId: string) {
  const [ratings, setRatings] = useState<ToolRatings>(getRatings);
  const [userRated, setUserRated] = useState<Record<string, number>>(getUserRated);

  const averageRating = ratings[toolId]
    ? Math.round((ratings[toolId].total / ratings[toolId].count) * 10) / 10
    : 0;
  
  const totalRatings = ratings[toolId]?.count || 0;
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
