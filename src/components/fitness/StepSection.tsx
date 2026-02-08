import React from 'react';
import { cn } from '@/lib/utils';

interface StepSectionProps {
  step: number;
  title: string;
  description?: string;
  icon: React.ReactNode;
  isLast?: boolean;
  children: React.ReactNode;
}

export const StepSection: React.FC<StepSectionProps> = ({
  step,
  title,
  description,
  icon,
  isLast = false,
  children,
}) => {
  return (
    <div className="relative">
      {/* Step header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Step indicator with connecting line */}
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">{step}</span>
          </div>
          {!isLast && (
            <div className="w-0.5 flex-1 min-h-[16px] bg-gradient-to-b from-primary/20 to-transparent mt-1" />
          )}
        </div>

        {/* Title area */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-primary/10 text-primary">
              {icon}
            </div>
            <h2 className="font-semibold text-sm text-foreground leading-tight">
              {title}
            </h2>
          </div>
          {description && (
            <p className="text-[10px] text-muted-foreground mt-0.5 ms-8">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn('ps-11 space-y-3', !isLast && 'pb-2')}>
        {children}
      </div>
    </div>
  );
};
