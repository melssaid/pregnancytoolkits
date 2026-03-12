import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  week: number;
}

interface TrimesterComparisonProps {
  entries: WeightEntry[];
  prePregnancyWeight: number;
  currentTrimester: 'first' | 'second' | 'third';
  t: TFunction;
}

const IDEAL_RANGES = {
  first:  { min: 0.5, max: 2.0 },
  second: { min: 5.0, max: 7.0 },
  third:  { min: 4.0, max: 6.0 },
};

export function TrimesterComparison({ entries, prePregnancyWeight, currentTrimester, t }: TrimesterComparisonProps) {
  const trimesters = ['first', 'second', 'third'] as const;
  
  const getGainForTrimester = (tri: typeof trimesters[number]) => {
    const weekRange = tri === 'first' ? [1, 13] : tri === 'second' ? [14, 26] : [27, 42];
    const triEntries = entries.filter(e => e.week >= weekRange[0] && e.week <= weekRange[1]);
    if (triEntries.length === 0) return null;
    
    const firstWeight = tri === 'first' ? prePregnancyWeight : 
      entries.filter(e => e.week < weekRange[0]).sort((a, b) => b.week - a.week)[0]?.weight ?? prePregnancyWeight;
    const lastWeight = triEntries.sort((a, b) => b.week - a.week)[0].weight;
    return lastWeight - firstWeight;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden">
        <CardContent className="p-4 pt-3">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-[12px] font-bold">{t('toolsInternal.weightGain.trimesterComparison')}</h3>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {trimesters.map((tri, i) => {
              const gain = getGainForTrimester(tri);
              const ideal = IDEAL_RANGES[tri];
              const isCurrent = tri === currentTrimester;
              const isInRange = gain !== null ? (gain >= ideal.min && gain <= ideal.max) : null;
              const maxBar = 8; // max kg for bar height
              const barHeight = gain !== null ? Math.min((gain / maxBar) * 100, 100) : 0;

              return (
                <motion.div
                  key={tri}
                  className={`rounded-2xl p-3 text-center relative overflow-hidden ${
                    isCurrent 
                      ? 'bg-primary/5 border-2 border-primary/30 shadow-sm shadow-primary/10' 
                      : 'bg-muted/30 border border-border/30'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {isCurrent && (
                    <motion.div 
                      className="absolute top-1 end-1 w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  
                  <p className="text-[9px] font-bold text-muted-foreground mb-2">
                    {t(`toolsInternal.weightGain.trimester${i + 1}`)}
                  </p>

                  {/* Mini bar */}
                  <div className="h-16 flex items-end justify-center mb-2">
                    <div className="w-8 bg-muted/50 rounded-t-lg relative overflow-hidden h-full">
                      {/* Ideal range indicator */}
                      <div 
                        className="absolute w-full bg-primary/10 border-y border-primary/20"
                        style={{ 
                          bottom: `${(ideal.min / maxBar) * 100}%`,
                          height: `${((ideal.max - ideal.min) / maxBar) * 100}%`
                        }}
                      />
                      {/* Actual bar */}
                      <motion.div 
                        className={`absolute bottom-0 w-full rounded-t-lg ${
                          isInRange === true ? 'bg-emerald-400/70' : isInRange === false ? 'bg-amber-400/70' : 'bg-muted-foreground/20'
                        }`}
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeight}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }}
                      />
                    </div>
                  </div>

                  <p className="text-sm font-black text-foreground">
                    {gain !== null ? `${gain >= 0 ? '+' : ''}${gain.toFixed(1)}` : '—'}
                  </p>
                  <p className="text-[8px] text-muted-foreground mt-0.5">
                    {ideal.min}–{ideal.max} kg
                  </p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
