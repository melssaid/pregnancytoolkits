import React from 'react';
import { Info } from 'lucide-react';

interface MedicalInfoBarProps {
  compact?: boolean;
}

const MedicalInfoBar: React.FC<MedicalInfoBarProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>For informational purposes only. Consult your healthcare provider.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground bg-muted/50 px-4 py-3 rounded-xl border border-border/50">
      <Info className="w-4 h-4 text-primary shrink-0" />
      <span>This tool provides general guidance. Always consult your healthcare provider for medical advice.</span>
    </div>
  );
};

export default MedicalInfoBar;
