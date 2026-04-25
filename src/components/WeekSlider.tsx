import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface WeekSliderProps {
  week: number;
  onChange: (week: number) => void;
  min?: number;
  max?: number;
  showCard?: boolean;
  showTrimester?: boolean;
  label?: string;
  className?: string;
}

const getTrimesterKey = (week: number): string => {
  if (week <= 13) return 'trimester1';
  if (week <= 26) return 'trimester2';
  return 'trimester3';
};

const getTrimesterColor = (week: number): string => {
  if (week <= 13) return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (week <= 26) return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
  return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
};

const TRIMESTER_BOUNDARIES = [
  { week: 1, color: 'hsl(var(--primary))' },
  { week: 13, color: 'hsl(160, 60%, 45%)' },
  { week: 14, color: 'hsl(210, 70%, 55%)' },
  { week: 26, color: 'hsl(210, 70%, 55%)' },
  { week: 27, color: 'hsl(270, 60%, 55%)' },
  { week: 42, color: 'hsl(270, 60%, 55%)' },
];

function getTrackColor(week: number): string {
  if (week <= 13) return 'hsl(var(--primary))';
  if (week <= 26) return 'hsl(210, 70%, 55%)';
  return 'hsl(270, 60%, 55%)';
}

export const WeekSlider = memo(function WeekSlider({
  week,
  onChange,
  min = 1,
  max = 42,
  showCard = true,
  showTrimester = true,
  label,
  className = '',
}: WeekSliderProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const progress = useMemo(() => ((week - min) / (max - min)) * 100, [week, min, max]);

  const displayLabel = label || t('toolsInternal.weekSlider.currentWeek');
  const trimesterText = t(`toolsInternal.weekSlider.${getTrimesterKey(week)}`);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let ratio = (e.clientX - rect.left) / rect.width;
    if (isRTL) ratio = 1 - ratio;
    const newWeek = Math.round(min + ratio * (max - min));
    onChange(Math.max(min, Math.min(max, newWeek)));
  };

  const handleDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const track = (e.currentTarget.parentElement as HTMLElement);
    
    const onMove = (ev: PointerEvent) => {
      const rect = track.getBoundingClientRect();
      let ratio = (ev.clientX - rect.left) / rect.width;
      if (isRTL) ratio = 1 - ratio;
      const newWeek = Math.round(min + ratio * (max - min));
      onChange(Math.max(min, Math.min(max, newWeek)));
    };
    
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  // Milestone markers at trimester boundaries
  const milestones = [13, 27].filter(m => m >= min && m <= max);

  const content = (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <label className="font-medium text-foreground text-sm">
            {displayLabel}
          </label>
        </div>
        {showTrimester && (
          <Badge
            variant="outline"
            className={`text-xs font-medium ${getTrimesterColor(week)}`}
          >
            {trimesterText}
          </Badge>
        )}
      </div>

      {/* Custom Track */}
      <div className="space-y-2">
        <div
          className="relative h-7 flex items-center cursor-pointer select-none touch-none"
          onClick={handleTrackClick}
          role="slider"
          aria-valuenow={week}
          aria-valuemin={min}
          aria-valuemax={max}
          tabIndex={0}
          onKeyDown={(e) => {
            const step = isRTL ? -1 : 1;
            if (e.key === 'ArrowRight') onChange(Math.min(max, week + step));
            if (e.key === 'ArrowLeft') onChange(Math.max(min, week - step));
          }}
        >
          {/* Track background */}
          <div className="absolute inset-x-0 h-2 rounded-full bg-secondary/60 overflow-hidden">
            {/* Filled portion */}
            <motion.div
              key={`fill-${isRTL ? 'rtl' : 'ltr'}`}
              className="absolute top-0 h-full rounded-full"
              style={{
                background: `linear-gradient(${isRTL ? '270deg' : '90deg'}, hsl(var(--primary)), ${getTrackColor(week)})`,
                left: isRTL ? 'auto' : 0,
                right: isRTL ? 0 : 'auto',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Trimester milestone dots */}
          {milestones.map((m) => {
            const pos = ((m - min) / (max - min)) * 100;
            return (
              <div
                key={`${m}-${isRTL ? 'rtl' : 'ltr'}`}
                className="absolute top-1/2 -translate-y-1/2 w-1 h-3 rounded-full bg-border/60"
                style={{
                  left: isRTL ? 'auto' : `${pos}%`,
                  right: isRTL ? `${pos}%` : 'auto',
                }}
              />
            );
          })}

          {/* Thumb */}
          <motion.div
            key={`thumb-${isRTL ? 'rtl' : 'ltr'}`}
            className="absolute top-1/2 z-10"
            style={{
              translateX: isRTL ? '50%' : '-50%',
              translateY: '-50%',
              left: isRTL ? 'auto' : undefined,
              right: isRTL ? undefined : 'auto',
            }}
            animate={
              isRTL
                ? { right: `${progress}%` }
                : { left: `${progress}%` }
            }
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onPointerDown={handleDrag}
          >
            <div className="w-6 h-6 rounded-full border-2 border-primary bg-background shadow-md shadow-primary/20 flex items-center justify-center cursor-grab active:cursor-grabbing">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </motion.div>
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('common.week')} {min}</span>
          <motion.div
            className="flex flex-col items-center"
            key={week}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <span className="text-base font-bold text-primary tabular-nums">
              {t('common.week')} {week}
            </span>
          </motion.div>
          <span>{t('common.week')} {max}</span>
        </div>
      </div>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card className="shadow-sm border-border bg-card">
      <CardContent className="pt-4 pb-4">
        {content}
      </CardContent>
    </Card>
  );
});

export default WeekSlider;
