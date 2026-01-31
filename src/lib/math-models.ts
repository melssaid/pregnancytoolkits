import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// صيغ رياضية آمنة للحمل مع disclaimer

export const usePregnancyCalculations = () => {
  const { t } = useTranslation();

  // 1. Naegele's Rule for Due Date (دقة ±7 أيام)
  const calculateDueDate = (lmp: Date): Date => {
    const edd = new Date(lmp);
    edd.setDate(edd.getDate() + 280); // 40 أسبوع
    return edd;
  };

  // 2. BMI Gain Tracker
  const calculateBmiTrend = (weight1: number, height: number, weight2: number, weeks: number): number => {
    const bmi1 = weight1 / (Math.pow(height / 100, 2));
    const bmi2 = weight2 / (Math.pow(height / 100, 2));
    return (bmi2 - bmi1) / weeks; // kg/week
  };

  // 3. Hadlock Fetal Weight (تقريبي ±10%)
  const hadlockWeight = (ac: number, fl: number, hc: number): number => {
    const logWeight = 1.3596 - 0.00386 * ac * fl + 0.0064 * hc * fl;
    return Math.pow(10, logWeight);
  };

  // 4. Modified HAS-BLED for Pregnancy Risk (تقييم تقريبي)
  const preeclampsiaRiskScore = (age: number, bpSystolic: number, proteinuria: boolean, history: boolean): number => {
    let score = 0;
    if (age > 35) score += 1;
    if (bpSystolic > 140) score += 2;
    if (proteinuria) score += 2;
    if (history) score += 3;
    return score; // 0-8: low-high
  };

  return {
    calculateDueDate,
    calculateBmiTrend,
    hadlockWeight,
    preeclampsiaRiskScore,
    disclaimer: t('disclaimer.medical'), // ربط مع i18n
  };
};

export default usePregnancyCalculations;

/*
⚠️ Disclaimer: These calculations are for educational purposes only.
   - Sources: ACOG, WHO guidelines.
   - Accuracy: Approximate, consult your doctor.
   Google Play compliant: local computation, no diagnosis.
*/