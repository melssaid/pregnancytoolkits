import React from 'react';
import { TFunction } from 'i18next';
import { motion } from 'framer-motion';

interface BMIScaleBarProps {
  bmi: number;
  t: TFunction;
}

const categories = [
  { key: 'underweight', max: 18.5, color: 'from-sky-400 to-sky-300', dotColor: 'bg-sky-400' },
  { key: 'normal', max: 25, color: 'from-emerald-400 to-emerald-300', dotColor: 'bg-emerald-400' },
  { key: 'overweight', max: 30, color: 'from-amber-400 to-amber-300', dotColor: 'bg-amber-400' },
  { key: 'obese', max: 45, color: 'from-red-400 to-red-300', dotColor: 'bg-red-400' },
];

export function BMIScaleBar({ bmi, t }: BMIScaleBarProps) {
  const clampedBmi = Math.max(15, Math.min(40, bmi));
  const position = ((clampedBmi - 15) / 25) * 100;
  const activeCategory = bmi < 18.5 ? 0 : bmi < 25 ? 1 : bmi < 30 ? 2 : 3;

  return (
    <div className="space-y-3">
      {/* BMI Value display */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl font-black text-foreground tabular-nums">{bmi.toFixed(1)}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          activeCategory === 0 ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' :
          activeCategory === 1 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
          activeCategory === 2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {t(`toolsInternal.weightGain.bmiCategories.${categories[activeCategory].key}`)}
        </span>
      </div>

      {/* Scale bar */}
      <div className="relative">
        <div className="h-2.5 rounded-full overflow-hidden flex bg-muted/20">
          {categories.map((cat, i) => (
            <div
              key={cat.key}
              className={`h-full bg-gradient-to-r ${cat.color} transition-opacity duration-300 ${
                i === activeCategory ? 'opacity-100' : 'opacity-25'
              } ${i === 0 ? 'rounded-s-full' : ''} ${i === categories.length - 1 ? 'rounded-e-full' : ''}`}
              style={{ flex: cat.key === 'obese' ? 1 : (cat.max - (i === 0 ? 15 : categories[i - 1].max)) / 25 }}
            />
          ))}
          {/* BMI Marker */}
          <motion.div
            className="absolute top-1/2 w-4 h-4 rounded-full bg-background border-2 border-foreground shadow-md"
            style={{ left: `${position}%` }}
            initial={{ scale: 0, x: '-50%', y: '-50%' }}
            animate={{ scale: 1, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Category dots */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {categories.map((cat, i) => (
          <div key={cat.key} className={`flex items-center gap-1 ${i !== activeCategory ? 'opacity-40' : ''}`}>
            <div className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
            <span className="text-[10px] font-semibold text-muted-foreground">
              {t(`toolsInternal.weightGain.bmiCategories.${cat.key}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
