import React from 'react';
import { TFunction } from 'i18next';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface WeeklyRateGaugeProps {
  rate: number | null;
  healthyMin: number;
  healthyMax: number;
  t: TFunction;
}

export function WeeklyRateGauge({ rate, healthyMin, healthyMax, t }: WeeklyRateGaugeProps) {
  if (rate === null) return null;
  
  const maxRate = 1.0; // kg/week max display
  const clampedRate = Math.max(0, Math.min(rate, maxRate));
  // Angle: 0 to 180 degrees
  const angle = (clampedRate / maxRate) * 180;
  
  const isHealthy = rate >= healthyMin && rate <= healthyMax;
  const isHigh = rate > healthyMax;
  const needleColor = isHealthy ? 'hsl(var(--primary))' : isHigh ? 'hsl(0, 70%, 55%)' : 'hsl(40, 90%, 50%)';

  // Healthy zone angles
  const healthyStartAngle = (healthyMin / maxRate) * 180;
  const healthyEndAngle = (Math.min(healthyMax, maxRate) / maxRate) * 180;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden">
        <CardContent className="p-4 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-[12px] font-bold">{t('toolsInternal.weightGain.weeklyRateGauge')}</h3>
          </div>
          
          {/* Semi-circle gauge */}
          <div className="flex justify-center">
            <div className="relative w-40 h-24">
              <svg viewBox="0 0 200 110" className="w-full h-full">
                {/* Background arc */}
                <path
                  d="M 15 100 A 85 85 0 0 1 185 100"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Healthy zone */}
                <path
                  d={describeArc(100, 100, 85, 180 - healthyEndAngle, 180 - healthyStartAngle)}
                  fill="none"
                  stroke="hsl(var(--primary) / 0.25)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Needle */}
                <motion.line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="25"
                  stroke={needleColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: angle - 90 }}
                  transition={{ duration: 1.2, type: 'spring', stiffness: 60 }}
                  style={{ transformOrigin: '100px 100px' }}
                />
                {/* Center dot */}
                <circle cx="100" cy="100" r="6" fill={needleColor} />
                <circle cx="100" cy="100" r="3" fill="hsl(var(--background))" />
              </svg>
              
              {/* Rate value */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <motion.span 
                  className="text-lg font-black text-foreground"
                  key={rate}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  {rate.toFixed(2)}
                </motion.span>
                <span className="text-[9px] text-muted-foreground block -mt-0.5">
                  {t('toolsInternal.weightGain.kgPerWeek')}
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-2 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-1.5 rounded bg-primary/25 inline-block" />
              {t('toolsInternal.weightGain.healthyRange')}: {healthyMin}–{healthyMax}
            </span>
            <span className={`font-bold ${isHealthy ? 'text-primary' : isHigh ? 'text-destructive' : 'text-amber-500'}`}>
              {isHealthy ? '✓' : '!'}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy - r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy - r * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`;
}
