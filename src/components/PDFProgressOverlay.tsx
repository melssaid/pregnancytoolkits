import { Progress } from '@/components/ui/progress';
import { FileDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PDFProgressOverlayProps {
  progress: number;
  visible: boolean;
}

export function PDFProgressOverlay({ progress, visible }: PDFProgressOverlayProps) {
  const { t } = useTranslation();
  
  if (!visible) return null;

  const isComplete = progress >= 100;
  const label = !isComplete
    ? t('common.exportingPDF', 'Preparing your report...')
    : t('common.exportComplete', 'Export complete');

  const steps = [
    { key: 'collect', label: t('common.pdfStepCollect', 'Collecting data'), threshold: 20 },
    { key: 'render', label: t('common.pdfStepRender', 'Rendering pages'), threshold: 50 },
    { key: 'generate', label: t('common.pdfStepGenerate', 'Generating PDF'), threshold: 80 },
    { key: 'finalize', label: t('common.pdfStepFinalize', 'Finalizing'), threshold: 100 },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-md animate-fade-in">
      <div className="bg-card rounded-2xl shadow-xl p-8 mx-4 w-full max-w-sm border border-border/30 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${isComplete ? 'bg-green-500/10' : 'bg-primary/10'}`}>
            {isComplete 
              ? <Check className="w-5 h-5 text-green-600" />
              : <FileDown className="w-5 h-5 text-primary animate-pulse" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{Math.round(progress)}%</p>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-1.5" />

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step) => {
            const done = progress >= step.threshold;
            const active = !done && progress >= step.threshold - 30;
            return (
              <div key={step.key} className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                  done ? 'bg-green-500' : active ? 'bg-primary animate-pulse' : 'bg-border'
                }`} />
                <span className={`text-xs transition-colors duration-300 ${
                  done ? 'text-muted-foreground line-through' : active ? 'text-foreground font-medium' : 'text-muted-foreground/60'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
