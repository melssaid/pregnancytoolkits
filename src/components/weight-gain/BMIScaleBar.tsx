import React from 'react';
import { TFunction } from 'i18next';
import { motion } from 'framer-motion';

interface BMIScaleBarProps {
  bmi: number;
  t: TFunction;
}

const categories = [
  { key: 'underweight', max: 18.5, color: 'bg-sky-400', label: '< 18.5' },
  { key: 'normal', max: 25, color: 'bg-emerald-400', label: '18.5–25' },
  { key: 'overweight', max: 30, color: 'bg-amber-400', label: '25–30' },
  { key: 'obese', max: 45, color: 'bg-red-400', label: '> 30' },
];

export function BMIScaleBar({ bmi, t }: BMIScaleBarProps) {
  const clampedBmi = Math.max(15, Math.min(40, bmi));
  const position = ((clampedBmi - 15) / 25) * 100;
  const activeCategory = bmi < 18.5 ? 0 : bmi < 25 ? 1 : bmi < 30 ? 2 : 3;

  return (
    <div className="space-y-2">
      {/* Scale bar */}
      <div className="relative h-3 rounded-full overflow-hidden flex bg-muted/30">
        {categories.map((cat, i) => (
          <div
            key={cat.key}
            className={`h-full ${cat.color} transition-opacity duration-300 ${
              i === activeCategory ? 'opacity-100' : 'opacity-30'
            } ${i === 0 ? 'rounded-s-full' : ''} ${i === categories.length - 1 ? 'rounded-e-full' : ''}`}
            style={{ flex: cat.key === 'obese' ? 1 : (cat.max - (i === 0 ? 15 : categories[i - 1].max)) / 25 }}
          />
        ))}
        {/* BMI Marker */}
        <motion.div
          className="absolute top-1/2 w-5 h-5 rounded-full bg-background border-[2.5px] border-foreground shadow-lg"
          style={{ left: `${position}%` }}
          initial={{ scale: 0, x: '-50%', y: '-50%' }}
          animate={{ scale: 1, x: '-50%', y: '-50%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
        />
      </div>
      
      {/* Labels */}
      <div className="grid grid-cols-4 gap-1">
        {categories.map((cat, i) => (
          <div 
            key={cat.key}
            className={`text-center py-1 px-1 rounded-lg transition-all ${
              i === activeCategory 
                ? 'bg-muted/60 border border-border/50' 
                : ''
            }`}
          >
            <p className={`text-[9px] font-bold ${i === activeCategory ? 'text-foreground' : 'text-muted-foreground/50'}`}>
              {t(`toolsInternal.weightGain.bmiCategories.${cat.key}`)}
            </p>
            <p className={`text-[8px] ${i === activeCategory ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
              {cat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
