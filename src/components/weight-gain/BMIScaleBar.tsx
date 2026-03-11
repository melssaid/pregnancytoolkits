import React from 'react';
import { TFunction } from 'i18next';

interface BMIScaleBarProps {
  bmi: number;
  t: TFunction;
}

const categories = [
  { key: 'underweight', max: 18.5, color: 'bg-sky-400' },
  { key: 'normal', max: 25, color: 'bg-emerald-500' },
  { key: 'overweight', max: 30, color: 'bg-amber-500' },
  { key: 'obese', max: 45, color: 'bg-red-500' },
];

export function BMIScaleBar({ bmi, t }: BMIScaleBarProps) {
  // Map BMI 15-40 to 0-100%
  const clampedBmi = Math.max(15, Math.min(40, bmi));
  const position = ((clampedBmi - 15) / 25) * 100;

  return (
    <div className="space-y-1.5">
      <div className="relative h-3 rounded-full overflow-hidden flex">
        {categories.map((cat, i) => (
          <div
            key={cat.key}
            className={`h-full ${cat.color} ${i === 0 ? 'rounded-s-full' : ''} ${i === categories.length - 1 ? 'rounded-e-full' : ''}`}
            style={{ flex: cat.key === 'obese' ? 1 : (cat.max - (i === 0 ? 15 : categories[i - 1].max)) / 25 }}
          />
        ))}
        {/* BMI Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-background border-2 border-foreground shadow-md transition-all duration-500"
          style={{ left: `${position}%`, transform: `translateX(-50%) translateY(-50%)` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground px-0.5">
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
      </div>
    </div>
  );
}
