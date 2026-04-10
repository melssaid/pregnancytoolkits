import { useState, useEffect, useCallback } from "react";
import { HealthData } from "./HealthInputForm";

const STORAGE_KEY = 'smart-plan-health-data';

const DEFAULT_HEALTH: HealthData = {
  week: 24, weight: 65, height: 165, age: 28,
  waterIntake: 6, bloodPressureSys: 120, bloodPressureDia: 80,
  sleepHours: 7, activityLevel: 'moderate', mood: 'good', conditions: [],
};

export function useHealthData() {
  const [health, setHealth] = useState<HealthData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_HEALTH, ...JSON.parse(saved) } : DEFAULT_HEALTH;
    } catch { return DEFAULT_HEALTH; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(health));
  }, [health]);

  const update = useCallback((field: keyof HealthData, value: any) => {
    setHealth(prev => ({ ...prev, [field]: value }));
  }, []);

  const getBMI = useCallback(() => {
    const heightM = health.height / 100;
    return (health.weight / (heightM * heightM)).toFixed(1);
  }, [health.weight, health.height]);

  const getCalories = useCallback(() => {
    const base = 1800;
    const weekBonus = health.week > 13 ? (health.week > 28 ? 450 : 340) : 0;
    const activityBonus = health.activityLevel === 'active' ? 200 : health.activityLevel === 'moderate' ? 100 : 0;
    return base + weekBonus + activityBonus;
  }, [health.week, health.activityLevel]);

  const getTrimester = useCallback(() => {
    if (health.week <= 13) return { num: 1, color: 'bg-emerald-500' };
    if (health.week <= 27) return { num: 2, color: 'bg-blue-500' };
    return { num: 3, color: 'bg-purple-500' };
  }, [health.week]);

  const progress = Math.min(100, Math.round((health.week / 40) * 100));
  const daysRemaining = Math.max(0, (40 - health.week) * 7);

  return { health, update, getBMI, getCalories, getTrimester, progress, daysRemaining };
}
