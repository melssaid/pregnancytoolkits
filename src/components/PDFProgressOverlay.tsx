import { useTranslation } from 'react-i18next';

interface PDFProgressOverlayProps {
  progress: number;
  visible: boolean;
}

export function PDFProgressOverlay({ progress, visible }: PDFProgressOverlayProps) {
  const { t } = useTranslation();
  
  if (!visible) return null;

  const isComplete = progress >= 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pb-12 pointer-events-none animate-fade-in">
      <div className="pointer-events-auto bg-card/95 backdrop-blur-sm rounded-full shadow-lg px-6 py-3 flex items-center gap-4 border border-border/40 min-w-[260px]">
        {/* Circular progress */}
        <div className="relative w-8 h-8 shrink-0">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16" cy="16" r="13"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="3"
            />
            <circle
              cx="16" cy="16" r="13"
              fill="none"
              stroke={isComplete ? 'hsl(var(--success))' : 'hsl(var(--primary))'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 13}`}
              strokeDashoffset={`${2 * Math.PI * 13 * (1 - progress / 100)}`}
              className="transition-all duration-300"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-foreground">
            {Math.round(progress)}
          </span>
        </div>

        {/* Label */}
        <span className="text-sm font-medium text-foreground">
          {isComplete
            ? t('common.exportComplete', 'Done')
            : t('common.exportingPDF', 'Exporting…')}
        </span>
      </div>
    </div>
  );
}
