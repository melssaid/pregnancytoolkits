import React from 'react';
import { TFunction } from 'i18next';
import { motion } from 'framer-motion';

interface BMIScaleBarProps {
  bmi: number;
  t: TFunction;
}

const categories = [
  { key: 'underweight', max: 18.5, color: 'from-sky-400 to-sky-500' },
  { key: 'normal', max: 25, color: 'from-emerald-400 to-emerald-500' },
  { key: 'overweight', max: 30, color: 'from-amber-400 to-amber-500' },
  { key: 'obese', max: 45, color: 'from-red-400 to-red-500' },
];

export function BMIScaleBar({ bmi, t }: BMIScaleBarProps) {
  const clampedBmi = Math.max(15, Math.min(40, bmi));
  const position = ((clampedBmi - 15) / 25) * 100;

  const activeCategory = bmi < 18.5 ? 0 : bmi < 25 ? 1 : bmi < 30 ? 2 : 3;

  return (
    <div className="space-y-1">
      <div className="relative h-2.5 rounded-full overflow-hidden flex bg-muted/50">
        {categories.map((cat, i) => (
          <div
            key={cat.key}
            className={`h-full bg-gradient-to-r ${cat.color} transition-opacity duration-300 ${i === activeCategory ? 'opacity-100' : 'opacity-40'} ${i === 0 ? 'rounded-s-full' : ''} ${i === categories.length - 1 ? 'rounded-e-full' : ''}`}
            style={{ flex: cat.key === 'obese' ? 1 : (cat.max - (i === 0 ? 15 : categories[i - 1].max)) / 25 }}
          />
        ))}
        {/* BMI Marker */}
        <motion.div
          className="absolute top-1/2 w-4 h-4 rounded-full bg-background border-[2.5px] border-foreground shadow-md"
          style={{ left: `${position}%` }}
          initial={{ scale: 0, x: '-50%', y: '-50%' }}
          animate={{ scale: 1, x: '-50%', y: '-50%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
        />
      </div>
      <div className="flex justify-between text-[8px] text-muted-foreground/70 px-0.5 font-medium">
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
      </div>
    </div>
  );
}
