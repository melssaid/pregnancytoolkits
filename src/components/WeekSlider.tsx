import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { haptic } from '@/lib/haptics';

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

// Clinically accurate trimester boundaries:
// T1 = weeks 1–13, T2 = weeks 14–27, T3 = weeks 28–42
const getTrimesterKey = (week: number): 'trimester1' | 'trimester2' | 'trimester3' => {
  if (week <= 13) return 'trimester1';
  if (week <= 27) return 'trimester2';
  return 'trimester3';
};

const getTrimesterColor = (week: number): string => {
  const t = getTrimesterKey(week);
  if (t === 'trimester1')
    return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/40';
  if (t === 'trimester2')
    return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40';
  return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/40';
};

function getTrackColor(week: number): string {
  const t = getTrimesterKey(week);
  if (t === 'trimester1') return 'hsl(var(--primary))';
  if (t === 'trimester2') return 'hsl(210, 70%, 55%)';
  return 'hsl(270, 60%, 55%)';
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

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
  const trackRef = useRef<HTMLDivElement | null>(null);
  const lastWeekRef = useRef<number>(week);

  // Guard against degenerate ranges and out-of-range incoming values
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const safeWeek = clamp(week, safeMin, safeMax);
  const span = Math.max(1, safeMax - safeMin);

  const progress = useMemo(() => ((safeWeek - safeMin) / span) * 100, [safeWeek, safeMin, span]);

  const displayLabel = label || t('toolsInternal.weekSlider.currentWeek');
  const trimesterText = t(`toolsInternal.weekSlider.${getTrimesterKey(safeWeek)}`);

  const commit = useCallback(
    (newWeek: number) => {
      const clamped = clamp(Math.round(newWeek), safeMin, safeMax);
      if (clamped !== lastWeekRef.current) {
        lastWeekRef.current = clamped;
        haptic('tap');
        onChange(clamped);
      }
    },
    [onChange, safeMin, safeMax],
  );

  const weekFromClientX = useCallback(
    (clientX: number, rect: DOMRect) => {
      let ratio = (clientX - rect.left) / rect.width;
      if (isRTL) ratio = 1 - ratio;
      ratio = clamp(ratio, 0, 1);
      return safeMin + ratio * span;
    },
    [isRTL, safeMin, span],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track) return;
      // Capture pointer so dragging continues even if it leaves the track
      try {
        track.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      const rect = track.getBoundingClientRect();
      commit(weekFromClientX(e.clientX, rect));
    },
    [commit, weekFromClientX],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track) return;
      // Only react while pointer is held (buttons & 1) — covers mouse, touch, pen
      if (e.pointerType === 'mouse' && e.buttons === 0) return;
      if (!track.hasPointerCapture(e.pointerId)) return;
      const rect = track.getBoundingClientRect();
      commit(weekFromClientX(e.clientX, rect));
    },
    [commit, weekFromClientX],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (track && track.hasPointerCapture(e.pointerId)) {
      try {
        track.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    }
  }, []);

  // Keyboard: increase/decrease ALWAYS map to logical "next/previous week"
  // regardless of layout direction. ArrowRight in RTL still feels natural
  // because the visual progress fills from the right side, so right-arrow
  // still moves the thumb forward visually.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      let next: number | null = null;
      switch (e.key) {
        case 'ArrowRight':
          next = isRTL ? safeWeek - 1 : safeWeek + 1;
          break;
        case 'ArrowLeft':
          next = isRTL ? safeWeek + 1 : safeWeek - 1;
          break;
        case 'ArrowUp':
          next = safeWeek + 1;
          break;
        case 'ArrowDown':
          next = safeWeek - 1;
          break;
        case 'PageUp':
          next = safeWeek + 4;
          break;
        case 'PageDown':
          next = safeWeek - 4;
          break;
        case 'Home':
          next = safeMin;
          break;
        case 'End':
          next = safeMax;
          break;
      }
      if (next !== null) {
        e.preventDefault();
        commit(next);
      }
    },
    [commit, isRTL, safeWeek, safeMin, safeMax],
  );

  // Trimester boundary markers (start of T2 = 14, start of T3 = 28)
  const milestones = useMemo(
    () => [14, 28].filter((m) => m > safeMin && m < safeMax),
    [safeMin, safeMax],
  );

  const content = (
    <div className={`space-y-4 ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <label className="font-medium text-foreground text-sm truncate">{displayLabel}</label>
        </div>
        {showTrimester && (
          <Badge
            variant="outline"
            className={`text-xs font-medium shrink-0 ${getTrimesterColor(safeWeek)}`}
          >
            {trimesterText}
          </Badge>
        )}
      </div>

      {/* Track */}
      <div className="space-y-2">
        <div
          ref={trackRef}
          className="relative h-8 flex items-center cursor-pointer select-none touch-none px-1"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          role="slider"
          aria-label={displayLabel}
          aria-valuenow={safeWeek}
          aria-valuemin={safeMin}
          aria-valuemax={safeMax}
          aria-valuetext={`${t('common.week')} ${safeWeek} — ${trimesterText}`}
          tabIndex={0}
        >
          {/* Track background */}
          <div className="absolute inset-x-1 h-2 rounded-full bg-secondary/60 overflow-hidden">
            {/* Filled portion */}
            <motion.div
              key={`fill-${isRTL ? 'rtl' : 'ltr'}`}
              className="absolute top-0 h-full rounded-full"
              style={{
                background: `linear-gradient(${isRTL ? '270deg' : '90deg'}, hsl(var(--primary)), ${getTrackColor(safeWeek)})`,
                left: isRTL ? 'auto' : 0,
                right: isRTL ? 0 : 'auto',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Trimester milestone markers */}
          {milestones.map((m) => {
            const pos = ((m - safeMin) / span) * 100;
            const passed = safeWeek >= m;
            return (
              <div
                key={`milestone-${m}`}
                aria-hidden="true"
                className={`absolute top-1/2 -translate-y-1/2 w-1 h-3 rounded-full transition-colors ${
                  passed ? 'bg-primary/70' : 'bg-border/70'
                }`}
                style={{
                  left: isRTL ? 'auto' : `calc(${pos}% + 4px)`,
                  right: isRTL ? `calc(${pos}% + 4px)` : 'auto',
                }}
              />
            );
          })}

          {/* Thumb */}
          <motion.div
            key={`thumb-${isRTL ? 'rtl' : 'ltr'}`}
            aria-hidden="true"
            className="absolute top-1/2 z-10 pointer-events-none"
            style={{
              translateX: isRTL ? '50%' : '-50%',
              translateY: '-50%',
            }}
            animate={
              isRTL
                ? { right: `calc(${progress}% + 4px)` }
                : { left: `calc(${progress}% + 4px)` }
            }
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="w-6 h-6 rounded-full border-2 border-primary bg-background shadow-md shadow-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </motion.div>
        </div>

        {/* Labels — start / current / end. RTL flips visually via flex direction. */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">
            {t('common.week')} {safeMin}
          </span>
          <motion.div
            className="flex flex-col items-center"
            key={safeWeek}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <span className="text-base font-bold text-primary tabular-nums">
              {t('common.week')} {safeWeek}
            </span>
          </motion.div>
          <span className="tabular-nums">
            {t('common.week')} {safeMax}
          </span>
        </div>
      </div>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card className="shadow-sm border-border bg-card">
      <CardContent className="pt-4 pb-4">{content}</CardContent>
    </Card>
  );
});

export default WeekSlider;
