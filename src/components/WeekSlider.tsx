import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

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
  
  const handleChange = (value: number[]) => {
    onChange(value[0]);
  };

  const displayLabel = label || t('toolsInternal.weekSlider.currentWeek');
  const trimesterText = t(`toolsInternal.weekSlider.${getTrimesterKey(week)}`);

  const content = (
    <div className={`space-y-4 ${className}`}>
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
      
      <div className="space-y-3">
        <Slider
          value={[week]}
          onValueChange={handleChange}
          min={min}
          max={max}
          step={1}
          className="w-full cursor-pointer"
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('common.week')} {min}</span>
          <div className="flex flex-col items-center">
            <span className="text-base font-bold text-primary">{t('common.week')} {week}</span>
          </div>
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
