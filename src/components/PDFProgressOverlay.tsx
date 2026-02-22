import { Progress } from '@/components/ui/progress';
import { FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PDFProgressOverlayProps {
  progress: number;
  visible: boolean;
}

export function PDFProgressOverlay({ progress, visible }: PDFProgressOverlayProps) {
  const { t } = useTranslation();
  
  if (!visible) return null;

  const label = progress < 100
    ? t('common.exportingPDF', 'Exporting PDF...')
    : t('common.exportComplete', 'Export complete!');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl p-6 mx-4 w-full max-w-xs border border-border/40 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <FileDown className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-2xl font-bold text-primary mt-1">{Math.round(progress)}%</p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
